const express = require('express');
const router = express.Router();
const db = require('../db');

// Mijozning barcha savdolarini olish
router.get('/:customerId', (req, res) => {
    const sql = "SELECT * FROM purchases WHERE customer_id = ? ORDER BY created_at DESC";
    db.all(sql, [req.params.customerId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Ma'lumotlarni olishda xatolik: " + err.message });
        res.json({ message: "success", data: rows });
    });
});

// Yangi savdo qo'shish
router.post('/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const { product, price, paid } = req.body;
    const priceNum = Number(price) || 0;
    const paidNum = Number(paid) || 0;

    if (priceNum < 0 || paidNum < 0) return res.status(400).json({ error: "Summalar noto'g'ri kiritildi!" });
    if (priceNum === 0 && paidNum === 0) return res.status(400).json({ error: "Kamida bitta maydonni (narx yoki to'lov) to'ldiring!" });

    const done = (purchaseData, paymentData) => {
        // Asosiy mijozdagi umumiy qarz va to'lovni oshiramiz
        db.run("UPDATE customers SET price = price + ?, paid = paid + ? WHERE id = ?", [priceNum, paidNum, customerId], (err) => {
            if (err) return res.status(500).json({ error: "Mijozni yangilashda xatolik: " + err.message });
            res.json({
                message: "success",
                data: { purchase: purchaseData, payment: paymentData }
            });
        });
    };

    let purchaseData = null;
    let paymentData = null;

    const processPayment = () => {
        if (paidNum > 0) {
            db.run("INSERT INTO payments (customer_id, amount) VALUES (?, ?)", [customerId, paidNum], function(err) {
                if (!err) paymentData = { id: this.lastID, customer_id: customerId, amount: paidNum, created_at: new Date().toISOString() };
                done(purchaseData, paymentData);
            });
        } else {
            done(purchaseData, paymentData);
        }
    };

    if (priceNum > 0 || (product && product.trim() !== '')) {
        db.run("INSERT INTO purchases (customer_id, product, price) VALUES (?, ?, ?)", [customerId, product || '', priceNum], function(err) {
            if (!err) purchaseData = { id: this.lastID, customer_id: customerId, product: product || '', price: priceNum, created_at: new Date().toISOString() };
            processPayment();
        });
    } else {
        processPayment();
    }
});

// Xaridni bekor qilish (o'chirish)
router.delete('/:id', (req, res) => {
    // Oldin qancha pul ekanini bilib olamiz, keyin ayiramiz
    db.get("SELECT price, customer_id FROM purchases WHERE id = ?", [req.params.id], (err, row) => {
        if (err || !row) return res.status(500).json({ error: "Bunday xarid topilmadi." });
        
        db.run("DELETE FROM purchases WHERE id = ?", [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: "O'chirishda xatolik: " + err.message });
            
            // Asosiy qarzdan ayirib tashlaymiz
            db.run("UPDATE customers SET price = price - ? WHERE id = ?", [row.price, row.customer_id], () => {
                res.json({ message: "success" });
            });
        });
    });
});

module.exports = router;

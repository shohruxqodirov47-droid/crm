const express = require('express');
const router = express.Router();
const db = require('../db');

// Mijozning barcha to'lovlarini olish
router.get('/:customerId', (req, res) => {
    const sql = "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC";
    db.all(sql, [req.params.customerId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Ma'lumotlarni olishda xatolik: " + err.message });
        res.json({ message: "success", data: rows });
    });
});

// Yangi to'lov qabul qilish
router.post('/:customerId', (req, res) => {
    const customerId = req.params.customerId;
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: "To'lov summasi noto'g'ri kiritildi!" });
    }

    // 1. To'lovni payments jadvaliga qo'shish
    const sqlInsert = "INSERT INTO payments (customer_id, amount) VALUES (?, ?)";
    db.run(sqlInsert, [customerId, amount], function(err) {
        if (err) return res.status(500).json({ error: "To'lovni saqlashda xatolik: " + err.message });
        
        const paymentId = this.lastID;
        const paymentDate = new Date().toISOString();

        // 2. Mijozning umumiy to'lagan summasini (paid) yangilash
        const sqlUpdate = "UPDATE customers SET paid = paid + ? WHERE id = ?";
        db.run(sqlUpdate, [amount, customerId], function(updateErr) {
            if (updateErr) {
                console.error("Mijoz balansini yangilashda xato:", updateErr);
                // Buni qaytarish shart emas, lekin logda qolishi yaxshi
            }
            
            res.json({ 
                message: "success", 
                data: { id: paymentId, customer_id: customerId, amount: amount, created_at: paymentDate }
            });
        });
    });
});

// To'lovni bekor qilish (o'chirish)
router.delete('/:id', (req, res) => {
    db.get("SELECT amount, customer_id FROM payments WHERE id = ?", [req.params.id], (err, row) => {
        if (err || !row) return res.status(500).json({ error: "Bunday to'lov topilmadi." });
        
        db.run("DELETE FROM payments WHERE id = ?", [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: "O'chirishda xatolik: " + err.message });
            
            // Asosiy mijozdagi to'langan summadan ayirib tashlaymiz (manfiy bo'lib ketmasligi uchun MAX ishlatamiz)
            db.run("UPDATE customers SET paid = MAX(0, paid - ?) WHERE id = ?", [row.amount, row.customer_id], () => {
                res.json({ message: "success" });
            });
        });
    });
});

module.exports = router;

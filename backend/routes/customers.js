const express = require('express');
const router = express.Router();
const db = require('../db');

// Barcha mijozlarni olish
router.get('/', (req, res) => {
    const sql = "SELECT * FROM customers ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Ma'lumotlarni olishda xatolik: " + err.message });
        res.json({ message: "success", data: rows });
    });
});

// Yangi mijoz qo'shish
router.post('/', (req, res) => {
    const { name, phone, email, status, product, price, paid } = req.body;
    
    // Validatsiya
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: "Mijoz ismi kiritilishi shart!" });
    }
    if (name.trim().length > 200) {
        return res.status(400).json({ error: "Mijoz ismi juda uzun (max 200 belgi)" });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        return res.status(400).json({ error: "Telefon raqam kiritilishi shart!" });
    }
    if (phone.trim().length > 20) {
        return res.status(400).json({ error: "Telefon raqam juda uzun (max 20 belgi)" });
    }
    if (product && typeof product === 'string' && product.length > 500) {
        return res.status(400).json({ error: "Mahsulot nomi juda uzun (max 500 belgi)" });
    }
    
    const priceNum = Number(price) || 0;
    const paidNum = Number(paid) || 0;
    
    if (priceNum < 0) {
        return res.status(400).json({ error: "Jami summa manfiy bo'lishi mumkin emas!" });
    }
    if (paidNum < 0) {
        return res.status(400).json({ error: "To'langan summa manfiy bo'lishi mumkin emas!" });
    }

    const validStatuses = ['new', 'progress', 'sold', 'cancelled'];
    const safeStatus = validStatuses.includes(status) ? status : 'new';

    const sql = "INSERT INTO customers (name, phone, email, status, product, price, paid) VALUES (?,?,?,?,?,?,?)";
    const params = [name.trim(), phone.trim(), (email || '').trim(), safeStatus, (product || '').trim(), priceNum, paidNum];
    
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: "Saqlashda xatolik: " + err.message });
        const customerId = this.lastID;
        
        // Yangi tizim uchun boshlang'ich savdo va to'lovni yozib qo'yamiz
        if (priceNum > 0 || (product && product.trim() !== '')) {
            db.run("INSERT INTO purchases (customer_id, product, price) VALUES (?, ?, ?)", [customerId, (product || '').trim(), priceNum]);
        }
        if (paidNum > 0) {
            db.run("INSERT INTO payments (customer_id, amount) VALUES (?, ?)", [customerId, paidNum]);
        }

        res.json({
            message: "success",
            data: { id: customerId, name: name.trim(), phone: phone.trim(), email: (email || '').trim(), status: safeStatus, product: (product || '').trim(), price: priceNum, paid: paidNum, created_at: new Date().toISOString() }
        });
    });
});

// Mijozni o'chirish
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
    }

    const sql = "DELETE FROM customers WHERE id = ?";
    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ error: "O'chirishda xatolik: " + err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Mijoz topilmadi" });
        res.json({ message: "success", deletedID: id });
    });
});

// Mijozni yangilash
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
    }

    const { name, phone, email, status, product, price, paid } = req.body;
    
    // Agar name kelsa, validatsiya
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        return res.status(400).json({ error: "Mijoz ismi bo'sh bo'lishi mumkin emas!" });
    }
    if (name && name.trim().length > 200) {
        return res.status(400).json({ error: "Mijoz ismi juda uzun (max 200 belgi)" });
    }
    if (phone !== undefined && (typeof phone !== 'string' || phone.trim().length === 0)) {
        return res.status(400).json({ error: "Telefon raqam bo'sh bo'lishi mumkin emas!" });
    }
    
    if (price !== undefined && Number(price) < 0) {
        return res.status(400).json({ error: "Jami summa manfiy bo'lishi mumkin emas!" });
    }
    if (paid !== undefined && Number(paid) < 0) {
        return res.status(400).json({ error: "To'langan summa manfiy bo'lishi mumkin emas!" });
    }

    if (status !== undefined) {
        const validStatuses = ['new', 'progress', 'sold', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Noto'g'ri holat qiymati" });
        }
    }

    const sql = "UPDATE customers SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email), status = COALESCE(?, status), product = COALESCE(?, product), price = COALESCE(?, price), paid = COALESCE(?, paid) WHERE id = ?";
    const params = [
        name ? name.trim() : name, 
        phone ? phone.trim() : phone, 
        email !== undefined ? (email || '').trim() : email, 
        status, 
        product !== undefined ? (product || '').trim() : product, 
        price !== undefined ? Number(price) : price, 
        paid !== undefined ? Number(paid) : paid, 
        id
    ];
    
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: "Yangilashda xatolik: " + err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Mijoz topilmadi" });
        res.json({ message: "success", updatedID: id });
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Barcha xarajatlarni olish
router.get('/', (req, res) => {
    const sql = "SELECT * FROM expenses ORDER BY created_at DESC";
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Ma'lumotlarni olishda xatolik: " + err.message });
        res.json({ message: "success", data: rows });
    });
});

// Yangi xarajat qo'shish
router.post('/', (req, res) => {
    const { title, amount, type } = req.body;
    
    // Validatsiya
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ error: "Sarlavha kiritilishi shart!" });
    }
    if (title.trim().length > 500) {
        return res.status(400).json({ error: "Sarlavha juda uzun (max 500 belgi)" });
    }
    
    const amountNum = Number(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({ error: "Summa musbat son bo'lishi kerak!" });
    }

    // Type validatsiya (kirim yoki chiqim)
    const validTypes = ['income', 'expense'];
    const safeType = validTypes.includes(type) ? type : 'expense';

    const sql = "INSERT INTO expenses (title, amount, type) VALUES (?, ?, ?)";
    db.run(sql, [title.trim(), amountNum, safeType], function(err) {
        if (err) return res.status(500).json({ error: "Saqlashda xatolik: " + err.message });
        res.json({
            message: "success",
            data: { id: this.lastID, title: title.trim(), amount: amountNum, type: safeType, created_at: new Date().toISOString() }
        });
    });
});

// Xarajatni o'chirish
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Noto'g'ri ID" });
    }

    const sql = "DELETE FROM expenses WHERE id = ?";
    db.run(sql, id, function(err) {
        if (err) return res.status(500).json({ error: "O'chirishda xatolik: " + err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Xarajat topilmadi" });
        res.json({ message: "success", deletedID: id });
    });
});

module.exports = router;

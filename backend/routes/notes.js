const express = require('express');
const router = express.Router();
const db = require('../db');

// Mijozning barcha izohlarini olish
router.get('/:customerId', (req, res) => {
    const sql = "SELECT * FROM notes WHERE customer_id = ? ORDER BY created_at DESC";
    db.all(sql, [req.params.customerId], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// Mijozga yangi izoh qo'shish
router.post('/:customerId', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Izoh matni bo'sh bo'lmasligi kerak" });

    const sql = "INSERT INTO notes (customer_id, content) VALUES (?, ?)";
    db.run(sql, [req.params.customerId, content], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ 
            message: "success", 
            data: { id: this.lastID, customer_id: req.params.customerId, content, created_at: new Date().toISOString() }
        });
    });
});

module.exports = router;

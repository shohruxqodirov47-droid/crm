const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'crm_pro_default_secret';

// Tizim uchun admin parolining hashi
// Standart parol: "admin5" -> bcrypt hash
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin5', 10);

// Faqat parol bilan kirish
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ error: "Parol kiritilishi shart!" });
        }

        if (password.length > 100) {
            return res.status(400).json({ error: "Parol juda uzun!" });
        }

        const isMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        
        if (isMatch) {
            const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ message: "success", token, username: "Admin" });
        } else {
            res.status(401).json({ error: "Parol noto'g'ri kiritildi! Tizimga kirish taqiqlandi." });
        }
    } catch (err) {
        console.error('Login xatosi:', err.message);
        res.status(500).json({ error: "Serverda xatolik yuz berdi" });
    }
});

module.exports = router;

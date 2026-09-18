const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'crm_pro_default_secret';

function authMiddleware(req, res, next) {
    // Login route'ni o'tkazib yuborish
    if (req.path === '/api/auth/login') {
        return next();
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Avtorizatsiya talab qilinadi. Token topilmadi." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token muddati tugagan. Qaytadan tizimga kiring." });
        }
        return res.status(401).json({ error: "Yaroqsiz token. Qaytadan tizimga kiring." });
    }
}

module.exports = authMiddleware;

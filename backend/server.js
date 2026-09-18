require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const app = express();

// CORS ni faqat frontend URL uchun ruxsat berish
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// Route'larni yuklash
const customersRouter = require('./routes/customers');
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');
const expensesRouter = require('./routes/expenses');
const paymentsRouter = require('./routes/payments');
const purchasesRouter = require('./routes/purchases');

// Auth route'ni himoyasiz qoldirish (login uchun)
app.use('/api/auth', authRouter);

// Qolgan barcha route'larni JWT middleware bilan himoyalash
app.use('/api/customers', authMiddleware, customersRouter);
app.use('/api/notes', authMiddleware, notesRouter);
app.use('/api/expenses', authMiddleware, expensesRouter);
app.use('/api/payments', authMiddleware, paymentsRouter);
app.use('/api/purchases', authMiddleware, purchasesRouter);

app.get('/', (req, res) => {
    res.json({ message: "CRM PRO API is running..." });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server xatosi:', err.message);
    res.status(err.status || 500).json({ 
        error: err.message || "Serverda kutilmagan xatolik yuz berdi" 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

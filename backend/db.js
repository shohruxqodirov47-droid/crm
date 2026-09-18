const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Vercel serverless muhitida faqat /tmp papkasiga yozishga ruxsat bor
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const dbPath = isProduction 
    ? '/tmp/database.sqlite' 
    : path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to the SQLite database.');
});

// Ustun mavjudligini tekshirish yordamchi funksiyasi
function columnExists(tableName, columnName) {
    return new Promise((resolve) => {
        db.all(`PRAGMA table_info(${tableName})`, [], (err, rows) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(rows.some(row => row.name === columnName));
        });
    });
}

// Ustunni xavfsiz qo'shish
async function addColumnIfNotExists(tableName, columnName, columnDef) {
    const exists = await columnExists(tableName, columnName);
    if (!exists) {
        return new Promise((resolve, reject) => {
            db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`, (err) => {
                if (err) {
                    console.error(`Ustun qo'shishda xatolik (${columnName}):`, err.message);
                    reject(err);
                } else {
                    console.log(`Ustun qo'shildi: ${tableName}.${columnName}`);
                    resolve();
                }
            });
        });
    }
}

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON");

    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            status TEXT DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
    `);

    // Kirim-chiqim (Xarajatlar) jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            amount INTEGER NOT NULL,
            type TEXT DEFAULT 'expense',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // To'lovlar tarixi jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            amount INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
    `);

    // Savdolar (Xaridlar) jadvali
    db.run(`
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            product TEXT,
            price INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE
        )
    `);
});

// Migratsiyalarni serialize blokidan tashqarida async bajarish
(async () => {
    try {
        await addColumnIfNotExists('customers', 'product', "TEXT DEFAULT ''");
        await addColumnIfNotExists('customers', 'price', 'INTEGER DEFAULT 0');
        await addColumnIfNotExists('customers', 'paid', 'INTEGER DEFAULT 0');
        await addColumnIfNotExists('expenses', 'type', "TEXT DEFAULT 'expense'");
        
        // Data Migration: Eski xaridlarni purchases ga ko'chirish
        db.get("SELECT COUNT(*) as count FROM purchases", [], (err, row) => {
            if (!err && row && row.count === 0) {
                db.all("SELECT id, product, price FROM customers WHERE price > 0 OR (product IS NOT NULL AND product != '')", [], (err, rows) => {
                    if (!err && rows) {
                        rows.forEach(r => {
                            db.run("INSERT INTO purchases (customer_id, product, price) VALUES (?, ?, ?)", [r.id, r.product || '', r.price || 0]);
                        });
                    }
                });
            }
        });

        // Data Migration: Eski to'lovlarni payments ga ko'chirish
        db.get("SELECT COUNT(*) as count FROM payments", [], (err, row) => {
            if (!err && row && row.count === 0) {
                db.all("SELECT id, paid FROM customers WHERE paid > 0", [], (err, rows) => {
                    if (!err && rows) {
                        rows.forEach(r => {
                            db.run("INSERT INTO payments (customer_id, amount) VALUES (?, ?)", [r.id, r.paid]);
                        });
                    }
                });
            }
        });

        console.log('Ma\'lumotlar bazasi migratsiyasi muvaffaqiyatli yakunlandi.');
    } catch (err) {
        console.error('Migratsiya xatosi:', err.message);
    }
})();

module.exports = db;

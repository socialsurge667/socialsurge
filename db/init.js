// db/init.js
// Ye file database (SQLite) banati hai aur zaroori tables create karti hai.
// SQLite ek file-based database hai - koi alag se MySQL server install nahi karna padta.
// Production me chaho to isse MySQL/PostgreSQL me switch kar sakte ho.

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const db = new Database(path.join(__dirname, 'socialsurge.db'));

db.pragma('journal_mode = WAL');

// ---------- TABLES ----------

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  balance REAL DEFAULT 0,
  role TEXT DEFAULT 'user',       -- 'user' ya 'admin'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,          -- e.g. Instagram, YouTube, TikTok
  name TEXT NOT NULL,              -- e.g. "Instagram Followers - High Quality"
  supplier_service_id TEXT,        -- supplier panel ka service ID (API call ke liye)
  rate_per_1000 REAL NOT NULL,     -- aapka selling price per 1000
  min_quantity INTEGER DEFAULT 100,
  max_quantity INTEGER DEFAULT 10000,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  link TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  charge REAL NOT NULL,
  status TEXT DEFAULT 'pending',   -- pending, in_progress, completed, cancelled
  supplier_order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS deposit_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  method TEXT,                     -- e.g. UPI, Bank Transfer
  reference TEXT,                  -- UTR number / transaction ID jo user ne bheja
  status TEXT DEFAULT 'pending',   -- pending, approved, rejected
  admin_note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,              -- 'deposit' ya 'order_debit'
  amount REAL NOT NULL,
  status TEXT DEFAULT 'success',   -- pending, success, failed
  reference TEXT,                  -- payment gateway ka transaction id
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// ---------- SEED: pehla admin account + kuch sample services ----------

const adminEmail = process.env.ADMIN_EMAIL || 'admin@socialsurge.com';
const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (!adminExists) {
  const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeThisPassword123', 10);
  db.prepare('INSERT INTO users (name, email, password, role, balance) VALUES (?, ?, ?, ?, ?)')
    .run('Admin', adminEmail, hashedPassword, 'admin', 0);
  console.log(`Admin account created: ${adminEmail}`);
}

const serviceCount = db.prepare('SELECT COUNT(*) as c FROM services').get().c;
if (serviceCount === 0) {
  const sampleServices = [
    ['Instagram', 'Instagram Followers - High Quality', 'SUP1001', 120, 100, 50000],
    ['Instagram', 'Instagram Likes - Instant', 'SUP1002', 40, 50, 20000],
    ['YouTube', 'YouTube Views - Real', 'SUP2001', 90, 500, 100000],
    ['YouTube', 'YouTube Subscribers', 'SUP2002', 300, 100, 10000],
    ['TikTok', 'TikTok Followers', 'SUP3001', 150, 100, 30000],
    ['Facebook', 'Facebook Page Likes', 'SUP4001', 100, 100, 20000]
  ];
  const insert = db.prepare(`INSERT INTO services
    (category, name, supplier_service_id, rate_per_1000, min_quantity, max_quantity)
    VALUES (?, ?, ?, ?, ?, ?)`);
  sampleServices.forEach(s => insert.run(...s));
  console.log('Sample services added.');
}

module.exports = db;

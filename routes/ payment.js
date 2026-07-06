// routes/payment.js
// Manual payment system: User deposit request daalta hai (UPI/Bank transfer karke reference number ke saath),
// Admin us request ko dekh kar Approve/Reject karta hai. Approve hone par hi balance add hota hai.

const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { requireLogin } = require('./middleware');
require('dotenv').config();

// Wallet page dikhana
router.get('/wallet', requireLogin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const transactions = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.session.userId);
  const myRequests = db.prepare('SELECT * FROM deposit_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.session.userId);

  res.render('wallet', {
    user,
    transactions,
    myRequests,
    // Ye aapka UPI ID / bank details hain jo user ko dikhengi payment karne ke liye
    upiId: process.env.UPI_ID || 'yourupi@bank',
    upiName: process.env.UPI_NAME || 'SocialSurge'
  });
});

// User deposit request submit karta hai (payment khud kar chuka hoga UPI/bank se)
router.post('/wallet/request', requireLogin, (req, res) => {
  const amount = parseFloat(req.body.amount);
  const method = req.body.method;
  const reference = req.body.reference;

  if (!amount || amount <= 0 || !reference) {
    return res.redirect('/wallet');
  }

  db.prepare(`INSERT INTO deposit_requests (user_id, amount, method, reference, status)
    VALUES (?, ?, ?, ?, 'pending')`)
    .run(req.session.userId, amount, method, reference);

  res.redirect('/wallet');
});

module.exports = router;

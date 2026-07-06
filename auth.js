// routes/auth.js
// Signup, Login, Logout ka poora system

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/init');

// ---------- SIGNUP PAGE ----------
router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render('signup', { error: 'Sabhi fields bharna zaroori hai.' });
  }
  if (password.length < 6) {
    return res.render('signup', { error: 'Password kam se kam 6 characters ka hona chahiye.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.render('signup', { error: 'Is email se account pehle se bana hua hai.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hashedPassword);

  req.session.userId = result.lastInsertRowid;
  req.session.role = 'user';
  res.redirect('/dashboard');
});

// ---------- LOGIN PAGE ----------
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.render('login', { error: 'Email ya password galat hai.' });
  }

  req.session.userId = user.id;
  req.session.role = user.role;

  if (user.role === 'admin') {
    res.redirect('/admin');
  } else {
    res.redirect('/dashboard');
  }
});

// ---------- LOGOUT ----------
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;

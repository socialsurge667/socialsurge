// routes/orders.js
// User dashboard, services list, aur order place karne ka system

const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { requireLogin } = require('./middleware');
const { placeSupplierOrder } = require('./supplier');

// Dashboard - services list + user ki details
router.get('/dashboard', requireLogin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
  const services = db.prepare('SELECT * FROM services WHERE active = 1 ORDER BY category').all();
  const myOrders = db.prepare(`
    SELECT orders.*, services.name as service_name
    FROM orders JOIN services ON orders.service_id = services.id
    WHERE orders.user_id = ? ORDER BY orders.created_at DESC LIMIT 20
  `).all(req.session.userId);

  res.render('dashboard', { user, services, myOrders });
});

// Naya order place karna
router.post('/order', requireLogin, async (req, res) => {
  const { service_id, link, quantity } = req.body;
  const qty = parseInt(quantity);

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND active = 1').get(service_id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

  if (!service || !link || !qty) {
    return res.redirect('/dashboard');
  }
  if (qty < service.min_quantity || qty > service.max_quantity) {
    return res.redirect('/dashboard');
  }

  const charge = (service.rate_per_1000 / 1000) * qty;

  if (user.balance < charge) {
    return res.render('dashboard', {
      user, myOrders: [], services: db.prepare('SELECT * FROM services WHERE active = 1').all(),
      insufficientBalance: true
    });
  }

  // Supplier ko order bhejna
  const supplierResponse = await placeSupplierOrder({
    supplierServiceId: service.supplier_service_id,
    link,
    quantity: qty
  });

  // User ka balance kaatna aur order save karna
  db.prepare('UPDATE users SET balance = balance - ? WHERE id = ?').run(charge, req.session.userId);

  db.prepare(`INSERT INTO orders (user_id, service_id, link, quantity, charge, status, supplier_order_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(req.session.userId, service_id, link, qty, charge, 'pending', supplierResponse.order || null);

  db.prepare('INSERT INTO transactions (user_id, type, amount, status) VALUES (?, ?, ?, ?)')
    .run(req.session.userId, 'order_debit', charge, 'success');

  res.redirect('/dashboard');
});

module.exports = router;

// routes/admin.js
// Admin panel - services add/edit karna, orders dekhna, users dekhna

const express = require('express');
const router = express.Router();
const db = require('../db/init');
const { requireAdmin } = require('./middleware');

// Admin dashboard
router.get('/admin', requireAdmin, (req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY category').all();
  const orders = db.prepare(`
    SELECT orders.*, users.email as user_email, services.name as service_name
    FROM orders
    JOIN users ON orders.user_id = users.id
    JOIN services ON orders.service_id = services.id
    ORDER BY orders.created_at DESC LIMIT 50
  `).all();
  const users = db.prepare('SELECT id, name, email, balance, role, created_at FROM users ORDER BY created_at DESC').all();
  const depositRequests = db.prepare(`
    SELECT deposit_requests.*, users.email as user_email
    FROM deposit_requests JOIN users ON deposit_requests.user_id = users.id
    ORDER BY
      CASE deposit_requests.status WHEN 'pending' THEN 0 ELSE 1 END,
      deposit_requests.created_at DESC
    LIMIT 50
  `).all();

  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    totalOrders: db.prepare('SELECT COUNT(*) as c FROM orders').get().c,
    totalRevenue: db.prepare("SELECT COALESCE(SUM(charge),0) as s FROM orders").get().s,
    pendingOrders: db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get().c,
    pendingDeposits: db.prepare("SELECT COUNT(*) as c FROM deposit_requests WHERE status = 'pending'").get().c
  };

  res.render('admin', { services, orders, users, stats, depositRequests });
});

// Naya service add karna
router.post('/admin/service/add', requireAdmin, (req, res) => {
  const { category, name, supplier_service_id, rate_per_1000, min_quantity, max_quantity } = req.body;
  db.prepare(`INSERT INTO services (category, name, supplier_service_id, rate_per_1000, min_quantity, max_quantity)
    VALUES (?, ?, ?, ?, ?, ?)`)
    .run(category, name, supplier_service_id, parseFloat(rate_per_1000), parseInt(min_quantity), parseInt(max_quantity));
  res.redirect('/admin');
});

// Service on/off karna
router.post('/admin/service/toggle/:id', requireAdmin, (req, res) => {
  const service = db.prepare('SELECT active FROM services WHERE id = ?').get(req.params.id);
  db.prepare('UPDATE services SET active = ? WHERE id = ?').run(service.active ? 0 : 1, req.params.id);
  res.redirect('/admin');
});

// Order ka status update karna
router.post('/admin/order/status/:id', requireAdmin, (req, res) => {
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.redirect('/admin');
});

// Deposit request ko Approve ya Reject karna
router.post('/admin/deposit/:id/:action', requireAdmin, (req, res) => {
  const request = db.prepare('SELECT * FROM deposit_requests WHERE id = ?').get(req.params.id);

  if (!request || request.status !== 'pending') {
    return res.redirect('/admin');
  }

  if (req.params.action === 'approve') {
    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(request.amount, request.user_id);
    db.prepare('INSERT INTO transactions (user_id, type, amount, status, reference) VALUES (?, ?, ?, ?, ?)')
      .run(request.user_id, 'deposit', request.amount, 'success', request.reference);
    db.prepare("UPDATE deposit_requests SET status = 'approved', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(request.id);
  } else if (req.params.action === 'reject') {
    db.prepare("UPDATE deposit_requests SET status = 'rejected', reviewed_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(request.id);
  }

  res.redirect('/admin');
});

module.exports = router;

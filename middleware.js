// routes/middleware.js
// Ye check karta hai ki user login hai ya nahi, aur admin hai ya nahi

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.userId || req.session.role !== 'admin') {
    return res.redirect('/login');
  }
  next();
}

module.exports = { requireLogin, requireAdmin };

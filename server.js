// server.js
// Ye main file hai jo poore server ko chalata hai.
// Chalane ke liye: npm install, phir node server.js

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

require('./db/init'); // database aur tables ready karta hai

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 din tak login yaad rahega
}));

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/orders'));
app.use('/', require('./routes/payment'));
app.use('/', require('./routes/admin'));

// Homepage
app.get('/', (req, res) => {
  res.render('home');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SocialSurge chal raha hai: http://localhost:${PORT}`);
});

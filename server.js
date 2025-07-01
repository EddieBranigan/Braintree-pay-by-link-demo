const express = require('express');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const { json, urlencoded } = require('body-parser');
const checkout = require('./routes/checkout');
const app = express();
const port = 3000;

app.use(helmet({ contentSecurityPolicy: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use('/checkout', checkout);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/order-management', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'order-management.html'));
});
app.get('/payment-link/:uuid', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment-link.html'));
});
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

module.exports = app;

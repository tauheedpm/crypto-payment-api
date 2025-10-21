const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Parse incoming JSON bodies
app.use(express.json());

const payments = {};

// Create a new payment
app.post('/payments', (req, res) => {
  const { merchantId, amount, currency, network, recipientAddress } = req.body;
  if (!merchantId || !amount || !currency || !network || !recipientAddress) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const paymentId = uuidv4();
  const txHash = Math.random().toString(16).slice(2);

  payments[paymentId] = {
    paymentId,
    merchantId,
    amount,
    currency,
    network,
    recipientAddress,
    txHash,
    status: 'pending',
    createdAt: Date.now(),
    confirmedAt: null
  };

  res.status(201).json(payments[paymentId]);
});

// Get a payment by ID, confirming pending if first time
app.get('/payments/:paymentId', (req, res) => {
  const payment = payments[req.params.paymentId];
  if (!payment) {
    return res.status(404).json({ error: 'Not found' });
  }

  if (payment.status === 'pending') {
    payment.status = 'confirmed';
    payment.confirmedAt = Date.now();
  }

  res.json(payment);
});

// List all payments for a merchant
app.get('/merchants/:merchantId/payments', (req, res) => {
  const list = Object.values(payments)
    .filter(p => p.merchantId === req.params.merchantId)
    .sort((a, b) => a.createdAt - b.createdAt);

  res.json(list);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
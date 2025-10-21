const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
const payments = {};
app.post('/payments', (req, res) => {
  const { merchantId, amount, currency, network, recipientAddress } = req.body;
  if (!merchantId || !amount || !currency || !network || !recipientAddress) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const paymentId = uuidv4();
  const txHash = Math.random().toString(16).slice(2);
  payments[paymentId] = { paymentId, merchantId, amount, currency, network, recipientAddress, txHash, status: 'pending', createdAt: Date.now(), confirmedAt: null };
  res.status(201).json(payments[paymentId]);
});
app.get('/payments/:paymentId', (req, res) => {
  const p = payments[req.params.paymentId];
  if (!p) return res.status(404).json({ error: 'Not found' });
  if (p.status === 'pending') {
    p.status = 'confirmed';
    p.confirmedAt = Date.now();
  }
  res.json(p);
});
app.get('/merchants/:merchantId/payments', (req, res) => {
  const list = Object.values(payments).filter(p => p.merchantId === req.params.merchantId);
  res.json(list.sort((a, b) => a.createdAt - b.createdAt));
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
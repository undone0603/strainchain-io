const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const payments = [
  { id: 'pay_001', dispensary: 'Green Leaf Dispensary', amount: 2500.00, currency: 'usd', status: 'succeeded', method: 'card', created_at: '2025-01-15T10:30:00Z', invoice_id: 'inv_001', blockchain_verified: true },
  { id: 'pay_002', dispensary: 'Cannabis Corner', amount: 1200.50, currency: 'usd', status: 'succeeded', method: 'ach', created_at: '2025-01-14T14:20:00Z', invoice_id: 'inv_002', blockchain_verified: true },
  { id: 'pay_003', dispensary: 'Herbal Solutions', amount: 3800.75, currency: 'usd', status: 'pending', method: 'card', created_at: '2025-01-13T09:15:00Z', invoice_id: 'inv_003', blockchain_verified: false }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { status, dispensary } = req.query;
    let filtered = payments;
    if (status) filtered = filtered.filter(p => p.status === status);
    if (dispensary) filtered = filtered.filter(p => p.dispensary.toLowerCase().includes(dispensary.toLowerCase()));
    return res.status(200).json({
      success: true,
      endpoint: '/api/payment',
      payments: filtered,
      total: filtered.length,
      total_amount: filtered.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0),
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { dispensary_id, amount, method = 'card', invoice_id } = req.body || {};
    if (!dispensary_id || !amount) return res.status(400).json({ error: 'dispensary_id and amount are required' });
    const payment = {
      id: `pay_${Date.now()}`,
      dispensary_id,
      amount: parseFloat(amount),
      currency: 'usd',
      status: 'succeeded',
      method,
      invoice_id,
      created_at: new Date().toISOString(),
      blockchain_hash: `0x${Math.random().toString(16).slice(2, 18)}`,
      blockchain_verified: true,
      protocol: 'StrainChain'
    };
    return res.status(200).json({ success: true, payment, protocol: 'StrainChain' });
  }
};

const plans = [
  { id: 'plan_starter', name: 'Starter', price: 99, interval: 'month', features: ['5 dispensaries', 'METRC sync', 'Basic analytics', 'Email support'], max_dispensaries: 5 },
  { id: 'plan_pro', name: 'Professional', price: 299, interval: 'month', features: ['25 dispensaries', 'METRC sync', 'Advanced analytics', 'API access', 'Priority support'], max_dispensaries: 25 },
  { id: 'plan_enterprise', name: 'Enterprise', price: 999, interval: 'month', features: ['Unlimited dispensaries', 'METRC sync', 'Custom analytics', 'Full API access', 'Dedicated support', 'White-label'], max_dispensaries: -1 }
];

const subscriptions = [
  { id: 'sub_001', customer: 'Green Leaf Co', plan: 'plan_pro', status: 'active', current_period_end: '2025-02-15T00:00:00Z', blockchain_verified: true },
  { id: 'sub_002', customer: 'Cannabis Corner', plan: 'plan_starter', status: 'active', current_period_end: '2025-02-10T00:00:00Z', blockchain_verified: true }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { type } = req.query;
    if (type === 'plans') {
      return res.status(200).json({ success: true, plans, protocol: 'StrainChain' });
    }
    return res.status(200).json({
      success: true,
      endpoint: '/api/subscription',
      subscriptions,
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { customer_id, plan_id, payment_method } = req.body || {};
    if (!customer_id || !plan_id) return res.status(400).json({ error: 'customer_id and plan_id are required' });
    const plan = plans.find(p => p.id === plan_id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    const sub = {
      id: `sub_${Date.now()}`,
      customer_id,
      plan_id,
      plan_name: plan.name,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: plan.price,
      blockchain_hash: `0x${Math.random().toString(16).slice(2, 18)}`,
      blockchain_verified: true,
      protocol: 'StrainChain'
    };
    return res.status(200).json({ success: true, subscription: sub, protocol: 'StrainChain' });
  }
};

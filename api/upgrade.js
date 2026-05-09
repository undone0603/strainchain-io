import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PLAN_HIERARCHY = ['dispensary_starter', 'dispensary_pro', 'grower_lab', 'enterprise'];

const PLAN_PRICES = {
  dispensary_starter: { monthly: 149, annual: 119 },
  dispensary_pro: { monthly: 299, annual: 239 },
  grower_lab: { monthly: 499, annual: 399 },
  enterprise: { monthly: null, annual: null, contact: true }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'POST') {
    const { to_plan, billing_cycle = 'monthly', promo_code } = req.body;
    if (!to_plan) return res.status(400).json({ error: 'to_plan is required' });
    if (!PLAN_PRICES[to_plan]) return res.status(400).json({ error: 'Invalid plan' });

    const plan = PLAN_PRICES[to_plan];
    if (plan.contact) {
      return res.status(200).json({
        success: true,
        contact_required: true,
        message: 'Contact sales@strainchain.io for Enterprise pricing.',
        contact_url: 'https://strainchain.io/enterprise'
      });
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan_id, billing_cycle')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    const from_plan = sub?.plan_id || 'free';
    const from_idx = PLAN_HIERARCHY.indexOf(from_plan);
    const to_idx = PLAN_HIERARCHY.indexOf(to_plan);
    const is_upgrade = to_idx > from_idx;
    const is_downgrade = to_idx < from_idx;

    let amount = billing_cycle === 'annual' ? plan.annual : plan.monthly;
    let discount = 0;
    if (promo_code === 'CANNABIS20') discount = 20;
    if (promo_code === 'METRC10') discount = 10;
    if (is_upgrade && from_plan !== 'free') discount = Math.max(discount, 5);

    const final_amount = amount - Math.floor(amount * discount / 100);

    const { data: upgradeRecord, error: upgradeErr } = await supabase
      .from('upgrades')
      .insert({
        user_id: user.id,
        from_plan,
        to_plan,
        billing_cycle,
        amount: final_amount,
        discount_percent: discount,
        promo_code: promo_code || null,
        is_upgrade,
        is_downgrade,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (upgradeErr) return res.status(500).json({ error: upgradeErr.message });

    return res.status(200).json({
      success: true,
      upgrade_id: upgradeRecord.id,
      from_plan,
      to_plan,
      is_upgrade,
      is_downgrade,
      billing_cycle,
      amount: final_amount,
      discount_percent: discount,
      next_step: 'checkout',
      checkout_url: `/api/checkout?upgrade_id=${upgradeRecord.id}`
    });
  }

  if (req.method === 'GET') {
    const { data: history } = await supabase
      .from('upgrades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return res.status(200).json({ success: true, upgrades: history || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

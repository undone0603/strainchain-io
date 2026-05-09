import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COMMISSION_RATE = 0.20;

function generateCode(userId) {
  const suffix = userId.replace(/-/g, '').substring(0, 6).toUpperCase();
  return `SC${suffix}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    try {
      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !affiliate) {
        return res.status(200).json({ enrolled: false, message: 'Not enrolled in affiliate program' });
      }

      const { data: earnings } = await supabase
        .from('affiliate_earnings')
        .select('amount, status, created_at, referral_type')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const paid = (earnings || []).filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
      const pending = (earnings || []).filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);

      return res.status(200).json({
        success: true,
        enrolled: true,
        affiliate: {
          code: affiliate.code,
          affiliate_url: `https://strainchain.io?ref=${affiliate.code}`,
          commission_rate: affiliate.commission_rate,
          status: affiliate.status,
          enrolled_at: affiliate.enrolled_at,
        },
        earnings: { total_paid: paid, pending, recent: earnings || [] },
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { data: existing } = await supabase.from('affiliates').select('id').eq('user_id', user.id).single();
      if (existing) return res.status(409).json({ error: 'Already enrolled in affiliate program' });

      const code = generateCode(user.id);
      const { data, error } = await supabase.from('affiliates').insert({
        user_id: user.id,
        code,
        commission_rate: COMMISSION_RATE,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        affiliate_code: code,
        affiliate_url: `https://strainchain.io?ref=${code}`,
        commission_rate: COMMISSION_RATE,
        message: 'Welcome to the StrainChain Affiliate Program! Earn 20% recurring commission on every dispensary you refer.',
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PLAN_LIMITS = {
  starter: { dispensaries: 1, users: 3, metrc_integrations: 1, monthly_reports: 10 },
  growth: { dispensaries: 5, users: 15, metrc_integrations: 3, monthly_reports: 50 },
  enterprise: { dispensaries: 999, users: 999, metrc_integrations: 999, monthly_reports: 999 },
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const [subResult, dispensaryResult] = await Promise.all([
    supabase.from('subscriptions').select('plan, status').eq('user_id', user_id).single(),
    supabase.from('dispensaries').select('id', { count: 'exact', head: true }).eq('user_id', user_id),
  ]);

  const plan = subResult.data?.plan || 'starter';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
  const dispensaryCount = dispensaryResult.count || 0;
  const dispensaryPercent = Math.round((dispensaryCount / limits.dispensaries) * 100);

  const triggers = [];

  if (dispensaryPercent >= 80) {
    triggers.push({
      type: 'quota_warning',
      message: `You're using ${dispensaryPercent}% of your dispensary limit. Upgrade to add more locations.`,
      cta: 'Upgrade Plan',
      urgency: dispensaryPercent >= 100 ? 'high' : 'medium',
    });
  }

  if (plan === 'starter') {
    triggers.push({
      type: 'feature_gate',
      message: 'Growth plan unlocks multi-location support, advanced METRC reporting, and team management.',
      cta: 'Upgrade to Growth - $299/mo',
      urgency: 'low',
    });
  }

  if (plan === 'growth') {
    triggers.push({
      type: 'upgrade_nudge',
      message: 'Enterprise plan includes unlimited locations, dedicated compliance manager, and API access.',
      cta: 'Talk to Enterprise Sales',
      urgency: 'low',
    });
  }

  return res.status(200).json({
    current_plan: plan,
    dispensary_usage: { used: dispensaryCount, limit: limits.dispensaries, percent: dispensaryPercent },
    upsell_triggers: triggers,
    next_plan: plan === 'starter' ? 'growth' : plan === 'growth' ? 'enterprise' : null,
  });
};

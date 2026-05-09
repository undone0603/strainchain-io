// /api/churn-risk - Multi-signal churn scoring for StrainChain
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, created_at, trial_ends_at')
      .in('status', ['active', 'trialing']);
    if (error) throw error;

    const scored = [];
    for (const sub of subs || []) {
      let score = 0;
      const signals = [];

      const { count: recentOrders } = await supabase
        .from('orders').select('id', { count: 'exact', head: true })
        .eq('user_id', sub.user_id).gte('created_at', sevenDaysAgo);
      if ((recentOrders ?? 0) === 0) { score += 30; signals.push('No orders in 7 days'); }

      const { count: totalOrders } = await supabase
        .from('orders').select('id', { count: 'exact', head: true })
        .eq('user_id', sub.user_id).gte('created_at', thirtyDaysAgo);
      if ((totalOrders ?? 0) === 0) { score += 20; signals.push('No orders in 30 days'); }

      const age = Date.now() - new Date(sub.created_at).getTime();
      if (sub.plan === 'free' && age > 14 * 24 * 60 * 60 * 1000) { score += 20; signals.push('Free plan 14+ days'); }

      if (sub.status === 'trialing' && sub.trial_ends_at) {
        const daysLeft = (new Date(sub.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysLeft <= 3 && daysLeft > 0) { score += 30; signals.push('Trial ending within 3 days'); }
      }

      const riskLevel = score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low';
      await supabase.from('churn_risk_scores').upsert({
        user_id: sub.user_id, subscription_id: sub.id,
        score, risk_level: riskLevel, signals,
        evaluated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      scored.push({ userId: sub.user_id, plan: sub.plan, riskScore: score, riskLevel, signals });
    }

    return res.status(200).json({
      success: true, total: scored.length,
      highRisk: scored.filter(s => s.riskLevel === 'high').length,
      mediumRisk: scored.filter(s => s.riskLevel === 'medium').length,
      users: scored.sort((a, b) => b.riskScore - a.riskScore),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export default {
  async fetch(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const token = authHeader.replace('Bearer ', '');

    const userRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_ANON_KEY }
    });
    if (!userRes.ok) return Response.json({ error: 'Invalid token' }, { status: 401 });
    const { id: userId } = await userRes.json();

    const statsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${userId}&select=streak_days,total_strains,total_scans,milestone_count,last_active_at,plan`,
      { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } }
    );
    const statsArr = await statsRes.json();
    const stats = statsArr[0] || {};

    const daysSinceActive = stats.last_active_at
      ? Math.floor((Date.now() - new Date(stats.last_active_at).getTime()) / 86400000)
      : 999;

    let health = 100;
    if (daysSinceActive > 30) health -= 40;
    else if (daysSinceActive > 14) health -= 25;
    else if (daysSinceActive > 7) health -= 10;
    if (!stats.streak_days || stats.streak_days < 3) health -= 15;
    if (!stats.total_strains || stats.total_strains < 1) health -= 20;
    if (!stats.milestone_count || stats.milestone_count < 1) health -= 10;
    health = Math.max(0, health);

    const risk = health < 40 ? 'high' : health < 65 ? 'medium' : 'low';

    const recommendations = [];
    if (daysSinceActive > 7) recommendations.push({ action: 'login', message: 'Log back in to keep your compliance tracking current' });
    if (!stats.streak_days || stats.streak_days < 7) recommendations.push({ action: 'streak', message: 'Build a 7-day streak to unlock the Week Tracker badge' });
    if (!stats.total_strains || stats.total_strains < 10) recommendations.push({ action: 'strain', message: 'Add 10 strains to unlock the Master Grower badge' });
    if (stats.plan === 'free') recommendations.push({ action: 'upgrade', message: 'Upgrade to Dispensary Pro for METRC sync, unlimited strains, and patient records', cta_url: '/pricing' });

    return Response.json({
      user_id: userId,
      health_score: health,
      churn_risk: risk,
      days_since_active: daysSinceActive,
      streak_days: stats.streak_days || 0,
      total_strains: stats.total_strains || 0,
      total_scans: stats.total_scans || 0,
      milestones_earned: stats.milestone_count || 0,
      plan: stats.plan || 'free',
      recommendations,
    });
  }
};

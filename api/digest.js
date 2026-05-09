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

    const since = new Date(Date.now() - 7 * 86400000).toISOString();

    const [strainsRes, batchesRes, patientsRes, statsRes] = await Promise.all([
      fetch(`${env.SUPABASE_URL}/rest/v1/strains?user_id=eq.${userId}&created_at=gte.${since}&select=id,name,type,status`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/batches?user_id=eq.${userId}&created_at=gte.${since}&select=id,batch_id,quantity,status`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/patients?dispensary_id=eq.${userId}&created_at=gte.${since}&select=id,patient_id`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
      fetch(`${env.SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${userId}&select=streak_days,total_strains,total_scans,milestone_count`, {
        headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` }
      }),
    ]);

    const [strains, batches, patients, statsArr] = await Promise.all([
      strainsRes.json(), batchesRes.json(), patientsRes.json(), statsRes.json()
    ]);
    const stats = statsArr[0] || {};

    const digest = {
      period: 'weekly',
      generated_at: new Date().toISOString(),
      user_id: userId,
      summary: {
        new_strains_this_week: (strains || []).length,
        new_batches_this_week: (batches || []).length,
        new_patients_this_week: (patients || []).length,
        current_streak: stats.streak_days || 0,
        total_strains: stats.total_strains || 0,
        total_scans: stats.total_scans || 0,
        milestones_earned: stats.milestone_count || 0,
      },
      recent_strains: (strains || []).slice(0, 5),
      recent_batches: (batches || []).slice(0, 5),
      action_items: [
        ...(stats.streak_days === 0 ? [{ type: 'streak', message: 'Resume your daily tracking streak to earn cultivation badges' }] : []),
        ...((batches || []).filter(b => b.status === 'pending').length > 0
          ? [{ type: 'batch', message: `${(batches || []).filter(b => b.status === 'pending').length} batches pending METRC compliance review` }]
          : []),
        ...((!stats.total_strains || stats.total_strains < 10)
          ? [{ type: 'upgrade', message: 'Upgrade to the Dispensary plan to track unlimited strains and patients', cta_url: '/pricing' }]
          : []),
      ],
    };

    return Response.json(digest);
  }
};

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PLAN_LIMITS = {
  free: { strains: 10, scans: 100, patients: 25 },
  starter: { strains: 100, scans: 1000, patients: 250 },
  pro: { strains: 1000, scans: 10000, patients: 2500 },
  enterprise: { strains: -1, scans: -1, patients: -1 },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  try {
    const [profileRes, strainsRes, patientsRes, scansRes, complianceRes, trialRes] = await Promise.all([
      supabase.from('profiles').select('id, email, name, company, current_plan, trial_ends_at, created_at, referral_code').eq('id', user_id).single(),
      supabase.from('strains').select('id', { count: 'exact', head: true }).eq('user_id', user_id),
      supabase.from('patients').select('id', { count: 'exact', head: true }).eq('user_id', user_id),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('user_id', user_id).eq('event', 'strain_scan'),
      supabase.from('compliance_audits').select('status, created_at').eq('user_id', user_id).order('created_at', { ascending: false }).limit(1),
      supabase.from('trials').select('status, ends_at').eq('user_id', user_id).single(),
    ]);

    const profile = profileRes.data;
    if (!profile) return res.status(404).json({ error: 'User not found' });

    const plan = profile.current_plan || 'free';
    const limits = PLAN_LIMITS[plan.replace('_trial', '')] || PLAN_LIMITS.free;
    const isTrialing = plan.endsWith('_trial');
    const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    const trialDaysRemaining = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000)) : null;

    const strainCount = strainsRes.count || 0;
    const patientCount = patientsRes.count || 0;
    const scanCount = scansRes.count || 0;
    const lastAudit = complianceRes.data?.[0] || null;
    const trialActive = trialRes.data?.status === 'active';

    // Referral credits
    const { data: credits } = await supabase.from('referral_credits').select('total_credits, total_referrals').eq('user_id', user_id).single();

    return res.status(200).json({
      user: { id: profile.id, name: profile.name, email: profile.email, company: profile.company, member_since: profile.created_at },
      plan: {
        current: plan,
        is_trialing: isTrialing,
        trial_days_remaining: trialDaysRemaining,
        upgrade_cta: plan === 'free' ? 'Start 14-day free trial' : isTrialing ? `Upgrade before trial ends (${trialDaysRemaining}d left)` : null,
      },
      usage: {
        strains: { current: strainCount, limit: limits.strains, pct: limits.strains > 0 ? Math.round((strainCount / limits.strains) * 100) : 0 },
        patients: { current: patientCount, limit: limits.patients, pct: limits.patients > 0 ? Math.round((patientCount / limits.patients) * 100) : 0 },
        scans: { current: scanCount, limit: limits.scans, pct: limits.scans > 0 ? Math.round((scanCount / limits.scans) * 100) : 0 },
      },
      compliance: {
        last_audit_status: lastAudit?.status || null,
        last_audit_date: lastAudit?.created_at || null,
        metrc_connected: !!process.env.METRC_API_KEY,
      },
      referrals: {
        total_credits: credits?.total_credits || 0,
        total_paid_referrals: credits?.total_referrals || 0,
        share_url: `https://strainchain.io/register?ref=${profile.referral_code}`,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

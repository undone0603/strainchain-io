const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const REWARDS = {
  signup: { credits: 15, description: '$15 dispensary credit per sign-up' },
  trial: { credits: 30, description: '$30 credit when referral starts trial' },
  paid: { credits: 75, description: '$75 credit per paying customer referral' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { action, referral_code, referred_user_id, referred_email } = req.body;
    if (!action || !referral_code) return res.status(400).json({ error: 'action and referral_code required' });

    const { data: referrer } = await supabase.from('profiles').select('id, referral_code').eq('referral_code', referral_code).single();
    if (!referrer) return res.status(404).json({ error: 'Invalid referral code' });
    if (referred_user_id && referrer.id === referred_user_id) return res.status(400).json({ error: 'Self-referral not allowed' });

    const reward = REWARDS[action];
    if (!reward) return res.status(400).json({ error: `Unknown action: ${action}` });

    const { data: existing } = await supabase.from('referral_events').select('id').eq('referrer_id', referrer.id).eq('referred_email', referred_email || '').eq('action', action).single();
    if (existing) return res.status(409).json({ error: 'Referral already recorded' });

    await supabase.from('referral_events').insert({ referrer_id: referrer.id, referred_user_id: referred_user_id || null, referred_email: referred_email || null, action, credits_awarded: reward.credits, created_at: new Date().toISOString() });

    const { data: existing_credits } = await supabase.from('referral_credits').select('total_credits, total_referrals').eq('user_id', referrer.id).single();
    await supabase.from('referral_credits').upsert({ user_id: referrer.id, total_credits: (existing_credits?.total_credits || 0) + reward.credits, total_referrals: (existing_credits?.total_referrals || 0) + (action === 'paid' ? 1 : 0), updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    return res.status(200).json({ success: true, credits_awarded: reward.credits, reward_description: reward.description });
  }

  if (req.method === 'GET') {
    const { user_id, code } = req.query;
    if (code) {
      const { data } = await supabase.from('profiles').select('id, referral_code').eq('referral_code', code).single();
      if (!data) return res.status(404).json({ valid: false });
      return res.status(200).json({ valid: true, referral_url: `https://strainchain.io/register?ref=${code}` });
    }
    if (!user_id) return res.status(400).json({ error: 'user_id or code required' });
    const { data: credits } = await supabase.from('referral_credits').select('total_credits, total_referrals').eq('user_id', user_id).single();
    const { data: events } = await supabase.from('referral_events').select('referred_email, action, credits_awarded, created_at').eq('referrer_id', user_id).order('created_at', { ascending: false }).limit(20);
    const { data: profile } = await supabase.from('profiles').select('referral_code').eq('id', user_id).single();
    return res.status(200).json({ referral_code: profile?.referral_code, referral_url: `https://strainchain.io/register?ref=${profile?.referral_code}`, total_credits: credits?.total_credits || 0, total_paid_referrals: credits?.total_referrals || 0, events: events || [], rewards_info: REWARDS });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// /api/email-broadcast - Segmented email broadcast for StrainChain
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { segment, subject, html } = req.body;
    if (!segment || !subject || !html) return res.status(400).json({ error: 'Missing required fields' });

    let userIds = null;
    if (segment === 'trialing') {
      const { data } = await supabase.from('subscriptions').select('user_id').eq('status', 'trialing');
      userIds = data?.map(s => s.user_id) ?? [];
    } else if (segment === 'free') {
      const { data } = await supabase.from('subscriptions').select('user_id').eq('plan', 'free');
      userIds = data?.map(s => s.user_id) ?? [];
    } else if (segment === 'paid') {
      const { data } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
      userIds = data?.map(s => s.user_id) ?? [];
    }

    let query = supabase.from('users').select('id, email, full_name');
    if (userIds) query = query.in('id', userIds);
    const { data: users, error } = await query;
    if (error) throw error;

    let sent = 0, failed = 0;
    for (const user of users || []) {
      if (!user.email) continue;
      const personalizedHtml = html.replace(/\{\{name\}\}/g, user.full_name || 'there');
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'StrainChain <hello@strainchain.io>', to: user.email, subject, html: personalizedHtml }),
      });
      if (r.ok) sent++; else failed++;
    }

    await supabase.from('broadcast_log').insert({ segment, subject, sent, failed, sent_at: new Date().toISOString() });
    return res.status(200).json({ success: true, segment, sent, failed });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

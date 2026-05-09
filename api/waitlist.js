const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { email, name, company, state, dispensary_type } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const { data: existing } = await supabase.from('waitlist').select('id').eq('email', email).single();
    if (existing) return res.status(200).json({ message: 'Already on waitlist' });

    const { error } = await supabase.from('waitlist').insert({
      email, name, company, state, dispensary_type,
      joined_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });

    const { count } = await supabase.from('waitlist').select('*', { count: 'exact', head: true });

    await resend.emails.send({
      from: 'StrainChain <noreply@strainchain.io>',
      to: email,
      subject: "You're on the StrainChain waitlist!",
      html: `<h2>Welcome, ${name || 'friend'}!</h2><p>You're #${count} on the StrainChain waitlist. We'll notify you when your state (${state || 'your area'}) is ready for onboarding.</p>`,
    }).catch(() => {});

    return res.status(200).json({ success: true, position: count });
  }

  if (req.method === 'GET') {
    const { admin_key } = req.query;
    if (admin_key !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const { data, count } = await supabase.from('waitlist').select('*', { count: 'exact' }).order('joined_at', { ascending: false });
    return res.status(200).json({ total: count, entries: data || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

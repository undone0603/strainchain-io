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
    const { name, email, company, state, dispensary_count, annual_revenue, message } = req.body;
    if (!name || !email || !company) return res.status(400).json({ error: 'name, email, and company required' });

    const { error } = await supabase.from('enterprise_inquiries').insert({
      name, email, company, state, dispensary_count, annual_revenue, message,
      status: 'new',
      created_at: new Date().toISOString(),
    });
    if (error) return res.status(500).json({ error: error.message });

    await Promise.all([
      resend.emails.send({
        from: 'StrainChain <noreply@strainchain.io>',
        to: email,
        subject: 'Your StrainChain Enterprise inquiry has been received',
        html: `<h2>Hi ${name},</h2><p>Thank you for your interest in StrainChain Enterprise! Our compliance specialists will reach out within 1 business day to discuss a custom plan for your operation.</p><p><strong>Company:</strong> ${company}<br/><strong>State:</strong> ${state || 'N/A'}<br/><strong>Dispensaries:</strong> ${dispensary_count || 'N/A'}</p>`,
      }).catch(() => {}),
      resend.emails.send({
        from: 'StrainChain <noreply@strainchain.io>',
        to: process.env.SALES_EMAIL || 'sales@strainchain.io',
        subject: `Enterprise inquiry: ${company} - ${dispensary_count || '?'} locations in ${state || 'unknown state'}`,
        html: `<p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}<br/><strong>Company:</strong> ${company}<br/><strong>State:</strong> ${state || 'N/A'}<br/><strong>Dispensaries:</strong> ${dispensary_count || 'N/A'}<br/><strong>Annual Revenue:</strong> ${annual_revenue || 'N/A'}<br/><strong>Message:</strong> ${message || 'None'}</p>`,
      }).catch(() => {}),
    ]);

    return res.status(200).json({ success: true, message: 'Enterprise inquiry received. Our team will contact you within 1 business day.' });
  }

  if (req.method === 'GET') {
    const { admin_key } = req.query;
    if (admin_key !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const { data, count } = await supabase.from('enterprise_inquiries').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    return res.status(200).json({ total: count, inquiries: data || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

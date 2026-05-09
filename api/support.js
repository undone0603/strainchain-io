const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@strainchain.io';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@strainchain.io';

async function sendEmail(to, subject, html) {
  if (!SENDGRID_API_KEY) return;
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${SENDGRID_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ personalizations: [{ to: [{ email: to }] }], from: { email: FROM_EMAIL, name: 'StrainChain Support' }, subject, content: [{ type: 'text/html', value: html }] }),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { user_id, email, name, subject, message, category = 'general', priority = 'normal' } = req.body;
    if (!email || !subject || !message) return res.status(400).json({ error: 'email, subject, and message required' });

    const validCategories = ['compliance', 'metrc', 'billing', 'technical', 'account', 'general'];
    if (!validCategories.includes(category)) return res.status(400).json({ error: `Invalid category. Use: ${validCategories.join(', ')}` });

    const { data: ticket, error } = await supabase.from('support_tickets').insert({ user_id: user_id || null, email, name: name || null, subject, message, category, priority, status: 'open', created_at: new Date().toISOString() }).select('id').single();
    if (error) return res.status(500).json({ error: error.message });

    await sendEmail(SUPPORT_EMAIL, `[${priority.toUpperCase()}] New Ticket #${ticket.id} - ${subject}`, `<p>From: ${email}</p><p>Category: ${category}</p><p>${message}</p>`);
    await sendEmail(email, `Support ticket received - #${ticket.id}`, `<p>Thanks for reaching out! Your ticket #${ticket.id} has been received. We respond within 24 hours for standard tickets and 4 hours for compliance/METRC issues.</p>`);

    return res.status(200).json({ success: true, ticket_id: ticket.id, message: 'Ticket submitted. We will respond within 24 hours.' });
  }

  if (req.method === 'GET') {
    const { user_id, ticket_id } = req.query;
    if (!user_id && !ticket_id) return res.status(400).json({ error: 'user_id or ticket_id required' });

    if (ticket_id) {
      const { data, error } = await supabase.from('support_tickets').select('id, subject, category, priority, status, created_at').eq('id', ticket_id).single();
      if (error || !data) return res.status(404).json({ error: 'Ticket not found' });
      return res.status(200).json(data);
    }

    const { data, error } = await supabase.from('support_tickets').select('id, subject, category, priority, status, created_at').eq('user_id', user_id).order('created_at', { ascending: false }).limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ tickets: data || [] });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

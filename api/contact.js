// /api/contact - StrainChain contact form handler
// Uses native fetch (Node 18+) to send via SendGrid or falls back to logging

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, company, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    const sgApiKey = process.env.SENDGRID_API_KEY;
    const toEmail = process.env.CONTACT_EMAIL || 'hello@strainchain.io';

    if (sgApiKey) {
      // Send via SendGrid REST API (no npm package needed)
      const sgRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sgApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail }] }],
          from: { email: 'noreply@strainchain.io', name: 'StrainChain Contact' },
          reply_to: { email, name },
          subject: `StrainChain Contact: ${name}${company ? ` (${company})` : ''}`,
          content: [
            {
              type: 'text/plain',
              value: `Name: ${name}\nEmail: ${email}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message}`,
            },
          ],
        }),
      });

      if (!sgRes.ok) {
        const errText = await sgRes.text();
        console.error('SendGrid error:', errText);
        // Still return success to avoid leaking internal errors to client
      }
    } else {
      // No email provider configured — log submission for manual follow-up
      console.log('Contact form submission (no email provider configured):', {
        name, email, company, message, timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out. We will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again or email hello@strainchain.io directly.',
    });
  }
};

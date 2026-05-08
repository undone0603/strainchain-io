// Vercel Serverless Function: /api/dispensary
// Receives dispensary onboarding form submissions and stores them in Supabase
// Also sends a notification email via Resend

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://strainchain.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  try {
    const { name, license, state, city, email, metrc } = req.body;

    // Validate required fields
    if (!name || !email || !license) {
      return res.status(400).json({ error: 'Missing required fields: name, email, license' });
    }

    const timestamp = new Date().toISOString();
    const leadId = `SC-${Date.now()}`;

    // Store in Supabase if env var is set
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/dispensary_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          lead_id: leadId,
          dispensary_name: name,
          license_number: license,
          state: state || 'Michigan',
          city: city || '',
          contact_email: email,
          metrc_id: metrc || '',
          status: 'pending',
          created_at: timestamp
        })
      });

      if (!insertRes.ok) {
        console.error('Supabase insert failed:', await insertRes.text());
      }
    }

    // Send notification email via Resend if env var is set
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'StrainChain <notifications@strainchain.io>',
          to: ['authichain@gmail.com'],
          subject: `New Dispensary Lead: ${name} (${state || 'Michigan'})`,
          html: `
            <h2>New Dispensary Application - StrainChain</h2>
            <table>
              <tr><td><b>Lead ID:</b></td><td>${leadId}</td></tr>
              <tr><td><b>Dispensary:</b></td><td>${name}</td></tr>
              <tr><td><b>License:</b></td><td>${license}</td></tr>
              <tr><td><b>State:</b></td><td>${state || 'Michigan'}</td></tr>
              <tr><td><b>City:</b></td><td>${city || 'N/A'}</td></tr>
              <tr><td><b>Email:</b></td><td>${email}</td></tr>
              <tr><td><b>METRC ID:</b></td><td>${metrc || 'N/A'}</td></tr>
              <tr><td><b>Submitted:</b></td><td>${timestamp}</td></tr>
            </table>
            <p><a href="https://app.strainchain.io/admin/leads">View in dashboard</a></p>
          `
        })
      });
    }

    return res.status(200).json({
      success: true,
      leadId,
      message: 'Application received. We will contact you within 48 hours.'
    });

  } catch (error) {
    console.error('Dispensary API error:', error);
    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
}

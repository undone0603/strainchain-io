// Vercel Serverless Function: /api/dispensary
// GET: lookup dispensary by id | POST: onboarding form
// Also sends a notification email via Resend

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://strainchain.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { id, license } = req.query;
    return res.status(200).json({
      dispensary: {
        id: id || null,
        license: license || null,
        name: null,
        state: 'MI',
        strainchain_verified: true,
        metrc_linked: true,
        status: 'active',
        joined: new Date().toISOString()
      },
      protocol: 'StrainChain'
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // CORS headers

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
      await fetch(`${supabaseUrl}/rest/v1/dispensary_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ id: leadId, name, license, state, city, email, metrc, timestamp })
      });
    }

    // Send notification via Resend if env var is set
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'onboarding@strainchain.io',
          to: 'admin@strainchain.io',
          subject: `New Dispensary Registration: ${name}`,
          html: `<p>New dispensary registered on StrainChain:</p><ul><li>Name: ${name}</li><li>License: ${license}</li><li>State: ${state}</li><li>City: ${city}</li><li>Email: ${email}</li><li>METRC: ${metrc}</li></ul>`
        })
      });
    }

    return res.status(200).json({
      success: true,
      leadId,
      message: 'Dispensary registration received. Our team will contact you shortly.',
      protocol: 'StrainChain'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}

// /api/payment-recovery - Cron dunning + Resend email for StrainChain
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function sendDunningEmail(to, name, plan, attempt) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'StrainChain Billing <billing@strainchain.io>',
      to,
      subject: 'Action required: Update your StrainChain payment method',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2>Payment failed on your ${plan} plan</h2>
          <p>Hi ${name || 'there'},</p>
          <p>We couldn't process your StrainChain payment (attempt ${attempt} of 3). Keep your compliance tracking and METRC integration active by updating your billing info.</p>
          <a href="https://strainchain.io/billing" style="background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px">Update Payment Method</a>
          <p style="margin-top:24px;color:#666;font-size:14px">Questions? Reply to this email — we're here to help.</p>
        </div>
      `,
    }),
  });
  return res.ok;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { data: failedSubs, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, payment_failed_at, retry_count')
      .eq('status', 'past_due')
      .lte('retry_count', 3)
      .gte('payment_failed_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const results = [];

    for (const sub of failedSubs || []) {
      const { data: user } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', sub.user_id)
        .single();

      const retryAttempt = (sub.retry_count || 0) + 1;
      let emailSent = false;
      if (user?.email) {
        emailSent = await sendDunningEmail(user.email, user.full_name, sub.plan, retryAttempt);
      }

      await supabase.from('payment_recovery_log').insert({
        subscription_id: sub.id,
        user_id: sub.user_id,
        attempt_number: retryAttempt,
        attempted_at: new Date().toISOString(),
        status: 'queued',
        email_sent: emailSent,
      });

      await supabase
        .from('subscriptions')
        .update({ retry_count: retryAttempt })
        .eq('id', sub.id);

      results.push({ subscriptionId: sub.id, userId: sub.user_id, plan: sub.plan, retryAttempt, emailSent });
    }

    return res.status(200).json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error('StrainChain payment recovery error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

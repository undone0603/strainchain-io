// Vercel Serverless Function: /api/webhook
// Handles Stripe webhook events for StrainChain subscription activation
// Events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

export const config = { api: { bodyParser: false } };

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

async function supabaseUpsert(table, data, supabaseUrl, supabaseKey) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(data),
  });
  return res.ok;
}

async function supabaseUpdate(table, match, data, supabaseUrl, supabaseKey) {
  const params = new URLSearchParams(Object.entries(match).map(([k, v]) => [k, `eq.${v}`]));
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify(data),
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecret || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe env vars not configured' });
  }

  let event;
  try {
    const rawBody = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const crypto = await import('crypto');

    // Verify Stripe signature
    const parts = sig.split(',');
    const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
    const sigHash = parts.find(p => p.startsWith('v1=')).split('=').slice(1).join('=');
    const signedPayload = `${timestamp}.${rawBody}`;
    const expected = crypto.default
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');

    if (expected !== sigHash) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    event = JSON.parse(rawBody.toString());
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (!supabaseUrl || !supabaseKey) {
    // Log event but proceed without DB writes if Supabase not configured
    console.log('Stripe event received (no Supabase):', event.type);
    return res.status(200).json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_details?.email || session.customer_email;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const plan = session.metadata?.plan || 'pro';

        await supabaseUpsert('strainchain_subscriptions', {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          email,
          plan,
          status: 'active',
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, supabaseUrl, supabaseKey);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await supabaseUpdate(
          'strainchain_subscriptions',
          { stripe_subscription_id: sub.id },
          { status: sub.status, plan: sub.items?.data?.[0]?.price?.nickname || 'pro', updated_at: new Date().toISOString() },
          supabaseUrl, supabaseKey
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await supabaseUpdate(
          'strainchain_subscriptions',
          { stripe_subscription_id: sub.id },
          { status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          supabaseUrl, supabaseKey
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await supabaseUpdate(
          'strainchain_subscriptions',
          { stripe_subscription_id: invoice.subscription },
          { status: 'past_due', updated_at: new Date().toISOString() },
          supabaseUrl, supabaseKey
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Processing error' });
  }

  return res.status(200).json({ received: true });
}

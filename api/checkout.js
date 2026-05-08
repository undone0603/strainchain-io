// Vercel Serverless Function: /api/checkout
// Creates a Stripe Checkout Session for StrainChain subscriptions
// POST { plan: 'pro' | 'dispensary' | 'enterprise', email?: string }

const PLANS = {
  standard: null, // free tier, no checkout needed
  pro: {
    name: 'StrainChain Pro',
    amount: 9900, // $99/mo in cents
    currency: 'usd',
    interval: 'month',
  },
  dispensary: {
    name: 'Dispensary Suite',
    amount: 29900, // $299/mo
    currency: 'usd',
    interval: 'month',
  },
  eu_dpp: {
    name: 'EU DPP Compliance',
    amount: 4900, // $49 one-time
    currency: 'usd',
    interval: null, // one-time
  },
  btc_auth: {
    name: 'AuthiChain BTC Authentication',
    amount: 29900, // $299 one-time
    currency: 'usd',
    interval: null,
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://strainchain.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  const { plan = 'pro', email } = req.body || {};
  const planConfig = PLANS[plan];

  if (!planConfig) {
    return res.status(400).json({ error: `Invalid plan: ${plan}` });
  }

  try {
    const sessionPayload = {
      payment_method_types: ['card'],
      mode: planConfig.interval ? 'subscription' : 'payment',
      metadata: { plan, source: 'strainchain' },
      success_url: `https://strainchain.io/?checkout=success&plan=${plan}`,
      cancel_url: `https://strainchain.io/?checkout=cancelled`,
      line_items: [
        {
          price_data: {
            currency: planConfig.currency,
            product_data: { name: planConfig.name },
            unit_amount: planConfig.amount,
            ...(planConfig.interval ? { recurring: { interval: planConfig.interval } } : {}),
          },
          quantity: 1,
        },
      ],
    };

    if (email) {
      sessionPayload.customer_email = email;
    }

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(flattenStripeParams(sessionPayload)).toString(),
    });

    const session = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: session.error?.message || 'Stripe error' });
    }

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Flatten nested object to Stripe's x-www-form-urlencoded format
function flattenStripeParams(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenStripeParams(value, fullKey));
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === 'object') {
          Object.assign(result, flattenStripeParams(item, `${fullKey}[${i}]`));
        } else {
          result[`${fullKey}[${i}]`] = item;
        }
      });
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const PLANS = [
  {
    id: 'dispensary_starter',
    name: 'Dispensary Starter',
    price_monthly: 149,
    price_annual: 119,
    stripe_price_id_monthly: 'price_strainchain_ds_monthly',
    stripe_price_id_annual: 'price_strainchain_ds_annual',
    features: [
      'Up to 500 SKUs',
      'METRC compliance sync',
      'Basic strain tracking',
      'POS integration',
      'Email support'
    ],
    limits: { skus: 500, locations: 1, users: 3 },
    trial_days: 14,
    recommended: false
  },
  {
    id: 'dispensary_pro',
    name: 'Dispensary Pro',
    price_monthly: 299,
    price_annual: 239,
    stripe_price_id_monthly: 'price_strainchain_dp_monthly',
    stripe_price_id_annual: 'price_strainchain_dp_annual',
    features: [
      'Unlimited SKUs',
      'METRC + BioTrack sync',
      'Advanced strain analytics',
      'NFT provenance verification',
      'Loyalty program',
      'Multi-location support',
      'Priority support'
    ],
    limits: { skus: -1, locations: 5, users: 10 },
    trial_days: 14,
    recommended: true
  },
  {
    id: 'grower_lab',
    name: 'Grower + Lab',
    price_monthly: 499,
    price_annual: 399,
    stripe_price_id_monthly: 'price_strainchain_gl_monthly',
    stripe_price_id_annual: 'price_strainchain_gl_annual',
    features: [
      'Full cultivation tracking',
      'Lab testing integration',
      'Batch + cure management',
      'Extraction & formulation tracking',
      'Harvest analytics',
      'Supplier management',
      'API access',
      'Dedicated support'
    ],
    limits: { skus: -1, locations: -1, users: -1 },
    trial_days: 14,
    recommended: false
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: null,
    price_annual: null,
    stripe_price_id_monthly: null,
    stripe_price_id_annual: null,
    features: [
      'Custom integrations',
      'Multi-state compliance',
      'White-label options',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom reporting'
    ],
    limits: { skus: -1, locations: -1, users: -1 },
    trial_days: 30,
    recommended: false,
    contact_required: true,
    contact_url: 'https://strainchain.io/enterprise'
  }
];

export default async function handler(req, res) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { billing = 'monthly' } = req.query;
  const annual_discount_percent = 20;

  const plans_with_billing = PLANS.map(plan => ({
    ...plan,
    displayed_price: billing === 'annual' ? plan.price_annual : plan.price_monthly,
    active_stripe_price_id: billing === 'annual' ? plan.stripe_price_id_annual : plan.stripe_price_id_monthly,
    billing_cycle: billing
  }));

  return res.status(200).json({
    success: true,
    billing,
    annual_discount_percent,
    plans: plans_with_billing,
    faq: [
      { q: 'Is METRC included?', a: 'Yes, all plans include METRC compliance sync.' },
      { q: 'Can I track cannabis NFTs?', a: 'Yes, NFT provenance is included on Dispensary Pro and above.' },
      { q: 'Do you support multi-state operators?', a: 'Yes, Enterprise supports multi-state compliance across all legal markets.' },
      { q: 'Is there a free trial?', a: 'Yes, all plans include a 14-day free trial with no credit card required.' }
    ],
    contact: { sales: 'sales@strainchain.io', support: 'support@strainchain.io' }
  });
}

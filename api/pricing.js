export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { billing = 'monthly', segment } = req.query;

  const PRICING = {
    dispensary: {
      starter: {
        name: 'Dispensary Starter',
        monthly: 149,
        annual: 119,
        description: 'Perfect for single-location dispensaries getting started with compliance.',
        features: ['500 SKU limit', 'METRC sync', 'Basic strain tracking', 'POS integration', '14-day free trial'],
        cta: 'Start Free Trial',
        cta_url: '/signup?plan=dispensary_starter'
      },
      pro: {
        name: 'Dispensary Pro',
        monthly: 299,
        annual: 239,
        description: 'For growing dispensaries that need advanced compliance and NFT verification.',
        badge: 'Most Popular',
        features: ['Unlimited SKUs', 'METRC + BioTrack', 'NFT provenance badges', 'Loyalty program', 'Multi-location (5)', 'Priority support', '14-day free trial'],
        cta: 'Start Free Trial',
        cta_url: '/signup?plan=dispensary_pro'
      }
    },
    grower: {
      lab: {
        name: 'Grower + Lab',
        monthly: 499,
        annual: 399,
        description: 'End-to-end cannabis supply chain from seed to sale.',
        features: ['Full cultivation tracking', 'Lab test integration', 'Batch/cure/extraction', 'Harvest analytics', 'Supplier management', 'API access', '14-day free trial'],
        cta: 'Start Free Trial',
        cta_url: '/signup?plan=grower_lab'
      }
    },
    enterprise: {
      custom: {
        name: 'Enterprise',
        monthly: null,
        annual: null,
        description: 'For multi-state operators and large cannabis brands.',
        features: ['Custom integrations', 'Multi-state compliance', 'White-label', 'SLA guarantee', 'Dedicated account manager', '30-day trial'],
        cta: 'Contact Sales',
        cta_url: 'mailto:sales@strainchain.io',
        contact_required: true
      }
    }
  };

  const segment_data = segment && PRICING[segment] ? PRICING[segment] : null;
  const all_plans = Object.values(PRICING).flatMap(s => Object.values(s));
  const plans = segment_data ? Object.values(segment_data) : all_plans;

  const enriched = plans.map(p => ({
    ...p,
    displayed_price: billing === 'annual' ? p.annual : p.monthly,
    savings: p.monthly && p.annual ? `Save $${(p.monthly - p.annual) * 12}/yr` : null,
    billing_cycle: billing
  }));

  return res.status(200).json({
    success: true,
    billing,
    annual_discount: '20% off',
    currency: 'USD',
    plans: enriched,
    segments: Object.keys(PRICING),
    promo_codes_accepted: true,
    contact: {
      sales: 'sales@strainchain.io',
      support: 'support@strainchain.io',
      phone: null
    }
  });
}

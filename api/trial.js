// StrainChain - Dispensary Free Trial API
// Revenue-critical: first-contact conversion for dispensaries
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TRIAL_PLANS = [
    {
      id: 'dispensary_trial',
      name: 'Dispensary Trial',
      trial_days: 30,
      converts_to: 'dispensary_pro',
      price_after_trial: 299,
      billing: 'monthly',
      products_limit: 500,
      transactions_per_month: 5000,
      locations: 1,
      metrc_integration: true,
      pos_integration: true,
      compliance_reporting: true,
      credit_card_required: false,
      features: [
        '500 product SKUs',
        '5,000 transactions/month',
        'METRC compliance integration',
        'POS system sync',
        'Strain blockchain verification',
        'Lab result tracking',
        'Customer loyalty program',
        'Inventory management',
        'Compliance reporting',
        '1 dispensary location',
      ],
    },
    {
      id: 'grower_trial',
      name: 'Grower / Cultivator Trial',
      trial_days: 30,
      converts_to: 'grower_pro',
      price_after_trial: 199,
      billing: 'monthly',
      plants_limit: 1000,
      batches_limit: 50,
      harvest_tracking: true,
      metrc_integration: true,
      lab_integration: true,
      credit_card_required: false,
      features: [
        '1,000 plant tracking',
        '50 harvest batches/month',
        'Seed-to-sale tracking',
        'METRC integration',
        'Lab result integration',
        'Blockchain batch certificates',
        'Compliance audit trail',
        'NFT strain provenance tokens',
      ],
    },
  ];

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Start your free 30-day StrainChain trial. No credit card required.',
      trials: TRIAL_PLANS,
      trust_signals: [
        'No credit card required',
        '30-day full access',
        'METRC-compliant from day 1',
        'Dedicated onboarding specialist',
        'Cancel anytime — your data stays',
      ],
      cta_url: 'https://strainchain.io/trial',
      contact: 'sales@strainchain.io',
    });
  }

  if (req.method === 'POST') {
    const {
      email,
      name,
      dispensary_name,
      license_number,
      state,
      plan_id = 'dispensary_trial',
      metrc_api_key,
      phone,
      referral_source,
    } = req.body || {};

    if (!email || !dispensary_name || !state) {
      return res.status(400).json({
        error: 'email, dispensary_name, and state are required to start a trial',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(422).json({ error: 'Invalid email address' });
    }

    const plan = TRIAL_PLANS.find((p) => p.id === plan_id);
    if (!plan) {
      return res.status(422).json({
        error: `Invalid plan_id. Must be one of: ${TRIAL_PLANS.map((p) => p.id).join(', ')}`,
      });
    }

    const trial_id = `SC-TRIAL-${Date.now()}`;
    const trial_start = new Date();
    const trial_end = new Date(trial_start.getTime() + plan.trial_days * 24 * 60 * 60 * 1000);

    // Production: create Supabase account, send SendGrid welcome email,
    // provision METRC sandbox credentials, alert sales team in Slack

    return res.status(201).json({
      success: true,
      trial_id,
      email,
      name: name || null,
      dispensary_name,
      license_number: license_number || null,
      state,
      phone: phone || null,
      plan,
      trial_start: trial_start.toISOString(),
      trial_end: trial_end.toISOString(),
      days_remaining: plan.trial_days,
      status: 'active',
      metrc_connected: !!metrc_api_key,
      next_steps: [
        'Check your email for your login credentials',
        'Log in to your StrainChain dashboard at strainchain.io/dashboard',
        'Connect your METRC credentials to begin compliance sync',
        'Import your inventory or start with a new batch',
        'Book your onboarding call: strainchain.io/onboarding-call',
      ],
      upgrade_url: `https://strainchain.io/upgrade?trial=${trial_id}&plan=${plan.converts_to}`,
      dashboard_url: 'https://strainchain.io/dashboard',
      support: 'support@strainchain.io',
      message: `Your ${plan.trial_days}-day free StrainChain trial is active for ${dispensary_name}. No credit card required.`,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// StrainChain - Medical Cannabis Patient Registry API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const PATIENT_STATUSES = ['active', 'expired', 'suspended', 'pending_renewal'];
  const QUALIFYING_CONDITIONS = [
    'chronic_pain', 'cancer', 'epilepsy', 'glaucoma', 'hiv_aids', 'ptsd',
    'multiple_sclerosis', 'crohns_disease', 'parkinsons', 'als', 'alzheimers',
    'terminal_illness', 'nausea', 'muscle_spasms', 'anxiety', 'other'
  ];

  if (req.method === 'GET') {
    const { patient_id, registry_id, dispensary_id, status } = req.query;

    if (!patient_id && !registry_id && !dispensary_id) {
      return res.status(400).json({ error: 'patient_id, registry_id, or dispensary_id is required' });
    }

    const patient = {
      patient_id: patient_id || `PAT-${Date.now()}`,
      registry_id: registry_id || `REG-${Date.now()}`,
      dispensary_id: dispensary_id || null,
      status: status || 'active',
      state: 'MI',
      card_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      qualifying_condition: 'chronic_pain',
      caregiver_id: null,
      physician_verified: true,
      monthly_limit_oz: 2.5,
      purchases_this_month_oz: 0.5,
      remaining_limit_oz: 2.0,
      purchase_history_count: 5,
      preferred_dispensary_id: dispensary_id || null,
      created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      last_purchase: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return res.status(200).json({
      success: true,
      patient,
      compliance: {
        card_valid: patient.status === 'active',
        card_days_remaining: Math.floor((new Date(patient.card_expiry) - new Date()) / (24 * 60 * 60 * 1000)),
        purchase_limit_reached: patient.purchases_this_month_oz >= patient.monthly_limit_oz,
        limit_percent_used: Math.round((patient.purchases_this_month_oz / patient.monthly_limit_oz) * 100),
      },
    });
  }

  if (req.method === 'POST') {
    const { dispensary_id, registry_id, state, qualifying_condition, physician_id } = req.body || {};

    if (!registry_id || !state) {
      return res.status(400).json({ error: 'registry_id and state are required' });
    }

    if (qualifying_condition && !QUALIFYING_CONDITIONS.includes(qualifying_condition)) {
      return res.status(422).json({
        error: `Invalid qualifying_condition. Must be one of: ${QUALIFYING_CONDITIONS.join(', ')}`,
      });
    }

    const patient_id = `PAT-${Date.now()}`;

    return res.status(201).json({
      success: true,
      patient_id,
      registry_id,
      state,
      qualifying_condition,
      physician_id,
      status: 'pending_renewal',
      monthly_limit_oz: 2.5,
      card_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      message: 'Patient registration submitted. Awaiting physician verification.',
    });
  }

  if (req.method === 'PUT') {
    const { patient_id, status, card_expiry, monthly_limit_oz } = req.body || {};

    if (!patient_id) {
      return res.status(400).json({ error: 'patient_id is required' });
    }

    if (status && !PATIENT_STATUSES.includes(status)) {
      return res.status(422).json({
        error: `Invalid status. Must be one of: ${PATIENT_STATUSES.join(', ')}`,
      });
    }

    return res.status(200).json({
      success: true,
      patient_id,
      status: status || 'active',
      card_expiry: card_expiry || null,
      monthly_limit_oz: monthly_limit_oz || 2.5,
      updated_at: new Date().toISOString(),
      message: `Patient ${patient_id} record updated`,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const profile = {
    id: 'org_001',
    business_name: 'Green Valley Farms LLC',
    dba: 'Green Valley Cannabis',
    license_number: 'MMFLA-2024-0042',
    license_type: 'grower_class_c',
    license_status: 'active',
    license_expiry: '2027-03-01',
    metrc_license: 'METRC-MI-0042',
    state: 'MI',
    compliance_agency: 'Michigan Cannabis Regulatory Agency',
    owner: {
      name: 'Alex Rivera',
      email: 'alex@greenvalleyfarms.com',
      phone: '+1-555-GRN-VALY',
      background_check: 'cleared',
      cleared_date: '2024-01-15'
    },
    facility: {
      address: '456 Cannabis Way',
      city: 'Roscommon',
      state: 'MI',
      zip: '48653',
      square_footage: 15000,
      grow_rooms: 8,
      canopy_sqft: 8000
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      renewal: '2027-01-01',
      features: ['metrc_sync', 'blockchain_verification', 'lab_integration', 'api_access', 'compliance_alerts']
    },
    stats: {
      active_plants: 2847,
      active_batches: 12,
      total_harvests: 48,
      lifetime_yield_lbs: 2840,
      compliance_score: 98.4,
      metrc_last_sync: new Date().toISOString()
    },
    integrations: [
      { name: 'METRC', status: 'connected', last_sync: new Date().toISOString() },
      { name: 'BioTrackTHC', status: 'disconnected', last_sync: null },
      { name: 'StrainChain Blockchain', status: 'connected', last_sync: new Date().toISOString() }
    ],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: new Date().toISOString(),
    protocol: 'StrainChain'
  };

  if (req.method === 'PUT') {
    const updates = req.body || {};
    const allowed = ['business_name', 'dba', 'owner', 'facility'];
    const updated = Object.fromEntries(
      Object.entries(updates).filter(([k]) => allowed.includes(k))
    );
    return res.status(200).json({
      success: true,
      profile: { ...profile, ...updated, updated_at: new Date().toISOString() },
      message: 'Profile updated successfully'
    });
  }

  return res.status(200).json({ success: true, profile, protocol: 'StrainChain' });
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { batch_id, status, facility_id, date_from, date_to } = req.query;

  const wasteRecords = [
    {
      id: 'waste_001',
      metrc_waste_id: 'METRC-WASTE-2026-001',
      batch_id: 'SC-HARVEST-2026-002',
      facility_id: 'facility_001',
      facility_name: 'Green Valley Farms LLC',
      waste_type: 'plant_material',
      waste_reason: 'failed_testing',
      weight_g: 2840,
      weight_lbs: 6.26,
      disposal_method: 'composting',
      disposal_location: 'on_site',
      witness_name: 'CRA Inspector J. Thompson',
      witness_badge: 'CRA-MI-1042',
      scheduled_date: '2026-04-18',
      completed_date: '2026-04-18',
      status: 'completed',
      metrc_submitted: true,
      metrc_submitted_at: '2026-04-18T16:00:00Z',
      blockchain_hash: '0xwaste001abc123',
      photos: ['https://storage.strainchain.io/waste/waste_001_before.jpg', 'https://storage.strainchain.io/waste/waste_001_after.jpg'],
      notes: 'THC content exceeded allowable limit for failed batch',
      protocol: 'StrainChain'
    },
    {
      id: 'waste_002',
      metrc_waste_id: 'METRC-WASTE-2026-002',
      batch_id: 'SC-EXT-2026-001',
      facility_id: 'facility_001',
      facility_name: 'Green Valley Farms LLC',
      waste_type: 'extraction_byproduct',
      waste_reason: 'production_excess',
      weight_g: 450,
      weight_lbs: 0.99,
      disposal_method: 'incineration',
      disposal_location: 'licensed_facility',
      witness_name: 'Alex Rivera',
      witness_badge: 'EMPLOYEE-001',
      scheduled_date: '2026-05-01',
      completed_date: null,
      status: 'scheduled',
      metrc_submitted: false,
      metrc_submitted_at: null,
      blockchain_hash: null,
      photos: [],
      notes: 'Supercritical CO2 extraction byproduct - residual wax',
      protocol: 'StrainChain'
    },
    {
      id: 'waste_003',
      metrc_waste_id: 'METRC-WASTE-2026-003',
      batch_id: 'SC-CULT-2026-001',
      facility_id: 'facility_002',
      facility_name: 'Sunrise Cannabis Co.',
      waste_type: 'plant_debris',
      waste_reason: 'pest_disease',
      weight_g: 12000,
      weight_lbs: 26.46,
      disposal_method: 'composting',
      disposal_location: 'on_site',
      witness_name: 'State Inspector M. Wallace',
      witness_badge: 'CRA-MI-0891',
      scheduled_date: '2026-03-15',
      completed_date: '2026-03-15',
      status: 'completed',
      metrc_submitted: true,
      metrc_submitted_at: '2026-03-15T14:30:00Z',
      blockchain_hash: '0xwaste003def456',
      photos: ['https://storage.strainchain.io/waste/waste_003_cert.jpg'],
      notes: 'Powdery mildew outbreak - entire grow room affected',
      protocol: 'StrainChain'
    }
  ];

  let filtered = wasteRecords;
  if (batch_id) filtered = filtered.filter(w => w.batch_id === batch_id);
  if (status) filtered = filtered.filter(w => w.status === status);
  if (facility_id) filtered = filtered.filter(w => w.facility_id === facility_id);

  const total_weight_g = filtered.reduce((s, w) => s + w.weight_g, 0);

  return res.status(200).json({
    success: true,
    waste_records: filtered,
    total: filtered.length,
    completed: filtered.filter(w => w.status === 'completed').length,
    scheduled: filtered.filter(w => w.status === 'scheduled').length,
    total_weight_g,
    total_weight_lbs: (total_weight_g / 453.592).toFixed(2),
    metrc_submitted: filtered.filter(w => w.metrc_submitted).length,
    metrc_pending: filtered.filter(w => !w.metrc_submitted).length,
    compliance_note: 'All waste disposal must be witnessed and reported to METRC within 3 business days',
    protocol: 'StrainChain'
  });
};

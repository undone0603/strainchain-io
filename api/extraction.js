module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { batch_id, method, status, facility_id } = req.query;

  const extractions = [
    {
      id: 'ext_001',
      batch_id: 'SC-EXT-2026-001',
      source_batch: 'SC-HARVEST-2026-003',
      strain_name: 'OG Kush',
      facility_id: 'facility_001',
      facility_name: 'Green Valley Processing',
      method: 'CO2_supercritical',
      input_weight_g: 5000,
      output_weight_g: 750,
      yield_percentage: 15.0,
      thc_percentage: 78.4,
      cbd_percentage: 1.2,
      terpene_percentage: 4.8,
      product_type: 'concentrate',
      product_form: 'oil',
      solvent_used: 'CO2',
      residual_solvent_ppm: 0,
      extraction_date: '2026-04-10',
      completion_date: '2026-04-11',
      operator: 'Jordan Smith',
      status: 'completed',
      metrc_tag: 'METRC-EXT-001',
      blockchain_hash: '0xext001abc123',
      lab_tested: true,
      coa_url: 'https://lab.strainchain.io/coa/ext_001',
      protocol: 'StrainChain'
    },
    {
      id: 'ext_002',
      batch_id: 'SC-EXT-2026-002',
      source_batch: 'SC-HARVEST-2026-005',
      strain_name: 'Blue Dream',
      facility_id: 'facility_002',
      facility_name: 'Sunrise Extracts Lab',
      method: 'ethanol',
      input_weight_g: 8000,
      output_weight_g: 960,
      yield_percentage: 12.0,
      thc_percentage: 82.1,
      cbd_percentage: 0.8,
      terpene_percentage: 3.2,
      product_type: 'concentrate',
      product_form: 'distillate',
      solvent_used: 'ethanol',
      residual_solvent_ppm: 180,
      extraction_date: '2026-04-20',
      completion_date: null,
      operator: 'Alex Chen',
      status: 'in_progress',
      metrc_tag: 'METRC-EXT-002',
      blockchain_hash: '0xext002def456',
      lab_tested: false,
      coa_url: null,
      protocol: 'StrainChain'
    },
    {
      id: 'ext_003',
      batch_id: 'SC-EXT-2026-003',
      source_batch: 'SC-HARVEST-2026-001',
      strain_name: 'Wedding Cake',
      facility_id: 'facility_001',
      facility_name: 'Green Valley Processing',
      method: 'rosin',
      input_weight_g: 2000,
      output_weight_g: 220,
      yield_percentage: 11.0,
      thc_percentage: 71.5,
      cbd_percentage: 2.1,
      terpene_percentage: 8.9,
      product_type: 'concentrate',
      product_form: 'rosin',
      solvent_used: 'none',
      residual_solvent_ppm: 0,
      extraction_date: '2026-03-28',
      completion_date: '2026-03-28',
      operator: 'Maria Lopez',
      status: 'completed',
      metrc_tag: 'METRC-EXT-003',
      blockchain_hash: '0xext003ghi789',
      lab_tested: true,
      coa_url: 'https://lab.strainchain.io/coa/ext_003',
      protocol: 'StrainChain'
    }
  ];

  let filtered = extractions;
  if (batch_id) filtered = filtered.filter(e => e.batch_id === batch_id);
  if (method) filtered = filtered.filter(e => e.method === method);
  if (status) filtered = filtered.filter(e => e.status === status);
  if (facility_id) filtered = filtered.filter(e => e.facility_id === facility_id);

  const total_input = filtered.reduce((s, e) => s + e.input_weight_g, 0);
  const total_output = filtered.reduce((s, e) => s + e.output_weight_g, 0);

  return res.status(200).json({
    success: true,
    extractions: filtered,
    total: filtered.length,
    completed: filtered.filter(e => e.status === 'completed').length,
    in_progress: filtered.filter(e => e.status === 'in_progress').length,
    total_input_g: total_input,
    total_output_g: total_output,
    average_yield_pct: total_input > 0 ? ((total_output / total_input) * 100).toFixed(2) : 0,
    protocol: 'StrainChain'
  });
};

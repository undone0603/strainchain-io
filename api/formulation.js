module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { product_type, strain_id, status } = req.query;

  const formulations = [
    {
      id: 'form_001',
      batch_id: 'SC-FORM-2026-001',
      product_name: 'OG Kush Vape Cartridge 1g',
      product_type: 'vape_cartridge',
      strain_id: 'strain_og_kush',
      strain_name: 'OG Kush',
      source_batch: 'SC-EXT-2026-001',
      formulation_type: 'full_spectrum',
      thc_mg_per_unit: 800,
      cbd_mg_per_unit: 10,
      terpene_mg_per_unit: 38,
      total_cannabinoids_pct: 84.8,
      units_produced: 750,
      fill_volume_ml: 1.0,
      hardware_type: '510_thread',
      cutting_agents: [],
      additives: ['natural_terpenes'],
      child_resistant: true,
      manufactured_date: '2026-04-15',
      expiry_date: '2027-04-15',
      status: 'released',
      metrc_tag: 'METRC-FORM-001',
      blockchain_hash: '0xform001abc',
      lab_tested: true,
      coa_url: 'https://lab.strainchain.io/coa/form_001',
      protocol: 'StrainChain'
    },
    {
      id: 'form_002',
      batch_id: 'SC-FORM-2026-002',
      product_name: 'Blue Dream Gummies 10mg THC (10ct)',
      product_type: 'edible',
      strain_id: 'strain_blue_dream',
      strain_name: 'Blue Dream',
      source_batch: 'SC-EXT-2026-002',
      formulation_type: 'distillate_infused',
      thc_mg_per_unit: 10,
      cbd_mg_per_unit: 0,
      terpene_mg_per_unit: 0,
      total_cannabinoids_pct: null,
      units_produced: 5000,
      fill_volume_ml: null,
      hardware_type: null,
      cutting_agents: [],
      additives: ['pectin', 'natural_flavoring', 'citric_acid'],
      child_resistant: true,
      manufactured_date: '2026-04-22',
      expiry_date: '2027-01-22',
      status: 'in_production',
      metrc_tag: 'METRC-FORM-002',
      blockchain_hash: '0xform002def',
      lab_tested: false,
      coa_url: null,
      protocol: 'StrainChain'
    },
    {
      id: 'form_003',
      batch_id: 'SC-FORM-2026-003',
      product_name: 'Wedding Cake Live Rosin 1g',
      product_type: 'concentrate',
      strain_id: 'strain_wedding_cake',
      strain_name: 'Wedding Cake',
      source_batch: 'SC-EXT-2026-003',
      formulation_type: 'live_rosin',
      thc_mg_per_unit: 715,
      cbd_mg_per_unit: 21,
      terpene_mg_per_unit: 89,
      total_cannabinoids_pct: 73.6,
      units_produced: 220,
      fill_volume_ml: null,
      hardware_type: null,
      cutting_agents: [],
      additives: [],
      child_resistant: true,
      manufactured_date: '2026-03-30',
      expiry_date: '2027-03-30',
      status: 'released',
      metrc_tag: 'METRC-FORM-003',
      blockchain_hash: '0xform003ghi',
      lab_tested: true,
      coa_url: 'https://lab.strainchain.io/coa/form_003',
      protocol: 'StrainChain'
    }
  ];

  let filtered = formulations;
  if (product_type) filtered = filtered.filter(f => f.product_type === product_type);
  if (strain_id) filtered = filtered.filter(f => f.strain_id === strain_id);
  if (status) filtered = filtered.filter(f => f.status === status);

  return res.status(200).json({
    success: true,
    formulations: filtered,
    total: filtered.length,
    released: filtered.filter(f => f.status === 'released').length,
    in_production: filtered.filter(f => f.status === 'in_production').length,
    total_units: filtered.reduce((s, f) => s + f.units_produced, 0),
    protocol: 'StrainChain'
  });
};

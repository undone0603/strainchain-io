module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { strain_id, batch_id, status, grower_id } = req.query;

  const seedBatches = [
    {
      id: 'seed_001',
      batch_id: 'SC-SEED-2026-001',
      strain_id: 'strain_og_kush',
      strain_name: 'OG Kush',
      grower_id: 'grower_001',
      grower_name: 'Green Valley Farms',
      seed_type: 'feminized',
      quantity: 500,
      germination_rate: 0.94,
      source: 'certified_seedbank',
      source_name: 'Pacific Seed Bank',
      certificate_number: 'PSB-2026-F-441',
      planted_date: '2026-02-01',
      expected_harvest: '2026-07-15',
      status: 'growing',
      metrc_tag: 'METRC-SEED-001',
      blockchain_hash: '0xabc123def456',
      protocol: 'StrainChain'
    },
    {
      id: 'seed_002',
      batch_id: 'SC-SEED-2026-002',
      strain_id: 'strain_blue_dream',
      strain_name: 'Blue Dream',
      grower_id: 'grower_002',
      grower_name: 'Sunrise Cannabis Co.',
      seed_type: 'autoflower',
      quantity: 250,
      germination_rate: 0.91,
      source: 'in_house',
      source_name: 'Sunrise Cannabis Co. Mother Room',
      certificate_number: 'SCC-2026-A-089',
      planted_date: '2026-03-15',
      expected_harvest: '2026-06-01',
      status: 'germinating',
      metrc_tag: 'METRC-SEED-002',
      blockchain_hash: '0xdef789ghi012',
      protocol: 'StrainChain'
    },
    {
      id: 'seed_003',
      batch_id: 'SC-SEED-2025-098',
      strain_id: 'strain_wedding_cake',
      strain_name: 'Wedding Cake',
      grower_id: 'grower_001',
      grower_name: 'Green Valley Farms',
      seed_type: 'regular',
      quantity: 1000,
      germination_rate: 0.88,
      source: 'certified_seedbank',
      source_name: 'Humboldt Seed Company',
      certificate_number: 'HSC-2025-R-201',
      planted_date: '2025-11-01',
      expected_harvest: '2026-04-30',
      status: 'harvested',
      metrc_tag: 'METRC-SEED-003',
      blockchain_hash: '0x789abc012def',
      protocol: 'StrainChain'
    }
  ];

  let filtered = seedBatches;
  if (strain_id) filtered = filtered.filter(s => s.strain_id === strain_id);
  if (batch_id) filtered = filtered.filter(s => s.batch_id === batch_id);
  if (status) filtered = filtered.filter(s => s.status === status);
  if (grower_id) filtered = filtered.filter(s => s.grower_id === grower_id);

  return res.status(200).json({
    success: true,
    seed_batches: filtered,
    total: filtered.length,
    growing: filtered.filter(s => s.status === 'growing').length,
    germinating: filtered.filter(s => s.status === 'germinating').length,
    harvested: filtered.filter(s => s.status === 'harvested').length,
    protocol: 'StrainChain'
  });
};

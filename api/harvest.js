module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/harvest',
      harvests: [
        {
          id: 'harv_001',
          cultivation_id: 'cult_001',
          strain: 'OG Kush',
          harvest_date: '2026-04-28',
          wet_weight_lbs: 42.5,
          dry_weight_lbs: 9.8,
          yield_pct: 23.1,
          rooms_harvested: ['Room A', 'Room B'],
          metrc_harvest_id: 'HV-CA-001234',
          status: 'drying',
          notes: 'Excellent resin production this cycle'
        },
        {
          id: 'harv_002',
          cultivation_id: 'cult_002',
          strain: 'Blue Dream',
          harvest_date: '2026-05-01',
          wet_weight_lbs: 38.2,
          dry_weight_lbs: 8.4,
          yield_pct: 22.0,
          rooms_harvested: ['Greenhouse 1'],
          metrc_harvest_id: 'HV-OR-005678',
          status: 'curing',
          notes: 'Good terpene development'
        }
      ],
      total: 2,
      total_dry_weight_lbs: 18.2,
      avg_yield_pct: 22.55,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

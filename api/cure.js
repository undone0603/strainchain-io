module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/cure',
      cure_batches: [
        {
          id: 'cure_001',
          harvest_id: 'harv_001',
          strain: 'OG Kush',
          start_date: '2026-04-30',
          end_date: '2026-05-28',
          cure_days: 28,
          weight_start_lbs: 9.8,
          weight_end_lbs: 9.2,
          moisture_pct: 11.5,
          temp_f: 65,
          humidity_pct: 62,
          status: 'in_progress',
          location: 'Cure Room A'
        },
        {
          id: 'cure_002',
          harvest_id: 'harv_002',
          strain: 'Blue Dream',
          start_date: '2026-05-03',
          end_date: '2026-05-31',
          cure_days: 28,
          weight_start_lbs: 8.4,
          weight_end_lbs: null,
          moisture_pct: 13.2,
          temp_f: 65,
          humidity_pct: 60,
          status: 'in_progress',
          location: 'Cure Room B'
        }
      ],
      total: 2,
      in_progress: 2,
      completed: 0,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

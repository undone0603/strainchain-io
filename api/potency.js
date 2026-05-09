export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { strain_id, batch_id, lab_id, above_thc } = req.query;

  const potency_results = [
    {
      id: 'pot_001',
      strain_id: 'strain_001',
      strain_name: 'Blue Dream',
      batch_id: 'batch_001',
      lab_id: 'lab_001',
      lab_name: 'CannaSafe Analytics',
      test_date: '2025-05-01',
      sample_type: 'flower',
      cannabinoids: {
        thc: 22.4,
        thca: 24.8,
        cbd: 0.12,
        cbda: 0.08,
        cbn: 0.05,
        cbg: 0.87,
        cbga: 0.34,
        thcv: 0.21,
        delta8_thc: 0.01,
        total_thc: 21.6,
        total_cbd: 0.19,
        total_cannabinoids: 24.7
      },
      terpenes: [
        { name: 'Myrcene', percentage: 0.52 },
        { name: 'Caryophyllene', percentage: 0.31 },
        { name: 'Limonene', percentage: 0.28 },
        { name: 'Pinene', percentage: 0.19 }
      ],
      moisture_content: 12.3,
      water_activity: 0.58,
      pass_fail: 'pass',
      coa_url: '/lab-results/coa_pot_001.pdf',
      metrc_uid: 'METRC-POT-001'
    },
    {
      id: 'pot_002',
      strain_id: 'strain_002',
      strain_name: 'OG Kush',
      batch_id: 'batch_002',
      lab_id: 'lab_001',
      lab_name: 'CannaSafe Analytics',
      test_date: '2025-05-03',
      sample_type: 'concentrate',
      cannabinoids: {
        thc: 78.5,
        thca: 1.2,
        cbd: 0.04,
        cbda: 0.01,
        cbn: 0.33,
        cbg: 0.12,
        cbga: 0.05,
        thcv: 0.08,
        delta8_thc: 0.02,
        total_thc: 79.6,
        total_cbd: 0.05,
        total_cannabinoids: 81.3
      },
      terpenes: [
        { name: 'Limonene', percentage: 1.24 },
        { name: 'Myrcene', percentage: 0.88 },
        { name: 'Linalool', percentage: 0.41 }
      ],
      moisture_content: null,
      water_activity: null,
      pass_fail: 'pass',
      coa_url: '/lab-results/coa_pot_002.pdf',
      metrc_uid: 'METRC-POT-002'
    }
  ];

  let filtered = potency_results;
  if (strain_id) filtered = filtered.filter(p => p.strain_id === strain_id);
  if (batch_id) filtered = filtered.filter(p => p.batch_id === batch_id);
  if (lab_id) filtered = filtered.filter(p => p.lab_id === lab_id);
  if (above_thc) filtered = filtered.filter(p => p.cannabinoids.thc >= parseFloat(above_thc));

  const avg_thc = filtered.length ? (filtered.reduce((sum, p) => sum + p.cannabinoids.thc, 0) / filtered.length).toFixed(2) : 0;

  return res.status(200).json({
    success: true,
    potency_results: filtered,
    total: filtered.length,
    average_thc_percent: parseFloat(avg_thc),
    pass_count: filtered.filter(p => p.pass_fail === 'pass').length,
    fail_count: filtered.filter(p => p.pass_fail === 'fail').length,
    generated_at: new Date().toISOString()
  });
}

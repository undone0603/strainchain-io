module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/testing',
      test_results: [
        {
          id: 'test_001',
          batch_id: 'batch_001',
          strain: 'OG Kush',
          lab: 'CannaSafe Analytics',
          test_date: '2026-05-01',
          thc: 24.3,
          cbd: 0.8,
          terpenes: { myrcene: 1.2, limonene: 0.8, caryophyllene: 0.6 },
          pesticides: 'pass',
          mold: 'pass',
          heavy_metals: 'pass',
          status: 'passed',
          coa_url: 'https://strainchain.io/coa/test_001'
        },
        {
          id: 'test_002',
          batch_id: 'batch_002',
          strain: 'Blue Dream',
          lab: 'Steep Hill Labs',
          test_date: '2026-05-03',
          thc: 18.7,
          cbd: 1.2,
          terpenes: { myrcene: 0.9, terpinolene: 1.4, ocimene: 0.5 },
          pesticides: 'pass',
          mold: 'pass',
          heavy_metals: 'pass',
          status: 'passed',
          coa_url: 'https://strainchain.io/coa/test_002'
        }
      ],
      total: 2,
      pass_rate: 1.0,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

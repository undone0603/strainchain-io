// StrainChain Lab Results API
// Cannabis laboratory test results and COA (Certificate of Analysis) endpoint

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { strainId, batchId, labId, status } = req.query;

    const labResults = [
      {
        id: 'LAB-001',
        strainId: strainId || 'SC-STRAIN-001',
        strainName: 'Blue Dream',
        batchId: batchId || 'BATCH-2026-001',
        labId: 'CANN-SAFE-001',
        labName: 'CannSafe Analytics',
        labLicense: 'C8-0000001-LIC',
        status: 'passed',
        coaUrl: 'https://strainchain.io/coa/LAB-001',
        testedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 90).toISOString(),
        cannabinoids: {
          thc: { value: 22.4, unit: '%', passing: true },
          thca: { value: 24.8, unit: '%', passing: true },
          cbd: { value: 0.8, unit: '%', passing: true },
          cbda: { value: 0.9, unit: '%', passing: true },
          cbn: { value: 0.1, unit: '%', passing: true },
          cbg: { value: 0.6, unit: '%', passing: true }
        },
        terpenes: [
          { name: 'myrcene', value: 0.42, unit: '%' },
          { name: 'limonene', value: 0.28, unit: '%' },
          { name: 'caryophyllene', value: 0.19, unit: '%' },
          { name: 'linalool', value: 0.15, unit: '%' }
        ],
        safety: {
          pesticides: { status: 'not_detected', passing: true },
          heavyMetals: { status: 'not_detected', passing: true },
          residualSolvents: { status: 'not_detected', passing: true },
          microbials: { status: 'not_detected', passing: true },
          mycotoxins: { status: 'not_detected', passing: true },
          moisture: { value: 11.2, unit: '%', passing: true }
        },
        blockchainHash: '0x' + Math.random().toString(16).slice(2, 66),
        blockchainVerified: true,
        metrcId: 'METRC-LAB-' + Math.floor(Math.random() * 100000)
      },
      {
        id: 'LAB-002',
        strainId: strainId || 'SC-STRAIN-002',
        strainName: 'OG Kush',
        batchId: batchId || 'BATCH-2026-002',
        labId: 'SC-LABS-001',
        labName: 'SC Labs',
        labLicense: 'C8-0000002-LIC',
        status: 'passed',
        coaUrl: 'https://strainchain.io/coa/LAB-002',
        testedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 83).toISOString(),
        cannabinoids: {
          thc: { value: 26.1, unit: '%', passing: true },
          thca: { value: 29.2, unit: '%', passing: true },
          cbd: { value: 0.2, unit: '%', passing: true },
          cbg: { value: 0.4, unit: '%', passing: true }
        },
        safety: {
          pesticides: { status: 'not_detected', passing: true },
          heavyMetals: { status: 'not_detected', passing: true },
          microbials: { status: 'not_detected', passing: true }
        },
        blockchainHash: '0x' + Math.random().toString(16).slice(2, 66),
        blockchainVerified: true,
        metrcId: 'METRC-LAB-' + Math.floor(Math.random() * 100000)
      }
    ];

    let filtered = labResults;
    if (strainId) filtered = filtered.filter(r => r.strainId === strainId);
    if (batchId) filtered = filtered.filter(r => r.batchId === batchId);
    if (status) filtered = filtered.filter(r => r.status === status);

    return res.status(200).json({
      success: true,
      platform: 'StrainChain',
      totalResults: filtered.length,
      results: filtered,
      filters: { strainId, batchId, labId, status },
      accreditedLabs: ['CannSafe Analytics', 'SC Labs', 'Encore Labs', 'Anresco Laboratories'],
      blockchainVerified: true,
      docs: 'https://strainchain.io/docs/lab',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/packaging',
      packages: [
        {
          id: 'pkg_001',
          label: 'SC-2026-OGK-001',
          strain: 'OG Kush',
          batch_id: 'batch_001',
          weight_grams: 28,
          package_type: 'flower',
          metrc_tag: '1A40503000085B000000001',
          status: 'active',
          packaged_date: '2026-05-02'
        },
        {
          id: 'pkg_002',
          label: 'SC-2026-BD-002',
          strain: 'Blue Dream',
          batch_id: 'batch_002',
          weight_grams: 3.5,
          package_type: 'pre-roll',
          metrc_tag: '1A40503000085B000000002',
          status: 'active',
          packaged_date: '2026-05-04'
        }
      ],
      total: 2,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

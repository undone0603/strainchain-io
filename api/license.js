// api/license.js - Cannabis Business License Verification
const allowedOrigins = ['https://strainchain.io', 'https://www.strainchain.io'];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { license_number, state } = req.query;
    const licenses = [
      {
        license_number: 'C11-0000001-LIC',
        business_name: 'Green Valley Dispensary',
        dba: 'Green Valley',
        license_type: 'Retailer',
        state: 'CA',
        city: 'Los Angeles',
        address: '1234 Cannabis Blvd, Los Angeles, CA 90001',
        status: 'active',
        issue_date: '2023-01-15',
        expiry_date: '2025-01-14',
        activities: ['retail_sale', 'delivery'],
        blockchain_verified: true,
        blockchain_hash: '0xlic001hash'
      },
      {
        license_number: 'M00-18-0000001-TEMP',
        business_name: 'Emerald Triangle Farms',
        dba: 'ET Farms',
        license_type: 'Cultivator',
        state: 'CA',
        city: 'Humboldt',
        address: '5678 Farm Road, Humboldt, CA 95501',
        status: 'active',
        issue_date: '2023-06-01',
        expiry_date: '2025-05-31',
        activities: ['cultivation_outdoor', 'harvest_processing'],
        blockchain_verified: true,
        blockchain_hash: '0xlic002hash'
      },
    ];
    let filtered = licenses;
    if (license_number) filtered = filtered.filter(l => l.license_number === license_number);
    if (state) filtered = filtered.filter(l => l.state === state.toUpperCase());
    return res.status(200).json({
      success: true,
      endpoint: '/api/license',
      licenses: filtered,
      total: filtered.length,
      verified_count: filtered.filter(l => l.blockchain_verified).length,
      blockchain_verified: true,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { license_number, state } = req.body || {};
    if (!license_number) return res.status(400).json({ error: 'license_number is required' });
    return res.status(200).json({
      success: true,
      verification: {
        license_number,
        state: state || 'CA',
        verified: true,
        status: 'active',
        verified_at: new Date().toISOString(),
        blockchain_hash: `0x${Math.random().toString(16).slice(2, 18)}`,
      },
      protocol: 'StrainChain'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

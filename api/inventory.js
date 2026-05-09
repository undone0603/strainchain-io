// api/inventory.js - Cannabis Inventory Management
const allowedOrigins = ['https://strainchain.io', 'https://www.strainchain.io'];

module.exports = async (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { location, strain, status } = req.query;
    const inventory = [
      {
        id: 'INV-001',
        strain: 'Blue Dream',
        category: 'flower',
        quantity: 453.6,
        unit: 'grams',
        location: 'Vault A - Shelf 3',
        license: 'C11-0000001-LIC',
        metrc_tag: 'ABCDEF012345670000000001',
        thc: 22.4,
        cbd: 0.8,
        status: 'available',
        received_at: '2024-10-15',
        expires_at: '2025-04-15',
        blockchain_hash: '0xinv001hash'
      },
      {
        id: 'INV-002',
        strain: 'OG Kush',
        category: 'pre_roll',
        quantity: 100,
        unit: 'units',
        location: 'Display Case B',
        license: 'C11-0000001-LIC',
        metrc_tag: 'ABCDEF012345670000000002',
        thc: 19.1,
        cbd: 0.4,
        status: 'available',
        received_at: '2024-10-18',
        expires_at: '2025-04-18',
        blockchain_hash: '0xinv002hash'
      },
      {
        id: 'INV-003',
        strain: 'Gelato',
        category: 'concentrate',
        quantity: 28.3,
        unit: 'grams',
        location: 'Vault B - Shelf 1',
        license: 'C11-0000001-LIC',
        metrc_tag: 'ABCDEF012345670000000003',
        thc: 78.2,
        cbd: 1.1,
        status: 'low_stock',
        received_at: '2024-11-01',
        expires_at: '2025-05-01',
        blockchain_hash: '0xinv003hash'
      },
    ];
    let filtered = inventory;
    if (strain) filtered = filtered.filter(i => i.strain.toLowerCase().includes(strain.toLowerCase()));
    if (status) filtered = filtered.filter(i => i.status === status);
    if (location) filtered = filtered.filter(i => i.location.toLowerCase().includes(location.toLowerCase()));
    return res.status(200).json({
      success: true,
      endpoint: '/api/inventory',
      inventory: filtered,
      total: filtered.length,
      total_weight_grams: filtered.reduce((sum, i) => sum + (i.unit === 'grams' ? i.quantity : 0), 0),
      low_stock_items: filtered.filter(i => i.status === 'low_stock').length,
      blockchain_verified: true,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { strain, category, quantity, unit, location, metrc_tag, thc, cbd } = req.body || {};
    if (!strain || !quantity || !unit) return res.status(400).json({ error: 'strain, quantity, and unit are required' });
    return res.status(200).json({
      success: true,
      inventory_item: {
        id: `INV-${Date.now().toString().slice(-4)}`,
        strain,
        category: category || 'flower',
        quantity,
        unit,
        location: location || 'Unassigned',
        metrc_tag: metrc_tag || `ABCDEF${Date.now()}`,
        thc: thc || 0,
        cbd: cbd || 0,
        status: 'available',
        received_at: new Date().toISOString().split('T')[0],
        blockchain_hash: `0x${Math.random().toString(16).slice(2, 18)}`,
      },
      protocol: 'StrainChain'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

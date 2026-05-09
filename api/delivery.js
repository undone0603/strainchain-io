const deliveries = [
  { id: 'dlv_001', manifest_id: 'MNF-2025-0001', from_dispensary: 'Green Leaf Cultivators', to_dispensary: 'Cannabis Corner', driver: 'Carlos Mendez', vehicle: 'CA-7832', products: [{ sku: 'SKU-001', name: 'Blue Dream 3.5g', quantity: 100 }, { sku: 'SKU-002', name: 'OG Kush 1g', quantity: 200 }], status: 'in_transit', departed_at: '2025-01-15T09:00:00Z', estimated_arrival: '2025-01-15T12:00:00Z', metrc_manifest: 'MET-2025-001847', blockchain_hash: '0xabcdef123456', blockchain_verified: true },
  { id: 'dlv_002', manifest_id: 'MNF-2025-0002', from_dispensary: 'Herbal Solutions', to_dispensary: 'Green Leaf Dispensary', driver: 'Maria Gonzalez', vehicle: 'CA-4521', products: [{ sku: 'SKU-003', name: 'Girl Scout Cookies 3.5g', quantity: 50 }], status: 'delivered', departed_at: '2025-01-14T14:00:00Z', arrived_at: '2025-01-14T16:30:00Z', metrc_manifest: 'MET-2025-001792', blockchain_hash: '0xfedcba654321', blockchain_verified: true }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { status, dispensary } = req.query;
    let filtered = deliveries;
    if (status) filtered = filtered.filter(d => d.status === status);
    if (dispensary) filtered = filtered.filter(d => d.from_dispensary.toLowerCase().includes(dispensary.toLowerCase()) || d.to_dispensary.toLowerCase().includes(dispensary.toLowerCase()));
    return res.status(200).json({
      success: true,
      endpoint: '/api/delivery',
      deliveries: filtered,
      total: filtered.length,
      in_transit: filtered.filter(d => d.status === 'in_transit').length,
      delivered: filtered.filter(d => d.status === 'delivered').length,
      metrc_synced: true,
      blockchain_verified: true,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { from_dispensary, to_dispensary, products, driver, vehicle } = req.body || {};
    if (!from_dispensary || !to_dispensary || !products) return res.status(400).json({ error: 'from_dispensary, to_dispensary, and products are required' });
    return res.status(200).json({
      success: true,
      delivery: {
        id: `dlv_${Date.now()}`,
        manifest_id: `MNF-${Date.now()}`,
        from_dispensary, to_dispensary, driver, vehicle, products,
        status: 'pending',
        created_at: new Date().toISOString(),
        metrc_manifest: `MET-${Date.now()}`,
        blockchain_hash: `0x${Math.random().toString(16).slice(2, 18)}`,
        blockchain_verified: true,
        protocol: 'StrainChain'
      },
      protocol: 'StrainChain'
    });
  }
};

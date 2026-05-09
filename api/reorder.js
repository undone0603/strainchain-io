export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dispensary_id, status, vendor_id } = req.query;

  const reorders = [
    {
      id: 'reorder_001',
      dispensary_id: 'disp_001',
      vendor_id: 'vendor_001',
      vendor_name: 'Green Valley Farms',
      status: 'pending_approval',
      created_by: 'emp_001',
      items: [
        { product_id: 'prod_001', strain: 'Blue Dream', category: 'flower', quantity_lbs: 5, unit_price: 1200, total: 6000, metrc_category: 'Flower' },
        { product_id: 'prod_002', strain: 'OG Kush', category: 'flower', quantity_lbs: 3, unit_price: 1350, total: 4050, metrc_category: 'Flower' }
      ],
      subtotal: 10050,
      tax: 0,
      total: 10050,
      notes: 'Rush order - running low on top sellers',
      expected_delivery: '2026-05-12',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      approved_at: null,
      approved_by: null
    },
    {
      id: 'reorder_002',
      dispensary_id: 'disp_001',
      vendor_id: 'vendor_002',
      vendor_name: 'Pacific Extract Labs',
      status: 'approved',
      created_by: 'emp_002',
      items: [
        { product_id: 'prod_010', strain: 'Mixed', category: 'concentrate', quantity_units: 50, unit_price: 45, total: 2250, metrc_category: 'Concentrate' },
        { product_id: 'prod_011', strain: 'Mixed', category: 'cartridge', quantity_units: 100, unit_price: 22, total: 2200, metrc_category: 'Vape Cartridge' }
      ],
      subtotal: 4450,
      tax: 0,
      total: 4450,
      notes: null,
      expected_delivery: '2026-05-14',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      approved_at: new Date(Date.now() - 43200000).toISOString(),
      approved_by: 'emp_mgr_001'
    },
    {
      id: 'reorder_003',
      dispensary_id: 'disp_001',
      vendor_id: 'vendor_003',
      vendor_name: 'SunLeaf Cultivators',
      status: 'received',
      created_by: 'emp_001',
      items: [
        { product_id: 'prod_003', strain: 'Gelato', category: 'flower', quantity_lbs: 4, unit_price: 1450, total: 5800, metrc_category: 'Flower' }
      ],
      subtotal: 5800,
      tax: 0,
      total: 5800,
      notes: null,
      expected_delivery: '2026-05-08',
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      approved_at: new Date(Date.now() - 3.5 * 86400000).toISOString(),
      approved_by: 'emp_mgr_001',
      received_at: new Date(Date.now() - 86400000).toISOString(),
      metrc_intake_completed: true
    }
  ];

  let filtered = reorders;
  if (dispensary_id) filtered = filtered.filter(r => r.dispensary_id === dispensary_id);
  if (status) filtered = filtered.filter(r => r.status === status);
  if (vendor_id) filtered = filtered.filter(r => r.vendor_id === vendor_id);

  const pending_value = filtered.filter(r => ['pending_approval','approved'].includes(r.status)).reduce((sum, r) => sum + r.total, 0);

  return res.status(200).json({
    success: true,
    reorders: filtered,
    total: filtered.length,
    pending_value,
    statuses: ['draft', 'pending_approval', 'approved', 'in_transit', 'received', 'cancelled'],
    generated_at: new Date().toISOString()
  });
}

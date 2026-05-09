export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, dispensary_id, customer_id, status, reason } = req.query;

  const returns = [
    {
      id: 'ret_001',
      dispensary_id: 'disp_001',
      customer_id: 'cust_002',
      original_order_id: 'order_045',
      items: [
        { product_id: 'prod_003', product_name: 'Blue Dream 1g Pre-Roll', quantity: 2, unit_price: 8.00, total: 16.00, reason: 'Product defect - mold detected' }
      ],
      reason: 'Product defect',
      reason_detail: 'Customer reported visible mold on pre-rolls',
      status: 'approved',
      refund_method: 'store_credit',
      refund_amount: 16.00,
      metrc_adjusted: true,
      compliance_notes: 'Defective product quarantined. METRC inventory adjusted.',
      approved_by: 'staff_001',
      created_at: '2025-05-05T10:00:00Z',
      resolved_at: '2025-05-05T11:00:00Z'
    },
    {
      id: 'ret_002',
      dispensary_id: 'disp_001',
      customer_id: 'cust_001',
      original_order_id: 'order_089',
      items: [
        { product_id: 'prod_010', product_name: 'OG Kush 3.5g', quantity: 1, unit_price: 45.00, total: 45.00, reason: 'Wrong product received' }
      ],
      reason: 'Wrong item',
      reason_detail: 'Customer ordered Gorilla Glue but received OG Kush',
      status: 'pending',
      refund_method: 'original_payment',
      refund_amount: 45.00,
      metrc_adjusted: false,
      compliance_notes: '',
      approved_by: null,
      created_at: '2025-05-09T09:30:00Z',
      resolved_at: null
    }
  ];

  let filtered = returns;
  if (id) filtered = filtered.filter(r => r.id === id);
  if (dispensary_id) filtered = filtered.filter(r => r.dispensary_id === dispensary_id);
  if (customer_id) filtered = filtered.filter(r => r.customer_id === customer_id);
  if (status) filtered = filtered.filter(r => r.status === status);
  if (reason) filtered = filtered.filter(r => r.reason.toLowerCase().includes(reason.toLowerCase()));

  return res.status(200).json({
    success: true,
    returns: filtered,
    total: filtered.length,
    statuses: ['pending', 'approved', 'rejected', 'completed'],
    reasons: ['Product defect', 'Wrong item', 'Damaged packaging', 'Customer dissatisfaction', 'Other'],
    refund_methods: ['original_payment', 'store_credit', 'cash'],
    generated_at: new Date().toISOString()
  });
}

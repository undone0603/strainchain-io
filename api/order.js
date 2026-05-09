export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dispensary_id, customer_id, status, order_type, limit = 20 } = req.query;

  const orders = [
    {
      id: 'ord_001',
      dispensary_id: 'disp_001',
      customer_id: 'cust_001',
      customer_name: 'Alex Johnson',
      order_type: 'pickup',
      status: 'completed',
      items: [
        { strain_id: 'str_001', strain_name: 'Blue Dream', quantity_g: 3.5, unit_price: 14.00, total: 49.00, batch_id: 'batch_001' },
        { strain_id: 'str_002', strain_name: 'OG Kush', quantity_g: 1.0, unit_price: 16.00, total: 16.00, batch_id: 'batch_002' }
      ],
      subtotal: 65.00,
      tax: 9.75,
      discount: 0,
      total: 74.75,
      payment_method: 'cash',
      metrc_receipt: 'METRC-REC-20240315-001',
      created_at: '2024-03-15T14:30:00Z',
      completed_at: '2024-03-15T14:45:00Z'
    },
    {
      id: 'ord_002',
      dispensary_id: 'disp_001',
      customer_id: 'cust_002',
      customer_name: 'Sam Rivera',
      order_type: 'delivery',
      status: 'in_transit',
      items: [
        { strain_id: 'str_003', strain_name: 'Granddaddy Purple', quantity_g: 7.0, unit_price: 12.50, total: 87.50, batch_id: 'batch_003' }
      ],
      subtotal: 87.50,
      tax: 13.13,
      discount: 5.00,
      total: 95.63,
      payment_method: 'debit',
      delivery_address: '123 Main St, Los Angeles, CA 90001',
      driver_id: 'emp_005',
      metrc_receipt: 'METRC-REC-20240315-002',
      created_at: '2024-03-15T15:00:00Z',
      completed_at: null
    },
    {
      id: 'ord_003',
      dispensary_id: 'disp_002',
      customer_id: 'cust_003',
      customer_name: 'Jordan Lee',
      order_type: 'pickup',
      status: 'pending',
      items: [
        { strain_id: 'str_004', strain_name: 'Sour Diesel', quantity_g: 3.5, unit_price: 15.00, total: 52.50, batch_id: 'batch_004' },
        { product_id: 'prod_001', product_name: 'CBD Tincture 500mg', quantity: 1, unit_price: 45.00, total: 45.00 }
      ],
      subtotal: 97.50,
      tax: 14.63,
      discount: 10.00,
      total: 102.13,
      payment_method: 'cash',
      metrc_receipt: null,
      created_at: '2024-03-15T16:00:00Z',
      completed_at: null
    }
  ];

  let filtered = orders;
  if (dispensary_id) filtered = filtered.filter(o => o.dispensary_id === dispensary_id);
  if (customer_id) filtered = filtered.filter(o => o.customer_id === customer_id);
  if (status) filtered = filtered.filter(o => o.status === status);
  if (order_type) filtered = filtered.filter(o => o.order_type === order_type);
  filtered = filtered.slice(0, parseInt(limit));

  const total_revenue = filtered.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0);

  return res.status(200).json({
    success: true,
    orders: filtered,
    total: filtered.length,
    total_revenue: parseFloat(total_revenue.toFixed(2)),
    statuses: ['pending', 'confirmed', 'preparing', 'ready', 'in_transit', 'completed', 'cancelled'],
    order_types: ['pickup', 'delivery', 'in_store']
  });
}

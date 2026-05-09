export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dispensary_id, transaction_id, date_from, date_to, status } = req.query;

  const transactions = [
    {
      id: 'pos_001',
      dispensary_id: 'disp_001',
      customer_id: 'cust_001',
      budtender_id: 'emp_002',
      register_id: 'reg_001',
      status: 'completed',
      items: [
        { product_id: 'prod_001', name: 'Blue Dream 3.5g', quantity: 1, unit_price: 45.00, tax: 4.50, total: 49.50, metrc_tag: 'METRC-TAG-001' },
        { product_id: 'prod_005', name: 'Pineapple Express Pre-Roll', quantity: 2, unit_price: 12.00, tax: 1.20, total: 26.40, metrc_tag: 'METRC-TAG-005' }
      ],
      subtotal: 69.00,
      discount: 5.00,
      discount_reason: 'Loyalty reward',
      tax_total: 8.28,
      total: 72.28,
      payment_method: 'cash',
      change_due: 2.72,
      loyalty_points_earned: 72,
      loyalty_points_redeemed: 200,
      receipt_url: '/receipts/pos_001.pdf',
      metrc_reported: true,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'pos_002',
      dispensary_id: 'disp_001',
      customer_id: 'cust_002',
      budtender_id: 'emp_003',
      register_id: 'reg_002',
      status: 'completed',
      items: [
        { product_id: 'prod_012', name: 'RSO Syringe 1g', quantity: 1, unit_price: 65.00, tax: 0, total: 65.00, metrc_tag: 'METRC-TAG-012' }
      ],
      subtotal: 65.00,
      discount: 9.75,
      discount_reason: 'Medical patient 15% discount',
      tax_total: 0,
      total: 55.25,
      payment_method: 'debit',
      change_due: 0,
      loyalty_points_earned: 55,
      loyalty_points_redeemed: 0,
      receipt_url: '/receipts/pos_002.pdf',
      metrc_reported: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  let filtered = transactions;
  if (dispensary_id) filtered = filtered.filter(t => t.dispensary_id === dispensary_id);
  if (transaction_id) filtered = filtered.filter(t => t.id === transaction_id);
  if (status) filtered = filtered.filter(t => t.status === status);
  if (date_from) filtered = filtered.filter(t => new Date(t.created_at) >= new Date(date_from));
  if (date_to) filtered = filtered.filter(t => new Date(t.created_at) <= new Date(date_to));

  const total_revenue = filtered.reduce((sum, t) => sum + t.total, 0);
  const total_tax = filtered.reduce((sum, t) => sum + t.tax_total, 0);

  return res.status(200).json({
    success: true,
    transactions: filtered,
    total: filtered.length,
    total_revenue: parseFloat(total_revenue.toFixed(2)),
    total_tax_collected: parseFloat(total_tax.toFixed(2)),
    payment_methods: ['cash', 'debit', 'credit', 'check', 'digital_wallet'],
    generated_at: new Date().toISOString()
  });
}

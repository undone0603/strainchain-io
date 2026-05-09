export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, dispensary_id, status, type } = req.query;

  const now = new Date();

  const promotions = [
    {
      id: 'promo_001',
      dispensary_id: 'disp_001',
      name: 'Happy Hour Deals',
      type: 'time_limited',
      discount_type: 'percentage',
      discount_value: 20,
      status: 'active',
      applies_to: 'all_products',
      product_categories: [],
      specific_products: [],
      min_purchase: 25.00,
      max_discount: 50.00,
      schedule: { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], start_time: '16:00', end_time: '18:00' },
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      use_count: 847,
      max_uses: null,
      code: null,
      stackable: false,
      created_at: '2026-04-28T00:00:00Z'
    },
    {
      id: 'promo_002',
      dispensary_id: 'disp_001',
      name: 'First-Time Patient 15% Off',
      type: 'first_purchase',
      discount_type: 'percentage',
      discount_value: 15,
      status: 'active',
      applies_to: 'all_products',
      product_categories: [],
      specific_products: [],
      min_purchase: 0,
      max_discount: null,
      schedule: null,
      start_date: '2026-01-01',
      end_date: null,
      use_count: 312,
      max_uses: null,
      code: 'NEWPATIENT15',
      stackable: false,
      created_at: '2026-01-01T00:00:00Z'
    },
    {
      id: 'promo_003',
      dispensary_id: 'disp_001',
      name: 'Terpene Tuesday - Concentrates 25% Off',
      type: 'recurring',
      discount_type: 'percentage',
      discount_value: 25,
      status: 'active',
      applies_to: 'category',
      product_categories: ['concentrates'],
      specific_products: [],
      min_purchase: 0,
      max_discount: null,
      schedule: { days: ['tuesday'], start_time: '00:00', end_time: '23:59' },
      start_date: '2026-03-01',
      end_date: null,
      use_count: 2145,
      max_uses: null,
      code: null,
      stackable: false,
      created_at: '2026-03-01T00:00:00Z'
    }
  ];

  let filtered = promotions;
  if (id) filtered = filtered.filter(p => p.id === id);
  if (dispensary_id) filtered = filtered.filter(p => p.dispensary_id === dispensary_id);
  if (status) filtered = filtered.filter(p => p.status === status);
  if (type) filtered = filtered.filter(p => p.type === type);

  return res.status(200).json({
    success: true,
    promotions: filtered,
    total: filtered.length,
    active_count: filtered.filter(p => p.status === 'active').length,
    types: ['time_limited', 'first_purchase', 'recurring', 'flash_sale', 'bundle', 'loyalty'],
    generated_at: now.toISOString()
  });
}

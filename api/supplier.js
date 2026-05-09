export default async function handler(req, res) {
  const { method, query } = req;
  const { dispensary_id, status, category } = query;

  const suppliers = [
    {
      id: 'sup_001',
      dispensary_id: 'disp_001',
      name: 'Green Valley Farms',
      license_number: 'CDPH-10001234',
      license_type: 'cultivator',
      category: 'flower',
      contact_name: 'Maria Gonzalez',
      contact_email: 'maria@greenvalleyfarms.com',
      contact_phone: '(530) 555-0101',
      address: '1200 Farm Road, Redding, CA 96001',
      status: 'active',
      metrc_vendor_id: 'MV-001',
      payment_terms: 'net_30',
      lead_time_days: 7,
      minimum_order_lbs: 2,
      rating: 4.8,
      total_orders: 24,
      last_order_date: new Date(Date.now() - 14 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 180 * 86400000).toISOString()
    },
    {
      id: 'sup_002',
      dispensary_id: 'disp_001',
      name: 'SoCal Extracts LLC',
      license_number: 'CDPH-10002345',
      license_type: 'manufacturer',
      category: 'concentrate',
      contact_name: 'Derek Kim',
      contact_email: 'derek@socalextracts.com',
      contact_phone: '(213) 555-0202',
      address: '88 Industrial Blvd, Los Angeles, CA 90023',
      status: 'active',
      metrc_vendor_id: 'MV-002',
      payment_terms: 'net_15',
      lead_time_days: 3,
      minimum_order_lbs: 0.5,
      rating: 4.5,
      total_orders: 18,
      last_order_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 120 * 86400000).toISOString()
    },
    {
      id: 'sup_003',
      dispensary_id: 'disp_002',
      name: 'Bay Area Botanicals',
      license_number: 'CDPH-10003456',
      license_type: 'cultivator',
      category: 'edible',
      contact_name: 'Priya Patel',
      contact_email: 'priya@bayareabotanicals.com',
      contact_phone: '(415) 555-0303',
      address: '456 Herb Street, Oakland, CA 94601',
      status: 'pending_review',
      metrc_vendor_id: 'MV-003',
      payment_terms: 'prepaid',
      lead_time_days: 10,
      minimum_order_lbs: 1,
      rating: 4.2,
      total_orders: 6,
      last_order_date: new Date(Date.now() - 30 * 86400000).toISOString(),
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ];

  let filtered = suppliers;
  if (dispensary_id) filtered = filtered.filter(s => s.dispensary_id === dispensary_id);
  if (status) filtered = filtered.filter(s => s.status === status);
  if (category) filtered = filtered.filter(s => s.category === category);

  const stats = {
    total: filtered.length,
    active: filtered.filter(s => s.status === 'active').length,
    avg_rating: filtered.length ? (filtered.reduce((sum, s) => sum + s.rating, 0) / filtered.length).toFixed(2) : 0,
    categories: [...new Set(filtered.map(s => s.category))]
  };

  return res.status(200).json({
    success: true,
    suppliers: filtered,
    stats,
    statuses: ['active', 'inactive', 'pending_review', 'suspended']
  });
}

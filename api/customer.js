export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, dispensary_id, status, state_id } = req.query;

  const customers = [
    {
      id: 'cust_001',
      dispensary_id: 'disp_001',
      first_name: 'Alex',
      last_name: 'Rivera',
      date_of_birth: '1990-05-15',
      state_id: 'DL-CA-1234567',
      state_id_expiry: '2027-05-15',
      medical_card: null,
      customer_type: 'recreational',
      status: 'active',
      verified: true,
      lifetime_spend: 2340.50,
      visit_count: 47,
      last_visit: '2025-05-08T14:30:00Z',
      preferred_categories: ['flower', 'edibles'],
      notes: 'Prefers indica strains',
      created_at: '2023-03-10T00:00:00Z'
    },
    {
      id: 'cust_002',
      dispensary_id: 'disp_001',
      first_name: 'Jordan',
      last_name: 'Kim',
      date_of_birth: '1985-11-22',
      state_id: 'DL-CA-7654321',
      state_id_expiry: '2026-11-22',
      medical_card: 'MED-CA-98765',
      medical_card_expiry: '2025-12-01',
      customer_type: 'medical',
      status: 'active',
      verified: true,
      lifetime_spend: 5870.00,
      visit_count: 102,
      last_visit: '2025-05-07T11:00:00Z',
      preferred_categories: ['tinctures', 'concentrates', 'topicals'],
      notes: 'Medical card renewal due soon',
      created_at: '2022-01-05T00:00:00Z'
    },
    {
      id: 'cust_003',
      dispensary_id: 'disp_002',
      first_name: 'Sam',
      last_name: 'Patel',
      date_of_birth: '1995-08-30',
      state_id: 'DL-CA-5551234',
      state_id_expiry: '2028-08-30',
      medical_card: null,
      customer_type: 'recreational',
      status: 'inactive',
      verified: true,
      lifetime_spend: 420.00,
      visit_count: 8,
      last_visit: '2024-11-15T16:00:00Z',
      preferred_categories: ['vapes'],
      notes: '',
      created_at: '2024-09-01T00:00:00Z'
    }
  ];

  let filtered = customers;
  if (id) filtered = filtered.filter(c => c.id === id);
  if (dispensary_id) filtered = filtered.filter(c => c.dispensary_id === dispensary_id);
  if (status) filtered = filtered.filter(c => c.status === status);
  if (state_id) filtered = filtered.filter(c => c.state_id === state_id);

  const medical_count = filtered.filter(c => c.customer_type === 'medical').length;
  const recreational_count = filtered.filter(c => c.customer_type === 'recreational').length;

  return res.status(200).json({
    success: true,
    customers: filtered,
    total: filtered.length,
    medical_count,
    recreational_count,
    generated_at: new Date().toISOString()
  });
}

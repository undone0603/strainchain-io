export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { dispensary_id, status, recipient_id } = req.query;

  // Cannabis gift cards / gifting within legal compliance
  const gifts = [
    {
      id: 'gift_001',
      dispensary_id: 'disp_001',
      type: 'gift_card',
      code: 'SC-GIFT-A1B2C3',
      initial_value: 50.00,
      remaining_value: 50.00,
      purchaser_id: 'cust_001',
      recipient_id: null,
      recipient_email: 'friend@example.com',
      message: 'Happy Birthday!',
      status: 'active',
      is_redeemed: false,
      expiry_date: '2025-03-15',
      created_at: '2024-03-15T10:00:00Z'
    },
    {
      id: 'gift_002',
      dispensary_id: 'disp_001',
      type: 'gift_card',
      code: 'SC-GIFT-D4E5F6',
      initial_value: 100.00,
      remaining_value: 35.50,
      purchaser_id: 'cust_002',
      recipient_id: 'cust_004',
      recipient_email: null,
      message: null,
      status: 'partially_used',
      is_redeemed: false,
      expiry_date: '2025-01-01',
      created_at: '2024-01-01T10:00:00Z',
      last_used_at: '2024-02-15T14:30:00Z'
    },
    {
      id: 'gift_003',
      dispensary_id: 'disp_002',
      type: 'promotional_gift',
      code: 'SC-PROMO-G7H8I9',
      initial_value: 20.00,
      remaining_value: 0,
      purchaser_id: null,
      recipient_id: 'cust_005',
      recipient_email: null,
      message: 'Welcome gift for new members',
      status: 'redeemed',
      is_redeemed: true,
      expiry_date: '2024-12-31',
      created_at: '2024-03-01T00:00:00Z',
      redeemed_at: '2024-03-10T11:20:00Z'
    }
  ];

  let filtered = gifts;
  if (dispensary_id) filtered = filtered.filter(g => g.dispensary_id === dispensary_id);
  if (status) filtered = filtered.filter(g => g.status === status);
  if (recipient_id) filtered = filtered.filter(g => g.recipient_id === recipient_id);

  const total_issued = filtered.reduce((sum, g) => sum + g.initial_value, 0);
  const total_remaining = filtered.reduce((sum, g) => sum + g.remaining_value, 0);

  return res.status(200).json({
    success: true,
    gifts: filtered,
    total: filtered.length,
    total_issued_value: parseFloat(total_issued.toFixed(2)),
    total_remaining_value: parseFloat(total_remaining.toFixed(2)),
    statuses: ['active', 'partially_used', 'redeemed', 'expired', 'voided'],
    types: ['gift_card', 'promotional_gift', 'loyalty_reward']
  });
}

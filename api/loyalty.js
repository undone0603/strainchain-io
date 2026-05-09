export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { customer_id, dispensary_id, action } = req.query;

  const loyalty_accounts = [
    {
      id: 'loyal_001',
      customer_id: 'cust_001',
      dispensary_id: 'disp_001',
      tier: 'gold',
      points_balance: 1250,
      lifetime_points: 4800,
      points_to_next_tier: 750,
      next_tier: 'platinum',
      tier_thresholds: { bronze: 0, silver: 500, gold: 1000, platinum: 2000, vip: 5000 },
      rewards_available: [
        { id: 'rew_001', name: '10% Off Next Purchase', points_required: 200, type: 'discount' },
        { id: 'rew_002', name: 'Free Pre-Roll', points_required: 500, type: 'product' },
        { id: 'rew_003', name: '$25 Store Credit', points_required: 1000, type: 'credit' }
      ],
      recent_transactions: [
        { date: '2025-05-08', type: 'earn', points: 47, description: 'Purchase $47.00' },
        { date: '2025-04-30', type: 'redeem', points: -200, description: 'Redeemed: 10% Off Discount' },
        { date: '2025-04-25', type: 'earn', points: 89, description: 'Purchase $89.00' }
      ],
      enrolled_at: '2023-03-10T00:00:00Z',
      last_activity: '2025-05-08T14:30:00Z'
    },
    {
      id: 'loyal_002',
      customer_id: 'cust_002',
      dispensary_id: 'disp_001',
      tier: 'platinum',
      points_balance: 3200,
      lifetime_points: 12500,
      points_to_next_tier: 1800,
      next_tier: 'vip',
      tier_thresholds: { bronze: 0, silver: 500, gold: 1000, platinum: 2000, vip: 5000 },
      rewards_available: [
        { id: 'rew_001', name: '10% Off Next Purchase', points_required: 200, type: 'discount' },
        { id: 'rew_004', name: 'Free Eighth', points_required: 2500, type: 'product' },
        { id: 'rew_005', name: '$100 Store Credit', points_required: 3000, type: 'credit' }
      ],
      recent_transactions: [
        { date: '2025-05-07', type: 'earn', points: 120, description: 'Purchase $120.00' },
        { date: '2025-05-01', type: 'earn', points: 65, description: 'Bonus: Medical Patient Day' }
      ],
      enrolled_at: '2022-01-05T00:00:00Z',
      last_activity: '2025-05-07T11:00:00Z'
    }
  ];

  let filtered = loyalty_accounts;
  if (customer_id) filtered = filtered.filter(l => l.customer_id === customer_id);
  if (dispensary_id) filtered = filtered.filter(l => l.dispensary_id === dispensary_id);

  const program_config = {
    points_per_dollar: 1,
    bonus_multipliers: {
      medical: 1.5,
      birthday_month: 2.0,
      new_product: 1.25
    },
    expiration_days: 365,
    tiers: ['bronze', 'silver', 'gold', 'platinum', 'vip']
  };

  return res.status(200).json({
    success: true,
    loyalty_accounts: filtered,
    total: filtered.length,
    program_config,
    generated_at: new Date().toISOString()
  });
}

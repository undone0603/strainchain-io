export default async function handler(req, res) {
  const { query } = req;
  const { dispensary_id, category, strain_id } = query;

  const prices = [
    {
      id: 'price_001',
      dispensary_id: 'disp_001',
      strain_id: 'strain_001',
      strain_name: 'Blue Dream',
      category: 'flower',
      tier: 'premium',
      unit: 'gram',
      price_per_unit: 18,
      price_per_eighth: 55,
      price_per_quarter: 100,
      price_per_half: 190,
      price_per_oz: 360,
      member_discount_pct: 10,
      bulk_threshold_oz: 4,
      bulk_price_per_oz: 320,
      effective_date: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 86400000).toISOString()
    },
    {
      id: 'price_002',
      dispensary_id: 'disp_001',
      strain_id: 'strain_002',
      strain_name: 'Gelato',
      category: 'flower',
      tier: 'top_shelf',
      unit: 'gram',
      price_per_unit: 22,
      price_per_eighth: 65,
      price_per_quarter: 120,
      price_per_half: 230,
      price_per_oz: 440,
      member_discount_pct: 10,
      bulk_threshold_oz: 4,
      bulk_price_per_oz: 400,
      effective_date: new Date(Date.now() - 20 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 'price_003',
      dispensary_id: 'disp_001',
      strain_id: 'strain_003',
      strain_name: 'OG Kush Cartridge',
      category: 'concentrate',
      tier: 'standard',
      unit: '0.5g_cart',
      price_per_unit: 35,
      price_per_gram: 60,
      member_discount_pct: 5,
      bulk_threshold_oz: null,
      bulk_price_per_oz: null,
      effective_date: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
    }
  ];

  let filtered = prices;
  if (dispensary_id) filtered = filtered.filter(p => p.dispensary_id === dispensary_id);
  if (category) filtered = filtered.filter(p => p.category === category);
  if (strain_id) filtered = filtered.filter(p => p.strain_id === strain_id);

  return res.status(200).json({
    success: true,
    prices: filtered,
    total: filtered.length,
    tiers: ['budget', 'standard', 'premium', 'top_shelf'],
    categories: ['flower', 'concentrate', 'edible', 'tincture', 'topical', 'preroll']
  });
}

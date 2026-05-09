export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { strain_id, dispensary_id, customer_id, rating, title, body, effects, flavors, verified_purchase } = req.body || {};
    if (!strain_id || !rating) {
      return res.status(400).json({ error: 'strain_id and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }
    return res.status(201).json({
      success: true,
      review_id: 'rev_' + Date.now(),
      strain_id,
      status: 'pending_moderation',
      message: 'Review submitted and pending moderation. It will appear within 24 hours.'
    });
  }

  const { strain_id, dispensary_id, min_rating, sort = 'recent', limit = 20 } = req.query;

  const reviews = [
    {
      id: 'rev_001',
      strain_id: 'str_001',
      strain_name: 'Blue Dream',
      dispensary_id: 'disp_001',
      customer_id: 'cust_001',
      customer_display: 'Alex J.',
      rating: 5,
      title: 'Perfect daytime strain',
      body: 'Smooth, balanced high. Great for creativity and focus. Mild berry flavor. No anxiety at all.',
      effects: ['euphoric', 'creative', 'focused', 'uplifted'],
      flavors: ['berry', 'sweet', 'earthy'],
      verified_purchase: true,
      helpful_votes: 23,
      reported: false,
      status: 'approved',
      created_at: '2024-03-10T14:00:00Z'
    },
    {
      id: 'rev_002',
      strain_id: 'str_001',
      strain_name: 'Blue Dream',
      dispensary_id: 'disp_001',
      customer_id: 'cust_002',
      customer_display: 'Sam R.',
      rating: 4,
      title: 'Good but a little harsh',
      body: 'Nice effects overall, very uplifting. The smoke was a little harsh though. Would buy again.',
      effects: ['uplifted', 'happy', 'relaxed'],
      flavors: ['blueberry', 'herbal'],
      verified_purchase: true,
      helpful_votes: 11,
      reported: false,
      status: 'approved',
      created_at: '2024-03-08T09:30:00Z'
    },
    {
      id: 'rev_003',
      strain_id: 'str_002',
      strain_name: 'OG Kush',
      dispensary_id: 'disp_002',
      customer_id: 'cust_003',
      customer_display: 'Jordan L.',
      rating: 5,
      title: 'Classic for a reason',
      body: 'Legendary strain. Heavy body high, great for evening use. Earthy pine flavor is unmistakable.',
      effects: ['relaxed', 'euphoric', 'sleepy', 'hungry'],
      flavors: ['earthy', 'pine', 'woody'],
      verified_purchase: true,
      helpful_votes: 45,
      reported: false,
      status: 'approved',
      created_at: '2024-03-05T20:00:00Z'
    }
  ];

  let filtered = reviews.filter(r => r.status === 'approved');
  if (strain_id) filtered = filtered.filter(r => r.strain_id === strain_id);
  if (dispensary_id) filtered = filtered.filter(r => r.dispensary_id === dispensary_id);
  if (min_rating) filtered = filtered.filter(r => r.rating >= parseInt(min_rating));

  if (sort === 'helpful') filtered.sort((a, b) => b.helpful_votes - a.helpful_votes);
  else filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  filtered = filtered.slice(0, parseInt(limit));

  const avg_rating = filtered.length ? (filtered.reduce((s, r) => s + r.rating, 0) / filtered.length).toFixed(2) : null;

  return res.status(200).json({
    success: true,
    reviews: filtered,
    total: filtered.length,
    average_rating: avg_rating ? parseFloat(avg_rating) : null,
    verified_count: filtered.filter(r => r.verified_purchase).length
  });
}

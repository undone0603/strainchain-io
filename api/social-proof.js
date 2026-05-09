import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [testimonialsRes, statsRes, partnersRes] = await Promise.all([
      supabase
        .from('testimonials')
        .select('id, author_name, dispensary_name, strain_name, content, rating, effects_reported')
        .eq('status', 'approved')
        .eq('is_featured', true)
        .limit(6),
      supabase
        .from('social_proof_stats')
        .select('metric, value, label')
        .eq('is_active', true)
        .order('sort_order'),
      supabase
        .from('partner_dispensaries')
        .select('id, name, logo_url, city, state')
        .eq('is_featured', true)
        .order('sort_order')
        .limit(12),
    ]);

    const ratings = (testimonialsRes.data || []).map((t) => t.rating).filter(Boolean);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : '5.0';

    return res.status(200).json({
      success: true,
      featured_testimonials: testimonialsRes.data || [],
      stats: statsRes.data || [
        { metric: 'strains', value: '10K+', label: 'Strains Tracked' },
        { metric: 'dispensaries', value: '500+', label: 'Dispensaries Onboarded' },
        { metric: 'verifications', value: '2M+', label: 'Compliance Scans' },
        { metric: 'states', value: '25+', label: 'Legal States Covered' },
      ],
      partner_dispensaries: partnersRes.data || [],
      average_rating: avgRating,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

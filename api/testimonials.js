import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const featured = req.query.featured === 'true';
      const strain = req.query.strain;

      let query = supabase
        .from('testimonials')
        .select('id, author_name, dispensary_name, strain_name, content, rating, effects_reported, is_featured, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (featured) query = query.eq('is_featured', true);
      if (strain) query = query.ilike('strain_name', `%${strain}%`);

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json({ success: true, testimonials: data || [] });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

      const { author_name, dispensary_name, strain_name, content, rating, effects_reported } = req.body;
      if (!author_name || !content || !rating) {
        return res.status(400).json({ error: 'Missing required fields: author_name, content, rating' });
      }

      const { data, error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          author_name,
          dispensary_name: dispensary_name || null,
          strain_name: strain_name || null,
          content,
          rating: Math.min(5, Math.max(1, parseInt(rating))),
          effects_reported: effects_reported || [],
          status: 'pending',
          is_featured: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        testimonial: data,
        message: 'Thank you! Your testimonial will be reviewed and published shortly.',
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

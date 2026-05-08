// StrainChain Strains API
// GET /api/strains - Search and browse verified cannabis strains

const DEMO_STRAINS = [
  { id: 'SC-001', name: 'Blue Dream', type: 'Hybrid', thc: '21%', cbd: '0.1%', dispensary: 'Michigan Wellness Co.', verified: true, nft_available: true, batch: 'BD-2026-Q1', state: 'MI' },
  { id: 'SC-002', name: 'OG Kush', type: 'Indica', thc: '23%', cbd: '0.2%', dispensary: 'Detroit Dispensary', verified: true, nft_available: true, batch: 'OGK-2026-Q1', state: 'MI' },
  { id: 'SC-003', name: 'Sour Diesel', type: 'Sativa', thc: '19%', cbd: '0.1%', dispensary: 'GreenLeaf Provisioning', verified: true, nft_available: false, batch: 'SD-2026-Q1', state: 'MI' },
  { id: 'SC-004', name: 'Girl Scout Cookies', type: 'Hybrid', thc: '25%', cbd: '0.3%', dispensary: 'Lume Cannabis Co.', verified: true, nft_available: true, batch: 'GSC-2026-Q1', state: 'MI' },
  { id: 'SC-005', name: 'Gorilla Glue #4', type: 'Hybrid', thc: '28%', cbd: '0.1%', dispensary: 'Arbors Wellness', verified: true, nft_available: true, batch: 'GG4-2026-Q1', state: 'MI' },
  { id: 'SC-006', name: 'Jack Herer', type: 'Sativa', thc: '18%', cbd: '0.2%', dispensary: 'SKYMINT', verified: true, nft_available: false, batch: 'JH-2026-Q1', state: 'MI' },
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { q, type, state, verified, nft_available, limit = '20', page = '1' } = req.query;

  const pageSize = Math.min(parseInt(limit) || 20, 100);
  const pageNum = Math.max(parseInt(page) || 1, 1);

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    let strains = DEMO_STRAINS;

    if (supabaseUrl && supabaseKey) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/strains?select=*&limit=${pageSize}&offset=${(pageNum - 1) * pageSize}`, {
          headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        });
        if (dbRes.ok) {
          const dbStrains = await dbRes.json();
          if (dbStrains.length > 0) strains = dbStrains;
        }
      } catch (_) { /* fall through to demo data */ }
    }

    // Apply filters
    if (q) {
      const search = q.toLowerCase();
      strains = strains.filter(s => s.name.toLowerCase().includes(search) || s.dispensary.toLowerCase().includes(search) || s.batch.toLowerCase().includes(search));
    }
    if (type) strains = strains.filter(s => s.type.toLowerCase() === type.toLowerCase());
    if (state) strains = strains.filter(s => s.state === state.toUpperCase());
    if (verified === 'true') strains = strains.filter(s => s.verified);
    if (nft_available === 'true') strains = strains.filter(s => s.nft_available);

    const total = strains.length;
    const paginated = strains.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
      strains: paginated,
      filters: { q: q || null, type: type || null, state: state || null, verified: verified || null, nft_available: nft_available || null },
    });
  } catch (err) {
    console.error('Strains API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

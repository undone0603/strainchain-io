// StrainChain Analytics API
// Provides scan/verification metrics for dispensaries and brands

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { period = '7d', dispensaryId, strainId } = req.query;

    // Validate period
    const validPeriods = ['24h', '7d', '30d', '90d'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ error: 'Invalid period. Use: 24h, 7d, 30d, 90d' });
    }

    // Period to hours mapping
    const periodHours = { '24h': 24, '7d': 168, '30d': 720, '90d': 2160 };
    const hours = periodHours[period];
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    // Query Supabase for scan events
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    let totalScans = 0;
    let verifiedCount = 0;
    let suspiciousCount = 0;
    let topStrains = [];
    let scansByDay = [];

    if (supabaseUrl && supabaseKey) {
      // Fetch scan events
      const scansRes = await fetch(
        `${supabaseUrl}/rest/v1/scan_events?select=id,verified,strain_id,created_at&created_at=gte.${since}` +
          (dispensaryId ? `&dispensary_id=eq.${dispensaryId}` : '') +
          (strainId ? `&strain_id=eq.${strainId}` : ''),
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (scansRes.ok) {
        const scans = await scansRes.json();
        totalScans = scans.length;
        verifiedCount = scans.filter(s => s.verified).length;
        suspiciousCount = totalScans - verifiedCount;

        // Aggregate top strains
        const strainCounts = {};
        scans.forEach(s => {
          if (s.strain_id) strainCounts[s.strain_id] = (strainCounts[s.strain_id] || 0) + 1;
        });
        topStrains = Object.entries(strainCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([id, count]) => ({ strainId: id, scans: count }));

        // Build scans-by-day
        const dayMap = {};
        scans.forEach(s => {
          const day = s.created_at.slice(0, 10);
          dayMap[day] = (dayMap[day] || 0) + 1;
        });
        scansByDay = Object.entries(dayMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, count]) => ({ date, count }));
      }
    }

    const verificationRate = totalScans > 0 ? Math.round((verifiedCount / totalScans) * 100) : 0;

    return res.status(200).json({
      success: true,
      period,
      since,
      metrics: {
        totalScans,
        verifiedCount,
        suspiciousCount,
        verificationRate,
        complianceScore: verificationRate >= 95 ? 'A' : verificationRate >= 85 ? 'B' : verificationRate >= 70 ? 'C' : 'F',
      },
      topStrains,
      scansByDay,
      filters: {
        dispensaryId: dispensaryId || null,
        strainId: strainId || null,
      },
    });
  } catch (err) {
    console.error('[StrainChain /api/analytics]', err);
    return res.status(500).json({
      success: false,
      error: 'Analytics unavailable',
      metrics: { totalScans: 0, verifiedCount: 0, suspiciousCount: 0, verificationRate: 0 },
    });
  }
};

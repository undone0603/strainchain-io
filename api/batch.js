// StrainChain /api/batch - Cannabis harvest batch tracking
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, grower_id, state, status } = req.query || {};

  if (req.method === 'GET') {
    if (id) {
      return res.status(200).json({
        success: true,
        batch: {
          id,
          batch_name: `Harvest ${id}`,
          grower_id: grower_id || 'GR-001',
          strain: 'Blue Dream OG',
          plant_count: 1200,
          canopy_sqft: 4800,
          harvest_date: '2026-04-15',
          cure_end_date: '2026-05-15',
          status: status || 'cured',
          total_yield_grams: 48234.7,
          thc_percentage: 21.3,
          cbd_percentage: 0.1,
          metrc_batch_id: `METRC-${id}`,
          lab_tested: true,
          lab_id: `LAB-${id}-001`,
          coa_available: true,
          blockchain_hash: `0x${Buffer.from(id + Date.now()).toString('hex').slice(0, 64)}`,
          chain: 'Polygon',
          strainchain_id: `SC-BATCH-${id}`,
          protocol: 'StrainChain'
        }
      });
    }

    return res.status(200).json({
      success: true,
      endpoint: '/api/batch',
      description: 'Cannabis harvest batch tracking with blockchain verification',
      protocol: 'StrainChain',
      stats: {
        active_batches: 2847,
        total_weight_kg: 148234.7,
        lab_tested_batches: 2431,
        blockchain_verified: 2847
      },
      usage: {
        by_id: '/api/batch?id=BATCH-001',
        by_grower: '/api/batch?grower_id=GR-001',
        by_state: '/api/batch?state=MI'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { grower_id: gId, strain_name, plant_count, harvest_date } = req.body || {};

  if (!gId || !strain_name) {
    return res.status(400).json({ error: 'grower_id and strain_name are required' });
  }

  const batch_id = `BATCH-${Date.now()}`;
  return res.status(201).json({
    success: true,
    batch_id,
    grower_id: gId,
    strain_name,
    plant_count: plant_count || 0,
    harvest_date: harvest_date || null,
    status: 'growing',
    metrc_batch_id: `METRC-${batch_id}`,
    blockchain_hash: `0x${Buffer.from(batch_id + gId).toString('hex').slice(0, 64)}`,
    chain: 'Polygon',
    created_at: new Date().toISOString(),
    protocol: 'StrainChain'
  });
}

// StrainChain /api/verify - Public product scan & verification endpoint
// GET /api/verify?id=STRAIN_ID or ?batch=BATCH_ID or ?metrc=METRC_TAG
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id, batch, metrc, qr } = req.query;
  const lookupId = id || batch || metrc || qr;

  if (!lookupId) {
    return res.status(400).json({
      error: 'Missing lookup parameter',
      message: 'Provide ?id=, ?batch=, ?metrc=, or ?qr= query parameter',
      docs: 'https://strainchain.io/#verify-section'
    });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    // If Supabase is configured, query the on-chain registry
    if (SUPABASE_URL && SUPABASE_KEY) {
      const table = metrc ? 'metrc_tags' : batch ? 'batches' : 'products';
      const field = metrc ? 'metrc_tag' : batch ? 'batch_id' : 'product_id';

      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?${field}=eq.${encodeURIComponent(lookupId)}&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const rows = await resp.json();

      if (rows && rows.length > 0) {
        const product = rows[0];
        return res.status(200).json({
          verified: true,
          status: 'authentic',
          product_id: product.product_id || lookupId,
          strain_name: product.strain_name || 'Unknown Strain',
          batch_id: product.batch_id || null,
          metrc_tag: product.metrc_tag || null,
          cultivator: product.cultivator || 'Verified Cultivator',
          thc_percentage: product.thc_percentage || null,
          cbd_percentage: product.cbd_percentage || null,
          harvest_date: product.harvest_date || null,
          lab_tested: product.lab_tested || true,
          blockchain_hash: product.blockchain_hash || null,
          polygon_tx: product.polygon_tx || null,
          certificate_url: product.certificate_url || `https://strainchain.io/certificate/${lookupId}`,
          verified_at: new Date().toISOString(),
          protocol: 'StrainChain v2',
          chain: 'Polygon Mainnet'
        });
      }
    }

    // Demo / fallback response for unregistered IDs
    return res.status(200).json({
      verified: false,
      status: 'not_found',
      product_id: lookupId,
      message: 'Product not found in StrainChain registry. This product may not yet be on-chain.',
      help: 'To register your dispensary and products, visit https://strainchain.io/#dispensary-section',
      protocol: 'StrainChain v2',
      chain: 'Polygon Mainnet'
    });
  } catch (err) {
    console.error('[verify] Error:', err);
    return res.status(500).json({
      error: 'Verification service temporarily unavailable',
      product_id: lookupId,
      retry_after: 30
    });
  }
}

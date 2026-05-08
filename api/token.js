// StrainChain /api/token - $QRON token info & staking tiers
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Live price from CoinGecko (falls back to static data)
  let price = null;
  let marketCap = null;
  let volume24h = null;
  try {
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=qron-token&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true',
      { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) }
    );
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      if (cgData['qron-token']) {
        price = cgData['qron-token'].usd;
        marketCap = cgData['qron-token'].usd_market_cap;
        volume24h = cgData['qron-token'].usd_24h_vol;
      }
    }
  } catch (_) {}

  return res.status(200).json({
    token: {
      name: 'QRON',
      symbol: '$QRON',
      type: 'ERC-1155',
      chain: 'Polygon Mainnet',
      contract: '0xAebfA6b08fb25b59748c93273a88880e20FFE437',
      decimals: 18,
      max_supply: 1000000000,
      description: 'The utility token powering the StrainChain cannabis provenance protocol. Used for verification fees, dispensary staking, and governance.'
    },
    market: {
      price_usd: price,
      market_cap_usd: marketCap,
      volume_24h_usd: volume24h,
      data_source: price ? 'coingecko' : 'unavailable',
      note: price ? null : 'Token not yet listed. Pre-launch phase.'
    },
    utility: {
      verification_fee: 'Micro-fee in $QRON per product scan',
      burn_rate: '20% of all verification fees are burned',
      staking: true,
      governance: true
    },
    staking_tiers: [
      { tier: 'Bronze', minimum_qron: 100, apy: '5%', benefits: ['Basic analytics', 'Standard METRC sync', 'StrainChain badge'] },
      { tier: 'Silver', minimum_qron: 1000, apy: '12%', benefits: ['Advanced analytics', 'Priority METRC sync', 'Custom QR styles', 'API access'] },
      { tier: 'Gold', minimum_qron: 10000, apy: '25%', benefits: ['Full analytics suite', 'Real-time METRC sync', 'White-label QR codes', 'Dedicated support', 'Early feature access'] },
      { tier: 'Platinum', minimum_qron: 100000, apy: '40%', benefits: ['All Gold benefits', 'Revenue sharing', 'Governance voting weight 10x', 'Co-marketing opportunities'] }
    ],
    links: {
      polygonscan: 'https://polygonscan.com/token/0xAebfA6b08fb25b59748c93273a88880e20FFE437',
      whitepaper: 'https://strainchain.io/#token-section',
      staking_app: 'https://strainchain.io/#token-section'
    },
    protocol: 'StrainChain v2',
    updated_at: new Date().toISOString()
  });
}

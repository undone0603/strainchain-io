// api/nft.js - StrainChain NFT metadata and collection endpoint
const NFT_BASE_URL = process.env.NFT_BASE_URL || 'https://strainchain.io/nfts';

const COLLECTION = [
  {
    id: 1,
    name: 'Blue Dream OG',
    strain: 'Blue Dream',
    type: 'Hybrid',
    thc: '22%',
    cbd: '0.5%',
    batch: 'BD-2024-001',
    image: `${NFT_BASE_URL}/images/1.png`,
    description: 'Premium Blue Dream cannabis strain with verified provenance on StrainChain.',
    attributes: [
      { trait_type: 'Strain Type', value: 'Hybrid' },
      { trait_type: 'THC Content', value: '22%' },
      { trait_type: 'CBD Content', value: '0.5%' },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Batch', value: 'BD-2024-001' }
    ]
  },
  {
    id: 2,
    name: 'Wedding Cake Reserve',
    strain: 'Wedding Cake',
    type: 'Indica-Dominant',
    thc: '25%',
    cbd: '0.3%',
    batch: 'WC-2024-002',
    image: `${NFT_BASE_URL}/images/2.png`,
    description: 'Exclusive Wedding Cake Reserve with full blockchain provenance.',
    attributes: [
      { trait_type: 'Strain Type', value: 'Indica-Dominant' },
      { trait_type: 'THC Content', value: '25%' },
      { trait_type: 'CBD Content', value: '0.3%' },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Batch', value: 'WC-2024-002' }
    ]
  },
  {
    id: 3,
    name: 'OG Kush Classic',
    strain: 'OG Kush',
    type: 'Indica',
    thc: '20%',
    cbd: '0.4%',
    batch: 'OGK-2024-003',
    image: `${NFT_BASE_URL}/images/3.png`,
    description: 'Classic OG Kush with verified origin and METRC-compliant tracking.',
    attributes: [
      { trait_type: 'Strain Type', value: 'Indica' },
      { trait_type: 'THC Content', value: '20%' },
      { trait_type: 'CBD Content', value: '0.4%' },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Batch', value: 'OGK-2024-003' }
    ]
  },
  {
    id: 4,
    name: 'Gorilla Glue #4 Elite',
    strain: 'Gorilla Glue #4',
    type: 'Hybrid',
    thc: '28%',
    cbd: '0.2%',
    batch: 'GG4-2024-004',
    image: `${NFT_BASE_URL}/images/4.png`,
    description: 'Elite Gorilla Glue #4 with top-tier potency and blockchain certification.',
    attributes: [
      { trait_type: 'Strain Type', value: 'Hybrid' },
      { trait_type: 'THC Content', value: '28%' },
      { trait_type: 'CBD Content', value: '0.2%' },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Batch', value: 'GG4-2024-004' }
    ]
  },
  {
    id: 5,
    name: 'Sour Diesel Express',
    strain: 'Sour Diesel',
    type: 'Sativa',
    thc: '21%',
    cbd: '0.3%',
    batch: 'SD-2024-005',
    image: `${NFT_BASE_URL}/images/5.png`,
    description: 'Sativa-dominant Sour Diesel with energizing effects and verified provenance.',
    attributes: [
      { trait_type: 'Strain Type', value: 'Sativa' },
      { trait_type: 'THC Content', value: '21%' },
      { trait_type: 'CBD Content', value: '0.3%' },
      { trait_type: 'Verified', value: 'Yes' },
      { trait_type: 'Batch', value: 'SD-2024-005' }
    ]
  }
];

export default function handler(req, res) {
  const { id, strain, type } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  // Return single NFT by ID
  if (id) {
    const nft = COLLECTION.find(n => n.id === parseInt(id));
    if (!nft) {
      return res.status(404).json({ error: 'NFT not found', id });
    }
    return res.status(200).json({
      success: true,
      nft,
      metadata_url: `${NFT_BASE_URL}/${id}.json`
    });
  }

  // Filter by strain type
  let results = COLLECTION;
  if (type) {
    results = results.filter(n => n.type.toLowerCase().includes(type.toLowerCase()));
  }
  if (strain) {
    results = results.filter(n => n.strain.toLowerCase().includes(strain.toLowerCase()));
  }

  return res.status(200).json({
    success: true,
    total: results.length,
    collection: results,
    contract: process.env.NFT_CONTRACT_ADDRESS || null
  });
}

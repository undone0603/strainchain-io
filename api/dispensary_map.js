export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { state, city, lat, lng, radius_miles = 25, medical, recreational } = req.query;

  const dispensaries = [
    {
      id: 'disp_001',
      name: 'Green Leaf Dispensary',
      slug: 'green-leaf-dispensary',
      address: '420 Cannabis Blvd, Los Angeles, CA 90001',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90001',
      lat: 34.0522,
      lng: -118.2437,
      phone: '+1-310-420-4200',
      website: 'https://greenleaf.example.com',
      hours: { mon_fri: '9am-10pm', sat: '9am-11pm', sun: '10am-9pm' },
      services: ['in_store', 'pickup', 'delivery'],
      license_type: ['medical', 'recreational'],
      metrc_licensed: true,
      strainchain_verified: true,
      rating: 4.7,
      review_count: 312,
      distance_miles: null
    },
    {
      id: 'disp_002',
      name: 'Harbor Collective',
      slug: 'harbor-collective',
      address: '710 Harbor Way, Long Beach, CA 90802',
      city: 'Long Beach',
      state: 'CA',
      zip: '90802',
      lat: 33.7701,
      lng: -118.1937,
      phone: '+1-562-710-7100',
      website: 'https://harborcollective.example.com',
      hours: { mon_fri: '8am-9pm', sat: '8am-10pm', sun: '10am-8pm' },
      services: ['in_store', 'delivery'],
      license_type: ['recreational'],
      metrc_licensed: true,
      strainchain_verified: true,
      rating: 4.5,
      review_count: 187,
      distance_miles: null
    },
    {
      id: 'disp_003',
      name: 'Valley Wellness Center',
      slug: 'valley-wellness-center',
      address: '1234 Valley Pkwy, San Fernando, CA 91340',
      city: 'San Fernando',
      state: 'CA',
      zip: '91340',
      lat: 34.2822,
      lng: -118.4372,
      phone: '+1-818-710-5500',
      website: 'https://valleywellness.example.com',
      hours: { mon_fri: '7am-9pm', sat: '8am-9pm', sun: '10am-7pm' },
      services: ['in_store', 'pickup'],
      license_type: ['medical'],
      metrc_licensed: true,
      strainchain_verified: false,
      rating: 4.2,
      review_count: 95,
      distance_miles: null
    }
  ];

  let filtered = dispensaries;
  if (state) filtered = filtered.filter(d => d.state.toLowerCase() === state.toLowerCase());
  if (city) filtered = filtered.filter(d => d.city.toLowerCase().includes(city.toLowerCase()));
  if (medical === 'true') filtered = filtered.filter(d => d.license_type.includes('medical'));
  if (recreational === 'true') filtered = filtered.filter(d => d.license_type.includes('recreational'));

  // Simulate distance calculation if lat/lng provided
  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    filtered = filtered.map(d => ({
      ...d,
      distance_miles: parseFloat((Math.sqrt(Math.pow(d.lat - userLat, 2) + Math.pow(d.lng - userLng, 2)) * 69).toFixed(1))
    })).filter(d => d.distance_miles <= parseFloat(radius_miles))
       .sort((a, b) => a.distance_miles - b.distance_miles);
  }

  return res.status(200).json({
    success: true,
    dispensaries: filtered,
    total: filtered.length,
    strainchain_verified_count: filtered.filter(d => d.strainchain_verified).length,
    states_available: ['CA', 'CO', 'OR', 'WA', 'MI', 'IL', 'NV', 'AZ', 'MA', 'NJ']
  });
}

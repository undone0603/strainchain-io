// /api/vendor - Cannabis supply chain vendor and supplier management
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, vendor_type, state_licensed, status } = req.query;

  const vendors = [
    {
      id: 'vnd_001',
      name: 'GreenTech Nutrients LLC',
      vendor_type: 'nutrients',
      contact_name: 'Paul Stevens',
      email: 'paul@greentech-nutrients.com',
      phone: '734-555-0201',
      address: '4500 Industrial Pkwy, Ann Arbor, MI 48108',
      website: 'https://greentech-nutrients.com',
      state_licensed: true,
      license_number: 'VEND-MI-001234',
      license_expiry: '2027-03-31',
      status: 'active',
      preferred: true,
      payment_terms: 'net_30',
      lead_time_days: 3,
      categories: ['nutrients', 'supplements', 'ph_adjusters'],
      annual_spend: 48000,
      last_order: '2026-04-28T09:00:00Z',
      notes: 'Primary nutrients supplier; COA provided with each batch'
    },
    {
      id: 'vnd_002',
      name: 'MichiFlora Genetics',
      vendor_type: 'genetics',
      contact_name: 'Sandra Lee',
      email: 'sandra@michiflora.com',
      phone: '517-555-0302',
      address: '200 Horticulture Dr, Lansing, MI 48910',
      website: 'https://michiflora.com',
      state_licensed: true,
      license_number: 'VEND-MI-002345',
      license_expiry: '2027-06-30',
      status: 'active',
      preferred: true,
      payment_terms: 'net_15',
      lead_time_days: 7,
      categories: ['seeds', 'clones', 'genetics'],
      annual_spend: 32000,
      last_order: '2026-03-15T10:00:00Z',
      notes: 'State-licensed genetics supplier; exclusive provider of Blue Dream phenotype'
    },
    {
      id: 'vnd_003',
      name: 'Packaging Solutions MI',
      vendor_type: 'packaging',
      contact_name: 'Kevin Park',
      email: 'kevin@packagingmi.com',
      phone: '616-555-0403',
      address: '800 Commerce Blvd, Grand Rapids, MI 49503',
      website: 'https://packagingmi.com',
      state_licensed: false,
      license_number: null,
      license_expiry: null,
      status: 'active',
      preferred: false,
      payment_terms: 'net_45',
      lead_time_days: 10,
      categories: ['child_resistant_packaging', 'labels', 'bags', 'containers'],
      annual_spend: 22000,
      last_order: '2026-05-01T08:00:00Z',
      notes: 'CPSC-compliant packaging; 30-day lead time for custom printed labels'
    },
    {
      id: 'vnd_004',
      name: 'Precision Extraction Solutions',
      vendor_type: 'equipment',
      contact_name: 'Lisa Chen',
      email: 'lisa@precisionextraction.com',
      phone: '248-555-0504',
      address: '1200 Tech Center Dr, Troy, MI 48083',
      website: 'https://precisionextraction.com',
      state_licensed: true,
      license_number: 'EQUIP-MI-004567',
      license_expiry: '2027-12-31',
      status: 'active',
      preferred: true,
      payment_terms: 'net_60',
      lead_time_days: 30,
      categories: ['co2_extractors', 'ethanol_extractors', 'hydrocarbon', 'filtration'],
      annual_spend: 85000,
      last_order: '2025-11-20T11:00:00Z',
      notes: 'Major equipment vendor; service contracts available'
    }
  ];

  let filtered = vendors;
  if (vendor_type) filtered = filtered.filter(v => v.vendor_type === vendor_type);
  if (state_licensed !== undefined) filtered = filtered.filter(v => v.state_licensed === (state_licensed === 'true'));
  if (status) filtered = filtered.filter(v => v.status === status);

  const total_spend = filtered.reduce((sum, v) => sum + v.annual_spend, 0);

  return res.status(200).json({
    success: true,
    vendors: filtered,
    total: filtered.length,
    total_annual_spend: total_spend,
    preferred_count: filtered.filter(v => v.preferred).length,
    vendor_types: ['nutrients', 'genetics', 'packaging', 'equipment', 'testing_lab', 'compliance', 'security', 'delivery'],
    generated_at: new Date().toISOString()
  });
};

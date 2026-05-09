// /api/manifest - METRC transport manifest management
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, driver_id, status, manifest_type } = req.query;

  const manifests = [
    {
      id: 'mfst_001',
      manifest_number: 'TM-2026-0055',
      manifest_type: 'transfer',
      status: 'in_transit',
      origin_facility: 'fac_001',
      origin_name: 'Green Valley Cultivation',
      destination_facility: 'fac_003',
      destination_name: 'Michigan Dispensary Co.',
      driver_id: 'emp_005',
      driver_name: 'Jordan Reyes',
      driver_license: 'MI-DL-00123456',
      vehicle: '2024 Ford Transit - License RHK-2241',
      packages: [
        { tag: 'A00000000000055', product: 'Blue Dream Flower', quantity: '2.5 lbs', unit: 'lbs' },
        { tag: 'A00000000000056', product: 'OG Kush Pre-rolls 1g', quantity: '100 units', unit: 'units' }
      ],
      total_weight_lbs: 2.625,
      departed_at: '2026-05-10T09:00:00Z',
      estimated_arrival: '2026-05-10T11:30:00Z',
      arrived_at: null,
      route_notes: 'I-96 W to US-23 N',
      metrc_manifest_id: 'METRC-TM-00055',
      created_at: '2026-05-09T16:00:00Z'
    },
    {
      id: 'mfst_002',
      manifest_number: 'TM-2026-0044',
      manifest_type: 'lab_sample',
      status: 'completed',
      origin_facility: 'fac_001',
      origin_name: 'Green Valley Cultivation',
      destination_facility: 'fac_lab_001',
      destination_name: 'Michigan Cannabis Testing Lab',
      driver_id: 'emp_006',
      driver_name: 'Taylor Brooks',
      driver_license: 'MI-DL-00234567',
      vehicle: '2023 Honda CR-V - License PLK-9981',
      packages: [
        { tag: 'A00000000000044', product: 'Gelato Flower Sample', quantity: '5g', unit: 'grams' }
      ],
      total_weight_lbs: 0.011,
      departed_at: '2026-05-08T10:00:00Z',
      estimated_arrival: '2026-05-08T11:00:00Z',
      arrived_at: '2026-05-08T10:52:00Z',
      route_notes: 'Direct route, no stops',
      metrc_manifest_id: 'METRC-TM-00044',
      created_at: '2026-05-07T15:00:00Z'
    },
    {
      id: 'mfst_003',
      manifest_number: 'TM-2026-0060',
      manifest_type: 'waste',
      status: 'scheduled',
      origin_facility: 'fac_001',
      origin_name: 'Green Valley Cultivation',
      destination_facility: 'fac_waste_001',
      destination_name: 'Compliant Waste Disposal LLC',
      driver_id: null,
      driver_name: null,
      driver_license: null,
      vehicle: null,
      packages: [
        { tag: 'WASTE-2026-012', product: 'Trim Waste', quantity: '2.4 kg', unit: 'kg' }
      ],
      total_weight_lbs: 5.29,
      departed_at: null,
      estimated_arrival: null,
      arrived_at: null,
      route_notes: 'Scheduled for May 12 pickup',
      metrc_manifest_id: null,
      created_at: '2026-05-10T11:00:00Z'
    }
  ];

  let filtered = manifests;
  if (facility_id) filtered = filtered.filter(m => m.origin_facility === facility_id || m.destination_facility === facility_id);
  if (driver_id) filtered = filtered.filter(m => m.driver_id === driver_id);
  if (status) filtered = filtered.filter(m => m.status === status);
  if (manifest_type) filtered = filtered.filter(m => m.manifest_type === manifest_type);

  return res.status(200).json({
    success: true,
    manifests: filtered,
    total: filtered.length,
    in_transit: filtered.filter(m => m.status === 'in_transit').length,
    scheduled: filtered.filter(m => m.status === 'scheduled').length,
    completed: filtered.filter(m => m.status === 'completed').length,
    manifest_types: ['transfer', 'lab_sample', 'waste', 'return'],
    statuses: ['draft', 'scheduled', 'in_transit', 'completed', 'rejected'],
    generated_at: new Date().toISOString()
  });
};

// /api/room - Grow room and zone management
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, room_type, status } = req.query;

  const rooms = [
    {
      id: 'room_001',
      name: 'Veg Room A',
      facility_id: 'fac_001',
      room_type: 'vegetation',
      status: 'active',
      capacity_plants: 200,
      current_plants: 142,
      sq_ft: 1200,
      lighting: 'LED 600W x12',
      co2_ppm: 1200,
      temp_f: 76,
      humidity_pct: 65,
      vpd: 1.1,
      air_circulation: 'active',
      irrigation: 'drip',
      last_inspection: '2026-05-09T10:00:00Z',
      metrc_room_id: 'METRC_VEG_A'
    },
    {
      id: 'room_002',
      name: 'Flower Room B',
      facility_id: 'fac_001',
      room_type: 'flowering',
      status: 'active',
      capacity_plants: 150,
      current_plants: 98,
      sq_ft: 1800,
      lighting: 'HPS 1000W x18',
      co2_ppm: 1500,
      temp_f: 74,
      humidity_pct: 50,
      vpd: 1.4,
      air_circulation: 'active',
      irrigation: 'flood_and_drain',
      last_inspection: '2026-05-08T14:00:00Z',
      metrc_room_id: 'METRC_FLOWER_B'
    },
    {
      id: 'room_003',
      name: 'Clone Room C',
      facility_id: 'fac_001',
      room_type: 'clone',
      status: 'active',
      capacity_plants: 500,
      current_plants: 320,
      sq_ft: 400,
      lighting: 'T5 Fluorescent x8',
      co2_ppm: 800,
      temp_f: 78,
      humidity_pct: 80,
      vpd: 0.7,
      air_circulation: 'passive',
      irrigation: 'misting',
      last_inspection: '2026-05-10T09:00:00Z',
      metrc_room_id: 'METRC_CLONE_C'
    },
    {
      id: 'room_004',
      name: 'Dry Room D',
      facility_id: 'fac_001',
      room_type: 'drying',
      status: 'active',
      capacity_plants: 0,
      current_plants: 0,
      sq_ft: 600,
      lighting: 'None',
      co2_ppm: null,
      temp_f: 60,
      humidity_pct: 55,
      vpd: null,
      air_circulation: 'active',
      irrigation: null,
      last_inspection: '2026-05-07T11:00:00Z',
      metrc_room_id: 'METRC_DRY_D'
    },
    {
      id: 'room_005',
      name: 'Processing Lab E',
      facility_id: 'fac_002',
      room_type: 'processing',
      status: 'maintenance',
      capacity_plants: 0,
      current_plants: 0,
      sq_ft: 800,
      lighting: 'LED Overhead',
      co2_ppm: null,
      temp_f: 68,
      humidity_pct: 40,
      vpd: null,
      air_circulation: 'active',
      irrigation: null,
      last_inspection: '2026-05-05T08:00:00Z',
      metrc_room_id: 'METRC_PROC_E'
    }
  ];

  let filtered = rooms;
  if (facility_id) filtered = filtered.filter(r => r.facility_id === facility_id);
  if (room_type) filtered = filtered.filter(r => r.room_type === room_type);
  if (status) filtered = filtered.filter(r => r.status === status);

  return res.status(200).json({
    success: true,
    rooms: filtered,
    total: filtered.length,
    room_types: ['vegetation', 'flowering', 'clone', 'drying', 'processing', 'storage', 'quarantine'],
    statuses: ['active', 'inactive', 'maintenance', 'sealed'],
    generated_at: new Date().toISOString()
  });
};

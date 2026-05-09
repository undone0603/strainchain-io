// /api/equipment - Cultivation and processing equipment tracking
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, equipment_type, status } = req.query;

  const equipment = [
    {
      id: 'eq_001',
      name: 'LED Grow Light Array #1',
      equipment_type: 'lighting',
      facility_id: 'fac_001',
      room_id: 'room_001',
      manufacturer: 'Spider Farmer',
      model: 'SF-7000',
      serial_number: 'SF7K-2024-00142',
      status: 'operational',
      purchase_date: '2024-06-01',
      warranty_expiry: '2027-06-01',
      last_maintenance: '2026-04-01',
      next_maintenance: '2026-07-01',
      power_watts: 650,
      coverage_sqft: 100,
      hours_of_use: 14200,
      notes: 'Primary veg room lighting array'
    },
    {
      id: 'eq_002',
      name: 'CO2 Generator System',
      equipment_type: 'climate_control',
      facility_id: 'fac_001',
      room_id: 'room_002',
      manufacturer: 'CAP',
      model: 'PPM-4',
      serial_number: 'CAP-PPM4-20240823',
      status: 'operational',
      purchase_date: '2024-08-01',
      warranty_expiry: '2026-08-01',
      last_maintenance: '2026-03-15',
      next_maintenance: '2026-06-15',
      power_watts: 4800,
      coverage_sqft: 1800,
      hours_of_use: 9800,
      notes: 'Flower room CO2 enrichment; set to 1500 ppm'
    },
    {
      id: 'eq_003',
      name: 'CO2 Extraction System',
      equipment_type: 'extraction',
      facility_id: 'fac_002',
      room_id: 'room_005',
      manufacturer: 'Apeks Supercritical',
      model: 'CO2-10L',
      serial_number: 'APEKS-10L-2025-0041',
      status: 'maintenance',
      purchase_date: '2025-01-15',
      warranty_expiry: '2028-01-15',
      last_maintenance: '2026-05-05',
      next_maintenance: '2026-05-12',
      power_watts: 3200,
      coverage_sqft: null,
      hours_of_use: 2100,
      notes: 'Scheduled maintenance in progress; seal replacement'
    },
    {
      id: 'eq_004',
      name: 'HVAC Unit - Flower Room',
      equipment_type: 'climate_control',
      facility_id: 'fac_001',
      room_id: 'room_002',
      manufacturer: 'Quest',
      model: 'Quest 335',
      serial_number: 'QST335-2023-0188',
      status: 'operational',
      purchase_date: '2023-09-01',
      warranty_expiry: '2026-09-01',
      last_maintenance: '2026-02-01',
      next_maintenance: '2026-08-01',
      power_watts: 2200,
      coverage_sqft: 1800,
      hours_of_use: 22400,
      notes: 'Dehumidification unit; filter replaced Feb 2026'
    },
    {
      id: 'eq_005',
      name: 'Trimming Machine',
      equipment_type: 'processing',
      facility_id: 'fac_001',
      room_id: 'room_004',
      manufacturer: 'Tom Trowbridge',
      model: 'Pro 3600',
      serial_number: 'TT3600-2024-0055',
      status: 'operational',
      purchase_date: '2024-10-01',
      warranty_expiry: '2026-10-01',
      last_maintenance: '2026-05-01',
      next_maintenance: '2026-08-01',
      power_watts: 800,
      coverage_sqft: null,
      hours_of_use: 480,
      notes: 'Wet and dry trim capable; cleaned after each harvest'
    }
  ];

  let filtered = equipment;
  if (facility_id) filtered = filtered.filter(e => e.facility_id === facility_id);
  if (equipment_type) filtered = filtered.filter(e => e.equipment_type === equipment_type);
  if (status) filtered = filtered.filter(e => e.status === status);

  const needs_maintenance = filtered.filter(e => {
    if (!e.next_maintenance) return false;
    const days = (new Date(e.next_maintenance) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  }).length;

  return res.status(200).json({
    success: true,
    equipment: filtered,
    total: filtered.length,
    operational: filtered.filter(e => e.status === 'operational').length,
    in_maintenance: filtered.filter(e => e.status === 'maintenance').length,
    maintenance_due_30_days: needs_maintenance,
    equipment_types: ['lighting', 'climate_control', 'irrigation', 'extraction', 'processing', 'security', 'monitoring'],
    statuses: ['operational', 'maintenance', 'offline', 'decommissioned'],
    generated_at: new Date().toISOString()
  });
};

// /api/employee - Licensed cannabis employee and badging management
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, role, badge_status, license_status } = req.query;

  const employees = [
    {
      id: 'emp_001',
      name: 'Alex Johnson',
      facility_id: 'fac_001',
      role: 'cultivation_manager',
      email: 'alex@strainchain.io',
      phone: '555-0101',
      badge_number: 'BADGE-2024-001',
      badge_status: 'active',
      badge_expiry: '2027-01-15',
      state_license: 'EMP-MI-00001',
      license_status: 'active',
      license_expiry: '2027-06-30',
      background_check: '2024-01-10',
      hired_date: '2023-03-15',
      certifications: ['METRC_CERTIFIED', 'PESTICIDE_APPLICATOR', 'GMP_CERTIFIED'],
      access_rooms: ['room_001', 'room_002', 'room_003']
    },
    {
      id: 'emp_002',
      name: 'Maria Garcia',
      facility_id: 'fac_001',
      role: 'master_grower',
      email: 'maria@strainchain.io',
      phone: '555-0102',
      badge_number: 'BADGE-2024-002',
      badge_status: 'active',
      badge_expiry: '2027-03-20',
      state_license: 'EMP-MI-00002',
      license_status: 'active',
      license_expiry: '2027-09-30',
      background_check: '2024-03-15',
      hired_date: '2022-08-01',
      certifications: ['METRC_CERTIFIED', 'MASTER_GROWER_CERT', 'IPM_CERTIFIED'],
      access_rooms: ['room_001', 'room_002', 'room_003', 'room_004']
    },
    {
      id: 'emp_003',
      name: 'Sam Torres',
      facility_id: 'fac_001',
      role: 'compliance_officer',
      email: 'sam@strainchain.io',
      phone: '555-0103',
      badge_number: 'BADGE-2024-003',
      badge_status: 'active',
      badge_expiry: '2026-12-01',
      state_license: 'EMP-MI-00003',
      license_status: 'active',
      license_expiry: '2026-12-31',
      background_check: '2023-12-01',
      hired_date: '2022-01-10',
      certifications: ['METRC_CERTIFIED', 'COMPLIANCE_OFFICER', 'AUDIT_SPECIALIST'],
      access_rooms: ['room_001', 'room_002', 'room_003', 'room_004', 'room_005']
    },
    {
      id: 'emp_004',
      name: 'Casey Kim',
      facility_id: 'fac_002',
      role: 'extraction_technician',
      email: 'casey@strainchain.io',
      phone: '555-0104',
      badge_number: 'BADGE-2025-004',
      badge_status: 'active',
      badge_expiry: '2028-05-01',
      state_license: 'EMP-MI-00004',
      license_status: 'active',
      license_expiry: '2028-05-01',
      background_check: '2025-04-20',
      hired_date: '2024-06-01',
      certifications: ['METRC_CERTIFIED', 'HYDROCARBON_EXTRACTION', 'CO2_EXTRACTION'],
      access_rooms: ['room_005']
    }
  ];

  let filtered = employees;
  if (facility_id) filtered = filtered.filter(e => e.facility_id === facility_id);
  if (role) filtered = filtered.filter(e => e.role === role);
  if (badge_status) filtered = filtered.filter(e => e.badge_status === badge_status);
  if (license_status) filtered = filtered.filter(e => e.license_status === license_status);

  const expiring_soon = filtered.filter(e => {
    const days = (new Date(e.license_expiry) - new Date()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 90;
  }).length;

  return res.status(200).json({
    success: true,
    employees: filtered,
    total: filtered.length,
    active: filtered.filter(e => e.badge_status === 'active').length,
    expiring_soon_licenses: expiring_soon,
    roles: ['cultivation_manager', 'master_grower', 'compliance_officer', 'extraction_technician', 'trimmer', 'delivery_driver', 'security'],
    generated_at: new Date().toISOString()
  });
};

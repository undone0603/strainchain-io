// /api/tag - METRC plant and package tag management
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, tag_type, status, assigned_to } = req.query;

  const tags = [
    {
      id: 'tag_001',
      tag_number: 'A00000000000001',
      facility_id: 'fac_001',
      tag_type: 'plant',
      status: 'assigned',
      assigned_to: 'plant_0001',
      assigned_at: '2026-01-15T08:00:00Z',
      strain: 'Blue Dream',
      room: 'Veg Room A',
      metrc_status: 'active',
      batch_id: 'batch_001'
    },
    {
      id: 'tag_002',
      tag_number: 'A00000000000042',
      facility_id: 'fac_001',
      tag_type: 'plant',
      status: 'assigned',
      assigned_to: 'plant_0042',
      assigned_at: '2026-02-20T09:00:00Z',
      strain: 'OG Kush',
      room: 'Flower Room B',
      metrc_status: 'active',
      batch_id: 'batch_002'
    },
    {
      id: 'tag_003',
      tag_number: 'A00000000000055',
      facility_id: 'fac_001',
      tag_type: 'package',
      status: 'assigned',
      assigned_to: 'pkg_055',
      assigned_at: '2026-04-10T10:00:00Z',
      strain: 'Blue Dream',
      room: null,
      metrc_status: 'active',
      batch_id: 'batch_001'
    },
    {
      id: 'tag_004',
      tag_number: 'A00000000000099',
      facility_id: 'fac_001',
      tag_type: 'plant',
      status: 'available',
      assigned_to: null,
      assigned_at: null,
      strain: null,
      room: null,
      metrc_status: 'inactive',
      batch_id: null
    },
    {
      id: 'tag_005',
      tag_number: 'A00000000000120',
      facility_id: 'fac_002',
      tag_type: 'package',
      status: 'retired',
      assigned_to: 'pkg_old_012',
      assigned_at: '2025-12-01T08:00:00Z',
      strain: 'Gelato',
      room: null,
      metrc_status: 'retired',
      batch_id: 'batch_old_005'
    }
  ];

  let filtered = tags;
  if (facility_id) filtered = filtered.filter(t => t.facility_id === facility_id);
  if (tag_type) filtered = filtered.filter(t => t.tag_type === tag_type);
  if (status) filtered = filtered.filter(t => t.status === status);
  if (assigned_to) filtered = filtered.filter(t => t.assigned_to === assigned_to);

  const available = filtered.filter(t => t.status === 'available').length;
  const assigned = filtered.filter(t => t.status === 'assigned').length;
  const retired = filtered.filter(t => t.status === 'retired').length;

  return res.status(200).json({
    success: true,
    tags: filtered,
    total: filtered.length,
    summary: { available, assigned, retired },
    tag_types: ['plant', 'package'],
    statuses: ['available', 'assigned', 'retired'],
    generated_at: new Date().toISOString()
  });
};

// /api/audit - Compliance audit trail and activity logging
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { facility_id, user_id, action_type, entity_type, start_date, end_date, limit = 50, offset = 0 } = req.query;

  const auditLogs = [
    {
      id: 'audit_001',
      facility_id: 'fac_001',
      user_id: 'emp_001',
      user_name: 'Alex Johnson',
      action_type: 'create',
      entity_type: 'batch',
      entity_id: 'batch_001',
      description: 'Created harvest batch HB-2026-001 for Blue Dream',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0',
      metrc_sync: true,
      metrc_tag: 'A00000000000001',
      timestamp: '2026-05-10T08:30:00Z',
      status: 'success'
    },
    {
      id: 'audit_002',
      facility_id: 'fac_001',
      user_id: 'emp_002',
      user_name: 'Maria Garcia',
      action_type: 'update',
      entity_type: 'plant',
      entity_id: 'plant_0042',
      description: 'Updated plant weight: 125g -> 142g after trimming',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0',
      metrc_sync: true,
      metrc_tag: 'A00000000000042',
      timestamp: '2026-05-10T09:15:00Z',
      status: 'success'
    },
    {
      id: 'audit_003',
      facility_id: 'fac_001',
      user_id: 'emp_003',
      user_name: 'Sam Torres',
      action_type: 'transfer',
      entity_type: 'package',
      entity_id: 'pkg_055',
      description: 'Initiated transfer manifest TM-2026-055 to dispensary',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0',
      metrc_sync: true,
      metrc_tag: 'A00000000000055',
      timestamp: '2026-05-10T10:00:00Z',
      status: 'success'
    },
    {
      id: 'audit_004',
      facility_id: 'fac_002',
      user_id: 'emp_004',
      user_name: 'Casey Kim',
      action_type: 'delete',
      entity_type: 'waste',
      entity_id: 'waste_012',
      description: 'Logged waste disposal: 2.4kg trim waste from extraction',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0',
      metrc_sync: false,
      metrc_tag: null,
      timestamp: '2026-05-10T11:30:00Z',
      status: 'success'
    },
    {
      id: 'audit_005',
      facility_id: 'fac_001',
      user_id: 'system',
      user_name: 'StrainChain System',
      action_type: 'sync',
      entity_type: 'metrc',
      entity_id: 'sync_daily',
      description: 'Daily METRC compliance sync completed - 142 records updated',
      ip_address: '10.0.0.1',
      user_agent: 'StrainChain/2.0',
      metrc_sync: true,
      metrc_tag: null,
      timestamp: '2026-05-10T02:00:00Z',
      status: 'success'
    }
  ];

  let filtered = auditLogs;
  if (facility_id) filtered = filtered.filter(l => l.facility_id === facility_id);
  if (user_id) filtered = filtered.filter(l => l.user_id === user_id);
  if (action_type) filtered = filtered.filter(l => l.action_type === action_type);
  if (entity_type) filtered = filtered.filter(l => l.entity_type === entity_type);
  if (start_date) filtered = filtered.filter(l => l.timestamp >= start_date);
  if (end_date) filtered = filtered.filter(l => l.timestamp <= end_date);

  const total = filtered.length;
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));

  return res.status(200).json({
    success: true,
    audit_logs: paginated,
    total,
    limit: Number(limit),
    offset: Number(offset),
    has_more: Number(offset) + Number(limit) < total,
    action_types: ['create', 'update', 'delete', 'transfer', 'sync', 'login', 'export'],
    entity_types: ['batch', 'plant', 'package', 'transfer', 'waste', 'user', 'metrc', 'license'],
    generated_at: new Date().toISOString()
  });
};

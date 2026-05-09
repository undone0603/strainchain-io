export default async function handler(req, res) {
  const { query } = req;
  const { dispensary_id, type, severity, status } = query;

  const alerts = [
    {
      id: 'alert_001',
      dispensary_id: 'disp_001',
      type: 'low_inventory',
      severity: 'high',
      status: 'active',
      title: 'Low Stock: Blue Dream (Flower)',
      message: 'Blue Dream inventory is at 2.4 lbs, below reorder threshold of 5 lbs.',
      product_id: 'prod_001',
      product_name: 'Blue Dream',
      current_value: 2.4,
      threshold_value: 5,
      unit: 'lbs',
      auto_reorder_triggered: false,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      acknowledged_at: null,
      resolved_at: null
    },
    {
      id: 'alert_002',
      dispensary_id: 'disp_001',
      type: 'license_expiry',
      severity: 'critical',
      status: 'active',
      title: 'License Expiring in 14 Days',
      message: 'Dispensary license CDPH-10001234 expires on 2026-06-01. Renew immediately.',
      license_id: 'lic_001',
      current_value: 14,
      threshold_value: 30,
      unit: 'days',
      auto_reorder_triggered: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      acknowledged_at: new Date(Date.now() - 43200000).toISOString(),
      resolved_at: null
    },
    {
      id: 'alert_003',
      dispensary_id: 'disp_001',
      type: 'compliance_violation',
      severity: 'medium',
      status: 'resolved',
      title: 'METRC Sync Delay',
      message: 'METRC package sync was delayed by 4 hours. All packages have now been reconciled.',
      metrc_batch_id: 'MB-1234',
      current_value: 4,
      threshold_value: 2,
      unit: 'hours',
      auto_reorder_triggered: false,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      acknowledged_at: new Date(Date.now() - 2.9 * 86400000).toISOString(),
      resolved_at: new Date(Date.now() - 2.8 * 86400000).toISOString()
    },
    {
      id: 'alert_004',
      dispensary_id: 'disp_002',
      type: 'failed_test',
      severity: 'critical',
      status: 'active',
      title: 'Batch Failed Lab Test',
      message: 'Batch BAT-2024-009 failed pesticide screening. Quarantine required.',
      batch_id: 'BAT-2024-009',
      current_value: null,
      threshold_value: null,
      unit: null,
      auto_reorder_triggered: false,
      created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
      acknowledged_at: null,
      resolved_at: null
    }
  ];

  let filtered = alerts;
  if (dispensary_id) filtered = filtered.filter(a => a.dispensary_id === dispensary_id);
  if (type) filtered = filtered.filter(a => a.type === type);
  if (severity) filtered = filtered.filter(a => a.severity === severity);
  if (status) filtered = filtered.filter(a => a.status === status);

  const summary = {
    total: filtered.length,
    active: filtered.filter(a => a.status === 'active').length,
    critical: filtered.filter(a => a.severity === 'critical' && a.status === 'active').length,
    unacknowledged: filtered.filter(a => !a.acknowledged_at).length
  };

  return res.status(200).json({
    success: true,
    alerts: filtered,
    summary,
    types: ['low_inventory', 'license_expiry', 'compliance_violation', 'failed_test', 'delivery_delay', 'payment_overdue'],
    severities: ['low', 'medium', 'high', 'critical']
  });
}

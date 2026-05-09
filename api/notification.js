const notifications = [
  { id: 'notif_001', type: 'compliance_alert', title: 'METRC Sync Required', message: 'Batch #BTC-2025-001 requires METRC synchronization within 24 hours', severity: 'high', read: false, created_at: '2025-01-15T08:00:00Z', dispensary_id: 'disp_001' },
  { id: 'notif_002', type: 'lab_result', title: 'Lab Test Results Available', message: 'COA for Blue Dream batch #BTC-2025-003 is ready for review', severity: 'info', read: false, created_at: '2025-01-15T09:30:00Z', dispensary_id: 'disp_001' },
  { id: 'notif_003', type: 'license_expiry', title: 'License Expiring Soon', message: 'Cultivation license LIC-CA-2021-8847 expires in 30 days', severity: 'warning', read: true, created_at: '2025-01-14T10:00:00Z', dispensary_id: 'disp_002' },
  { id: 'notif_004', type: 'transfer_complete', title: 'Transfer Completed', message: 'Product transfer TRF-2025-0123 to Cannabis Corner has been verified on blockchain', severity: 'success', read: false, created_at: '2025-01-15T11:00:00Z', dispensary_id: 'disp_001' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { dispensary_id, unread, severity } = req.query;
    let filtered = notifications;
    if (dispensary_id) filtered = filtered.filter(n => n.dispensary_id === dispensary_id);
    if (unread === 'true') filtered = filtered.filter(n => !n.read);
    if (severity) filtered = filtered.filter(n => n.severity === severity);
    return res.status(200).json({
      success: true,
      endpoint: '/api/notification',
      notifications: filtered,
      total: filtered.length,
      unread_count: filtered.filter(n => !n.read).length,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { dispensary_id, type, title, message, severity = 'info' } = req.body || {};
    if (!dispensary_id || !title || !message) return res.status(400).json({ error: 'dispensary_id, title, and message are required' });
    const notification = {
      id: `notif_${Date.now()}`,
      type: type || 'general',
      title,
      message,
      severity,
      read: false,
      created_at: new Date().toISOString(),
      dispensary_id,
      protocol: 'StrainChain'
    };
    return res.status(200).json({ success: true, notification, protocol: 'StrainChain' });
  }

  if (req.method === 'PUT') {
    const { id } = req.query;
    return res.status(200).json({ success: true, message: `Notification ${id} marked as read`, protocol: 'StrainChain' });
  }
};

const users = [
  { id: 'usr_001', name: 'Alex Green', email: 'alex@greenleaf.co', dispensary: 'Green Leaf Dispensary', role: 'admin', plan: 'professional', status: 'active', license: 'LIC-CA-2021-8847', metrc_key: '***masked***', verified: true, created_at: '2024-05-01T00:00:00Z' },
  { id: 'usr_002', name: 'Jamie Cole', email: 'jamie@cannabiscorner.com', dispensary: 'Cannabis Corner', role: 'manager', plan: 'starter', status: 'active', license: 'LIC-CA-2022-1234', metrc_key: '***masked***', verified: true, created_at: '2024-07-15T00:00:00Z' },
  { id: 'usr_003', name: 'Sam Rivera', email: 'sam@herbal.com', dispensary: 'Herbal Solutions', role: 'user', plan: 'starter', status: 'active', license: 'LIC-CA-2023-5678', metrc_key: null, verified: false, created_at: '2024-10-20T00:00:00Z' }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { id, role, plan } = req.query;
    if (id) {
      const user = users.find(u => u.id === id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json({ success: true, user, protocol: 'StrainChain' });
    }
    let filtered = users;
    if (role) filtered = filtered.filter(u => u.role === role);
    if (plan) filtered = filtered.filter(u => u.plan === plan);
    return res.status(200).json({
      success: true,
      endpoint: '/api/user',
      users: filtered,
      total: filtered.length,
      active: filtered.filter(u => u.status === 'active').length,
      verified: filtered.filter(u => u.verified).length,
      protocol: 'StrainChain'
    });
  }

  if (req.method === 'POST') {
    const { name, email, dispensary, role = 'user', plan = 'starter', license } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    return res.status(200).json({
      success: true,
      user: {
        id: `usr_${Date.now()}`,
        name, email, dispensary, role, plan, license,
        status: 'active',
        verified: false,
        created_at: new Date().toISOString(),
        protocol: 'StrainChain'
      },
      protocol: 'StrainChain'
    });
  }
};

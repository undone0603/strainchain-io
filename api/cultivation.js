module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/cultivation',
      cultivation_sites: [
        {
          id: 'cult_001',
          name: 'Northern Lights Farm',
          license: 'CULT-CA-001234',
          type: 'indoor',
          state: 'CA',
          active_plants: 2400,
          rooms: 8,
          status: 'active',
          metrc_facility_id: 'CA-MF-001234'
        },
        {
          id: 'cult_002',
          name: 'Emerald Valley Greenhouse',
          license: 'CULT-OR-005678',
          type: 'greenhouse',
          state: 'OR',
          active_plants: 1800,
          rooms: 4,
          status: 'active',
          metrc_facility_id: 'OR-MF-005678'
        }
      ],
      total: 2,
      total_active_plants: 4200,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

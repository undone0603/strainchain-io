export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { dispensary_id, policy_type, status } = req.query;

  const policies = [
    {
      id: 'ins_001',
      dispensary_id: 'disp_001',
      dispensary_name: 'Green Leaf Dispensary',
      insurer: 'Cannabis Shield Insurance Co.',
      policy_number: 'CSI-2024-GL-001',
      policy_type: 'general_liability',
      status: 'active',
      coverage_amount: 2000000,
      premium_annual: 8400,
      deductible: 5000,
      effective_date: '2024-01-01',
      expiry_date: '2024-12-31',
      covers: [
        'Bodily injury and property damage',
        'Products and completed operations',
        'Personal and advertising injury',
        'Medical payments'
      ],
      exclusions: ['Intentional acts', 'Criminal fines', 'Federal prosecution'],
      agent_name: 'Robert Chen',
      agent_email: 'rchen@cannabisshield.com',
      agent_phone: '+1-800-420-SAFE',
      documents: [
        { name: 'Certificate of Insurance', url: '/docs/ins_001_coi.pdf', issued: '2024-01-01' },
        { name: 'Policy Declarations', url: '/docs/ins_001_dec.pdf', issued: '2024-01-01' }
      ],
      created_at: '2023-12-15T10:00:00Z'
    },
    {
      id: 'ins_002',
      dispensary_id: 'disp_001',
      dispensary_name: 'Green Leaf Dispensary',
      insurer: 'MedCanna Risk Partners',
      policy_number: 'MCRP-2024-PL-001',
      policy_type: 'product_liability',
      status: 'active',
      coverage_amount: 5000000,
      premium_annual: 14200,
      deductible: 10000,
      effective_date: '2024-01-01',
      expiry_date: '2024-12-31',
      covers: [
        'Cannabis product defects',
        'Contamination claims',
        'Mislabeling',
        'Third-party bodily injury from products'
      ],
      exclusions: ['Recall costs without prior approval', 'Punitive damages in some states'],
      agent_name: 'Lisa Park',
      agent_email: 'lpark@medcannarisk.com',
      agent_phone: '+1-888-710-RISK',
      documents: [
        { name: 'Product Liability Policy', url: '/docs/ins_002_pl.pdf', issued: '2024-01-01' }
      ],
      created_at: '2023-12-15T10:00:00Z'
    },
    {
      id: 'ins_003',
      dispensary_id: 'disp_002',
      dispensary_name: 'Harbor Collective',
      insurer: 'GreenGuard Specialty',
      policy_number: 'GGS-2024-BP-002',
      policy_type: 'business_owners',
      status: 'renewal_pending',
      coverage_amount: 1500000,
      premium_annual: 6800,
      deductible: 2500,
      effective_date: '2024-03-01',
      expiry_date: '2025-02-28',
      covers: ['Building', 'Business personal property', 'Business income', 'General liability'],
      exclusions: ['Flood', 'Earthquake', 'Cannabis odor complaints'],
      agent_name: 'Tom Williams',
      agent_email: 'twilliams@greenguard.com',
      agent_phone: '+1-877-GREEN-GD',
      documents: [],
      created_at: '2024-02-01T10:00:00Z'
    }
  ];

  let filtered = policies;
  if (dispensary_id) filtered = filtered.filter(p => p.dispensary_id === dispensary_id);
  if (policy_type) filtered = filtered.filter(p => p.policy_type === policy_type);
  if (status) filtered = filtered.filter(p => p.status === status);

  const total_premium = filtered.reduce((sum, p) => sum + p.premium_annual, 0);
  const total_coverage = filtered.reduce((sum, p) => sum + p.coverage_amount, 0);

  return res.status(200).json({
    success: true,
    policies: filtered,
    total: filtered.length,
    total_annual_premium: total_premium,
    total_coverage_limit: total_coverage,
    statuses: ['active', 'renewal_pending', 'expired', 'cancelled'],
    policy_types: ['general_liability', 'product_liability', 'business_owners', 'workers_comp', 'commercial_auto', 'cyber_liability']
  });
}

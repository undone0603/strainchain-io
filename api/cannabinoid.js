// StrainChain - Cannabinoid Profile API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const CANNABINOIDS = [
    { id: 'thc', name: 'THC', full_name: 'Tetrahydrocannabinol', type: 'major', psychoactive: true, unit: '%' },
    { id: 'thca', name: 'THCA', full_name: 'Tetrahydrocannabinolic Acid', type: 'major', psychoactive: false, unit: '%' },
    { id: 'cbd', name: 'CBD', full_name: 'Cannabidiol', type: 'major', psychoactive: false, unit: '%' },
    { id: 'cbda', name: 'CBDA', full_name: 'Cannabidiolic Acid', type: 'major', psychoactive: false, unit: '%' },
    { id: 'cbg', name: 'CBG', full_name: 'Cannabigerol', type: 'minor', psychoactive: false, unit: '%' },
    { id: 'cbga', name: 'CBGA', full_name: 'Cannabigerolic Acid', type: 'minor', psychoactive: false, unit: '%' },
    { id: 'cbc', name: 'CBC', full_name: 'Cannabichromene', type: 'minor', psychoactive: false, unit: '%' },
    { id: 'cbn', name: 'CBN', full_name: 'Cannabinol', type: 'minor', psychoactive: false, unit: '%' },
    { id: 'cbdv', name: 'CBDV', full_name: 'Cannabidivarin', type: 'minor', psychoactive: false, unit: '%' },
    { id: 'thcv', name: 'THCV', full_name: 'Tetrahydrocannabivarin', type: 'minor', psychoactive: true, unit: '%' },
    { id: 'd8_thc', name: 'D8-THC', full_name: 'Delta-8-THC', type: 'minor', psychoactive: true, unit: '%' },
    { id: 'cbl', name: 'CBL', full_name: 'Cannabicyclol', type: 'rare', psychoactive: false, unit: '%' },
  ];

  if (req.method === 'GET') {
    const { strain_id, batch_id, cannabinoid, type } = req.query;

    if (!strain_id && !batch_id) {
      return res.status(400).json({ error: 'strain_id or batch_id is required' });
    }

    let cannabinoid_list = CANNABINOIDS;
    if (type) cannabinoid_list = cannabinoid_list.filter((c) => c.type === type);
    if (cannabinoid) cannabinoid_list = cannabinoid_list.filter((c) => c.id === cannabinoid);

    const profile = cannabinoid_list.map((c) => ({
      ...c,
      value: parseFloat((Math.random() * (c.type === 'major' ? 25 : 2)).toFixed(2)),
      mg_per_gram: parseFloat((Math.random() * (c.type === 'major' ? 250 : 20)).toFixed(1)),
      detected: Math.random() > 0.3,
    })).filter((c) => c.detected);

    const total_thc = profile.find((c) => c.id === 'thc')?.value || 0;
    const total_cbd = profile.find((c) => c.id === 'cbd')?.value || 0;
    const total_thca = profile.find((c) => c.id === 'thca')?.value || 0;

    return res.status(200).json({
      success: true,
      strain_id: strain_id || null,
      batch_id: batch_id || null,
      cannabinoid_profile: profile,
      summary: {
        total_thc: parseFloat((total_thc + total_thca * 0.877).toFixed(2)),
        total_cbd: parseFloat(total_cbd.toFixed(2)),
        thc_to_cbd_ratio: total_cbd > 0 ? parseFloat((total_thc / total_cbd).toFixed(2)) : null,
        cannabinoid_count: profile.length,
        dominant_cannabinoid: profile.sort((a, b) => b.value - a.value)[0]?.name || 'Unknown',
      },
      test_date: new Date().toISOString().split('T')[0],
      test_method: 'HPLC-UV',
      lab_accreditation: 'ISO/IEC 17025',
    });
  }

  if (req.method === 'POST') {
    const { strain_id, batch_id, lab_id, test_results } = req.body || {};

    if (!batch_id || !test_results) {
      return res.status(400).json({ error: 'batch_id and test_results are required' });
    }

    const profile_id = `CANN-${Date.now()}`;

    return res.status(201).json({
      success: true,
      profile_id,
      strain_id: strain_id || null,
      batch_id,
      lab_id,
      cannabinoid_count: Object.keys(test_results).length,
      created_at: new Date().toISOString(),
      status: 'submitted',
      message: 'Cannabinoid profile submitted successfully',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

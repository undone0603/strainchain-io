module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { product_type, thc_min, thc_max } = req.query;

  const dosageGuides = [
    {
      id: 'dosage_001',
      product_type: 'flower',
      product_name: 'OG Kush - 3.5g',
      thc_percentage: 24.3,
      cbd_percentage: 0.8,
      dosage_recommendations: {
        microdose: { amount: '0.1g', thc_mg: 24, frequency: 'as needed', onset_minutes: 3 },
        low: { amount: '0.25g', thc_mg: 61, frequency: 'once daily', onset_minutes: 3 },
        moderate: { amount: '0.5g', thc_mg: 122, frequency: 'up to twice daily', onset_minutes: 3 },
        high: { amount: '1g', thc_mg: 243, frequency: 'experienced users only', onset_minutes: 3 }
      },
      experience_level: 'intermediate',
      effects: ['euphoric', 'relaxed', 'creative', 'pain_relief'],
      duration_hours: { min: 1, max: 3 },
      warnings: ['Do not drive', 'Not for minors', 'Consult physician if pregnant'],
      compliance_state: 'MI',
      protocol: 'StrainChain'
    },
    {
      id: 'dosage_002',
      product_type: 'edible',
      product_name: 'Blue Dream Gummies 10mg',
      thc_percentage: null,
      cbd_percentage: null,
      thc_mg_per_unit: 10,
      dosage_recommendations: {
        microdose: { amount: '0.5 gummy', thc_mg: 5, frequency: 'start low', onset_minutes: 60 },
        low: { amount: '1 gummy', thc_mg: 10, frequency: 'once daily', onset_minutes: 60 },
        moderate: { amount: '2 gummies', thc_mg: 20, frequency: 'experienced users', onset_minutes: 45 },
        high: { amount: '5+ gummies', thc_mg: 50, frequency: 'experienced users only', onset_minutes: 30 }
      },
      experience_level: 'beginner_friendly',
      effects: ['relaxed', 'happy', 'sleepy'],
      duration_hours: { min: 4, max: 8 },
      warnings: ['Onset can take 1-2 hours', 'Do not redose too quickly', 'Not for minors'],
      compliance_state: 'MI',
      protocol: 'StrainChain'
    },
    {
      id: 'dosage_003',
      product_type: 'concentrate',
      product_name: 'Wedding Cake Live Rosin 1g',
      thc_percentage: 71.5,
      cbd_percentage: 2.1,
      dosage_recommendations: {
        microdose: { amount: '0.01g (pinhead)', thc_mg: 7, frequency: 'once per session', onset_minutes: 1 },
        low: { amount: '0.05g (rice grain)', thc_mg: 36, frequency: 'once daily', onset_minutes: 1 },
        moderate: { amount: '0.1g', thc_mg: 72, frequency: 'experienced users', onset_minutes: 1 },
        high: { amount: '0.25g+', thc_mg: 180, frequency: 'experienced users only', onset_minutes: 1 }
      },
      experience_level: 'advanced',
      effects: ['intense_euphoria', 'pain_relief', 'deep_relaxation'],
      duration_hours: { min: 2, max: 4 },
      warnings: ['Very potent - start extremely low', 'Do not drive', 'Not for minors', 'Not for beginners'],
      compliance_state: 'MI',
      protocol: 'StrainChain'
    }
  ];

  let filtered = dosageGuides;
  if (product_type) filtered = filtered.filter(d => d.product_type === product_type);

  return res.status(200).json({
    success: true,
    dosage_guides: filtered,
    total: filtered.length,
    disclaimer: 'This information is for educational purposes only. Individual responses to cannabis vary. Consult a healthcare professional before use.',
    compliance_note: 'Dosage information complies with Michigan Cannabis Regulatory Agency guidelines.',
    protocol: 'StrainChain'
  });
};

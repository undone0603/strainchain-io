export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { product_id, batch_id, type, state } = req.query;

  const labels = [
    {
      id: 'lbl_001',
      product_id: 'prod_001',
      batch_id: 'batch_001',
      type: 'product',
      state: 'CA',
      label_data: {
        product_name: 'OG Kush',
        strain_type: 'Indica',
        net_weight: '3.5g',
        thc_percentage: 22.4,
        cbd_percentage: 0.3,
        terpenes: ['Myrcene', 'Limonene', 'Caryophyllene'],
        cultivator: 'Green Valley Farms',
        batch_number: 'GVF-2025-042',
        harvest_date: '2025-03-15',
        package_date: '2025-04-10',
        expiration_date: '2025-10-10',
        license_number: 'CCL20-0001234',
        metrc_tag: '1A4060300000000000000001',
        warnings: [
          'CALIFORNIA REQUIRES WARNING: This product contains cannabis. For use only by adults 21 and older.',
          'Keep out of reach of children.',
          'Do not drive a motor vehicle or operate machinery under the influence of cannabis.'
        ],
        distributor: 'Golden State Distribution',
        retailer_license: 'C10-0001234'
      },
      compliant: true,
      print_format: 'PDF',
      label_size: '2x3',
      generated_at: '2025-04-10T10:00:00Z'
    },
    {
      id: 'lbl_002',
      product_id: 'prod_002',
      batch_id: 'batch_002',
      type: 'child_resistant',
      state: 'CO',
      label_data: {
        product_name: 'Blue Dream Gummies',
        strain_type: 'Hybrid',
        serving_size: '1 gummy (10mg THC)',
        total_thc_mg: 100,
        total_cbd_mg: 0,
        servings_per_package: 10,
        ingredients: ['Sugar', 'Corn Syrup', 'Cannabis Extract', 'Natural Flavors'],
        batch_number: 'EDI-2025-018',
        manufacture_date: '2025-04-01',
        expiration_date: '2026-04-01',
        license_number: 'MED-REC-001',
        warnings: [
          'KEEP OUT OF REACH OF CHILDREN AND ANIMALS.',
          'FOR ADULT USE ONLY.',
          'DO NOT OPERATE A VEHICLE OR MACHINERY AFTER USING THIS PRODUCT.'
        ]
      },
      compliant: true,
      print_format: 'PDF',
      label_size: '3x4',
      generated_at: '2025-04-01T14:30:00Z'
    }
  ];

  let filtered = labels;
  if (product_id) filtered = filtered.filter(l => l.product_id === product_id);
  if (batch_id) filtered = filtered.filter(l => l.batch_id === batch_id);
  if (type) filtered = filtered.filter(l => l.type === type);
  if (state) filtered = filtered.filter(l => l.state === state);

  return res.status(200).json({
    success: true,
    labels: filtered,
    total: filtered.length,
    label_types: ['product', 'child_resistant', 'transfer', 'sample'],
    supported_states: ['CA', 'CO', 'MI', 'IL', 'WA', 'OR', 'NV', 'AZ'],
    generated_at: new Date().toISOString()
  });
}

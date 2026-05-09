module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      endpoint: '/api/retail',
      retail_sales: [
        {
          id: 'sale_001',
          dispensary_id: 'disp_001',
          dispensary_name: 'Green Leaf Collective',
          transaction_date: '2026-05-08',
          items: [
            { strain: 'OG Kush', package_id: 'pkg_001', quantity_grams: 3.5, price_usd: 45.00 }
          ],
          total_usd: 45.00,
          payment_method: 'cash',
          metrc_receipt: 'REC-001-2026',
          status: 'completed'
        },
        {
          id: 'sale_002',
          dispensary_id: 'disp_002',
          dispensary_name: 'Emerald Dispensary',
          transaction_date: '2026-05-09',
          items: [
            { strain: 'Blue Dream', package_id: 'pkg_002', quantity_grams: 1.0, price_usd: 14.00 }
          ],
          total_usd: 14.00,
          payment_method: 'debit',
          metrc_receipt: 'REC-002-2026',
          status: 'completed'
        }
      ],
      total_sales: 2,
      total_revenue_usd: 59.00,
      protocol: 'StrainChain'
    });
  }
  return res.status(405).json({ error: 'Method not allowed' });
};

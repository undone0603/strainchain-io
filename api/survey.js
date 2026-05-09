export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { survey_id, customer_id, dispensary_id, responses } = req.body || {};
    if (!survey_id || !responses) {
      return res.status(400).json({ error: 'survey_id and responses are required' });
    }
    return res.status(200).json({
      success: true,
      submission_id: 'sub_' + Date.now(),
      survey_id,
      message: 'Survey response recorded. Thank you for your feedback!',
      loyalty_points_earned: 50
    });
  }

  const { dispensary_id, active_only } = req.query;

  const surveys = [
    {
      id: 'survey_001',
      dispensary_id: 'disp_001',
      title: 'Post-Purchase Experience Survey',
      description: 'Help us improve your shopping experience',
      status: 'active',
      type: 'satisfaction',
      loyalty_points_reward: 50,
      estimated_minutes: 3,
      questions: [
        { id: 'q1', type: 'rating', text: 'How satisfied were you with your overall purchase?', scale: 5 },
        { id: 'q2', type: 'multiple_choice', text: 'How did you hear about us?', options: ['Friend', 'Google', 'Social Media', 'Weedmaps', 'Other'] },
        { id: 'q3', type: 'rating', text: 'How knowledgeable was our staff?', scale: 5 },
        { id: 'q4', type: 'text', text: 'Any suggestions for improvement?', required: false }
      ],
      response_count: 284,
      avg_score: 4.6,
      created_at: '2024-01-01T00:00:00Z',
      expires_at: null
    },
    {
      id: 'survey_002',
      dispensary_id: 'disp_001',
      title: 'New Strain Feedback - Sunset Sherbet',
      description: 'Share your experience with our newest addition',
      status: 'active',
      type: 'product_feedback',
      loyalty_points_reward: 75,
      estimated_minutes: 2,
      questions: [
        { id: 'q1', type: 'rating', text: 'How would you rate the effects?', scale: 10 },
        { id: 'q2', type: 'rating', text: 'How was the flavor profile?', scale: 10 },
        { id: 'q3', type: 'multiple_choice', text: 'What was the primary effect you experienced?', options: ['Relaxation', 'Euphoria', 'Focus', 'Creativity', 'Sleep Aid'] },
        { id: 'q4', type: 'boolean', text: 'Would you purchase this strain again?' }
      ],
      response_count: 67,
      avg_score: 8.4,
      created_at: '2024-03-01T00:00:00Z',
      expires_at: '2024-04-01T00:00:00Z'
    },
    {
      id: 'survey_003',
      dispensary_id: 'disp_002',
      title: 'Annual Customer Satisfaction Survey 2024',
      description: 'Tell us how we did this year',
      status: 'inactive',
      type: 'annual_review',
      loyalty_points_reward: 150,
      estimated_minutes: 8,
      questions: [],
      response_count: 412,
      avg_score: 4.3,
      created_at: '2023-12-01T00:00:00Z',
      expires_at: '2024-01-31T00:00:00Z'
    }
  ];

  let filtered = surveys;
  if (dispensary_id) filtered = filtered.filter(s => s.dispensary_id === dispensary_id);
  if (active_only === 'true') filtered = filtered.filter(s => s.status === 'active');

  return res.status(200).json({
    success: true,
    surveys: filtered,
    total: filtered.length,
    active_count: filtered.filter(s => s.status === 'active').length,
    types: ['satisfaction', 'product_feedback', 'annual_review', 'nps', 'compliance']
  });
}

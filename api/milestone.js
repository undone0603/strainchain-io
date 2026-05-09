import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const MILESTONES = [
  // Strain / product milestones
  { id: 'first_strain', category: 'catalog', threshold: 1, metric: 'strains_registered', title: 'First Strain Registered!', message: 'Your first cannabis strain is on the chain. Welcome to compliant tracking.', icon: '🌿', reward: null, badge: 'First Harvest' },
  { id: 'ten_strains', category: 'catalog', threshold: 10, metric: 'strains_registered', title: '10 Strains in Your Catalog', message: 'A real menu. 10 strains tracked with full provenance.', icon: '📊', reward: null, badge: 'Catalog Builder' },
  { id: 'fifty_strains', category: 'catalog', threshold: 50, metric: 'strains_registered', title: '50 Strains — Full Dispensary!', message: 'Premium catalog. 50 strains with blockchain provenance.', icon: '🏆', reward: { type: 'credit', amount: 50, description: '$50 account credit' }, badge: 'Full Menu' },
  // Compliance milestones
  { id: 'first_metrc_sync', category: 'compliance', threshold: 1, metric: 'metrc_syncs', title: 'First METRC Sync!', message: 'You are live with METRC. Compliance is now automated.', icon: '✅', reward: null, badge: 'METRC Connected' },
  { id: 'compliance_streak_30', category: 'compliance', threshold: 30, metric: 'compliance_days_streak', title: '30-Day Compliance Streak!', message: '30 days fully compliant. Inspectors will love you.', icon: '📅', reward: { type: 'discount', percent: 10, description: '10% off next billing cycle' }, badge: 'Compliance Champion' },
  { id: 'compliance_streak_90', category: 'compliance', threshold: 90, metric: 'compliance_days_streak', title: '90 Days Fully Compliant!', message: 'Three months without a compliance incident. You are a model operator.', icon: '🛡️', reward: { type: 'credit', amount: 75, description: '$75 account credit' }, badge: 'Compliance Elite' },
  // Batch / harvest milestones
  { id: 'first_batch', category: 'operations', threshold: 1, metric: 'batches_completed', title: 'First Batch Completed!', message: 'Seed to sale — your first full batch is tracked and complete.', icon: '🌱', reward: null, badge: 'Cultivator' },
  { id: 'ten_batches', category: 'operations', threshold: 10, metric: 'batches_completed', title: '10 Batches Tracked', message: '10 complete seed-to-sale cycles. Your operation is humming.', icon: '📦', reward: null, badge: 'Production Pro' },
  { id: 'hundred_batches', category: 'operations', threshold: 100, metric: 'batches_completed', title: '100 Batches Completed!', message: 'This is a real cannabis operation. 100 batches tracked end-to-end.', icon: '🏠', reward: { type: 'feature_unlock', feature: 'advanced_harvest_analytics', description: 'Advanced harvest analytics unlocked' }, badge: 'Master Cultivator' },
  // NFT provenance milestones
  { id: 'first_nft', category: 'nft', threshold: 1, metric: 'nfts_minted', title: 'First NFT Provenance Badge!', message: 'Your first product now has a blockchain provenance NFT. Premium-grade authenticity.', icon: '🎨', reward: null, badge: 'NFT Issuer' },
  { id: 'hundred_nfts', category: 'nft', threshold: 100, metric: 'nfts_minted', title: '100 NFT Provenance Badges!', message: 'Your brand stands for authenticity. 100 products with blockchain provenance.', icon: '💎', reward: { type: 'credit', amount: 50, description: '$50 account credit' }, badge: 'Provenance Brand' },
  // Revenue milestones
  { id: 'first_payment', category: 'revenue', threshold: 1, metric: 'payments_made', title: 'First Payment — Let\'s Go!', message: 'You are now a paying StrainChain customer. METRC compliance just got easier.', icon: '💳', reward: { type: 'bonus', description: 'Free METRC compliance audit for your first location' }, badge: 'Paying Operator' },
  { id: 'six_months', category: 'retention', threshold: 180, metric: 'days_active', title: '6 Months of Compliance!', message: 'Half a year of automated cannabis compliance. You are ahead of the curve.', icon: '🎉', reward: { type: 'discount', percent: 20, description: '20% off annual plan upgrade' }, badge: '6-Month Operator' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

  if (req.method === 'GET') {
    const { data: achieved } = await supabase.from('milestone_achievements').select('*').eq('user_id', user.id);
    const { data: stats } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
    const achievedIds = (achieved || []).map(a => a.milestone_id);

    const enriched = MILESTONES.map(m => {
      const current = stats?.[m.metric] || 0;
      const isAchieved = achievedIds.includes(m.id);
      return {
        ...m,
        achieved: isAchieved,
        achieved_at: (achieved || []).find(a => a.milestone_id === m.id)?.achieved_at || null,
        current_value: current,
        progress_percent: Math.min(100, Math.round((current / m.threshold) * 100)),
        remaining: isAchieved ? 0 : Math.max(0, m.threshold - current)
      };
    });

    const total_achieved = achievedIds.length;
    return res.status(200).json({
      success: true,
      total_milestones: MILESTONES.length,
      total_achieved,
      completion_percent: Math.round((total_achieved / MILESTONES.length) * 100),
      milestones: enriched,
      next_milestone: enriched.find(m => !m.achieved) || null
    });
  }

  if (req.method === 'POST') {
    const { metric, new_value } = req.body;
    if (!metric || new_value === undefined) return res.status(400).json({ error: 'metric and new_value required' });

    const triggered = MILESTONES.filter(m => m.metric === metric && new_value >= m.threshold);
    if (!triggered.length) return res.status(200).json({ success: true, newly_achieved: [] });

    const { data: existing } = await supabase.from('milestone_achievements').select('milestone_id').eq('user_id', user.id);
    const existingIds = (existing || []).map(e => e.milestone_id);
    const newlyAchieved = triggered.filter(m => !existingIds.includes(m.id));

    if (newlyAchieved.length > 0) {
      await supabase.from('milestone_achievements').insert(
        newlyAchieved.map(m => ({ user_id: user.id, milestone_id: m.id, metric, value_at_achievement: new_value, reward: m.reward || null, achieved_at: new Date().toISOString() }))
      );
    }

    return res.status(200).json({
      success: true,
      newly_achieved: newlyAchieved.map(m => ({ id: m.id, title: m.title, message: m.message, icon: m.icon, badge: m.badge, reward: m.reward, celebrate: true }))
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * StrainChain API - Single catch-all serverless function
 * Routes all /api/* requests to the correct handler.
 * This keeps Vercel Hobby plan under the 12-function limit.
 */
const url = require('url');

// Lazy-load handlers to avoid cold start bloat
const handlers = {
  dispensary:    () => require('./dispensary'),
  verify:        () => require('./verify'),
  token:         () => require('./token'),
  nft:           () => require('./nft'),
  status:        () => require('./status'),
  checkout:      () => require('./checkout'),
  webhook:       () => require('./webhook'),
  analytics:     () => require('./analytics'),
  contact:       () => require('./contact'),
  compliance:    () => require('./compliance'),
  strains:       () => require('./strains'),
  lab:           () => require('./lab'),
  grower:        () => require('./grower'),
  transfer:      () => require('./transfer'),
  batch:         () => require('./batch'),
  recall:        () => require('./recall'),
  metrc:         () => require('./metrc'),
  inventory:     () => require('./inventory'),
  license:       () => require('./license'),
  payment:       () => require('./payment'),
  subscription:  () => require('./subscription'),
  report:        () => require('./report'),
  notification:  () => require('./notification'),
  user:          () => require('./user'),
  delivery:      () => require('./delivery'),
  affiliate:     () => require('./affiliate'),
  alert:         () => require('./alert'),
  appointment:   () => require('./appointment'),
  audit:         () => require('./audit'),
  badges:        () => require('./badges'),
  cannabinoid:   () => require('./cannabinoid'),
  'churn-risk':  () => require('./churn-risk'),
  cultivation:   () => require('./cultivation'),
  cure:          () => require('./cure'),
  customer:      () => require('./customer'),
  dashboard:     () => require('./dashboard'),
  demo:          () => require('./demo'),
  digest:        () => require('./digest'),
  dispensary_map:() => require('./dispensary_map'),
  dosage:        () => require('./dosage'),
  'email-broadcast': () => require('./email-broadcast'),
  employee:      () => require('./employee'),
  enterprise:    () => require('./enterprise'),
  equipment:     () => require('./equipment'),
  extraction:    () => require('./extraction'),
  formulation:   () => require('./formulation'),
  gift:          () => require('./gift'),
  harvest:       () => require('./harvest'),
  insurance:     () => require('./insurance'),
  label:         () => require('./label'),
  leaderboard:   () => require('./leaderboard'),
  loyalty:       () => require('./loyalty'),
  manifest:      () => require('./manifest'),
  milestone:     () => require('./milestone'),
  onboarding:    () => require('./onboarding'),
  order:         () => require('./order'),
  packaging:     () => require('./packaging'),
  patient:       () => require('./patient'),
  'payment-recovery': () => require('./payment-recovery'),
  plans:         () => require('./plans'),
  pos:           () => require('./pos'),
  potency:       () => require('./potency'),
  pricing:       () => require('./pricing'),
  profile:       () => require('./profile'),
  promotion:     () => require('./promotion'),
  referral:      () => require('./referral'),
  reorder:       () => require('./reorder'),
  retail:        () => require('./retail'),
  retention:     () => require('./retention'),
  return:        () => require('./return'),
  review:        () => require('./review'),
  rewards:       () => require('./rewards'),
  room:          () => require('./room'),
  schedule:      () => require('./schedule'),
  seed:          () => require('./seed'),
  'social-proof':() => require('./social-proof'),
  streaks:       () => require('./streaks'),
  supplier:      () => require('./supplier'),
  support:       () => require('./support'),
  survey:        () => require('./survey'),
  tag:           () => require('./tag'),
  testimonials:  () => require('./testimonials'),
  testing:       () => require('./testing'),
  trial:         () => require('./trial'),
  upgrade:       () => require('./upgrade'),
  upsell:        () => require('./upsell'),
  vendor:        () => require('./vendor'),
  waitlist:      () => require('./waitlist'),
  waste:         () => require('./waste'),
};

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract route segment: /api/<segment>[/...]
  const parsed = url.parse(req.url);
  const parts = parsed.pathname.replace(/^\/api\//, '').split('/');
  const segment = parts[0];

  const loader = handlers[segment];
  if (!loader) {
    return res.status(404).json({ error: `API route not found: ${segment}` });
  }

  try {
    const handler = loader();
    // Support both default export and module.exports
    const fn = handler.default || handler;
    return await fn(req, res);
  } catch (err) {
    console.error(`[StrainChain API] Error in /${segment}:`, err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

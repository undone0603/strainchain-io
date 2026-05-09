module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { facility_id, room_id, week, task_type } = req.query;

  const schedules = [
    {
      id: 'sched_001',
      facility_id: 'facility_001',
      room_id: 'room_A1',
      room_name: 'Veg Room A - Bay 1',
      task_type: 'watering',
      title: 'Irrigation Cycle - Veg A1',
      description: 'Automated drip irrigation with nutrient solution pH 5.8-6.2',
      scheduled_for: '2026-05-09T08:00:00Z',
      duration_minutes: 45,
      assigned_to: 'Jordan Smith',
      assigned_id: 'emp_002',
      status: 'scheduled',
      recurrence: 'daily',
      nutrients: { nitrogen_ppm: 250, phosphorus_ppm: 80, potassium_ppm: 300 },
      completed_at: null,
      notes: 'Week 3 of veg - increase N by 10%',
      protocol: 'StrainChain'
    },
    {
      id: 'sched_002',
      facility_id: 'facility_001',
      room_id: 'room_F2',
      room_name: 'Flower Room 2',
      task_type: 'inspection',
      title: 'IPM Scouting - Flower Room 2',
      description: 'Integrated Pest Management weekly scouting for mites, aphids, powdery mildew',
      scheduled_for: '2026-05-09T10:00:00Z',
      duration_minutes: 90,
      assigned_to: 'Maria Lopez',
      assigned_id: 'emp_003',
      status: 'in_progress',
      recurrence: 'weekly',
      nutrients: null,
      completed_at: null,
      notes: 'Check sticky traps, inspect undersides of leaves, update METRC plant records if issues found',
      protocol: 'StrainChain'
    },
    {
      id: 'sched_003',
      facility_id: 'facility_001',
      room_id: 'room_H1',
      room_name: 'Harvest Room 1',
      task_type: 'harvest',
      title: 'OG Kush Batch - Final Harvest',
      description: 'Complete harvest of OG Kush batch SC-CULT-2026-003, METRC tag scan required',
      scheduled_for: '2026-05-10T06:00:00Z',
      duration_minutes: 480,
      assigned_to: 'Alex Rivera',
      assigned_id: 'emp_001',
      status: 'scheduled',
      recurrence: 'one_time',
      nutrients: null,
      completed_at: null,
      notes: 'Trichomes at peak cloudy/amber ratio. Estimated yield: 28 lbs. METRC harvest report required same day.',
      batch_id: 'SC-CULT-2026-003',
      metrc_required: true,
      protocol: 'StrainChain'
    },
    {
      id: 'sched_004',
      facility_id: 'facility_001',
      room_id: 'room_V1',
      room_name: 'Veg Room 1',
      task_type: 'transplant',
      title: 'Clone Transplant to Veg - Blue Dream',
      description: 'Move 120 rooted Blue Dream clones from clone room to veg room',
      scheduled_for: '2026-05-11T09:00:00Z',
      duration_minutes: 120,
      assigned_to: 'Casey Kim',
      assigned_id: 'emp_004',
      status: 'scheduled',
      recurrence: 'one_time',
      nutrients: null,
      completed_at: null,
      notes: 'Update METRC plant tags. Transplant into 3-gallon fabric pots with coco/perlite mix.',
      metrc_required: true,
      protocol: 'StrainChain'
    }
  ];

  let filtered = schedules;
  if (facility_id) filtered = filtered.filter(s => s.facility_id === facility_id);
  if (room_id) filtered = filtered.filter(s => s.room_id === room_id);
  if (task_type) filtered = filtered.filter(s => s.task_type === task_type);

  return res.status(200).json({
    success: true,
    schedules: filtered,
    total: filtered.length,
    scheduled: filtered.filter(s => s.status === 'scheduled').length,
    in_progress: filtered.filter(s => s.status === 'in_progress').length,
    completed: filtered.filter(s => s.status === 'completed').length,
    metrc_required: filtered.filter(s => s.metrc_required).length,
    today: new Date().toISOString().split('T')[0],
    protocol: 'StrainChain'
  });
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { id, dispensary_id, customer_id, type, status, date } = req.query;

  const appointments = [
    {
      id: 'appt_001',
      dispensary_id: 'disp_001',
      customer_id: 'cust_001',
      type: 'consultation',
      title: 'New Patient Consultation',
      staff_member: { id: 'staff_001', name: 'Amy Torres', role: 'Cannabis Consultant' },
      date: '2025-05-15',
      time: '10:00',
      duration_minutes: 30,
      status: 'scheduled',
      notes: 'First-time medical patient. Interested in pain management options.',
      reminder_sent: false,
      created_at: '2025-05-09T08:00:00Z'
    },
    {
      id: 'appt_002',
      dispensary_id: 'disp_001',
      customer_id: 'cust_002',
      type: 'pickup',
      title: 'Online Order Pickup',
      staff_member: null,
      date: '2025-05-10',
      time: '14:30',
      duration_minutes: 10,
      status: 'confirmed',
      order_id: 'order_089',
      notes: 'Order ready for pickup. Customer prefers curbside.',
      reminder_sent: true,
      created_at: '2025-05-08T16:45:00Z'
    },
    {
      id: 'appt_003',
      dispensary_id: 'disp_002',
      customer_id: 'cust_003',
      type: 'express',
      title: 'Express Shopping Session',
      staff_member: { id: 'staff_003', name: 'Carlos Ruiz', role: 'Budtender' },
      date: '2025-05-12',
      time: '11:00',
      duration_minutes: 15,
      status: 'completed',
      notes: 'Regular customer. Prefers vape products.',
      reminder_sent: true,
      created_at: '2025-05-09T09:00:00Z'
    }
  ];

  let filtered = appointments;
  if (id) filtered = filtered.filter(a => a.id === id);
  if (dispensary_id) filtered = filtered.filter(a => a.dispensary_id === dispensary_id);
  if (customer_id) filtered = filtered.filter(a => a.customer_id === customer_id);
  if (type) filtered = filtered.filter(a => a.type === type);
  if (status) filtered = filtered.filter(a => a.status === status);
  if (date) filtered = filtered.filter(a => a.date === date);

  return res.status(200).json({
    success: true,
    appointments: filtered.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    total: filtered.length,
    types: ['consultation', 'pickup', 'express', 'delivery'],
    statuses: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    generated_at: new Date().toISOString()
  });
}

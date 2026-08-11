const bcrypt = require('bcryptjs');
const { query } = require('./config/db');

async function seedDatabase() {
  console.log('Seeding Kristallball Military Asset Management Database...');

  const passwordHashAdmin = await bcrypt.hash('AdminPass123!', 10);
  const passwordHashCommander = await bcrypt.hash('CommandPass123!', 10);
  const passwordHashLogistics = await bcrypt.hash('LogisticsPass123!', 10);

  const seedData = {
    bases: [
      { id: 1, name: 'Fort Alpha', location: 'Sector Alpha-1', code: 'FA-01' },
      { id: 2, name: 'Camp Bravo', location: 'Sector Bravo-4', code: 'CB-04' },
      { id: 3, name: 'Base Echo', location: 'Sector Echo-9', code: 'BE-09' }
    ],
    equipment_types: [
      { id: 1, name: 'M4 Carbine Assault Rifle', category: 'WEAPON', unit_of_measure: 'Units' },
      { id: 2, name: 'HMMWV Humvee', category: 'VEHICLE', unit_of_measure: 'Vehicles' },
      { id: 3, name: '5.56x45mm NATO Ammo', category: 'AMMUNITION', unit_of_measure: 'Rounds' },
      { id: 4, name: 'AN/PVS-14 Night Vision Goggles', category: 'EQUIPMENT', unit_of_measure: 'Sets' },
      { id: 5, name: 'M1A2 Abrams Tank', category: 'VEHICLE', unit_of_measure: 'Vehicles' },
      { id: 6, name: '120mm Tank Sabot Rounds', category: 'AMMUNITION', unit_of_measure: 'Rounds' }
    ],
    users: [
      { id: 1, username: 'admin_user', password_hash: passwordHashAdmin, role: 'ADMIN', base_id: null, full_name: 'General Marcus Vance' },
      { id: 2, username: 'commander_alpha', password_hash: passwordHashCommander, role: 'BASE_COMMANDER', base_id: 1, full_name: 'Col. Sarah Jenkins' },
      { id: 3, username: 'commander_bravo', password_hash: passwordHashCommander, role: 'BASE_COMMANDER', base_id: 2, full_name: 'Col. Robert Chen' },
      { id: 4, username: 'logistics_officer', password_hash: passwordHashLogistics, role: 'LOGISTICS_OFFICER', base_id: 1, full_name: 'Maj. David Miller' }
    ],
    purchases: [
      { id: 1, base_id: 1, equipment_type_id: 1, quantity: 150, unit_cost: 1200, supplier: 'Colt Defense', created_at: '2026-01-10T08:00:00.000Z', created_by: 1 },
      { id: 2, base_id: 1, equipment_type_id: 2, quantity: 25, unit_cost: 85000, supplier: 'AM General', created_at: '2026-01-12T09:30:00.000Z', created_by: 1 },
      { id: 3, base_id: 1, equipment_type_id: 3, quantity: 50000, unit_cost: 0.75, supplier: 'Federal Ammunition', created_at: '2026-01-15T11:00:00.000Z', created_by: 4 },
      { id: 4, base_id: 1, equipment_type_id: 4, quantity: 80, unit_cost: 3400, supplier: 'L3Harris', created_at: '2026-01-18T14:20:00.000Z', created_by: 4 },
      { id: 5, base_id: 2, equipment_type_id: 1, quantity: 100, unit_cost: 1200, supplier: 'Colt Defense', created_at: '2026-01-11T10:00:00.000Z', created_by: 1 },
      { id: 6, base_id: 2, equipment_type_id: 3, quantity: 30000, unit_cost: 0.75, supplier: 'Federal Ammunition', created_at: '2026-01-16T13:00:00.000Z', created_by: 1 },
      { id: 7, base_id: 2, equipment_type_id: 5, quantity: 8, unit_cost: 8900000, supplier: 'General Dynamics', created_at: '2026-01-20T16:00:00.000Z', created_by: 1 },
      { id: 8, base_id: 3, equipment_type_id: 1, quantity: 80, unit_cost: 1200, supplier: 'Colt Defense', created_at: '2026-01-14T09:00:00.000Z', created_by: 1 },
      { id: 9, base_id: 3, equipment_type_id: 3, quantity: 20000, unit_cost: 0.75, supplier: 'Federal Ammunition', created_at: '2026-01-17T11:30:00.000Z', created_by: 1 }
    ],
    transfers: [
      { id: 1, source_base_id: 1, destination_base_id: 2, equipment_type_id: 1, quantity: 20, status: 'COMPLETED', initiated_by: 4, created_at: '2026-02-01T10:00:00.000Z' },
      { id: 2, source_base_id: 1, destination_base_id: 2, equipment_type_id: 3, quantity: 10000, status: 'COMPLETED', initiated_by: 4, created_at: '2026-02-03T11:15:00.000Z' },
      { id: 3, source_base_id: 2, destination_base_id: 3, equipment_type_id: 1, quantity: 10, status: 'COMPLETED', initiated_by: 3, created_at: '2026-02-05T14:00:00.000Z' }
    ],
    assignments: [
      { id: 1, base_id: 1, equipment_type_id: 1, assigned_to: '1st Battalion Infantry Division', quantity: 80, status: 'ACTIVE', assigned_at: '2026-02-02T09:00:00.000Z' },
      { id: 2, base_id: 1, equipment_type_id: 2, assigned_to: '3rd Reconnaissance Patrol', quantity: 12, status: 'ACTIVE', assigned_at: '2026-02-04T10:30:00.000Z' },
      { id: 3, base_id: 2, equipment_type_id: 1, assigned_to: 'Alpha Strike Squad', quantity: 45, status: 'ACTIVE', assigned_at: '2026-02-06T13:00:00.000Z' }
    ],
    expenditures: [
      { id: 1, base_id: 1, equipment_type_id: 3, quantity: 8500, reason: 'Live-Fire Tactical Exercise Alpha-26', expended_by: 2, created_at: '2026-02-07T15:00:00.000Z' },
      { id: 2, base_id: 2, equipment_type_id: 3, quantity: 5000, reason: 'Marksman Qualification Program', expended_by: 3, created_at: '2026-02-08T16:30:00.000Z' },
      { id: 3, base_id: 1, equipment_type_id: 4, quantity: 2, reason: 'Damaged during field deployment - retired', expended_by: 4, created_at: '2026-02-09T11:00:00.000Z' }
    ],
    audit_logs: [
      { id: 1, user_id: 1, action: 'SYSTEM_INITIALIZATION', details: 'Database schema created & seeded', created_at: '2026-01-01T00:00:00.000Z' },
      { id: 2, user_id: 1, action: 'PURCHASE', details: 'Purchased 150 M4 Carbines for Fort Alpha', created_at: '2026-01-10T08:00:00.000Z' },
      { id: 3, user_id: 4, action: 'TRANSFER', details: 'Transferred 20 M4 Carbines from Fort Alpha to Camp Bravo', created_at: '2026-02-01T10:00:00.000Z' },
      { id: 4, user_id: 2, action: 'EXPENDITURE', details: 'Recorded expenditure of 8500 5.56mm Rounds at Fort Alpha', created_at: '2026-02-07T15:00:00.000Z' }
    ]
  };

  query.resetState(seedData);
  console.log('Database successfully seeded!');
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
});

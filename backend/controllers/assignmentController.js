const { query } = require('../config/db');
const { logAuditTrail } = require('../middlewares/loggerMiddleware');

exports.createAssignment = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, assignedTo, quantity } = req.body;

    if (!baseId || !equipmentTypeId || !assignedTo || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Base ID, equipment type, recipient unit/personnel, and quantity required' });
    }

    const base = await query.get('bases', { id: Number(baseId) });
    const equipment = await query.get('equipment_types', { id: Number(equipmentTypeId) });

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Base or equipment type not found' });
    }

    const assignment = await query.insert('assignments', {
      base_id: Number(baseId),
      equipment_type_id: Number(equipmentTypeId),
      assigned_to: assignedTo,
      quantity: Number(quantity),
      status: 'ACTIVE',
      assigned_at: new Date().toISOString()
    });

    const auditDetail = `Assigned ${quantity} ${equipment.unit_of_measure} of ${equipment.name} at ${base.name} to '${assignedTo}'`;
    await logAuditTrail(req.user.id, 'ASSIGNMENT', auditDetail);

    return res.status(201).json({ message: 'Assignment recorded successfully', assignment });
  } catch (error) {
    return res.status(500).json({ message: 'Error recording assignment', error: error.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;
    const equipFilter = equipmentTypeId && equipmentTypeId !== 'ALL' ? Number(equipmentTypeId) : null;

    const assignments = await query.all('assignments', a => {
      const matchBase = baseFilter ? a.base_id === baseFilter : true;
      const matchEquip = equipFilter ? a.equipment_type_id === equipFilter : true;
      return matchBase && matchEquip;
    });

    const bases = await query.all('bases');
    const equipments = await query.all('equipment_types');
    const baseMap = Object.fromEntries(bases.map(b => [b.id, b]));
    const equipMap = Object.fromEntries(equipments.map(e => [e.id, e]));

    const enriched = assignments.map(a => ({
      ...a,
      baseName: baseMap[a.base_id]?.name || `Base #${a.base_id}`,
      equipmentName: equipMap[a.equipment_type_id]?.name || `Type #${a.equipment_type_id}`,
      unitOfMeasure: equipMap[a.equipment_type_id]?.unit_of_measure || 'Units'
    })).sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

exports.createExpenditure = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Base ID, equipment type, quantity, and reason required' });
    }

    const base = await query.get('bases', { id: Number(baseId) });
    const equipment = await query.get('equipment_types', { id: Number(equipmentTypeId) });

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Base or equipment type not found' });
    }

    const expenditure = await query.insert('expenditures', {
      base_id: Number(baseId),
      equipment_type_id: Number(equipmentTypeId),
      quantity: Number(quantity),
      reason: reason || 'Operation expenditure',
      expended_by: req.user.id,
      created_at: new Date().toISOString()
    });

    const auditDetail = `Expended ${quantity} ${equipment.unit_of_measure} of ${equipment.name} at ${base.name} (Reason: ${reason || 'Operational'})`;
    await logAuditTrail(req.user.id, 'EXPENDITURE', auditDetail);

    return res.status(201).json({ message: 'Expenditure recorded successfully', expenditure });
  } catch (error) {
    return res.status(500).json({ message: 'Error recording expenditure', error: error.message });
  }
};

exports.getExpenditures = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;
    const equipFilter = equipmentTypeId && equipmentTypeId !== 'ALL' ? Number(equipmentTypeId) : null;

    const expenditures = await query.all('expenditures', e => {
      const matchBase = baseFilter ? e.base_id === baseFilter : true;
      const matchEquip = equipFilter ? e.equipment_type_id === equipFilter : true;
      return matchBase && matchEquip;
    });

    const bases = await query.all('bases');
    const equipments = await query.all('equipment_types');
    const users = await query.all('users');
    const baseMap = Object.fromEntries(bases.map(b => [b.id, b]));
    const equipMap = Object.fromEntries(equipments.map(e => [e.id, e]));
    const userMap = Object.fromEntries(users.map(u => [u.id, u.full_name || u.username]));

    const enriched = expenditures.map(e => ({
      ...e,
      baseName: baseMap[e.base_id]?.name || `Base #${e.base_id}`,
      equipmentName: equipMap[e.equipment_type_id]?.name || `Type #${e.equipment_type_id}`,
      unitOfMeasure: equipMap[e.equipment_type_id]?.unit_of_measure || 'Units',
      expendedByName: userMap[e.expended_by] || 'System'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching expenditures', error: error.message });
  }
};

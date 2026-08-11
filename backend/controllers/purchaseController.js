const { query } = require('../config/db');
const { logAuditTrail } = require('../middlewares/loggerMiddleware');

exports.createPurchase = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, quantity, unitCost, supplier } = req.body;

    if (!baseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Base ID, equipment type, and positive quantity are required' });
    }

    const base = await query.get('bases', { id: Number(baseId) });
    const equipment = await query.get('equipment_types', { id: Number(equipmentTypeId) });

    if (!base || !equipment) {
      return res.status(404).json({ message: 'Base or Equipment Type not found' });
    }

    const purchase = await query.insert('purchases', {
      base_id: Number(baseId),
      equipment_type_id: Number(equipmentTypeId),
      quantity: Number(quantity),
      unit_cost: Number(unitCost || 0),
      supplier: supplier || 'Standard Procurement',
      created_by: req.user.id
    });

    const auditDetail = `Logged purchase of ${quantity} ${equipment.unit_of_measure} of ${equipment.name} for ${base.name} (Supplier: ${supplier || 'Standard'})`;
    await logAuditTrail(req.user.id, 'PURCHASE', auditDetail);

    return res.status(201).json({
      message: 'Purchase recorded successfully',
      purchase: {
        ...purchase,
        baseName: base.name,
        equipmentName: equipment.name
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error recording purchase', error: error.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;
    const equipFilter = equipmentTypeId && equipmentTypeId !== 'ALL' ? Number(equipmentTypeId) : null;

    const purchases = await query.all('purchases', p => {
      const matchBase = baseFilter ? p.base_id === baseFilter : true;
      const matchEquip = equipFilter ? p.equipment_type_id === equipFilter : true;
      return matchBase && matchEquip;
    });

    const bases = await query.all('bases');
    const equipments = await query.all('equipment_types');
    const users = await query.all('users');

    const baseMap = Object.fromEntries(bases.map(b => [b.id, b]));
    const equipMap = Object.fromEntries(equipments.map(e => [e.id, e]));
    const userMap = Object.fromEntries(users.map(u => [u.id, u.full_name || u.username]));

    const enriched = purchases.map(p => ({
      ...p,
      baseName: baseMap[p.base_id]?.name || `Base #${p.base_id}`,
      equipmentName: equipMap[p.equipment_type_id]?.name || `Type #${p.equipment_type_id}`,
      category: equipMap[p.equipment_type_id]?.category || 'N/A',
      unitOfMeasure: equipMap[p.equipment_type_id]?.unit_of_measure || 'Units',
      createdByName: userMap[p.created_by] || 'System'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching purchases', error: error.message });
  }
};

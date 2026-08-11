const { query } = require('../config/db');
const { logAuditTrail } = require('../middlewares/loggerMiddleware');

exports.createTransfer = async (req, res) => {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Source base, destination base, equipment type, and valid quantity required' });
    }

    if (Number(sourceBaseId) === Number(destinationBaseId)) {
      return res.status(400).json({ message: 'Source base and destination base cannot be the same' });
    }

    // Check base commander scope permission if user is base commander
    if (req.user.role === 'BASE_COMMANDER' && req.user.baseId && Number(sourceBaseId) !== Number(req.user.baseId)) {
      return res.status(403).json({ message: 'Base Commanders can only initiate transfers out of their assigned base' });
    }

    const sourceBase = await query.get('bases', { id: Number(sourceBaseId) });
    const destBase = await query.get('bases', { id: Number(destinationBaseId) });
    const equipment = await query.get('equipment_types', { id: Number(equipmentTypeId) });

    if (!sourceBase || !destBase || !equipment) {
      return res.status(404).json({ message: 'Source base, destination base, or equipment type not found' });
    }

    // Start DB Transaction for atomic state snapshot and mutation
    await query.beginTransaction();

    try {
      // Calculate available stock at source base
      const purchases = await query.all('purchases', p => p.base_id === Number(sourceBaseId) && p.equipment_type_id === Number(equipmentTypeId));
      const transfersIn = await query.all('transfers', t => t.destination_base_id === Number(sourceBaseId) && t.equipment_type_id === Number(equipmentTypeId) && t.status === 'COMPLETED');
      const transfersOut = await query.all('transfers', t => t.source_base_id === Number(sourceBaseId) && t.equipment_type_id === Number(equipmentTypeId) && t.status === 'COMPLETED');
      const assignments = await query.all('assignments', a => a.base_id === Number(sourceBaseId) && a.equipment_type_id === Number(equipmentTypeId) && a.status === 'ACTIVE');
      const expenditures = await query.all('expenditures', e => e.base_id === Number(sourceBaseId) && e.equipment_type_id === Number(equipmentTypeId));

      const totalP = purchases.reduce((sum, p) => sum + p.quantity, 0);
      const totalTin = transfersIn.reduce((sum, t) => sum + t.quantity, 0);
      const totalTout = transfersOut.reduce((sum, t) => sum + t.quantity, 0);
      const totalAssign = assignments.reduce((sum, a) => sum + a.quantity, 0);
      const totalExp = expenditures.reduce((sum, e) => sum + e.quantity, 0);

      const availableStock = (totalP + totalTin - totalTout) - totalAssign - totalExp;

      if (availableStock < Number(quantity)) {
        await query.rollback();
        return res.status(400).json({
          message: `Insufficient unassigned/unexpended stock at ${sourceBase.name}. Available: ${availableStock} ${equipment.unit_of_measure}, Requested: ${quantity}`
        });
      }

      // Record transfer
      const transfer = await query.insert('transfers', {
        source_base_id: Number(sourceBaseId),
        destination_base_id: Number(destinationBaseId),
        equipment_type_id: Number(equipmentTypeId),
        quantity: Number(quantity),
        status: 'COMPLETED',
        initiated_by: req.user.id
      });

      // Audit Log
      const auditDetail = `Atomic Transfer #${transfer.id}: Transferred ${quantity} ${equipment.unit_of_measure} of ${equipment.name} from ${sourceBase.name} to ${destBase.name}`;
      await logAuditTrail(req.user.id, 'TRANSFER', auditDetail);

      await query.commit();

      return res.status(201).json({
        message: 'Cross-base asset transfer completed successfully',
        transfer: {
          ...transfer,
          sourceBaseName: sourceBase.name,
          destinationBaseName: destBase.name,
          equipmentName: equipment.name
        }
      });
    } catch (err) {
      await query.rollback();
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
};

exports.getTransfers = async (req, res) => {
  try {
    const { baseId, equipmentTypeId } = req.query;
    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;
    const equipFilter = equipmentTypeId && equipmentTypeId !== 'ALL' ? Number(equipmentTypeId) : null;

    const transfers = await query.all('transfers', t => {
      const matchBase = baseFilter ? (t.source_base_id === baseFilter || t.destination_base_id === baseFilter) : true;
      const matchEquip = equipFilter ? t.equipment_type_id === equipFilter : true;
      return matchBase && matchEquip;
    });

    const bases = await query.all('bases');
    const equipments = await query.all('equipment_types');
    const users = await query.all('users');

    const baseMap = Object.fromEntries(bases.map(b => [b.id, b]));
    const equipMap = Object.fromEntries(equipments.map(e => [e.id, e]));
    const userMap = Object.fromEntries(users.map(u => [u.id, u.full_name || u.username]));

    const enriched = transfers.map(t => ({
      ...t,
      sourceBaseName: baseMap[t.source_base_id]?.name || `Base #${t.source_base_id}`,
      destinationBaseName: baseMap[t.destination_base_id]?.name || `Base #${t.destination_base_id}`,
      equipmentName: equipMap[t.equipment_type_id]?.name || `Type #${t.equipment_type_id}`,
      unitOfMeasure: equipMap[t.equipment_type_id]?.unit_of_measure || 'Units',
      initiatedByName: userMap[t.initiated_by] || 'System'
    })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json(enriched);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching transfers', error: error.message });
  }
};

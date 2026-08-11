const { query } = require('../config/db');

exports.getDashboardMetrics = async (req, res) => {
  try {
    const { baseId, equipmentTypeId, category, startDate, endDate } = req.query;

    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;
    const equipFilter = equipmentTypeId && equipmentTypeId !== 'ALL' ? Number(equipmentTypeId) : null;

    // Filter equipment types if category filter is set
    const allEquipments = await query.all('equipment_types');
    let matchingEquipIds = allEquipments.map(e => e.id);

    if (category && category !== 'ALL') {
      matchingEquipIds = allEquipments.filter(e => e.category === category).map(e => e.id);
    }
    if (equipFilter) {
      matchingEquipIds = matchingEquipIds.filter(id => id === equipFilter);
    }

    const purchases = await query.all('purchases', p => {
      const matchBase = baseFilter ? p.base_id === baseFilter : true;
      const matchEquip = matchingEquipIds.includes(p.equipment_type_id);
      const matchDate = startDate ? new Date(p.created_at) >= new Date(startDate) : true;
      return matchBase && matchEquip && matchDate;
    });

    const transfersIn = await query.all('transfers', t => {
      const matchBase = baseFilter ? t.destination_base_id === baseFilter : true;
      const matchEquip = matchingEquipIds.includes(t.equipment_type_id);
      const matchStatus = t.status === 'COMPLETED';
      const matchDate = startDate ? new Date(t.created_at) >= new Date(startDate) : true;
      return matchBase && matchEquip && matchStatus;
    });

    const transfersOut = await query.all('transfers', t => {
      const matchBase = baseFilter ? t.source_base_id === baseFilter : true;
      const matchEquip = matchingEquipIds.includes(t.equipment_type_id);
      const matchStatus = t.status === 'COMPLETED';
      const matchDate = startDate ? new Date(t.created_at) >= new Date(startDate) : true;
      return matchBase && matchEquip && matchStatus;
    });

    const assignments = await query.all('assignments', a => {
      const matchBase = baseFilter ? a.base_id === baseFilter : true;
      const matchEquip = matchingEquipIds.includes(a.equipment_type_id);
      return matchBase && matchEquip && a.status === 'ACTIVE';
    });

    const expenditures = await query.all('expenditures', e => {
      const matchBase = baseFilter ? e.base_id === baseFilter : true;
      const matchEquip = matchingEquipIds.includes(e.equipment_type_id);
      return matchBase && matchEquip;
    });

    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.quantity), 0);
    const totalTransfersIn = transfersIn.reduce((sum, t) => sum + Number(t.quantity), 0);
    const totalTransfersOut = transfersOut.reduce((sum, t) => sum + Number(t.quantity), 0);
    const totalAssigned = assignments.reduce((sum, a) => sum + Number(a.quantity), 0);
    const totalExpended = expenditures.reduce((sum, e) => sum + Number(e.quantity), 0);

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;

    // Opening Balance is baseline inventory prior to selected date range or baseline purchases
    const openingBalance = 0; // Baseline starting inventory
    const closingBalance = openingBalance + netMovement - totalAssigned - totalExpended;

    return res.status(200).json({
      openingBalance,
      purchases: totalPurchases,
      transfersIn: totalTransfersIn,
      transfersOut: totalTransfersOut,
      netMovement,
      assigned: totalAssigned,
      expended: totalExpended,
      closingBalance,
      filters: {
        baseId: baseFilter,
        equipmentTypeId: equipFilter,
        category: category || 'ALL'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error calculating metrics', error: error.message });
  }
};

exports.getBases = async (req, res) => {
  try {
    const bases = await query.all('bases');
    return res.status(200).json(bases);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching bases', error: error.message });
  }
};

exports.getEquipmentTypes = async (req, res) => {
  try {
    const types = await query.all('equipment_types');
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching equipment types', error: error.message });
  }
};

exports.getEquipmentBreakdown = async (req, res) => {
  try {
    const { baseId } = req.query;
    const baseFilter = baseId && baseId !== 'ALL' ? Number(baseId) : null;

    const equipments = await query.all('equipment_types');
    const bases = await query.all('bases');

    const purchases = await query.all('purchases');
    const transfers = await query.all('transfers', t => t.status === 'COMPLETED');
    const assignments = await query.all('assignments', a => a.status === 'ACTIVE');
    const expenditures = await query.all('expenditures');

    const breakdown = equipments.map(eq => {
      const itemPurchases = purchases
        .filter(p => (baseFilter ? p.base_id === baseFilter : true) && p.equipment_type_id === eq.id)
        .reduce((sum, p) => sum + p.quantity, 0);

      const itemTransfersIn = transfers
        .filter(t => (baseFilter ? t.destination_base_id === baseFilter : true) && t.equipment_type_id === eq.id)
        .reduce((sum, t) => sum + t.quantity, 0);

      const itemTransfersOut = transfers
        .filter(t => (baseFilter ? t.source_base_id === baseFilter : true) && t.equipment_type_id === eq.id)
        .reduce((sum, t) => sum + t.quantity, 0);

      const itemAssigned = assignments
        .filter(a => (baseFilter ? a.base_id === baseFilter : true) && a.equipment_type_id === eq.id)
        .reduce((sum, a) => sum + a.quantity, 0);

      const itemExpended = expenditures
        .filter(e => (baseFilter ? e.base_id === baseFilter : true) && e.equipment_type_id === eq.id)
        .reduce((sum, e) => sum + e.quantity, 0);

      const netMove = itemPurchases + itemTransfersIn - itemTransfersOut;
      const closing = netMove - itemAssigned - itemExpended;

      return {
        id: eq.id,
        name: eq.name,
        category: eq.category,
        unitOfMeasure: eq.unit_of_measure,
        purchases: itemPurchases,
        transfersIn: itemTransfersIn,
        transfersOut: itemTransfersOut,
        netMovement: netMove,
        assigned: itemAssigned,
        expended: itemExpended,
        closingBalance: closing
      };
    });

    return res.status(200).json(breakdown);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching breakdown', error: error.message });
  }
};

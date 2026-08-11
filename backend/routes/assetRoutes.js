const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { enforceBaseScope } = require('../middlewares/rbacMiddleware');

router.get('/metrics', authenticateToken, enforceBaseScope, assetController.getDashboardMetrics);
router.get('/bases', authenticateToken, assetController.getBases);
router.get('/equipment-types', authenticateToken, assetController.getEquipmentTypes);
router.get('/breakdown', authenticateToken, enforceBaseScope, assetController.getEquipmentBreakdown);

module.exports = router;

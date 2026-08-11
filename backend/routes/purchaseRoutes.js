const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles, enforceBaseScope } = require('../middlewares/rbacMiddleware');

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), purchaseController.createPurchase);
router.get('/', authenticateToken, enforceBaseScope, purchaseController.getPurchases);

module.exports = router;

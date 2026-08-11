const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles, enforceBaseScope } = require('../middlewares/rbacMiddleware');

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), transferController.createTransfer);
router.get('/', authenticateToken, enforceBaseScope, transferController.getTransfers);

module.exports = router;

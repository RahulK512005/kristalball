const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/rbacMiddleware');

router.get('/', authenticateToken, authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'), auditController.getAuditLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { enforceBaseScope } = require('../middlewares/rbacMiddleware');

router.post('/assignments', authenticateToken, enforceBaseScope, assignmentController.createAssignment);
router.get('/assignments', authenticateToken, enforceBaseScope, assignmentController.getAssignments);

router.post('/expenditures', authenticateToken, enforceBaseScope, assignmentController.createExpenditure);
router.get('/expenditures', authenticateToken, enforceBaseScope, assignmentController.getExpenditures);

module.exports = router;

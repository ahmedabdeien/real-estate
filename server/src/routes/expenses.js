const router = require('express').Router();
const c = require('../controllers/expenseController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('expenses.view'), c.getExpenses);
router.post('/', hasPermission('expenses.create'), logAction("expenses", "create"), c.createExpense);
router.put('/:id', hasPermission('expenses.update'), logAction("expenses", "update"), c.updateExpense);
router.delete('/:id', hasPermission('expenses.delete'), logAction("expenses", "delete"), c.deleteExpense);

module.exports = router;

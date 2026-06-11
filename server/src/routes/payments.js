const router = require('express').Router();
const c = require('../controllers/paymentController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('payments.view'), c.getPayments);
router.post('/', hasPermission('payments.create'), logAction("payments", "create"), c.createPayment);
router.delete('/:id', hasPermission('payments.delete'), logAction("payments", "delete"), c.deletePayment);

module.exports = router;

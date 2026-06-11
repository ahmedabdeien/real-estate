const router = require('express').Router();
const c = require('../controllers/customerController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('customers.view'), c.getCustomers);
router.post('/', hasPermission('customers.create'), logAction("customers", "create"), c.createCustomer);
router.get('/:id', hasPermission('customers.view'), c.getCustomer);
router.put('/:id', hasPermission('customers.update'), logAction("customers", "update"), c.updateCustomer);
router.delete('/:id', hasPermission('customers.delete'), logAction("customers", "delete"), c.deleteCustomer);

module.exports = router;

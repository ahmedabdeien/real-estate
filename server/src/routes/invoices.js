const router = require('express').Router();
const c = require('../controllers/invoiceController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('invoices.view'), c.getInvoices);
router.post('/', hasPermission('invoices.create'), logAction("invoices", "create"), c.createInvoice);
router.get('/:id', hasPermission('invoices.view'), c.getInvoice);
router.put('/:id', hasPermission('invoices.update'), logAction("invoices", "update"), c.updateInvoice);
router.delete('/:id', hasPermission('invoices.delete'), logAction("invoices", "delete"), c.deleteInvoice);

module.exports = router;

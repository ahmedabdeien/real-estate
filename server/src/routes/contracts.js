const router = require('express').Router();
const c = require('../controllers/contractController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('contracts.view'), c.getContracts);
router.post('/', hasPermission('contracts.create'), logAction("contracts", "create"), c.createContract);
router.get('/:id', hasPermission('contracts.view'), c.getContract);
router.put('/:id', hasPermission('contracts.update'), logAction("contracts", "update"), c.updateContract);
router.delete('/:id', hasPermission('contracts.delete'), logAction("contracts", "delete"), c.deleteContract);
router.put('/:id/installments/:instId', hasPermission('contracts.update'), c.updateInstallment);

module.exports = router;

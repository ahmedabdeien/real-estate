const router = require('express').Router();
const c = require('../controllers/unitController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('units.view'), c.getUnits);
router.post('/', hasPermission('units.create'), logAction("units", "create"), c.createUnit);
router.get('/:id', hasPermission('units.view'), c.getUnit);
router.put('/:id', hasPermission('units.update'), logAction("units", "update"), c.updateUnit);
router.delete('/:id', hasPermission('units.delete'), logAction("units", "delete"), c.deleteUnit);

module.exports = router;

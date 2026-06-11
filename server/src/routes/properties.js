const router = require('express').Router();
const c = require('../controllers/propertyController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('properties.view'), c.getProperties);
router.post('/', hasPermission('properties.create'), logAction("properties", "create"), c.createProperty);
router.get('/:id', hasPermission('properties.view'), c.getProperty);
router.put('/:id', hasPermission('properties.update'), logAction("properties", "update"), c.updateProperty);
router.delete('/:id', hasPermission('properties.delete'), logAction("properties", "delete"), c.deleteProperty);

module.exports = router;

const router = require('express').Router();
const c = require('../controllers/roleController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/permissions', c.getPermissions);
router.get('/', hasPermission('roles.view'), c.getRoles);
router.post('/', hasPermission('roles.create'), logAction("roles", "create"), c.createRole);
router.put('/:id', hasPermission('roles.update'), logAction("roles", "update"), c.updateRole);
router.delete('/:id', hasPermission('roles.delete'), logAction("roles", "delete"), c.deleteRole);
router.post('/:id/duplicate', hasPermission('roles.create'), logAction("roles", "duplicate"), c.duplicateRole);

module.exports = router;

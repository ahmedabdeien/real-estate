const router = require('express').Router();
const c = require('../controllers/roleController');
const { protect, hasPermission, hasAnyPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);

// الصلاحيات + القائمة — تشتغل لأدوار الشركة (roles.view) وأدوار المنصة (platform.roles.view)
router.get('/permissions', c.getPermissions);
router.get('/', hasAnyPermission('roles.view', 'platform.roles.view'), c.getRoles);
router.post('/', hasAnyPermission('roles.create', 'platform.roles.create'), logAction('roles', 'create'), c.createRole);
router.put('/:id', hasAnyPermission('roles.update', 'platform.roles.update'), logAction('roles', 'update'), c.updateRole);
router.delete('/:id', hasAnyPermission('roles.delete', 'platform.roles.delete'), logAction('roles', 'delete'), c.deleteRole);
router.post('/:id/duplicate', hasAnyPermission('roles.create', 'platform.roles.create'), logAction('roles', 'duplicate'), c.duplicateRole);

module.exports = router;

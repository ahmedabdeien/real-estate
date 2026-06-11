const router = require('express').Router();
const c = require('../controllers/userController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/', hasPermission('users.view'), c.getUsers);
router.post('/', hasPermission('users.create'), logAction("users", "create"), c.createUser);
router.put('/profile', c.updateProfile);
router.get('/:id', hasPermission('users.view'), c.getUser);
router.put('/:id', hasPermission('users.update'), logAction("users", "update"), c.updateUser);
router.delete('/:id', hasPermission('users.delete'), logAction("users", "delete"), c.deleteUser);

module.exports = router;

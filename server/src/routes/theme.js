const router = require('express').Router();
const c = require('../controllers/themeController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.get('/', protect, tenantScope, c.getTheme);
router.put('/', protect, tenantScope, hasPermission('theme.update'), c.updateTheme);

module.exports = router;

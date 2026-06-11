const router = require('express').Router();
const { getAuditLogs, getAuditStats } = require('../controllers/auditController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');

router.use(protect, tenantScope);
router.get('/',       hasPermission('audit.view'), getAuditLogs);
router.get('/stats',  hasPermission('audit.view'), getAuditStats);

module.exports = router;

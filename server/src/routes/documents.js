const router = require('express').Router();
const c = require('../controllers/documentController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { logAction } = require('../middlewares/audit');

router.use(protect, tenantScope);
router.get('/',    hasPermission('documents.view'),   c.getDocuments);
router.post('/',   hasPermission('documents.create'), logAction('documents', 'create'), c.createDocument);
router.get('/:id', hasPermission('documents.view'),   c.getDocument);
router.put('/:id', hasPermission('documents.update'), logAction('documents', 'update'), c.updateDocument);
router.delete('/:id', hasPermission('documents.delete'), logAction('documents', 'delete'), c.deleteDocument);

module.exports = router;

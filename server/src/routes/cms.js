const router = require('express').Router();
const c = require('../controllers/cmsController');
const { protect } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');

/* Public — fetch page content for frontend rendering */
router.get('/public', c.getPublicPage);

/* Protected */
router.use(protect, tenantScope);
router.get('/:pageKey',             c.getCmsPage);
router.put('/:pageKey',             c.updateCmsPage);
router.put('/:pageKey/:sectionKey', c.updateSection);

module.exports = router;

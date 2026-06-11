const router = require('express').Router();
const c = require('../controllers/pageController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');

// Public — site visitors read published pages without auth
router.get('/public/:slug', c.getPublicPageBySlug);

router.use(protect, tenantScope, hasPermission('theme.update'));
router.get('/',       c.getPages);
router.get('/:id',    c.getPage);
router.post('/',      c.createPage);
router.put('/:id',    c.updatePage);
router.delete('/:id', c.deletePage);

module.exports = router;

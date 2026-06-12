const router = require('express').Router();
const c = require('../controllers/pageController');
const { protect, hasAnyPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');

// Public — site visitors read published pages without auth
router.get('/public-nav', c.getNavPages);
router.get('/public/:slug', c.getPublicPageBySlug);

router.use(protect, tenantScope);
/* صلاحيات محتوى دقيقة لكل عملية — theme.update مقبولة للتوافق مع أدوار الشركة القديمة */
router.get('/',       hasAnyPermission('pages.view', 'pages.update', 'theme.update'), c.getPages);
router.get('/:id',    hasAnyPermission('pages.view', 'pages.update', 'theme.update'), c.getPage);
router.post('/',      hasAnyPermission('pages.create', 'theme.update'), c.createPage);
router.put('/:id',    hasAnyPermission('pages.update', 'theme.update'), c.updatePage);
router.delete('/:id', hasAnyPermission('pages.delete', 'theme.update'), c.deletePage);

module.exports = router;

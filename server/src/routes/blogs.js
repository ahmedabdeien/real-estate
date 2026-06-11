const router = require('express').Router();
const c = require('../controllers/blogController');
const { protect, hasPermission } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');

/* Public */
router.get('/public', c.getPublicBlogs);
router.get('/public/:slug', c.getBlogBySlug);

/* Protected */
router.use(protect, tenantScope);
router.get('/',     c.getBlogs);
router.post('/',    c.createBlog);
router.get('/:id',  c.getBlog);
router.put('/:id',  c.updateBlog);
router.delete('/:id', c.deleteBlog);

module.exports = router;

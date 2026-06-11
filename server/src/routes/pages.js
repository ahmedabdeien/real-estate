const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pageController');
const auth    = require('../middleware/auth');
const tenant  = require('../middleware/tenantScope');

router.get('/slug/:slug', auth, tenant, ctrl.getPageBySlug);
router.get('/',           auth, tenant, ctrl.getPages);
router.get('/:id',        auth, tenant, ctrl.getPage);
router.post('/',          auth, tenant, ctrl.createPage);
router.put('/:id',        auth, tenant, ctrl.updatePage);
router.delete('/:id',     auth, tenant, ctrl.deletePage);

module.exports = router;

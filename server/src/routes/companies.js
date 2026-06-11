const router = require('express').Router();
const c = require('../controllers/companyController');
const { protect, superAdmin } = require('../middlewares/auth');

router.use(protect, superAdmin);
router.get('/', c.getCompanies);
router.post('/', c.createCompany);
router.get('/:id', c.getCompany);
router.put('/:id', c.updateCompany);
router.delete('/:id', c.deleteCompany);
router.post('/:id/impersonate', c.impersonateCompany);

module.exports = router;

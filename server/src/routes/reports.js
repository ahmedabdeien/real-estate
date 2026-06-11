const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect, hasPermission, isSuperAdmin } = require('../middlewares/auth');
const { tenantScope } = require('../middlewares/tenant');
const { markOverdueInstallments, markOverdueInvoices } = require('../jobs/overdueJob');

router.use(protect, tenantScope);
router.get('/dashboard',     c.getDashboard);
router.get('/financial',     c.getFinancialReport);
router.get('/installments',  c.getInstallmentsReport);

router.post('/run-overdue', async (req, res) => {
  try {
    await markOverdueInstallments();
    await markOverdueInvoices();
    res.json({ success: true, message: 'تم تحديث الأقساط والفواتير المتأخرة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

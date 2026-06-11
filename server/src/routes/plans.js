const express = require('express');
const router = express.Router();
const { protect, superAdmin } = require('../middlewares/auth');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { sendSuccess } = require('../utils/response');

// Public: list active plans (for pricing page / tenant registration)
router.get('/public', async (req, res) => {
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ sortOrder: 1, price: 1 })
    .select('-__v');
  sendSuccess(res, plans);
});

router.use(protect, superAdmin);

router.get('/', async (req, res) => {
  const plans = await SubscriptionPlan.find().sort({ sortOrder: 1, price: 1 });
  sendSuccess(res, plans);
});

router.post('/', async (req, res) => {
  const plan = await SubscriptionPlan.create(req.body);
  sendSuccess(res, plan, 201);
});

router.put('/:id', async (req, res) => {
  const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendSuccess(res, plan);
});

router.delete('/:id', async (req, res) => {
  await SubscriptionPlan.findByIdAndDelete(req.params.id);
  sendSuccess(res, null);
});

// Seed default plans
router.post('/seed', async (req, res) => {
  const count = await SubscriptionPlan.countDocuments();
  if (count > 0) return sendSuccess(res, null, 'الباقات موجودة مسبقاً');

  const defaults = [
    {
      name: 'starter', nameAr: 'المبتدئ', label: 'Starter',
      description: 'مثالي للشركات الصغيرة والناشئة',
      price: 299, priceYearly: 249, sortOrder: 1,
      maxUsers: 3, maxProperties: 2, maxUnits: 50,
      modules: ['properties', 'units', 'contracts', 'installments', 'notifications', 'tasks', 'activity'],
      features: ['حتى 3 مستخدمين', 'حتى 2 مشروع عقاري', 'حتى 50 وحدة', 'إدارة العقود والأقساط', 'التنبيهات والمهام', 'دعم بالبريد الإلكتروني'],
      isActive: true, isPopular: false,
    },
    {
      name: 'professional', nameAr: 'الاحترافي', label: 'Professional',
      description: 'للشركات المتوسطة في مرحلة النمو',
      price: 699, priceYearly: 579, sortOrder: 2,
      maxUsers: 15, maxProperties: 10, maxUnits: 500,
      modules: ['properties', 'units', 'contracts', 'installments', 'accounting', 'reports', 'advanced_reports', 'export', 'whatsapp', 'tasks', 'activity', 'notifications', 'media', 'roles', 'api', 'theme'],
      features: ['حتى 15 مستخدم', 'حتى 10 مشاريع', 'حتى 500 وحدة', 'محاسبة كاملة', 'تقارير متقدمة + تصدير', 'واتساب وإشعارات', 'تخصيص المظهر', 'API Access', 'دعم أولوية 24/7'],
      isActive: true, isPopular: true,
    },
    {
      name: 'enterprise', nameAr: 'المؤسسات', label: 'Enterprise',
      description: 'للشركات الكبيرة وسلاسل العقارات',
      price: 1499, priceYearly: 1249, sortOrder: 3,
      maxUsers: -1, maxProperties: -1, maxUnits: -1,
      modules: ['properties', 'units', 'contracts', 'installments', 'accounting', 'reports', 'advanced_reports', 'export', 'whatsapp', 'tasks', 'activity', 'notifications', 'media', 'roles', 'api', 'theme', 'warehouse', 'multi_branch', 'purchasing'],
      features: ['مستخدمون غير محدودين', 'مشاريع ووحدات غير محدودة', 'محاسبة + مستودعات + مشتريات', 'تقارير متقدمة + تصدير', 'واتساب + API + Webhooks', 'فروع متعددة', 'مدير حساب مخصص', 'دعم أولوية 24/7'],
      isActive: true, isPopular: false,
    },
  ];

  await SubscriptionPlan.insertMany(defaults);
  sendSuccess(res, defaults, 'تم إنشاء الباقات الافتراضية');
});

module.exports = router;

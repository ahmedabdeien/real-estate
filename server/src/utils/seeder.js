require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const ThemeSettings = require('../models/ThemeSettings');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PERMISSIONS = require('../constants/permissions');
const PLATFORM_PERMISSIONS = require('../constants/platformPermissions');
const Permission = require('../models/Permission');

// ── أدوار المنصة الافتراضية ──────────────────────────────────────────────────
const PLATFORM_ROLES = [
  {
    name: 'platform-super-manager',
    label: 'مشرف المنصة',
    scope: 'platform',
    companyId: null,
    isSystem: true,
    color: '#da1f27',
    description: 'صلاحيات كاملة على المنصة ما عدا الحذف',
    permissions: PLATFORM_PERMISSIONS
      .filter(p => !p.name.endsWith('.delete'))
      .map(p => p.name),
  },
  {
    name: 'platform-companies-manager',
    label: 'مدير الشركات',
    scope: 'platform',
    companyId: null,
    isSystem: true,
    color: '#009756',
    description: 'إدارة الشركات والاشتراكات والخطط',
    permissions: PLATFORM_PERMISSIONS
      .filter(p => ['companies', 'plans', 'billing'].includes(p.module))
      .map(p => p.name),
  },
  {
    name: 'platform-marketing-manager',
    label: 'مدير التسويق الإلكتروني',
    scope: 'platform',
    companyId: null,
    isSystem: true,
    color: '#fbb140',
    description: 'إدارة الموقع التسويقي والمحتوى والثيم والصور',
    permissions: [
      'platform.pages.view',
      'platform.pages.manage',
      'platform.media.manage',
      'platform.theme.update',
      'platform.changelog.manage',
      'platform.stats.view',
    ],
  },
  {
    name: 'platform-team-manager',
    label: 'مدير فريق المنصة',
    scope: 'platform',
    companyId: null,
    isSystem: true,
    color: '#231f20',
    description: 'إدارة أعضاء الفريق وأدوار المنصة',
    permissions: [
      'platform.team.view',
      'platform.team.create',
      'platform.team.update',
      'platform.team.delete',
      'platform.roles.view',
      'platform.roles.create',
      'platform.roles.update',
      'platform.stats.view',
    ],
  },
  {
    name: 'platform-reports-viewer',
    label: 'محلل البيانات',
    scope: 'platform',
    companyId: null,
    isSystem: true,
    color: '#6366f1',
    description: 'عرض الإحصاءات وسجلات العمليات فقط',
    permissions: [
      'platform.stats.view',
      'platform.audit.view',
      'platform.companies.view',
      'platform.billing.view',
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  await Permission.deleteMany({});
  await Permission.insertMany(PERMISSIONS);
  console.log('Permissions seeded');

  await SubscriptionPlan.deleteMany({});
  const plans = await SubscriptionPlan.insertMany([
    {
      name: 'basic', label: 'الأساسي', price: 299, billingCycle: 'monthly',
      maxUsers: 5, maxProperties: 5, maxUnits: 50,
      modules: ['properties', 'units', 'customers', 'contracts', 'invoices', 'payments'],
      features: ['إدارة المشاريع', 'إدارة العملاء', 'العقود والفواتير'],
    },
    {
      name: 'professional', label: 'الاحترافي', price: 699, billingCycle: 'monthly',
      maxUsers: 20, maxProperties: 20, maxUnits: 200,
      modules: ['properties', 'units', 'customers', 'contracts', 'invoices', 'payments', 'expenses', 'reports', 'chat'],
      features: ['كل ميزات الأساسي', 'التقارير المالية', 'المصروفات', 'الدردشة الداخلية'],
      isPopular: true,
    },
    {
      name: 'enterprise', label: 'المؤسسي', price: 1499, billingCycle: 'monthly',
      maxUsers: 100, maxProperties: -1, maxUnits: -1,
      modules: ['all'],
      features: ['كل الميزات', 'دعم مخصص', 'تخصيص كامل', 'تقارير متقدمة'],
    },
  ]);
  console.log('Plans seeded');

  // ── أدوار المنصة الافتراضية ─────────────────────────────────────────────
  for (const roleData of PLATFORM_ROLES) {
    await Role.findOneAndUpdate(
      { name: roleData.name, companyId: null },
      roleData,
      { upsert: true, new: true }
    );
  }
  console.log(`Platform roles seeded (${PLATFORM_ROLES.length} roles)`);

  let superAdmin = await User.findOne({ isSuperAdmin: true });
  if (!superAdmin) {
    const theme = await ThemeSettings.findOneAndUpdate(
      { companyId: null },
      { companyId: null },
      { upsert: true, new: true }
    );
    superAdmin = await User.create({
      name: 'المشرف العام',
      email: 'superadmin@egyestate.com',
      password: 'SuperAdmin@123',
      isSuperAdmin: true,
      status: 'active',
    });
    console.log('Super admin created: superadmin@egyestate.com / SuperAdmin@123');
  } else {
    console.log('Super admin already exists');
  }

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

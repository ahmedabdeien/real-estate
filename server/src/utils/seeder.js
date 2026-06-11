require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const ThemeSettings = require('../models/ThemeSettings');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const PERMISSIONS = require('../constants/permissions');
const Permission = require('../models/Permission');

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

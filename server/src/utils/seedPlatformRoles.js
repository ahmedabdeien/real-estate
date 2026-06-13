require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');
const PLATFORM_PERMISSIONS = require('../constants/platformPermissions');

// ── أدوار المنصة ──────────────────────────────────────────────────────────────
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

// ── مستخدمو المنصة الافتراضيون ──────────────────────────────────────────────
const PLATFORM_USERS = [
  {
    name: 'مشرف المنصة',
    email: 'manager@egyestate.com',
    password: 'Manager@123',
    roleName: 'platform-super-manager',
  },
  {
    name: 'مدير الشركات',
    email: 'companies@egyestate.com',
    password: 'Companies@123',
    roleName: 'platform-companies-manager',
  },
  {
    name: 'مدير التسويق الإلكتروني',
    email: 'marketing@egyestate.com',
    password: 'Marketing@123',
    roleName: 'platform-marketing-manager',
  },
  {
    name: 'مدير فريق المنصة',
    email: 'team@egyestate.com',
    password: 'Team@123',
    roleName: 'platform-team-manager',
  },
  {
    name: 'محلل البيانات',
    email: 'analyst@egyestate.com',
    password: 'Analyst@123',
    roleName: 'platform-reports-viewer',
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  // 1) Upsert roles
  const roleMap = {};
  for (const roleData of PLATFORM_ROLES) {
    const role = await Role.findOneAndUpdate(
      { name: roleData.name, companyId: null },
      roleData,
      { upsert: true, new: true }
    );
    roleMap[role.name] = role._id;
    console.log(`  [ROLE] ${role.label}`);
  }

  // 2) Upsert platform users
  for (const u of PLATFORM_USERS) {
    const roleId = roleMap[u.roleName];
    if (!roleId) { console.warn(`  [SKIP] role not found: ${u.roleName}`); continue; }

    const existing = await User.findOne({ email: u.email });
    if (existing) {
      // تحديث الدور فقط بدون المساس بالباسورد
      await User.updateOne({ email: u.email }, { role: roleId, companyId: null, status: 'active' });
      console.log(`  [USER UPDATED] ${u.email}`);
    } else {
      await User.create({
        name: u.name,
        email: u.email,
        password: u.password,
        role: roleId,
        companyId: null,
        isSuperAdmin: false,
        status: 'active',
      });
      console.log(`  [USER CREATED] ${u.email} / ${u.password}`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Role = require('../models/Role');
const PERMISSIONS = require('../constants/permissions');

const all = PERMISSIONS.map(p => p.name);
const perms = (modules) => all.filter(p => modules.some(m => p.startsWith(m + '.')));

const buildDefaultRoles = (companyId) => [
  {
    name: 'company_admin',
    label: 'مدير الشركة',
    color: '#da1f27',
    description: 'صلاحيات كاملة على جميع أقسام الشركة',
    permissions: all,
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'sales_manager',
    label: 'مدير المبيعات',
    color: '#009756',
    description: 'إدارة المشاريع والوحدات والعملاء والعقود والأقساط والتقارير',
    permissions: perms(['properties', 'units', 'customers', 'contracts', 'installments', 'invoices', 'payments', 'tasks', 'notifications', 'reports', 'documents', 'media']),
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'accountant',
    label: 'المحاسب',
    color: '#2563eb',
    description: 'العقود والأقساط والفواتير والمدفوعات والمصروفات والتقارير المالية',
    permissions: perms(['contracts', 'installments', 'invoices', 'payments', 'expenses', 'reports', 'documents', 'customers', 'notifications']),
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'sales_rep',
    label: 'مندوب المبيعات',
    color: '#fbb140',
    description: 'عرض المشاريع والوحدات وإدارة العملاء والمهام',
    permissions: [
      ...perms(['customers', 'tasks', 'notifications']),
      ...all.filter(p => ['properties.view', 'units.view', 'contracts.view', 'installments.view', 'invoices.view', 'documents.view', 'media.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'marketing_manager',
    label: 'مدير التسويق',
    color: '#7c3aed',
    description: 'مكتبة الصور والعملاء والإشعارات والتقارير',
    permissions: [
      ...perms(['media', 'notifications', 'tasks']),
      ...all.filter(p => ['properties.view', 'units.view', 'customers.view', 'customers.create', 'customers.update', 'reports.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'hr_admin',
    label: 'المشرف الإداري',
    color: '#0d9488',
    description: 'إدارة المستخدمين والأدوار والإعدادات والوثائق وسجل العمليات',
    permissions: [
      ...perms(['users', 'tasks', 'documents', 'notifications']),
      ...all.filter(p => ['roles.view', 'settings.view', 'settings.update', 'audit.view', 'activity.view', 'reports.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const companies = await Company.find({});
  console.log(`Found ${companies.length} companies`);

  for (const company of companies) {
    console.log(`\n[${company.name}]`);
    const roles = buildDefaultRoles(company._id);
    for (const roleData of roles) {
      const existing = await Role.findOne({ name: roleData.name, companyId: company._id });
      if (existing) {
        // تحديث الصلاحيات والبيانات بدون تغيير isSystem
        await Role.updateOne({ _id: existing._id }, {
          label: roleData.label,
          color: roleData.color,
          description: roleData.description,
          permissions: roleData.permissions,
          scope: 'company',
          isSystem: true,
        });
        console.log(`  [UPDATED] ${roleData.label}`);
      } else {
        await Role.create(roleData);
        console.log(`  [CREATED] ${roleData.label}`);
      }
    }
  }

  console.log('\nDone.');
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });

const PERMISSIONS = require('./permissions');

const all = PERMISSIONS.map(p => p.name);
const perms = (...modules) => all.filter(p => modules.some(m => p.startsWith(m + '.')));

const buildDefaultCompanyRoles = (companyId) => [
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
    permissions: perms('properties', 'units', 'customers', 'contracts', 'installments', 'invoices', 'payments', 'tasks', 'notifications', 'reports', 'documents', 'media'),
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'accountant',
    label: 'المحاسب',
    color: '#2563eb',
    description: 'العقود والأقساط والفواتير والمدفوعات والمصروفات والتقارير المالية',
    permissions: perms('contracts', 'installments', 'invoices', 'payments', 'expenses', 'reports', 'documents', 'customers', 'notifications'),
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'sales_rep',
    label: 'مندوب المبيعات',
    color: '#fbb140',
    description: 'عرض المشاريع والوحدات وإدارة العملاء والمهام',
    permissions: [
      ...perms('customers', 'tasks', 'notifications'),
      ...all.filter(p => ['properties.view','units.view','contracts.view','installments.view','invoices.view','documents.view','media.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'marketing_manager',
    label: 'مدير التسويق',
    color: '#7c3aed',
    description: 'مكتبة الصور والعملاء والإشعارات والتقارير',
    permissions: [
      ...perms('media', 'notifications', 'tasks'),
      ...all.filter(p => ['properties.view','units.view','customers.view','customers.create','customers.update','reports.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'hr_admin',
    label: 'المشرف الإداري',
    color: '#0d9488',
    description: 'إدارة المستخدمين والأدوار والإعدادات والوثائق وسجل العمليات',
    permissions: [
      ...perms('users', 'tasks', 'documents', 'notifications'),
      ...all.filter(p => ['roles.view','settings.view','settings.update','audit.view','activity.view','reports.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
];

module.exports = buildDefaultCompanyRoles;

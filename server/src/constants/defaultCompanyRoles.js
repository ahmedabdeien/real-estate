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

  // ── أدوار جديدة ─────────────────────────────────────────────────────────

  {
    name: 'project_manager',
    label: 'مدير المشروع',
    color: '#ea580c',
    description: 'إدارة المشاريع والوحدات والعملاء والعقود والمهام وتقارير المبيعات',
    permissions: [
      ...perms('properties', 'units', 'customers', 'contracts', 'installments', 'tasks', 'documents', 'notifications'),
      ...all.filter(p => ['invoices.view','payments.view','reports.view','reports.export','media.view','media.upload','audit.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'customer_service',
    label: 'خدمة العملاء',
    color: '#0891b2',
    description: 'التعامل مع العملاء والرد على الاستفسارات وعرض العقود والأقساط',
    permissions: [
      ...perms('customers', 'tasks', 'notifications', 'whatsapp'),
      ...all.filter(p => [
        'properties.view','units.view',
        'contracts.view','installments.view',
        'invoices.view','payments.view',
        'documents.view','media.view',
      ].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'legal_officer',
    label: 'المسؤول القانوني',
    color: '#1e3a5f',
    description: 'الاطلاع على العقود والوثائق القانونية وإدارتها',
    permissions: [
      ...perms('contracts', 'documents'),
      ...all.filter(p => [
        'customers.view','properties.view','units.view',
        'invoices.view','payments.view','audit.view','reports.view',
      ].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'warehouse_manager',
    label: 'مسؤول المستودع',
    color: '#92400e',
    description: 'إدارة المستودع والمشتريات ومتابعة الطلبات',
    permissions: [
      ...perms('warehouse', 'purchasing'),
      ...all.filter(p => ['tasks.view','tasks.create','tasks.update','documents.view','reports.view','activity.view'].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'purchasing_officer',
    label: 'مسؤول المشتريات',
    color: '#b45309',
    description: 'إنشاء طلبات الشراء ومتابعتها مع إدارة المستودع',
    permissions: [
      ...perms('purchasing'),
      ...all.filter(p => [
        'warehouse.view','tasks.view','tasks.create','tasks.update',
        'expenses.view','expenses.create','documents.view','documents.create','reports.view',
      ].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'financial_manager',
    label: 'المدير المالي',
    color: '#166534',
    description: 'إدارة كاملة للجانب المالي: فواتير، مدفوعات، مصروفات، أقساط، تقارير',
    permissions: [
      ...perms('invoices', 'payments', 'expenses', 'installments', 'reports', 'documents', 'notifications'),
      ...all.filter(p => [
        'contracts.view','customers.view','properties.view','units.view',
        'warehouse.view','purchasing.view','audit.view','activity.view',
      ].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'media_manager',
    label: 'مدير المحتوى والوسائط',
    color: '#7c3aed',
    description: 'إدارة مكتبة الصور والوسائط والمحتوى التسويقي',
    permissions: [
      ...perms('media', 'notifications'),
      ...all.filter(p => [
        'properties.view','units.view','customers.view',
        'tasks.view','tasks.create','tasks.update',
        'reports.view',
      ].includes(p)),
    ],
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'viewer',
    label: 'مراقب (قراءة فقط)',
    color: '#64748b',
    description: 'صلاحيات عرض كاملة على جميع أقسام الشركة بدون أي تعديل',
    permissions: all.filter(p =>
      p.endsWith('.view') || p === 'reports.export'
    ),
    companyId, scope: 'company', isSystem: true,
  },
];

module.exports = buildDefaultCompanyRoles;

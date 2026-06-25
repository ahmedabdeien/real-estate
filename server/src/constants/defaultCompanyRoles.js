const PERMISSIONS = require('./permissions');

const all = PERMISSIONS.map(p => p.name);

// helper: all permissions for given modules
const perms = (...modules) => all.filter(p => modules.some(m => p.startsWith(m + '.')));

// helper: specific named permissions
const only = (...names) => all.filter(p => names.includes(p));

const buildDefaultCompanyRoles = (companyId) => [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. مدير العمليات — صلاحيات كاملة
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'operations_manager',
    label: 'مدير العمليات',
    color: '#da1f27',
    description: 'صلاحيات كاملة على جميع أقسام النظام',
    permissions: all,
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. مدير المبيعات
  // لوحة التحكم ✅ | مركز القيادة ✅ | مشاريع 👁 | وحدات 👁 | leads ✅ | عملاء ✅
  // صفقات ✅ | عقود ✅ | فواتير ❌ | مهام ✅ | تقويم ✅ | محادثات ✅ | واتساب ✅
  // إشعارات ✅ | تقارير ❌ | نشاط ✅ | أتمتة ❌ | تكاملات ❌ | تدقيق ❌ | إعدادات ❌
  // إدارة فريق ✅ | API ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'sales_manager',
    label: 'مدير المبيعات',
    color: '#009756',
    description: 'إدارة العملاء والصفقات والعقود والفريق',
    permissions: [
      ...perms('leads', 'customers', 'deals', 'contracts', 'tasks', 'calendar',
                'notifications', 'whatsapp', 'users'),
      ...only(
        'properties.view', 'units.view',
        'command_center.view',
        'activity.view',
        'roles.view',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. مندوب المبيعات
  // لوحة التحكم ✅ | مركز القيادة ❌ | مشاريع 👁 | وحدات 👁 | leads ✏ | عملاء ✏
  // صفقات ✏ | عقود ❌ | فواتير ❌ | مهام ✏ | تقويم ✏ | محادثات ❌ | واتساب ❌
  // إشعارات ✅ | تقارير ❌ | نشاط ✏ | باقي ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'sales_rep',
    label: 'مندوب المبيعات',
    color: '#fbb140',
    description: 'إدارة بياناته الخاصة من عملاء وصفقات ومهام',
    permissions: [
      ...only(
        'properties.view', 'units.view',
        // leads - own only
        'leads.view', 'leads.create', 'leads.update', 'leads.own',
        // customers - own only
        'customers.view', 'customers.create', 'customers.update', 'customers.own',
        // deals - own only
        'deals.view', 'deals.create', 'deals.update', 'deals.own',
        // tasks - own only
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.own',
        // calendar - own only
        'calendar.view', 'calendar.create', 'calendar.update', 'calendar.own',
        // notifications
        'notifications.view',
        // activity - own
        'activity.view',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. مدير العقارات
  // لوحة التحكم ✅ | مركز القيادة ❌ | مشاريع ✅ | وحدات ✅ | leads ❌ | عملاء 👁
  // صفقات 👁 | عقود 👁 | فواتير ❌ | مهام ✏ | تقويم ✏ | محادثات ❌ | واتساب ❌
  // إشعارات ✅ | تقارير ✅ | نشاط ❌ | باقي ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'real_estate_manager',
    label: 'مدير العقارات',
    color: '#ea580c',
    description: 'إدارة المشاريع والوحدات مع قراءة العقود والصفقات',
    permissions: [
      ...perms('properties', 'units'),
      ...only(
        'customers.view',
        'deals.view',
        'contracts.view',
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.own',
        'calendar.view', 'calendar.create', 'calendar.update', 'calendar.own',
        'notifications.view',
        'reports.view', 'reports.export',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. المحاسب
  // لوحة التحكم ✅ | مركز القيادة ❌ | مشاريع 👁 | وحدات 👁 | leads ❌ | عملاء 👁
  // صفقات 👁 | عقود ❌ | فواتير ✅ | مهام ✏ | تقويم ✏ | محادثات ❌ | واتساب ✅
  // إشعارات ✅ | تقارير ✅ | نشاط ❌ | باقي ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'accountant',
    label: 'المحاسب',
    color: '#2563eb',
    description: 'إدارة الفواتير والمدفوعات والمصروفات والتقارير المالية',
    permissions: [
      ...perms('invoices', 'payments', 'expenses', 'installments'),
      ...only(
        'properties.view', 'units.view',
        'customers.view',
        'deals.view',
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.own',
        'calendar.view', 'calendar.create', 'calendar.update', 'calendar.own',
        'whatsapp.view', 'whatsapp.send',
        'notifications.view',
        'reports.view', 'reports.export', 'reports.advanced',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. التسويق
  // لوحة التحكم ✅ | مركز القيادة ❌ | مشاريع 👁 | وحدات 👁 | leads ✅ | عملاء 👁
  // صفقات ❌ | عقود ❌ | فواتير ❌ | مهام ✏ | تقويم ✏ | محادثات ❌ | واتساب ✅
  // إشعارات ✅ | تقارير ❌ | نشاط ❌ | أتمتة ✅ | باقي ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'marketing',
    label: 'التسويق',
    color: '#7c3aed',
    description: 'إدارة العملاء المحتملين والإعلانات والأتمتة التسويقية',
    permissions: [
      ...perms('leads', 'media', 'facebook_ads', 'automation'),
      ...only(
        'properties.view', 'units.view',
        'customers.view',
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.own',
        'calendar.view', 'calendar.create', 'calendar.update', 'calendar.own',
        'whatsapp.view', 'whatsapp.send',
        'notifications.view',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. خدمة العملاء
  // لوحة التحكم ✅ | مركز القيادة ❌ | مشاريع ❌ | وحدات ❌ | leads 👁 | عملاء 👁
  // صفقات ❌ | عقود ❌ | فواتير ❌ | مهام ✏ | تقويم ✏ | محادثات ✅ | واتساب ✅
  // إشعارات ✅ | تقارير ❌ | نشاط ❌ | باقي ❌
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'customer_service',
    label: 'خدمة العملاء',
    color: '#0891b2',
    description: 'التعامل مع العملاء والرد عبر الواتساب والمحادثات',
    permissions: [
      ...only(
        'leads.view',
        'customers.view',
        'tasks.view', 'tasks.create', 'tasks.update', 'tasks.own',
        'calendar.view', 'calendar.create', 'calendar.update', 'calendar.own',
        'notifications.view', 'notifications.send',
        'whatsapp.view', 'whatsapp.send',
      ),
    ],
    companyId, scope: 'company', isSystem: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // أدوار إضافية مساعدة
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'company_admin',
    label: 'مدير الشركة',
    color: '#231f20',
    description: 'صلاحيات كاملة بما فيها الإعدادات وإدارة الفريق',
    permissions: all,
    companyId, scope: 'company', isSystem: true,
  },
  {
    name: 'viewer',
    label: 'مراقب (قراءة فقط)',
    color: '#64748b',
    description: 'صلاحيات عرض كاملة على جميع أقسام الشركة بدون أي تعديل',
    permissions: all.filter(p => p.endsWith('.view') || p === 'reports.export'),
    companyId, scope: 'company', isSystem: true,
  },
];

module.exports = buildDefaultCompanyRoles;

/* صلاحيات مستوى المنصة — للأدوار التي ينشئها السوبر أدمن (مالك المشروع)
   منفصلة تماماً عن صلاحيات الشركات */
const PLATFORM_PERMISSIONS = [
  // ── الشركات
  { name: 'platform.companies.view',    label: 'عرض الشركات',            module: 'companies' },
  { name: 'platform.companies.create',  label: 'إضافة شركة',             module: 'companies' },
  { name: 'platform.companies.update',  label: 'تعديل شركة',             module: 'companies' },
  { name: 'platform.companies.suspend', label: 'إيقاف/تفعيل شركة',       module: 'companies' },
  { name: 'platform.companies.delete',  label: 'حذف شركة',               module: 'companies' },
  { name: 'platform.companies.impersonate', label: 'الدخول كمدير شركة',  module: 'companies' },

  // ── خطط الاشتراك
  { name: 'platform.plans.view',    label: 'عرض الخطط',     module: 'plans' },
  { name: 'platform.plans.create',  label: 'إضافة خطة',     module: 'plans' },
  { name: 'platform.plans.update',  label: 'تعديل خطة',     module: 'plans' },
  { name: 'platform.plans.delete',  label: 'حذف خطة',       module: 'plans' },

  // ── الفواتير والاشتراكات
  { name: 'platform.billing.view',   label: 'عرض اشتراكات الشركات', module: 'billing' },
  { name: 'platform.billing.manage', label: 'إدارة الاشتراكات',     module: 'billing' },

  // ── أدوار المنصة
  { name: 'platform.roles.view',    label: 'عرض أدوار المنصة',   module: 'platformRoles' },
  { name: 'platform.roles.create',  label: 'إضافة دور منصة',     module: 'platformRoles' },
  { name: 'platform.roles.update',  label: 'تعديل دور منصة',     module: 'platformRoles' },
  { name: 'platform.roles.delete',  label: 'حذف دور منصة',       module: 'platformRoles' },

  // ── فريق المنصة
  { name: 'platform.team.view',    label: 'عرض فريق المنصة',   module: 'team' },
  { name: 'platform.team.create',  label: 'إضافة عضو فريق',    module: 'team' },
  { name: 'platform.team.update',  label: 'تعديل عضو فريق',    module: 'team' },
  { name: 'platform.team.delete',  label: 'حذف عضو فريق',      module: 'team' },

  // ── الموقع التسويقي
  { name: 'platform.pages.view',    label: 'عرض صفحات الموقع',  module: 'sitePages' },
  { name: 'platform.pages.manage',  label: 'إدارة صفحات الموقع', module: 'sitePages' },
  { name: 'platform.media.manage',  label: 'إدارة مكتبة الصور',  module: 'sitePages' },

  // ── إعدادات المنصة
  { name: 'platform.theme.update',     label: 'تعديل ثيم المنصة',     module: 'platformSettings' },
  { name: 'platform.settings.update',  label: 'تعديل إعدادات المنصة', module: 'platformSettings' },
  { name: 'platform.changelog.manage', label: 'إدارة سجل التحديثات',  module: 'platformSettings' },

  // ── التقارير والإحصاءات
  { name: 'platform.stats.view',   label: 'إحصاءات المنصة',     module: 'platformReports' },
  { name: 'platform.audit.view',   label: 'سجل عمليات المنصة',  module: 'platformReports' },
];

module.exports = PLATFORM_PERMISSIONS;

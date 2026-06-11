const PERMISSIONS = [
  { name: 'users.view', label: 'عرض المستخدمين', module: 'users' },
  { name: 'users.create', label: 'إضافة مستخدم', module: 'users' },
  { name: 'users.update', label: 'تعديل مستخدم', module: 'users' },
  { name: 'users.delete', label: 'حذف مستخدم', module: 'users' },
  { name: 'roles.view', label: 'عرض الأدوار', module: 'roles' },
  { name: 'roles.create', label: 'إضافة دور', module: 'roles' },
  { name: 'roles.update', label: 'تعديل دور', module: 'roles' },
  { name: 'roles.delete', label: 'حذف دور', module: 'roles' },
  { name: 'properties.view', label: 'عرض المشاريع', module: 'properties' },
  { name: 'properties.create', label: 'إضافة مشروع', module: 'properties' },
  { name: 'properties.update', label: 'تعديل مشروع', module: 'properties' },
  { name: 'properties.delete', label: 'حذف مشروع', module: 'properties' },
  { name: 'units.view', label: 'عرض الوحدات', module: 'units' },
  { name: 'units.create', label: 'إضافة وحدة', module: 'units' },
  { name: 'units.update', label: 'تعديل وحدة', module: 'units' },
  { name: 'units.delete', label: 'حذف وحدة', module: 'units' },
  { name: 'customers.view', label: 'عرض العملاء', module: 'customers' },
  { name: 'customers.create', label: 'إضافة عميل', module: 'customers' },
  { name: 'customers.update', label: 'تعديل عميل', module: 'customers' },
  { name: 'customers.delete', label: 'حذف عميل', module: 'customers' },
  { name: 'contracts.view', label: 'عرض العقود', module: 'contracts' },
  { name: 'contracts.create', label: 'إضافة عقد', module: 'contracts' },
  { name: 'contracts.update', label: 'تعديل عقد', module: 'contracts' },
  { name: 'contracts.delete', label: 'حذف عقد', module: 'contracts' },
  { name: 'invoices.view', label: 'عرض الفواتير', module: 'invoices' },
  { name: 'invoices.create', label: 'إضافة فاتورة', module: 'invoices' },
  { name: 'invoices.update', label: 'تعديل فاتورة', module: 'invoices' },
  { name: 'invoices.delete', label: 'حذف فاتورة', module: 'invoices' },
  { name: 'payments.view', label: 'عرض المدفوعات', module: 'payments' },
  { name: 'payments.create', label: 'إضافة دفعة', module: 'payments' },
  { name: 'payments.delete', label: 'حذف دفعة', module: 'payments' },
  { name: 'expenses.view', label: 'عرض المصروفات', module: 'expenses' },
  { name: 'expenses.create', label: 'إضافة مصروف', module: 'expenses' },
  { name: 'expenses.update', label: 'تعديل مصروف', module: 'expenses' },
  { name: 'expenses.delete', label: 'حذف مصروف', module: 'expenses' },
  // ── الأقساط
  { name: 'installments.view',     label: 'عرض الأقساط',            module: 'installments' },
  { name: 'installments.create',   label: 'إضافة قسط',              module: 'installments' },
  { name: 'installments.update',   label: 'تعديل قسط',              module: 'installments' },
  { name: 'installments.collect',  label: 'تحصيل قسط',              module: 'installments' },

  // ── المهام
  { name: 'tasks.view',            label: 'عرض المهام',              module: 'tasks' },
  { name: 'tasks.create',          label: 'إضافة مهمة',              module: 'tasks' },
  { name: 'tasks.update',          label: 'تعديل مهمة',              module: 'tasks' },
  { name: 'tasks.delete',          label: 'حذف مهمة',                module: 'tasks' },
  { name: 'tasks.assign',          label: 'تكليف مهمة لمستخدم',      module: 'tasks' },

  // ── الإشعارات
  { name: 'notifications.view',    label: 'عرض الإشعارات',           module: 'notifications' },
  { name: 'notifications.send',    label: 'إرسال إشعار',             module: 'notifications' },

  // ── واتساب
  { name: 'whatsapp.view',         label: 'عرض محادثات واتساب',      module: 'whatsapp' },
  { name: 'whatsapp.send',         label: 'إرسال رسائل واتساب',      module: 'whatsapp' },
  { name: 'whatsapp.settings',     label: 'إعدادات واتساب',          module: 'whatsapp' },

  // ── مكتبة الوسائط
  { name: 'media.view',            label: 'عرض مكتبة الصور',         module: 'media' },
  { name: 'media.upload',          label: 'رفع ملفات',                module: 'media' },
  { name: 'media.delete',          label: 'حذف ملفات',               module: 'media' },

  // ── المستودع
  { name: 'warehouse.view',        label: 'عرض المستودع',            module: 'warehouse' },
  { name: 'warehouse.manage',      label: 'إدارة المستودع',           module: 'warehouse' },

  // ── المشتريات
  { name: 'purchasing.view',       label: 'عرض المشتريات',           module: 'purchasing' },
  { name: 'purchasing.create',     label: 'إضافة طلب شراء',          module: 'purchasing' },
  { name: 'purchasing.approve',    label: 'اعتماد طلب شراء',         module: 'purchasing' },

  // ── التقارير
  { name: 'reports.view',          label: 'عرض التقارير',            module: 'reports' },
  { name: 'reports.export',        label: 'تصدير التقارير',           module: 'reports' },
  { name: 'reports.advanced',      label: 'التقارير المتقدمة',        module: 'reports' },

  // ── الإعدادات
  { name: 'settings.view',         label: 'عرض الإعدادات',           module: 'settings' },
  { name: 'settings.update',       label: 'تعديل الإعدادات',          module: 'settings' },
  { name: 'settings.integrations', label: 'إدارة التوصيلات',          module: 'settings' },

  // ── المظهر والوثائق والسجلات
  { name: 'theme.update',          label: 'تعديل الثيم',              module: 'theme' },
  { name: 'documents.view',        label: 'عرض الوثائق',              module: 'documents' },
  { name: 'documents.create',      label: 'رفع وثيقة',                module: 'documents' },
  { name: 'documents.update',      label: 'تعديل وثيقة',              module: 'documents' },
  { name: 'documents.delete',      label: 'حذف وثيقة',               module: 'documents' },
  { name: 'audit.view',            label: 'عرض سجل العمليات',         module: 'audit' },
  { name: 'activity.view',         label: 'عرض سجل النشاط',           module: 'activity' },
];

module.exports = PERMISSIONS;

/* صلاحيات مستوى الصفحات/المحتوى — المستوى الثالث المعزول
   لأدوار مثل: محرر، صانع محتوى، مشاهد */
const PAGE_PERMISSIONS = [
  // ── صفحات الموقع
  { name: 'pages.view',     label: 'عرض الصفحات',          module: 'sitePages' },
  { name: 'pages.create',   label: 'إنشاء صفحة',           module: 'sitePages' },
  { name: 'pages.update',   label: 'تعديل محتوى صفحة',     module: 'sitePages' },
  { name: 'pages.publish',  label: 'نشر/إلغاء نشر صفحة',   module: 'sitePages' },
  { name: 'pages.delete',   label: 'حذف صفحة',             module: 'sitePages' },
  { name: 'pages.seo',      label: 'تعديل إعدادات SEO',    module: 'sitePages' },

  // ── الوسائط
  { name: 'media.view',     label: 'عرض مكتبة الوسائط',    module: 'contentMedia' },
  { name: 'media.upload',   label: 'رفع وسائط',            module: 'contentMedia' },
  { name: 'media.delete',   label: 'حذف وسائط',            module: 'contentMedia' },
];

module.exports = PAGE_PERMISSIONS;

import { History, Sparkles, Wrench, Zap } from "lucide-react";

const TYPE_META = {
  feature:     { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  fix:         { icon: Wrench,   color: "text-amber-600",   bg: "bg-amber-50" },
  improvement: { icon: Zap,      color: "text-blue-600",    bg: "bg-blue-50" },
};

const VERSIONS = [
  {
    version: "2.4.0",
    date: "2026-05-17",
    title: "منتقي التاريخ العربي وتحسينات الأداء",
    items: [
      { type: "feature",     text: "منتقي تاريخ عربي مخصص في جميع أنحاء لوحة التحكم" },
      { type: "feature",     text: "ربط Cloudinary لعرض المساحة المستخدمة في مكتبة الوسائط" },
      { type: "improvement", text: "تحسين مكتبة الوسائط: بار المساحة وإحصائيات التخزين" },
      { type: "feature",     text: "زر تعديل سريع للمسؤول من صفحات الموقع العامة" },
      { type: "improvement", text: "تقسيم الكود (Code Splitting) لتحميل أسرع للصفحات" },
      { type: "improvement", text: "إعادة تنظيم الإعدادات وإدارة المحتوى" },
      { type: "improvement", text: "تواريخ بمراحل منطقية تبدأ من يونيو ٢٠٢٥" },
    ],
  },
  {
    version: "2.3.0",
    date: "2026-04-01",
    title: "إعادة تصميم تفاصيل المشروع وإصلاحات الحسابات",
    items: [
      { type: "improvement", text: "إزالة صفحة الوحدات من قائمة التنقل العامة" },
      { type: "feature",     text: "نقل عرض الوحدات إلى تفاصيل كل مشروع مع فلترة (متاح/مباعة/محجوز)" },
      { type: "feature",     text: "إضافة ميزة مقارنة الوحدات جنباً إلى جنب في صفحة تفاصيل المشروع" },
      { type: "improvement", text: "إعادة تصميم صفحة تفاصيل المشروع بشكل كامل مع عرض بطولي للصور" },
      { type: "improvement", text: "استبدال حقلي خط العرض/الطول برابط تضمين Google Maps" },
      { type: "feature",     text: "إضافة ميزة إدخال مميزات مخصصة في المشاريع والوحدات" },
      { type: "fix",         text: "إصلاح خطأ 500 عند إضافة جدول حسابي جديد (إضافة أنواع formula وpercentage)" },
      { type: "fix",         text: "إصلاح عرض القائمة المنسدلة (select) في الحسابات مع إمكانية إدخال الخيارات" },
      { type: "fix",         text: "إصلاح حجم الأرقام عند إضافة صف جديد في الجداول" },
      { type: "improvement", text: "تحسين عرض التواريخ بالعربية في جداول الحسابات" },
      { type: "feature",     text: "إضافة Vercel Speed Insights لتتبع أداء الموقع" },
    ],
  },
  {
    version: "2.2.0",
    date: "2026-02-14",
    title: "إصلاحات وتحسينات الموقع العام",
    items: [
      { type: "fix",         text: "إصلاح حفظ صور معرض المشاريع (كانت لا تحفظ بسبب خطأ في اسم الحقل)" },
      { type: "fix",         text: "إصلاح حفظ إحداثيات الخريطة للمشاريع (lat/lng)" },
      { type: "feature",     text: "عرض خريطة Google Maps في صفحة تفاصيل المشروع" },
      { type: "feature",     text: "عرض المميزات والمرافق في صفحة تفاصيل المشروع" },
      { type: "feature",     text: "عرض اسم المطوّر العقاري في بطاقات المشاريع" },
      { type: "feature",     text: "فيديو YouTube في صفحة تفاصيل المشروع" },
      { type: "feature",     text: "زر واتساب في صفحة تفاصيل المشروع" },
      { type: "improvement", text: "إعادة تصميم صفحة المشاريع العامة ببطاقات أجمل" },
      { type: "improvement", text: "بحث تلقائي في المشاريع بدون ضغط Enter" },
      { type: "fix",         text: "إصلاح CMS: بيانات الرئيسية (Hero + Stats) تتحدث فوراً" },
      { type: "fix",         text: "useCms يحتفظ بالبيانات في localStorage لعرض فوري" },
      { type: "feature",     text: "واتساب العملاء: رسالة منسقة تلقائية من صفحة العملاء" },
      { type: "feature",     text: "زر واتساب عائم في جميع صفحات الموقع" },
      { type: "feature",     text: "مقارنة الوحدات للمستخدمين المسجلين في الموقع" },
      { type: "feature",     text: "عرض مساحة Cloudinary المستخدمة في مكتبة الوسائط" },
      { type: "improvement", text: "إعادة تصميم صفحة الوحدات العامة ببطاقات احترافية" },
      { type: "improvement", text: "واجهة المهام موحدة لجميع الأدوار" },
      { type: "fix",         text: "أيقونة وعنوان تاب المتصفح باللغة العربية" },
    ],
  },
  {
    version: "2.1.0",
    date: "2025-12-10",
    title: "تحديث التحسينات الشاملة",
    items: [
      { type: "feature",     text: "واجهة موحدة لجميع الأدوار (مشرف، موظف، مبيعات، حسابات)" },
      { type: "feature",     text: "صلاحيات مفصّلة: كل دور يرى القائمة الخاصة به فقط" },
      { type: "feature",     text: "سجلات محاسبية بالقيد المزدوج (مدين / دائن)" },
      { type: "feature",     text: "أعمدة معادلات في جداول الحسابات (مثال: col1 * col2)" },
      { type: "feature",     text: "لوحة معدلات وتحليل: مجموع، متوسط، أدنى، أقصى لكل عمود" },
      { type: "feature",     text: "صفحة الإشعارات المستقلة مع فلترة وترقيم صفحات" },
      { type: "feature",     text: "طباعة صفوف محددة من جداول الحسابات" },
      { type: "feature",     text: "بحث فوري وملاحظات لكل صف في الجدول" },
      { type: "feature",     text: "استيراد ملفات Excel مع إنشاء جدول تلقائي" },
      { type: "feature",     text: "مرافق وخصائص موسّعة للوحدات (30+ ميزة)" },
      { type: "feature",     text: "مقارنة جانبية لـ 3 وحدات عقارية في آنٍ واحد" },
      { type: "feature",     text: "نوع الإنهاء والجهة للوحدات (تشطيب، إطلالة)" },
      { type: "feature",     text: "حقل 'الدور' للوحدات يقبل حروفاً وأرقاماً (أرضي، الدور الأول، B1)" },
      { type: "feature",     text: "معرض صور متعدد للمشاريع مع إحداثيات الخريطة" },
      { type: "feature",     text: "تاريخ التسليم المتوقع وعرض البطاقات للمشاريع" },
      { type: "feature",     text: "المفضلة في المشاريع والوحدات (يحفظ محلياً)" },
      { type: "feature",     text: "تحديد جماعي وتغيير حالة متعدد الوحدات" },
      { type: "improvement", text: "عرض كانبان للمهام: 3 أعمدة (معلق / جارٍ / مكتمل)" },
      { type: "improvement", text: "شريط تقدم المهام وفلتر الأولوية وزر الإنجاز السريع" },
      { type: "improvement", text: "تحسينات الموبايل في المهام والحسابات" },
      { type: "fix",         text: "حماية أمنية: mongoSanitize، HPP، GZIP، Rate Limiting" },
      { type: "fix",         text: "التحقق من صحة البيانات على مسارات الحسابات" },
      { type: "improvement", text: "شروحات الاستخدام (HelpCard) في كل قسم" },
      { type: "improvement", text: "تنظيم الإعدادات والمحتوى بشكل أوضح" },
    ],
  },
  {
    version: "2.0.0",
    date: "2025-10-01",
    title: "نظام الحسابات والمهام — المرحلة الثانية",
    items: [
      { type: "feature",     text: "نظام الحسابات المتكامل (دفاتر، جداول، صفوف)" },
      { type: "feature",     text: "استيراد ملفات Excel" },
      { type: "feature",     text: "طباعة صفوف محددة من الجداول" },
      { type: "feature",     text: "سجل التدقيق للعمليات المحاسبية" },
      { type: "feature",     text: "إشعارات المهام مع جرس التنبيه" },
      { type: "feature",     text: "واجهة المبيعات (مشاريع، وحدات، عملاء، مقالات)" },
      { type: "improvement", text: "تحسينات عرض المحتوى وإدارته" },
      { type: "feature",     text: "أقسام صفحة الخدمات" },
      { type: "feature",     text: "شعار قابل للتغيير من لوحة الإدارة" },
      { type: "improvement", text: "فصل المهام حسب القسم والدور" },
    ],
  },
  {
    version: "1.5.0",
    date: "2025-08-20",
    title: "تطوير المحتوى والإدارة",
    items: [
      { type: "feature",     text: "قسم إدارة المحتوى" },
      { type: "feature",     text: "صفحة الوظائف" },
      { type: "feature",     text: "نظام الإشعارات" },
      { type: "feature",     text: "لوحة التحكم مع الإحصائيات" },
      { type: "feature",     text: "صفحات الوحدات والمشاريع" },
    ],
  },
  {
    version: "1.1.0",
    date: "2025-07-15",
    title: "تحسينات ما بعد الإطلاق",
    items: [
      { type: "improvement", text: "تحسين أداء تحميل الصور" },
      { type: "fix",         text: "إصلاح مشكلة تسجيل الدخول على الأجهزة المحمولة" },
      { type: "feature",     text: "إضافة نظام الأدوار والصلاحيات" },
      { type: "improvement", text: "تحسين تجربة المستخدم في لوحة التحكم" },
    ],
  },
  {
    version: "1.0.0",
    date: "2025-06-01",
    title: "إطلاق المشروع — المرحلة الأولى",
    items: [
      { type: "feature", text: "إطلاق الموقع الأول" },
      { type: "feature", text: "نظام تسجيل الدخول" },
      { type: "feature", text: "إدارة المشاريع" },
      { type: "feature", text: "المدونة والأخبار" },
    ],
  },
];

export default function AdminChangelog() {
  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#2d5d89] flex items-center justify-center">
          <History className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">سجل التحديثات</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ التحسينات والميزات الجديدة في النظام</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute right-5 top-2 bottom-2 w-px bg-gradient-to-b from-[#2d5d89] via-[#2d5d89]/40 to-transparent" />

        <div className="space-y-8">
          {VERSIONS.map((v, i) => (
            <div key={v.version} className="relative pr-14">
              {/* Dot */}
              <div className={`absolute right-2 top-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-900 ${
                i === 0 ? "bg-[#2d5d89]" : "bg-gray-300 dark:bg-gray-600"
              }`}>
                <span className="text-white text-[10px] font-bold">{VERSIONS.length - i}</span>
              </div>

              {/* Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-bold text-[#2d5d89]">الإصدار {v.version}</h2>
                  {i === 0 && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">الأحدث</span>
                  )}
                  <span className="text-xs text-gray-400 mr-auto">{v.date}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{v.title}</p>

                <ul className="space-y-2">
                  {v.items.map((item, idx) => {
                    const meta = TYPE_META[item.type] || TYPE_META.improvement;
                    const MetaIcon = meta.icon;
                    return (
                      <li key={idx} className="flex items-start gap-3 group">
                        <span className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${meta.bg} ${meta.color}`}>
                          <MetaIcon className="w-4 h-4" />
                        </span>
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{item.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4">
        الصرح للتطوير العقاري © 2026
      </div>
    </div>
  );
}

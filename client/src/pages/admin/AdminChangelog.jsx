import { History, Sparkles, Wrench, Zap } from "lucide-react";

const TYPE_META = {
  feature:     { icon: Sparkles, color: "text-emerald-600", bg: "bg-emerald-50" },
  fix:         { icon: Wrench,   color: "text-amber-600",   bg: "bg-amber-50" },
  improvement: { icon: Zap,      color: "text-blue-600",    bg: "bg-blue-50" },
};

const VERSIONS = [
  {
    version: "2.0.0",
    date: "2026-05-16",
    title: "تحديث شامل",
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
    date: "2026-03-10",
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
    version: "1.0.0",
    date: "2026-01-15",
    title: "الإطلاق الأول",
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

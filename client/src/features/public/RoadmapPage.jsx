import React from 'react';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { FaCircleCheck, FaCircleHalfStroke, FaClock } from 'react-icons/fa6';

const PRIMARY = '#c8161d';
const ACCENT  = '#fbb140';

const STATUS = {
  done:        { icon: FaCircleCheck, color: '#16a34a', bg: '#dcfce7', label: 'مكتمل' },
  in_progress: { icon: FaCircleHalfStroke, color: '#d97706', bg: '#fef3c7', label: 'قيد التطوير' },
  planned:     { icon: FaClock, color: '#6b7280', bg: '#f3f4f6', label: 'مخطط' },
};

const quarters = [
  {
    period: 'Q1 2026',
    label: 'مكتمل',
    items: [
      { status: 'done', title: 'نظام Multi-Tenant SaaS', desc: 'عزل تام للبيانات بين الشركات' },
      { status: 'done', title: 'RBAC ديناميكي', desc: 'أدوار وصلاحيات مخصصة' },
      { status: 'done', title: 'Dashboard متقدم', desc: '7 KPIs وچارتات ApexCharts' },
      { status: 'done', title: 'Chat + Notifications', desc: 'Real-time بـ Socket.IO' },
    ],
  },
  {
    period: 'Q2 2026',
    label: 'الربع الحالي',
    highlight: true,
    items: [
      { status: 'done', title: 'نظام CMS للمحتوى', desc: 'تعديل الصفحة التسويقية من لوحة التحكم' },
      { status: 'done', title: 'إدارة المدونة', desc: 'مقالات مع SEO كامل' },
      { status: 'in_progress', title: 'تصدير PDF/Excel', desc: 'فواتير وعقود وتقارير' },
      { status: 'in_progress', title: 'WhatsApp Integration', desc: 'تذكير الأقساط عبر واتساب' },
    ],
  },
  {
    period: 'Q3 2026',
    label: 'قادم',
    items: [
      { status: 'planned', title: 'تطبيق موبايل', desc: 'iOS + Android للمبيعات والإدارة' },
      { status: 'planned', title: 'AI تحليل السوق', desc: 'توقع أسعار وتحليل الطلب' },
      { status: 'planned', title: 'بوابة العملاء', desc: 'بوابة ويب للعملاء لتتبع أقساطهم' },
      { status: 'planned', title: 'تكامل Stripe/Fawry', desc: 'دفع الأقساط أونلاين' },
    ],
  },
  {
    period: 'Q4 2026',
    label: 'مستقبلي',
    items: [
      { status: 'planned', title: 'تكامل أنظمة حكومية', desc: 'ربط مع الشهر العقاري والضرائب' },
      { status: 'planned', title: 'Marketplace العقارات', desc: 'نشر الوحدات المتاحة للعموم' },
      { status: 'planned', title: 'Zapier / Make Integration', desc: 'ربط مع أدوات الأتمتة' },
      { status: 'planned', title: 'Multi-language', desc: 'دعم الإنجليزية والفرنسية' },
    ],
  },
];

const RoadmapPage = () => (
  <PublicLayout>
    <PageHero title="خريطة الطريق" subtitle="شفافية كاملة في ما نبنيه — ملاحظاتكم تشكّل هذه الخارطة" />

    {/* Legend */}
    <div className="max-w-5xl mx-auto px-5 pt-10 flex flex-wrap gap-4 justify-center">
      {Object.entries(STATUS).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
          style={{ background: v.bg, color: v.color }}>
          <v.icon className="text-xs" />{v.label}
        </div>
      ))}
    </div>

    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quarters.map((q, i) => (
          <div key={i}
            className={`rounded-2xl overflow-hidden ${q.highlight ? 'ring-2 shadow-md' : 'border border-gray-100'}`}
            style={q.highlight ? { ringColor: PRIMARY } : {}}>
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ background: q.highlight ? PRIMARY : '#f9f5f0' }}>
              <div>
                <p className={`font-black text-lg ${q.highlight ? 'text-white' : ''}`}>{q.period}</p>
                <p className={`text-xs ${q.highlight ? 'text-white/70' : 'text-gray-400'}`}>{q.label}</p>
              </div>
              {q.highlight && (
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: ACCENT + '30', color: ACCENT }}>الآن</span>
              )}
            </div>
            <div className="bg-white p-4 space-y-3">
              {q.items.map((item, j) => {
                const s = STATUS[item.status];
                return (
                  <div key={j} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <s.icon className="text-base flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center rounded-2xl p-8 border border-dashed border-gray-200">
        <p className="font-bold text-lg mb-2">لديك اقتراح؟</p>
        <p className="text-sm text-gray-500 mb-4">نريد أن نسمعك — اقتراحاتك تؤثر مباشرة في أولوياتنا</p>
        <a href="/contact"
          className="inline-block px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: PRIMARY }}>
          شاركنا اقتراحك
        </a>
      </div>
    </div>
  </PublicLayout>
);

export default RoadmapPage;

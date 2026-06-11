import React from 'react';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { FaRocket, FaWrench, FaBug, FaStar } from 'react-icons/fa6';

const PRIMARY = '#c8161d';
const ACCENT  = '#fbb140';

const TYPE_CONFIG = {
  new:      { label: 'جديد',     color: '#16a34a', bg: '#dcfce7', icon: FaRocket },
  improved: { label: 'تحسين',    color: '#1a56db', bg: '#dbeafe', icon: FaStar },
  fix:      { label: 'إصلاح',    color: '#9333ea', bg: '#f3e8ff', icon: FaBug },
  breaking: { label: 'تغيير جوهري', color: '#dc2626', bg: '#fee2e2', icon: FaWrench },
};

const releases = [
  {
    version: '2.4.0',
    date: 'يونيو 2026',
    highlight: 'نظام CMS + إدارة المدونة',
    changes: [
      { type: 'new', text: 'محرر الصفحة التسويقية — تحكم كامل في محتوى landing page' },
      { type: 'new', text: 'نظام مقالات ومدونة متكامل مع SEO' },
      { type: 'new', text: 'صفحات عامة: المميزات، الأسعار، من نحن، الوظائف، تواصل' },
      { type: 'improved', text: 'إعادة تصميم صفحة الباقات بـ gradient cards وتفعيل/تعطيل فوري' },
      { type: 'improved', text: 'تصدير PDF محسّن للفواتير والعقود مع توقيع' },
    ],
  },
  {
    version: '2.3.0',
    date: 'مايو 2026',
    highlight: 'صفحة الأقساط + Dashboard محسّن',
    changes: [
      { type: 'new', text: 'صفحة الأقساط — تتبع كامل لجميع الأقساط مع فلاتر الحالة' },
      { type: 'new', text: 'Dashboard جديد مع 7 KPIs وچارتات تفاعلية' },
      { type: 'new', text: 'صفحة تفاصيل المشروع مع grid الوحدات' },
      { type: 'new', text: 'ملف العميل الكامل مع تاريخ العقود والفواتير' },
      { type: 'improved', text: 'تسريع 40% في أداء الـ queries' },
    ],
  },
  {
    version: '2.2.0',
    date: 'أبريل 2026',
    highlight: 'Chat + إشعارات real-time',
    changes: [
      { type: 'new', text: 'نظام رسائل داخلية Socket.IO' },
      { type: 'new', text: 'مركز إشعارات شامل' },
      { type: 'new', text: 'Command Palette بـ Ctrl+K' },
      { type: 'improved', text: 'Sidebar جديد بتصميم premium' },
      { type: 'fix', text: 'إصلاح مشكلة عزل بيانات المستأجرين' },
    ],
  },
  {
    version: '2.1.0',
    date: 'مارس 2026',
    highlight: 'Landing Page + الباقات',
    changes: [
      { type: 'new', text: 'الصفحة التسويقية الرئيسية' },
      { type: 'new', text: 'نظام خطط الاشتراك' },
      { type: 'improved', text: 'تحسين تجربة تسجيل الدخول' },
      { type: 'fix', text: 'إصلاح 12 خطأ في صفحة التقارير' },
    ],
  },
  {
    version: '2.0.0',
    date: 'فبراير 2026',
    highlight: 'إعادة بناء كاملة بـ React + Node.js',
    changes: [
      { type: 'new', text: 'معمارية Multi-Tenant SaaS جديدة' },
      { type: 'new', text: 'نظام RBAC ديناميكي' },
      { type: 'new', text: 'Theme Builder متكامل' },
      { type: 'breaking', text: 'API v2 — تغييرات جوهرية في endpoints (راجع docs)' },
    ],
  },
];

const ChangelogPage = () => (
  <PublicLayout>
    <PageHero title="سجل التحديثات" subtitle="كل ما هو جديد في EgyEstate — نحدّث بانتظام بناءً على ملاحظاتكم" />

    <div className="max-w-3xl mx-auto px-5 py-16">
      <div className="space-y-10">
        {releases.map((release, i) => (
          <div key={i} className="relative">
            {/* Version badge */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-xs font-black px-3 py-1.5 rounded-full text-white"
                style={{ background: PRIMARY }}>
                v{release.version}
              </span>
              <span className="text-sm text-gray-400">{release.date}</span>
              {i === 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>الأحدث</span>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50"
                style={{ background: '#f9fafb' }}>
                <h3 className="font-bold">{release.highlight}</h3>
              </div>
              <div className="p-5 space-y-3">
                {release.changes.map((change, j) => {
                  const cfg = TYPE_CONFIG[change.type];
                  return (
                    <div key={j} className="flex items-start gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <p className="text-sm text-gray-700">{change.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </PublicLayout>
);

export default ChangelogPage;

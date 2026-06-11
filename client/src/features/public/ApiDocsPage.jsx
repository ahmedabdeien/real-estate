import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaKey, FaLock, FaCircleCheck } from 'react-icons/fa6';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';

const P = '#c8161d';
const A = '#fbb140';

const ENDPOINTS = [
  { method: 'GET',    path: '/api/properties',         desc: 'جلب قائمة المشاريع العقارية' },
  { method: 'POST',   path: '/api/properties',         desc: 'إنشاء مشروع جديد' },
  { method: 'GET',    path: '/api/properties/:id',     desc: 'جلب تفاصيل مشروع محدد' },
  { method: 'PUT',    path: '/api/properties/:id',     desc: 'تحديث بيانات مشروع' },
  { method: 'DELETE', path: '/api/properties/:id',     desc: 'حذف مشروع' },
  { method: 'GET',    path: '/api/units',              desc: 'جلب الوحدات العقارية' },
  { method: 'POST',   path: '/api/units',              desc: 'إضافة وحدة جديدة' },
  { method: 'GET',    path: '/api/customers',          desc: 'جلب قائمة العملاء' },
  { method: 'POST',   path: '/api/customers',          desc: 'إضافة عميل جديد' },
  { method: 'GET',    path: '/api/contracts',          desc: 'جلب العقود' },
  { method: 'POST',   path: '/api/contracts',          desc: 'إنشاء عقد جديد' },
  { method: 'GET',    path: '/api/payments',           desc: 'جلب المدفوعات' },
  { method: 'POST',   path: '/api/payments',           desc: 'تسجيل دفعة جديدة' },
  { method: 'GET',    path: '/api/reports/installments', desc: 'تقرير الأقساط' },
  { method: 'GET',    path: '/api/reports/revenue',    desc: 'تقرير الإيرادات' },
];

const METHOD_COLORS = {
  GET:    { bg: '#dbeafe', text: '#1d4ed8' },
  POST:   { bg: '#dcfce7', text: '#15803d' },
  PUT:    { bg: '#fef9c3', text: '#a16207' },
  DELETE: { bg: '#fee2e2', text: '#dc2626' },
};

const CODE_AUTH = `// تضمين التوكن في كل طلب
const response = await fetch('https://api.egyestate.com/api/properties', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json',
  }
});
const data = await response.json();`;

const CODE_EXAMPLE = `// مثال: إنشاء مشروع جديد
const newProject = await fetch('https://api.egyestate.com/api/properties', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'برج النيل',
    location: 'القاهرة الجديدة',
    totalUnits: 120,
    type: 'residential',
  })
});
const { data } = await newProject.json();
console.log(data._id); // ID المشروع الجديد`;

export default function ApiDocsPage() {
  const [tab, setTab] = useState('overview');

  return (
    <PublicLayout>
      <PageHero tag="للمطورين" title="API Documentation" subtitle="الإصدار 1.0 — REST API — ابدأ بالتكامل خلال دقائق" breadcrumb={[{ label: 'API Docs' }]} />
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mt-6">
            {[['overview', 'نظرة عامة'], ['endpoints', 'النقاط الطرفية'], ['examples', 'أمثلة']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10">
        {tab === 'overview' && (
          <div className="space-y-8 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <FaKey className="text-base" style={{ color: A }} />
                المصادقة
              </h2>
              <p className="text-gray-600 text-sm leading-[2] mb-5">
                تستخدم EgyEstate API مصادقة JWT Token. أنشئ توكن API من لوحة الإعدادات تحت "المطورون".
                يُضاف التوكن في header كل طلب:
              </p>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto font-mono leading-[1.8]" dir="ltr">
                {CODE_AUTH}
              </pre>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                <FaLock className="text-base" style={{ color: P }} />
                Base URL
              </h2>
              <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm" dir="ltr">
                https://laudable-enthusiasm-production-de7c.up.railway.app
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-black text-gray-900 mb-4">صيغة الاستجابة</h2>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto font-mono leading-[1.8]" dir="ltr">
{`// نجاح
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 150 }
}

// خطأ
{
  "success": false,
  "message": "رسالة الخطأ بالعربي"
}`}
              </pre>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-black text-gray-900 mb-4">حدود الطلبات (Rate Limiting)</h2>
              <div className="space-y-3">
                {[
                  { plan: 'Starter', limit: '100 طلب/دقيقة' },
                  { plan: 'Pro',     limit: '500 طلب/دقيقة' },
                  { plan: 'Enterprise', limit: 'غير محدود' },
                ].map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="font-bold text-sm text-gray-900">{r.plan}</span>
                    <span className="text-sm text-gray-500">{r.limit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'endpoints' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-black text-gray-900">النقاط الطرفية المتاحة</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {ENDPOINTS.map((ep, i) => {
                const mc = METHOD_COLORS[ep.method];
                return (
                  <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg w-16 text-center flex-shrink-0"
                      style={{ background: mc.bg, color: mc.text }}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 flex-1" dir="ltr">{ep.path}</code>
                    <span className="text-sm text-gray-500 hidden md:block">{ep.desc}</span>
                    <FaCircleCheck className="text-green-500 text-sm flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'examples' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <h2 className="text-lg font-black text-gray-900 mb-4">مثال كامل</h2>
              <pre className="bg-gray-900 text-green-400 rounded-xl p-5 text-xs overflow-x-auto font-mono leading-[1.8]" dir="ltr">
                {CODE_EXAMPLE}
              </pre>
            </div>

            <div className="p-6 rounded-2xl border text-center" style={{ background: `${P}08`, borderColor: `${P}15` }}>
              <p className="text-sm text-gray-600 mb-3">تحتاج مساعدة في التكامل؟</p>
              <a href="mailto:dev@egyestate.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm"
                style={{ background: P }}>
                تواصل مع فريق المطورين
              </a>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

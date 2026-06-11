import React, { useState } from 'react';
import CmsPage from '../../components/cms/CmsPage';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { Link } from 'react-router-dom';
import { FaCircleCheck, FaXmark, FaCrown, FaRocket, FaStar, FaArrowLeft } from 'react-icons/fa6';

const PRIMARY = '#c8161d';
const ACCENT  = '#fbb140';
const GREEN   = '#009756';

const PLANS = [
  {
    key: 'starter',
    nameAr: 'المبتدئ',
    price: { monthly: 299, yearly: 249 },
    desc: 'مثالي للشركات الصغيرة والناشئة',
    color: '#1a56db',
    icon: FaStar,
    limits: '3 مستخدمين · 2 مشاريع · 50 وحدة',
    features: [
      { text: 'حتى 3 مستخدمين',           ok: true },
      { text: 'حتى 2 مشروع عقاري',        ok: true },
      { text: 'حتى 50 وحدة',              ok: true },
      { text: 'إدارة العقود والأقساط',     ok: true },
      { text: 'المهام والتنبيهات',          ok: true },
      { text: 'دعم بالبريد الإلكتروني',    ok: true },
      { text: 'المحاسبة والفواتير',         ok: false },
      { text: 'تقارير متقدمة + تصدير',     ok: false },
      { text: 'واتساب وإشعارات ذكية',      ok: false },
      { text: 'تخصيص المظهر والموقع',      ok: false },
      { text: 'API Access',               ok: false },
      { text: 'مدير حساب مخصص',           ok: false },
    ],
  },
  {
    key: 'professional',
    nameAr: 'الاحترافي',
    price: { monthly: 699, yearly: 579 },
    desc: 'للشركات المتوسطة في مرحلة النمو',
    color: PRIMARY,
    icon: FaRocket,
    featured: true,
    limits: '15 مستخدم · 10 مشاريع · 500 وحدة',
    features: [
      { text: 'حتى 15 مستخدم',            ok: true },
      { text: 'حتى 10 مشاريع عقارية',     ok: true },
      { text: 'حتى 500 وحدة',             ok: true },
      { text: 'إدارة العقود والأقساط',     ok: true },
      { text: 'المهام والتنبيهات',          ok: true },
      { text: 'دعم أولوية 24/7',           ok: true },
      { text: 'المحاسبة والفواتير',         ok: true },
      { text: 'تقارير متقدمة + تصدير',     ok: true },
      { text: 'واتساب وإشعارات ذكية',      ok: true },
      { text: 'تخصيص المظهر والموقع',      ok: true },
      { text: 'API Access',               ok: true },
      { text: 'مدير حساب مخصص',           ok: false },
    ],
  },
  {
    key: 'enterprise',
    nameAr: 'المؤسسات',
    price: { monthly: 1499, yearly: 1249 },
    desc: 'للشركات الكبيرة وسلاسل العقارات',
    color: GREEN,
    icon: FaCrown,
    limits: 'غير محدود',
    features: [
      { text: 'مستخدمون غير محدودين',      ok: true },
      { text: 'مشاريع غير محدودة',         ok: true },
      { text: 'وحدات غير محدودة',          ok: true },
      { text: 'إدارة العقود والأقساط',     ok: true },
      { text: 'المهام والتنبيهات',          ok: true },
      { text: 'دعم أولوية 24/7',           ok: true },
      { text: 'المحاسبة + المستودعات',      ok: true },
      { text: 'تقارير متقدمة + تصدير',     ok: true },
      { text: 'واتساب وإشعارات ذكية',      ok: true },
      { text: 'تخصيص المظهر والموقع',      ok: true },
      { text: 'API Access + Webhooks',    ok: true },
      { text: 'مدير حساب مخصص',           ok: true },
    ],
  },
];

const FAQ = [
  { q: 'هل يمكنني تغيير خطتي في أي وقت؟',         a: 'نعم، يمكنك الترقية أو التخفيض في أي وقت وسيتم احتساب الفارق تلقائياً.' },
  { q: 'ما وسائل الدفع المتاحة؟',                   a: 'نقبل جميع البطاقات الائتمانية والدبت، والتحويل البنكي للخطط السنوية.' },
  { q: 'هل يوجد عقد إلزامي؟',                       a: 'لا، جميع خططنا شهرية أو سنوية دون أي التزامات طويلة الأمد.' },
  { q: 'ماذا يحدث لبياناتي إذا ألغيت اشتراكي؟',    a: 'بياناتك محفوظة لمدة 30 يوماً بعد الإلغاء ويمكنك تصديرها كاملاً.' },
  { q: 'هل الباقة التجريبية مجانية بالكامل؟',        a: '14 يوماً مجاناً بدون بطاقة ائتمان. بعدها تختار الباقة المناسبة أو توقف الحساب.' },
];

const StaticPricingContent = () => {
  const [yearly, setYearly] = useState(false);

  return (
    <PublicLayout>
      <PageHero tag="الأسعار والباقات" title="باقة تناسب كل شركة" subtitle="ابدأ مجاناً لمدة 14 يوماً — لا تحتاج بطاقة ائتمان" />

      {/* Toggle */}
      <div className="flex justify-center pt-8 pb-2 px-4 bg-white">
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-semibold ${!yearly ? 'text-gray-800' : 'text-gray-400'}`}>شهري</span>
          <button onClick={() => setYearly(!yearly)}
            className="w-12 h-6 rounded-full relative transition-colors"
            style={{ background: yearly ? ACCENT : '#d1d5db' }}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${yearly ? 'right-0.5' : 'left-0.5'}`} />
          </button>
          <span className={`text-sm font-semibold ${yearly ? 'text-gray-800' : 'text-gray-400'}`}>
            سنوي
            <span className="text-xs px-1.5 py-0.5 rounded-full mr-1.5 font-bold"
              style={{ background: '#dcfce7', color: '#15803d' }}>
              وفّر 17%
            </span>
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-5 -mt-6 pb-16 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.key}
                className={`rounded-2xl overflow-hidden bg-white transition-all ${
                  plan.featured
                    ? 'ring-2 shadow-2xl scale-[1.03]'
                    : 'border border-gray-100 shadow-sm hover:shadow-md'
                }`}
                style={plan.featured ? { '--tw-ring-color': plan.color, boxShadow: `0 20px 60px ${plan.color}25` } : {}}>

                {plan.featured && (
                  <div className="text-center py-2 text-xs font-bold text-white"
                    style={{ background: plan.color }}>
                    ⭐ الأكثر شيوعاً
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                      style={{ background: plan.color }}>
                      <Icon className="text-sm" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg">{plan.nameAr}</h3>
                      <p className="text-xs text-gray-400">{plan.limits}</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-4">{plan.desc}</p>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black" style={{ color: plan.color }}>
                        {(yearly ? plan.price.yearly : plan.price.monthly).toLocaleString('en-US')}
                      </span>
                      <span className="text-sm text-gray-400">ج.م / شهر</span>
                    </div>
                    {yearly && (
                      <p className="text-xs mt-1" style={{ color: GREEN }}>
                        يُدفع {(plan.price.yearly * 12).toLocaleString('en-US')} ج.م سنوياً
                      </p>
                    )}
                  </div>

                  <Link to="/login"
                    className="block text-center py-3 rounded-xl font-bold text-sm transition-all mb-5 hover:opacity-90"
                    style={plan.featured
                      ? { background: plan.color, color: '#fff', boxShadow: `0 4px 15px ${plan.color}40` }
                      : { background: '#f3f4f6', color: '#1f2937' }}>
                    ابدأ مجاناً
                    {plan.featured && <FaArrowLeft className="inline-block mr-2 text-xs" />}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        {f.ok
                          ? <FaCircleCheck className="text-xs flex-shrink-0" style={{ color: plan.color }} />
                          : <FaXmark className="text-gray-300 text-xs flex-shrink-0" />}
                        <span className={f.ok ? 'text-gray-700' : 'text-gray-300'}>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom plan banner */}
        <div className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: '#231f20', border: '1px solid rgba(218,31,39,0.2)' }}>
          <p className="font-black text-white text-lg mb-1">تحتاج خطة مخصصة؟</p>
          <p className="text-sm text-white/50 mb-4">للمجمعات العقارية الكبيرة والمطورين المؤسسيين — نبني معك خطة على مقاسك</p>
          <Link to="/contact"
            className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
            style={{ background: PRIMARY }}>
            تواصل مع فريق المبيعات
            <FaArrowLeft className="text-xs" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-5 pb-20">
        <h2 className="text-2xl font-black text-center mb-8">أسئلة شائعة</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-gray-200 transition-colors">
              <p className="font-semibold mb-2 text-gray-800">{item.q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

const PricingPage = () => (
  <CmsPage pageKey="pricing" fallback={<StaticPricingContent />} />
);

export default PricingPage;

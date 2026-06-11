import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaCheck, FaCity, FaFileContract, FaMoneyBillWave,
  FaChartLine, FaUsers, FaBell, FaShield, FaComments,
  FaUserPlus, FaBuildingUser, FaFileSignature, FaRocket,
} from 'react-icons/fa6';
import PublicLayout from '../public/PublicLayout';

const RED    = '#da1f27';
const GREEN  = '#009756';
const YELLOW = '#fbb140';
const DARK   = '#231f20';
const BARS   = [RED, GREEN, YELLOW, DARK];

/* ── Counter ── */
function Counter({ to, suffix = '', prefix = '', plain = false }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = Math.max(1, Math.ceil(to / 50));
    const t = setInterval(() => {
      n += step;
      if (n >= to) { setVal(to); clearInterval(t); } else setVal(n);
    }, 20);
    return () => clearInterval(t);
  }, [to]);
  return <span ref={ref}>{prefix}{plain ? val : val.toLocaleString('en-US')}{suffix}</span>;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

/* ─── 1. HERO ─── */
const Hero = () => (
  <section className="bg-white">
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

      {/* Copy */}
      <motion.div {...fadeUp}>
        <h1 className="text-4xl md:text-5xl font-black leading-[1.25]" style={{ color: DARK }}>
          أدر شركتك <span style={{ color: RED }}>العقارية</span>
          <br />بكفاءة استثنائية
        </h1>
        <p className="mt-5 text-base md:text-lg leading-relaxed text-gray-500 max-w-lg">
          منصة متكاملة تجمع المشاريع والعقود والأقساط والمحاسبة في مكان واحد — بدلاً من جداول Excel ومحادثات واتساب المتفرقة.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login"
            className="flex items-center gap-2 px-7 py-3.5 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: GREEN }}>
            ابدأ مجاناً — 14 يوم
            <FaArrowLeft className="text-xs" />
          </Link>
          <a href="mailto:hello@egyestate.com"
            className="px-7 py-3.5 rounded-lg font-bold text-sm transition-colors"
            style={{ border: `2px solid ${YELLOW}`, color: '#b8860b' }}>
            تواصل مع فريق المبيعات
          </a>
        </div>
      </motion.div>

      {/* Browser mockup with bar chart */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}>
        <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #ededed', boxShadow: '0 20px 50px rgba(35,31,32,0.10)' }}>
          {/* Browser top bar */}
          <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: '#dedede' }} />
            ))}
          </div>
          {/* Chart */}
          <div className="px-10 py-10">
            <div className="flex items-end justify-center gap-3 h-48">
              {[55, 80, 65, 95, 45, 75, 60, 90, 70].map((h, i) => (
                <motion.div key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.07 }}
                  className="w-8 rounded-t-md"
                  style={{ background: BARS[i % 4] }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/* ─── 2. STATS — red strip with white cards ─── */
const STATS = [
  { value: 30,    prefix: '+', label: 'شركة عقارية' },
  { value: 12400, prefix: '+', label: 'وحدة مدارة' },
  { value: 99,    suffix: '%', label: 'وقت التشغيل' },
  { value: 2023,  label: 'سنة التأسيس', plain: true },
];

const Stats = () => (
  <section id="stats" style={{ background: RED }}>
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }}
            className="bg-white rounded-xl py-7 px-4 text-center">
            <p className="text-3xl md:text-4xl font-black" style={{ color: RED }}>
              <Counter to={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} plain={s.plain} />
            </p>
            <p className="text-sm text-gray-500 font-medium mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── 3. FEATURES — 8 cards with icons ─── */
const FEATURES = [
  { icon: FaCity,          title: 'إدارة المشاريع',   desc: 'تابع مشاريعك ووحداتك ونسب الإنجاز من شاشة واحدة.',        color: RED },
  { icon: FaFileContract,  title: 'العقود والأقساط',  desc: 'عقود رقمية وجداول أقساط تُنشأ تلقائيًا.',                  color: GREEN },
  { icon: FaMoneyBillWave, title: 'المحاسبة المالية', desc: 'فواتير ومدفوعات ومصروفات بدون جداول خارجية.',             color: YELLOW },
  { icon: FaChartLine,     title: 'تقارير ذكية',      desc: 'لوحات تحكم ورسوم بيانية تلخص أداء شركتك لحظيًا.',          color: DARK },
  { icon: FaUsers,         title: 'إدارة العملاء',    desc: 'ملف كامل لكل عميل بتعاملاته ومدفوعاته.',                   color: GREEN },
  { icon: FaShield,        title: 'صلاحيات دقيقة',    desc: 'أدوار مخصصة تتحكم في وصول كل موظف.',                       color: RED },
  { icon: FaComments,      title: 'رسائل داخلية',     desc: 'تواصل فريقك داخل المنصة بدون تطبيقات خارجية.',             color: DARK },
  { icon: FaBell,          title: 'تنبيهات تلقائية',  desc: 'تذكير بالأقساط المستحقة والعقود المنتهية.',                color: YELLOW },
];

const Features = () => (
  <section id="features" style={{ background: '#fafafc' }}>
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black" style={{ color: GREEN }}>
          كل ما تحتاجه في منصة واحدة
        </h2>
        <p className="text-gray-500 mt-3">بُنيت EgyEstate لتحل محل كل الأدوات المتفرقة.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: (i % 4) * 0.07 }}
              className="bg-white rounded-xl p-6 transition-shadow hover:shadow-md"
              style={{ border: '1px solid #f0f0f0' }}>
              <div className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${f.color}14` }}>
                <Icon className="text-lg" style={{ color: f.color }} />
              </div>
              <h3 className="font-bold text-[15px] mb-1.5" style={{ color: DARK }}>{f.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ─── 4. HOW — 4 colored steps timeline ─── */
const STEPS = [
  { icon: FaUserPlus,      color: RED,    title: 'سجّل شركتك',  desc: 'أنشئ حسابك في أقل من دقيقتين بدون بطاقة ائتمان.' },
  { icon: FaBuildingUser,  color: YELLOW, title: 'أضف مشاريعك', desc: 'ارفع مشاريعك ووحداتك وعملاءك بسهولة.' },
  { icon: FaFileSignature, color: GREEN,  title: 'حرّر العقود', desc: 'عقود وأقساط تُنشأ وتُتابع تلقائيًا.' },
  { icon: FaRocket,        color: DARK,   title: 'راقب وانطلق', desc: 'تقارير لحظية تساعدك على اتخاذ القرار.' },
];

const How = () => (
  <section id="how" className="bg-white">
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-20">
      <motion.div {...fadeUp} className="text-center mb-14">
        <span className="inline-block text-xs font-bold text-white px-4 py-1.5 rounded-full mb-4" style={{ background: GREEN }}>
          كيف يعمل؟
        </span>
        <h2 className="text-3xl md:text-4xl font-black" style={{ color: DARK }}>
          4 خطوات وأنت جاهز
        </h2>
      </motion.div>

      <div className="relative">
        {/* connecting line */}
        <div className="hidden lg:block absolute top-7 inset-x-16 h-px" style={{ background: '#e5e5e5' }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.1 }}
                className="text-center relative">
                <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center relative z-10"
                  style={{ background: s.color }}>
                  <Icon className="text-xl text-white" />
                </div>
                <p className="text-[11px] font-bold mt-3 mb-1" style={{ color: s.color }}>الخطوة {i + 1}</p>
                <h3 className="font-bold text-[15px] mb-1.5" style={{ color: DARK }}>{s.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed max-w-[220px] mx-auto">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);

/* ─── 5. PRICING — 3 cards with dark header strip ─── */
const PLANS = [
  {
    name: 'المبتدئ', nameEn: 'Starter', price: 299,
    features: ['3 مستخدمين', '2 مشروع', '50 وحدة', 'عقود وأقساط', 'دعم بالإيميل'],
    btnColor: RED, featured: false,
  },
  {
    name: 'الاحترافي', nameEn: 'Pro', price: 599,
    features: ['10 مستخدمين', 'مشاريع غير محدودة', '500 وحدة', 'تقارير متقدمة', 'دعم أولوية'],
    btnColor: RED, featured: true,
  },
  {
    name: 'المؤسسات', nameEn: 'Enterprise', price: 999,
    features: ['مستخدمون غير محدودين', 'كل شيء غير محدود', 'رسائل داخلية', 'مدير حساب مخصص', 'تدريب للفريق'],
    btnColor: DARK, featured: false,
  },
];

const Pricing = () => (
  <section id="pricing" style={{ background: '#fafafc' }}>
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-20">
      <motion.div {...fadeUp} className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-black" style={{ color: DARK }}>باقات تناسب الجميع</h2>
        <p className="text-gray-500 mt-3">ابدأ مجانًا وارفع باقتك مع نمو أعمالك.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {PLANS.map((p, i) => (
          <motion.div key={i} {...fadeUp} transition={{ duration: 0.45, delay: i * 0.08 }}
            className="bg-white rounded-2xl overflow-hidden relative"
            style={{
              border: p.featured ? `2px solid ${YELLOW}` : '1px solid #ededed',
              boxShadow: p.featured ? '0 12px 32px rgba(251,177,64,0.18)' : 'none',
            }}>
            {p.featured && (
              <span className="absolute top-4 left-4 text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ background: YELLOW, color: DARK }}>
                الأكثر اختياراً
              </span>
            )}
            {/* Dark header strip */}
            <div className="px-6 py-4" style={{ background: DARK }}>
              <p className="text-white font-bold text-sm">{p.name}</p>
              <p className="text-white/40 text-[11px] mt-0.5">{p.nameEn}</p>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-4xl font-black" style={{ color: DARK }}>{p.price.toLocaleString('en-US')}</span>
                <span className="text-sm text-gray-400">ج.م/شهر</span>
              </div>
              <ul className="space-y-3 mb-6">
                {p.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <FaCheck className="text-xs flex-shrink-0" style={{ color: GREEN }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login"
                className="block text-center py-3 rounded-lg text-white font-bold text-sm transition-opacity hover:opacity-90"
                style={{ background: p.btnColor }}>
                ابدأ مجاناً
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── PAGE ─── */
const LandingPage = () => (
  <PublicLayout>
    <Hero />
    <Stats />
    <Features />
    <How />
    <Pricing />
  </PublicLayout>
);

export default LandingPage;

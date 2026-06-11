import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FaBuilding, FaFileContract, FaChartLine, FaUsers, FaShield,
  FaComments, FaPalette, FaArrowLeft, FaCheck, FaStar,
  FaCity, FaMoneyBillWave, FaRocket,
  FaHeadset, FaGauge, FaLayerGroup,
  FaCircleCheck, FaBolt, FaWhatsapp, FaQuoteLeft,
  FaMobileScreen, FaArrowTrendUp, FaBell,
} from 'react-icons/fa6';
import { Button } from '../../components/ui/shadcn/button';
import { Badge } from '../../components/ui/shadcn/badge';
import { Card, CardContent } from '../../components/ui/shadcn/card';
import { cn } from '../../lib/utils';
import PublicLayout from '../public/PublicLayout';

const P = '#c8161d';
const A = '#fbb140';
const HERO_IMG = 'https://images.unsplash.com/photo-1778003586047-69c68f764af5?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

/* ── Counter ── */
function Counter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let n = 0;
    const step = Math.ceil(to / 50);
    const t = setInterval(() => {
      n += step;
      if (n >= to) { setVal(to); clearInterval(t); } else setVal(n);
    }, 20);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString('en-US')}{suffix}</span>;
}

/* ── Hero ── */
function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: '#0c0808' }}>
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMG}
          alt="real estate"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay — right side readable, left side shows image */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to left, rgba(10,5,4,0.97) 45%, rgba(10,5,4,0.7) 70%, rgba(10,5,4,0.25) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,5,4,0.6) 0%, transparent 40%)' }} />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-5 min-h-screen flex items-center">
        <div className="w-full grid lg:grid-cols-2 gap-12 items-center pt-20 pb-16">

          {/* Text — right side on RTL */}
          <div className="text-right order-2 lg:order-1">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <Badge variant="accent" className="mb-6 inline-flex">
                <FaRocket className="text-[10px]" />
                نظام إدارة عقارات SaaS — مصر والشرق الأوسط
              </Badge>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="text-5xl lg:text-[3.6rem] font-black text-white leading-[1.08] mb-5 tracking-tight">
              أدر شركتك العقارية
              <span className="block mt-2"
                style={{ backgroundImage: `linear-gradient(135deg, ${A} 0%, #f0d580 50%, ${A} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                بكفاءة استثنائية
              </span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-white/60 text-lg leading-relaxed mb-9 max-w-md">
              منصة متكاملة تجمع المشاريع والعقود والأقساط والمحاسبة — بدلاً من جداول Excel ومحادثات واتساب المتفرقة.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              className="flex flex-wrap gap-3 justify-end mb-10">
              <Button asChild size="lg" variant="default"
                className="shadow-xl" style={{ boxShadow: `0 8px 30px ${P}80` }}>
                <Link to="/login">
                  ابدأ مجاناً — 14 يوم
                  <FaArrowLeft className="text-xs" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#how">شاهد كيف يعمل</a>
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center gap-6 justify-end">
              <div className="flex -space-x-2 space-x-reverse">
                {[P, '#15803d', '#1d4ed8', '#7c3aed', '#be185d'].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0808] flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: c }}>
                    {['أ','م','س','ك','ن'][i]}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  {[1,2,3,4,5].map(i => <FaStar key={i} className="text-xs" style={{ color: A }} />)}
                  <span className="text-white font-bold text-sm mr-1">4.9</span>
                </div>
                <p className="text-white/40 text-xs">من 150+ شركة عقارية</p>
              </div>
            </motion.div>
          </div>

          {/* Image side — floating card overlapping the real photo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="order-1 lg:order-2 relative hidden lg:block"
          >
            {/* Dashboard floating card */}
            <div className="rounded-2xl overflow-hidden border shadow-2xl"
              style={{ background: 'rgba(20,14,14,0.88)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.1)' }}>
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex gap-1.5">
                  {['#ff5f56','#ffbd2e','#27c93f'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                </div>
                <div className="flex-1 mx-3 bg-white/8 rounded px-3 py-0.5 text-[11px] text-white/30 text-center font-mono">
                  app.egyestate.com
                </div>
              </div>

              <div className="flex" style={{ height: 340 }}>
                {/* Mini sidebar */}
                <div className="w-11 flex flex-col items-center py-3 gap-2 border-l" style={{ background: '#3a3535', borderColor: 'rgba(255,255,255,0.07)' }}>
                  {[FaGauge, FaCity, FaFileContract, FaMoneyBillWave, FaChartLine, FaUsers].map((Icon, i) => (
                    <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: i === 0 ? A : 'rgba(255,255,255,0.07)', color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                      <Icon className="text-[11px]" />
                    </div>
                  ))}
                </div>

                {/* Dashboard content */}
                <div className="flex-1 p-4" style={{ background: '#f7f5f3' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black" style={{ color: P }}>لوحة التحكم</span>
                    <span className="text-[9px] bg-white text-gray-400 border border-gray-100 rounded-full px-2 py-0.5">يونيو 2026</span>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {[
                      { l: 'المشاريع', v: '14', c: P },
                      { l: 'الوحدات', v: '287', c: '#15803d' },
                      { l: 'العملاء', v: '96', c: '#1d4ed8' },
                      { l: 'الإيرادات', v: '1.2M', c: A },
                    ].map(({ l, v, c }) => (
                      <div key={l} className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
                        <p className="text-[8px] text-gray-400">{l}</p>
                        <p className="text-sm font-black mt-0.5" style={{ color: c }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div className="bg-white rounded-lg p-2.5 mb-2 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[9px] font-semibold text-gray-500">الإيرادات الشهرية</p>
                      <span className="text-[8px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-full">↑ 24%</span>
                    </div>
                    <div className="flex items-end gap-1 h-14">
                      {[35,52,41,68,49,77,58,85,63,91,72,100].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm transition-all"
                          style={{ height: `${h}%`, background: i === 11 ? A : i >= 9 ? `${P}90` : `${P}30` }} />
                      ))}
                    </div>
                  </div>

                  {/* Recent */}
                  <div className="bg-white rounded-lg p-2 border border-gray-100">
                    <p className="text-[9px] font-semibold text-gray-500 mb-1.5">آخر العقود</p>
                    {[
                      { n: 'أحمد السيد', u: 'شقة 3B', v: '450,000' },
                      { n: 'سارة محمود', u: 'محل 12', v: '180,000' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-2 py-1 border-b last:border-0 border-gray-50">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                          style={{ background: [P,'#1d4ed8'][i] }}>{c.n[0]}</div>
                        <div className="flex-1">
                          <p className="text-[8px] font-medium text-gray-700 text-right">{c.n} — {c.u}</p>
                        </div>
                        <span className="text-[8px] font-bold text-green-600">{c.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification badges */}
            <motion.div animate={{ y: [0,-7,0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute -right-4 top-12 rounded-2xl px-4 py-3 shadow-2xl border"
              style={{ background: 'rgba(16,12,12,0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', minWidth: 195 }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                  <FaCircleCheck className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">قسط مكتسب</p>
                  <p className="text-[11px] text-white/50">أحمد السيد · 12,500 ج.م</p>
                </div>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0,7,0] }} transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -left-4 bottom-16 rounded-2xl px-4 py-3 shadow-2xl border"
              style={{ background: 'rgba(16,12,12,0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.1)', minWidth: 190 }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ background: A }}>
                  <FaWhatsapp className="text-sm" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">تذكير واتساب</p>
                  <p className="text-[11px] text-white/50">3 أقساط مستحقة اليوم</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <a href="#stats" className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{ y: [0,5,0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <FaChevronDown className="text-white/30 text-lg" />
        </motion.div>
      </a>
    </section>
  );
}

/* ── Stats ── */
function Stats() {
  return (
    <section id="stats" className="py-16 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {[
          { to: 157, suffix: '+', label: 'شركة عقارية' },
          { to: 12400, suffix: '+', label: 'وحدة مُدارة' },
          { to: 99, suffix: '%', label: 'وقت التشغيل' },
          { to: 2022, suffix: '', label: 'سنة التأسيس' },
        ].map(({ to, suffix, label }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <p className="text-4xl font-black mb-1" style={{ color: P }}>
              <Counter to={to} suffix={suffix} />
            </p>
            <p className="text-sm text-gray-500">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ── Features ── */
const FEATURES = [
  { icon: FaCity,          title: 'مشاريع ووحدات',         desc: 'تتبع حالة كل وحدة — متاحة، محجوزة، مباعة، إيجار — في ثوانٍ.', color: P, tag: 'العقارات' },
  { icon: FaFileContract,  title: 'عقود وأقساط تلقائية',    desc: 'العقد وجدول الأقساط بضغطة واحدة. تذكيرات واتساب قبل الاستحقاق.', color: '#1d4ed8', tag: 'العقود' },
  { icon: FaMoneyBillWave, title: 'محاسبة شاملة',           desc: 'فواتير ومدفوعات ومصروفات وتقارير. تصدير PDF/Excel فوري.', color: '#15803d', tag: 'المحاسبة' },
  { icon: FaChartLine,     title: 'تقارير ذكية',            desc: 'رسوم بيانية تفاعلية لأداء كل مشروع وإيرادات كل شهر.', color: '#7c3aed', tag: 'التقارير' },
  { icon: FaShield,        title: 'صلاحيات RBAC',           desc: 'حدد ما يراه كل موظف بدقة — محاسب، مبيعات، إدارة.', color: '#be185d', tag: 'الأمان' },
  { icon: FaComments,      title: 'دردشة داخلية فورية',     desc: 'تواصل الفريق بـ Socket.IO — بدون مجموعات واتساب.', color: '#0891b2', tag: 'التواصل' },
  { icon: FaPalette,       title: 'Theme Builder',           desc: 'ألوان وشعار وخطوط مخصصة لكل شركة على حدة.', color: '#d97706', tag: 'التخصيص' },
  { icon: FaLayerGroup,    title: 'Multi-Tenant',            desc: 'كل شركة بيانات معزولة تماماً — أمان كامل.', color: '#0f766e', tag: 'البنية' },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-xl mb-14 text-right">
          <Badge className="mb-4">المميزات</Badge>
          <h2 className="text-4xl font-black mb-4" style={{ color: '#111' }}>
            كل ما تحتاجه —<br />
            <span style={{ color: P }}>في منصة واحدة</span>
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            بُنيت EgyEstate لتحل محل كل الأدوات المتفرقة.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: (i % 4) * 0.07 }}>
              <Card className="h-full hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${f.color}12`, color: f.color }}>{f.tag}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: `${f.color}10` }}>
                      <f.icon className="text-base" style={{ color: f.color }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-xs leading-relaxed text-gray-500">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── How it works ── */
const STEPS = [
  { n: 1, icon: FaRocket,       title: 'سجّل شركتك',      desc: 'أنشئ حسابك في دقيقتين وادخل بيانات شركتك.' },
  { n: 2, icon: FaCity,         title: 'أضف مشاريعك',     desc: 'أدخل مشاريعك ووحداتها مع الأسعار والمواصفات.' },
  { n: 3, icon: FaFileContract, title: 'أدر العمليات',     desc: 'عقود وفواتير ومدفوعات — كلها من مكان واحد.' },
  { n: 4, icon: FaChartLine,    title: 'راقب وحسّن',       desc: 'تقارير لحظية تساعدك تاخد القرار الصح.' },
];

function HowItWorks() {
  return (
    <section id="how" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16">
          <Badge className="mb-4 mx-auto">كيف يعمل</Badge>
          <h2 className="text-4xl font-black" style={{ color: '#111' }}>4 خطوات وأنت جاهز</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector */}
          <div className="hidden md:block absolute top-9 right-[13%] left-[13%] h-px bg-gray-100" />

          {STEPS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="text-center">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 relative z-10 border',
                i === 0 ? 'text-white' : 'text-gray-400'
              )}
                style={{
                  background: i === 0 ? `linear-gradient(135deg, ${P}, #b01820)` : '#fff',
                  borderColor: i === 0 ? P : '#e5e7eb',
                  boxShadow: i === 0 ? `0 8px 24px ${P}40` : '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                <s.icon className="text-xl" />
              </div>
              <div className="text-xs font-bold mb-2" style={{ color: i === 0 ? P : '#9ca3af' }}>
                الخطوة {s.n}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Split section (image + text) ── */
function SplitFeature() {
  return (
    <section className="py-24 overflow-hidden" style={{ background: '#0c0808' }}>
      <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ height: 460 }}>
          <img src={HERO_IMG} alt="real estate management" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${P}cc 0%, transparent 60%)` }} />
          {/* Overlay card */}
          <div className="absolute bottom-6 right-6 left-6 rounded-2xl p-5 border"
            style={{ background: 'rgba(15,10,10,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">برج النيل — وحدة 3B</p>
                <p className="text-white/50 text-sm mt-0.5">عقد نشط · قسط مستحق: 25 يونيو</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: A }}>450,000</p>
                <p className="text-white/40 text-xs">ج.م إجمالي العقد</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="text-right">
          <Badge variant="accent" className="mb-6">إدارة ذكية</Badge>
          <h2 className="text-4xl font-black text-white mb-5 leading-tight">
            من الوحدة الواحدة
            <span className="block" style={{ color: A }}>لآلاف الوحدات</span>
          </h2>
          <p className="text-white/60 text-lg leading-relaxed mb-8">
            سواء عندك 10 وحدات أو 10,000 — EgyEstate يتعامل مع كل الأحجام بنفس السهولة والسرعة.
          </p>

          <ul className="space-y-4">
            {[
              { icon: FaCircleCheck, text: 'تتبع حالة كل وحدة في الوقت الفعلي', color: '#16a34a' },
              { icon: FaBolt,        text: 'إنشاء العقد وجدول الأقساط في ثوانٍ', color: A },
              { icon: FaArrowTrendUp,text: 'تقارير الأداء بالأرقام الحقيقية', color: '#3b82f6' },
              { icon: FaBell,        text: 'تذكيرات تلقائية للعملاء قبل الاستحقاق', color: '#8b5cf6' },
            ].map(({ icon: Icon, text, color }, i) => (
              <motion.li key={i}
                initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 justify-end">
                <span className="text-sm text-white/70">{text}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20` }}>
                  <Icon className="text-sm" style={{ color }} />
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="mt-8">
            <Button asChild size="lg" variant="accent">
              <Link to="/login">
                جرّب مجاناً الآن
                <FaArrowLeft className="text-xs" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Pricing ── */
const PLANS = [
  { id: 'starter', name: 'Starter', nameAr: 'المبتدئ', price: 299, color: '#1d4ed8', desc: 'للشركات الناشئة',
    features: ['3 مستخدمين', '2 مشروع', '50 وحدة', 'عقود وأقساط', 'دعم بالإيميل'] },
  { id: 'pro', name: 'Pro', nameAr: 'الاحترافي', price: 699, color: P, featured: true, desc: 'للشركات النامية',
    features: ['15 مستخدم', '10 مشاريع', '500 وحدة', 'محاسبة كاملة', 'تقارير + تصدير', 'Theme Builder', 'دعم 24/7'] },
  { id: 'enterprise', name: 'Enterprise', nameAr: 'المؤسسي', price: 1499, color: '#15803d', desc: 'للمجمعات الكبيرة',
    features: ['غير محدود', 'مشاريع غير محدودة', 'API + Webhooks', 'مدير حساب مخصص', 'SLA مضمون'] },
];

function PricingSection() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" className="py-24 bg-gray-50/60">
      <div className="max-w-5xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12">
          <Badge className="mb-4 mx-auto">الأسعار</Badge>
          <h2 className="text-4xl font-black mb-3 text-gray-900">خطط واضحة بدون مفاجآت</h2>
          <p className="text-gray-500 mb-7">14 يوماً مجاناً — لا بطاقة ائتمان مطلوبة</p>

          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {[['شهري', false],['سنوي — وفّر 17%', true]].map(([label, val]) => (
              <button key={label} onClick={() => setYearly(val)}
                className={cn('text-sm font-semibold px-5 py-2 rounded-lg transition-all',
                  yearly === val ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                )}>
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {PLANS.map((p, i) => {
            const price = yearly ? Math.round(p.price * 0.83) : p.price;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={cn('overflow-hidden', p.featured ? 'shadow-2xl scale-[1.03] ring-2' : '')}
                  style={p.featured ? { '--tw-ring-color': p.color } : {}}>
                  {p.featured && (
                    <div className="py-2 text-center text-xs font-bold text-white" style={{ background: p.color }}>
                      الأكثر اختياراً
                    </div>
                  )}
                  <CardContent className="p-6">
                    <p className="text-xs font-bold mb-1" style={{ color: p.color }}>{p.name}</p>
                    <h3 className="text-xl font-black mb-1 text-gray-900">{p.nameAr}</h3>
                    <p className="text-xs text-gray-400 mb-5">{p.desc}</p>
                    <div className="flex items-end gap-1 mb-6">
                      <span className="text-4xl font-black" style={{ color: p.color }}>
                        {price.toLocaleString('en-US')}
                      </span>
                      <span className="text-sm text-gray-400 mb-1">ج.م/شهر</span>
                    </div>
                    <Button asChild className="w-full mb-5"
                      variant={p.featured ? 'default' : 'secondary'}
                      style={p.featured ? {} : { borderColor: p.color, color: p.color }}>
                      <Link to="/login">ابدأ مجاناً</Link>
                    </Button>
                    <Separator className="mb-5" />
                    <ul className="space-y-2.5">
                      {p.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <FaCircleCheck className="text-xs flex-shrink-0" style={{ color: p.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          تحتاج خطة مخصصة؟{' '}
          <Link to="/contact" className="font-bold underline" style={{ color: P }}>تواصل مع فريق المبيعات</Link>
        </p>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
const TESTIMONIALS = [
  { name: 'م. أحمد رامي', role: 'مجموعة النخيل العقارية', text: 'قبل EgyEstate كنا نشغّل 280 وحدة على 6 شيتات Excel. دلوقتي كل حاجة في شاشة واحدة.', color: P, init: 'أ' },
  { name: 'أ. نهى كمال',  role: 'شركة الصرح للتطوير',       text: 'نظام الأقساط وفّر عليّ 3 ساعات يومياً. ما عدتش أتذكر أتصل بالعميل — النظام بيبعت تذكير لوحده.', color: '#1d4ed8', init: 'ن' },
  { name: 'م. كريم وليد', role: 'Blue Sky Developments',    text: 'الـ Theme Builder ده اللي بيميّزنا. كل شركة من شركاتنا بهويتها البصرية الخاصة.', color: '#15803d', init: 'ك' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-14">
          <Badge variant="accent" className="mb-4 mx-auto">آراء العملاء</Badge>
          <h2 className="text-4xl font-black text-gray-900">بيقولوا إيه عملاؤنا</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-7 flex flex-col h-full">
                  <FaQuoteLeft className="text-2xl mb-4 opacity-10" style={{ color: t.color }} />
                  <p className="text-sm leading-relaxed text-gray-600 flex-1 mb-6">{t.text}</p>
                  <div className="flex items-center gap-1 mb-5">
                    {[1,2,3,4,5].map(i => <FaStar key={i} className="text-xs" style={{ color: A }} />)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                      {t.init}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA ── */
function CTA() {
  return (
    <section className="relative py-28 overflow-hidden" style={{ background: '#0c0808' }}>
      <div className="absolute inset-0">
        <img src={HERO_IMG} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #0c0808 0%, rgba(12,8,8,0.7) 50%, #0c0808 100%)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Badge variant="accent" className="mb-6 mx-auto">ابدأ دلوقتي</Badge>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            خلّي إدارة العقارات<br />
            <span style={{ color: A }}>تشتغل لوحدها</span>
          </h2>
          <p className="text-white/50 text-lg mb-9">
            14 يوماً مجاناً — بدون بطاقة ائتمان — إعداد في 5 دقائق
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="xl" variant="default"
              style={{ boxShadow: `0 8px 30px ${P}80` }}>
              <Link to="/login">
                ابدأ مجاناً الآن
                <FaArrowLeft className="text-sm" />
              </Link>
            </Button>
            <Button asChild size="xl" variant="outline">
              <Link to="/contact">تواصل مع فريق المبيعات</Link>
            </Button>
          </div>
          <p className="text-white/25 text-xs mt-8">بدون التزام — يمكنك الإلغاء في أي وقت</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Page ── */
export default function LandingPage() {
  return (
    <PublicLayout navTransparent={true}>
      <Hero />
      <Stats />
      <FeaturesSection />
      <HowItWorks />
      <SplitFeature />
      <PricingSection />
      <TestimonialsSection />
      <CTA />
    </PublicLayout>
  );
}

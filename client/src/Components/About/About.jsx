import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, Building, Users, Target, Rocket, CheckCircle } from 'lucide-react';
import TeamMembers from './TeamMembers';

const stats = [
  { value: '+20',  label: 'عاماً من الخبرة' },
  { value: '+150', label: 'مشروع منجز' },
  { value: '+50K', label: 'عميل سعيد' },
  { value: '+500', label: 'وحدة سكنية' },
];

const values = [
  { icon: ShieldCheck, title: 'الأمان والثقة',   desc: 'نلتزم بأعلى معايير السلامة والأمان القانوني في كل معاملة.' },
  { icon: Award,       title: 'الجودة',            desc: 'جودة البناء هي أساس سمعتنا الموثوقة منذ عشرين عاماً.' },
  { icon: Building,    title: 'الاستدامة',         desc: 'تصاميم صديقة للبيئة تضمن كفاءة الطاقة وديمومة البناء.' },
  { icon: Users,       title: 'العميل أولاً',      desc: 'رضا عملائنا هو المحرك الأساسي لكل قراراتنا.' },
];

export default function About() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      label: 'رؤيتنا',
      icon:  <Target size={20} />,
      title: 'رؤية شركة الصرح',
      desc:  'أن نكون المطور العقاري الأكثر ثقة وابتكاراً في مصر، من خلال تقديم مجتمعات سكنية وتجارية تتجاوز التوقعات وتُثري حياة عملائنا.',
    },
    {
      label: 'رسالتنا',
      icon:  <Rocket size={20} />,
      title: 'رسالة شركة الصرح',
      desc:  'تحويل الأحلام إلى واقع ملموس من خلال التميز في التصميم، الالتزام الكامل بالجودة، والشفافية التامة مع شركاء نجاحنا.',
    },
  ];

  return (
    <div dir="rtl" className="overflow-hidden" style={{ background: '#faf8f4' }}>
      <Helmet>
        <title>عن الصرح | خبرة 20 عاماً في الاستثمار العقاري</title>
      </Helmet>

      {/* ===== Hero ===== */}
      <section className="relative h-[50vh] min-h-[380px] flex items-end pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="الصرح للتطوير العقاري"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(18,40,60,0.95) 0%, rgba(18,40,60,0.5) 50%, transparent 100%)' }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span
              className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase mb-4"
              style={{ background: 'rgba(138,105,36,0.85)', color: '#DFBA6B', border: '1px solid rgba(223,186,107,0.4)' }}
            >
              تاريخ من الإنجاز
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
              شركة الصرح للاستثمار العقاري
            </h1>
            <div className="h-1 w-20" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
          </motion.div>
        </div>
      </section>

      {/* ===== الإحصائيات ===== */}
      <section dir="rtl" style={{ background: '#12283C' }}>
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="py-10 px-8 text-center"
                style={{ borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
              >
                <p className="text-3xl md:text-4xl font-black mb-2" style={{ color: '#DFBA6B' }}>{s.value}</p>
                <div className="h-px w-8 mx-auto mb-2" style={{ background: 'rgba(138,105,36,0.5)' }} />
                <p className="text-xs font-bold tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== قصتنا ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="h-px w-8" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
                <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: '#8A6924' }}>قصتنا</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: '#12283C' }}>
                خبراتنا ممتدة منذ عام 2004
              </h2>
              <p className="text-sm leading-loose" style={{ color: '#6b5e3e' }}>
                تأسست شركة الصرح برؤية طموحة لمواكبة النهضة العمرانية في مصر. نحن نؤمن بأن العقار ليس مجرد جدران، بل هو قيمة استثمارية وإنسانية. نعتمد في مشاريعنا على أفضل الدراسات الهندسية وأحدث التكنولوجيا العالمية لنقدم لعملائنا مساحات حياة متكاملة.
              </p>

              <ul className="space-y-3">
                {['التزام راسخ بالجودة في كل تفصيلة', 'فريق هندسي من أفضل الكفاءات المصرية', 'شراكات استراتيجية مع كبرى المقاولين', 'ضمانات قانونية وعقدية واضحة'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: '#4a3e2a' }}>
                    <CheckCircle size={16} style={{ color: '#8A6924' }} className="shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
                className="w-full h-[400px] object-cover"
                alt="مكتب الصرح"
                style={{ border: '2px solid rgba(138,105,36,0.15)' }}
              />
              <div
                className="absolute -bottom-5 -left-5 p-5"
                style={{
                  background: 'rgba(18,40,60,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(223,186,107,0.2)',
                  boxShadow: '0 16px 40px rgba(18,40,60,0.3)',
                }}
              >
                <p className="text-3xl font-black" style={{ color: '#DFBA6B' }}>+50</p>
                <p className="text-xs font-bold text-white mt-1">مشروع ناجح</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== الرؤية والرسالة ===== */}
      <section className="py-20 relative" style={{ background: '#12283C' }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-start">

            {/* الأزرار والمحتوى */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="flex gap-2">
                {tabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className="flex items-center gap-2 px-6 py-2.5 text-xs font-black tracking-wide transition-all duration-300"
                    style={activeTab === i
                      ? { background: 'linear-gradient(135deg,#8A6924,#c4983a)', color: 'white' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }
                    }
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-4"
                >
                  <div
                    className="p-4 inline-block"
                    style={{ background: 'rgba(138,105,36,0.15)', border: '1px solid rgba(138,105,36,0.25)' }}
                  >
                    {React.cloneElement(tabs[activeTab].icon, { size: 32, style: { color: '#DFBA6B' } })}
                  </div>
                  <h3 className="text-2xl font-black text-white">{tabs[activeTab].title}</h3>
                  <p className="text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.6)' }}>{tabs[activeTab].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* القيم */}
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
              {values.map((v, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 group transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <v.icon size={28} style={{ color: '#DFBA6B' }} className="mb-4" />
                  <h4 className="text-sm font-black text-white mb-2">{v.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== الفريق ===== */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'linear-gradient(to left, #8A6924, transparent)' }} />
            <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: '#8A6924' }}>فريق التميز</span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(to right, #8A6924, transparent)' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-16" style={{ color: '#12283C' }}>القيادة خلف نجاحاتنا</h2>
          <TeamMembers />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        className="py-20 text-center relative overflow-hidden"
        style={{ background: '#12283C' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(138,105,36,0.15) 0%, transparent 70%)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            هل أنت مستعد لتكون جزءاً من قصتنا؟
          </h2>
          <p className="text-sm mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            تواصل معنا اليوم لمناقشة فرص الاستثمار العقاري المتاحة والمستقبلية.
          </p>
          <Link to="/Contact">
            <button
              className="px-12 py-4 text-sm font-black tracking-widest transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(138,105,36,0.4)',
              }}
            >
              تواصل معنا الآن
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

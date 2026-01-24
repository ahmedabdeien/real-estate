import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Home, Briefcase, Leaf, Award, ShieldCheck, Users, Target, Rocket } from 'lucide-react';
import TeamMembers from './TeamMembers';
import Testimonials from './Testimonials';

const About = () => {
  const [activeVision, setActiveVision] = useState(0);

  const visions = [
    {
      title: "رؤيتنا",
      desc: "أن نكون المطور العقاري الأكثر ثقة وابتكاراً في مصر، من خلال تقديم مجتمعات سكنية وتجارية تتجاوز التوقعات.",
      icon: <Target className="w-12 h-12 text-primary-500" />
    },
    {
      title: "رسالتنا",
      desc: "تحويل الأحلام إلى واقع ملموس من خلال التميز في التصميم، الالتزام بالجودة، والشفافية مع شركاء النجاح.",
      icon: <Rocket className="w-12 h-12 text-primary-500" />
    }
  ];

  return (
    <div dir="rtl" className="bg-white overflow-hidden">
      <Helmet>
        <title>عن الصرح | خبرة 20 عاماً في الاستثمار العقاري</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Real Estate Building"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 text-center px-6">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 bg-primary-500 text-white rounded-full text-xs font-black tracking-widest mb-6"
          >
            تاريخ من الإنجاز
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-heading font-black text-white mb-6"
          >
            شركة الصرح للاستثمار العقاري
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            أكثر من عقدين من التميز في صياغة الفخامة والابتكار في قلب السوق العقاري المصري.
          </motion.p>
        </div>
      </section>

      {/* Core Story */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-4">
              <div className="w-12 h-1 bg-primary-500 rounded-full" />
              <span className="text-primary-600 font-black uppercase tracking-widest text-sm">قصتنا</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 leading-tight">
              خبراتنا ممتدة منذ عام <span className="text-primary-500">2004</span>
            </h2>
            <p className="text-lg text-slate-600 leading-loose text-justify">
              تأسست شركة الصرح برؤية طموحة لمواكبة النهضة العمرانية في مصر. نحن نؤمن بأن العقار ليس مجرد جدران، بل هو قيمة استثمارية وإنسانية. نعتمد في مشاريعنا على أفضل الدراسات الهندسية وأحدث التكنولوجيا العالمية لنقدم لعملائنا مساحات حياة متكاملة.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="p-6 bg-white rounded-3xl shadow-premium border border-slate-100">
                <p className="text-4xl font-black text-primary-500 mb-2">+20</p>
                <p className="text-sm font-bold text-slate-500">عاماً من الخبرة</p>
              </div>
              <div className="p-6 bg-white rounded-3xl shadow-premium border border-slate-100">
                <p className="text-4xl font-black text-primary-500 mb-2">+50</p>
                <p className="text-sm font-bold text-slate-500">مشروع ناجح</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absoluteInset-0 bg-primary-500/10 blur-[100px] -z-10 rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
              className="rounded-[64px] shadow-premium-xl w-full h-[500px] object-cover border-8 border-white"
              alt="Office"
            />
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Tabs */}
      <section className="bg-slate-900 py-32">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="w-full lg:w-1/2 space-y-12">
              <div className="flex gap-4">
                {visions.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVision(i)}
                    className={`px-8 py-3 rounded-full font-black transition-all ${activeVision === i
                      ? 'bg-primary-500 text-white shadow-premium'
                      : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeVision}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-white/5 rounded-2xl inline-block">
                    {visions[activeVision].icon}
                  </div>
                  <h3 className="text-4xl font-black text-white">
                    {visions[activeVision].title} شركة الصرح
                  </h3>
                  <p className="text-xl text-slate-400 leading-loose">
                    {visions[activeVision].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <ShieldCheck className="text-primary-500 mb-4" size={40} />
                  <h4 className="text-white font-bold mb-2">الأمان والثقة</h4>
                  <p className="text-sm text-slate-500">نلتزم بأعلى معايير السلامة والأمان القانوني في كل تعاملاتنا.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <Award className="text-primary-500 mb-4" size={40} />
                  <h4 className="text-white font-bold mb-2">الجودة</h4>
                  <p className="text-sm text-slate-500">جودة البناء هي أساس سمعتنا التي بنيناها على مدار عقدين.</p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <Building className="text-primary-500 mb-4" size={40} />
                  <h4 className="text-white font-bold mb-2">الاستدامة</h4>
                  <p className="text-sm text-slate-500">تصاميم صديقة للبيئة تضمن كفاءة استهلاك الطاقة والموارد.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[40px] border border-white/10">
                  <Users className="text-primary-500 mb-4" size={40} />
                  <h4 className="text-white font-bold mb-2">العميل أولاً</h4>
                  <p className="text-sm text-slate-500">رضا عملائنا هو المحرك الأساسي لكل قرار نتخذه.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32 container mx-auto px-6 lg:px-12 text-center">
        <span className="text-primary-500 font-black uppercase text-xs tracking-widest">فريق التميز</span>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-20">القيادة خلف نجاحاتنا</h2>
        <TeamMembers />
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-20">ماذا يقول عملاؤنا؟</h2>
          <Testimonials />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full blur-[120px] -z-10" />
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8">
          هل أنت مستعد لتكون جزءاً من قصتنا؟
        </h2>
        <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium">
          تواصل معنا اليوم لمناقشة فرص الاستثمار العقاري المتاحة والمستقبلية.
        </p>
        <Link to="/contact">
          <button className="px-12 py-4 bg-slate-900 text-white font-black rounded-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">تواصل معنا الآن</button>
        </Link>
      </section>
    </div>
  );
};

export default About;
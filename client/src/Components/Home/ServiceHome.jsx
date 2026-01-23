import React from 'react';
import { motion } from 'framer-motion';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow, BsArrowLeft } from "react-icons/bs";
import { Link } from 'react-router-dom';

const ServiceCard = ({ icon: Icon, title, text, index }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -15, scale: 1.02 }}
    className="group relative bg-white dark:bg-slate-800 p-12 rounded-[50px] shadow-premium border border-slate-100 dark:border-slate-700 transition-all duration-700 hover:shadow-premium-xl hover:border-accent-600/50 overflow-hidden"
  >
    {/* Decorative Background */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-600/5 rounded-bl-[100px] -z-0 transition-all duration-700 group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:bg-accent-600/10" />

    <div className="relative z-10">
      <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-accent-600 mb-10 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500 shadow-premium">
        <Icon className="text-5xl" />
      </div>

      <h3 className="text-3xl font-heading font-black text-primary-900 dark:text-white mb-6 group-hover:text-accent-600 transition-colors">
        {title}
      </h3>

      <p className="text-slate-500 dark:text-slate-400 leading-loose text-lg mb-8">
        {text}
      </p>

      <div className="flex items-center gap-2 text-accent-600 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        اكتشف المزيد <BsArrowLeft size={16} />
      </div>
    </div>
  </motion.div>
);

export default function ServiceHome() {
  const services = [
    {
      icon: BsBuildingCheck,
      title: "تطوير عقاري متكامل",
      text: "نحول الرؤى إلى واقع ملموس عبر إدارة شاملة للمشروع من الفكرة حتى التسليم."
    },
    {
      icon: BsBriefcase,
      title: "استشارات قانونية",
      text: "فريق من الخبراء القانونيين لضمان أمان استثماراتك وشفافية جميع التعاقدات."
    },
    {
      icon: BsArrowRepeat,
      title: "إدارة المرافق",
      text: "خدمات صيانة وإدارة متكاملة تضمن استدامة قيمة عقارك وراحة بالك الدائمة."
    },
    {
      icon: BsGraphUpArrow,
      title: "استثمار ذكي",
      text: "نوفر لك فرصاً استثمارية مدروسة تحقق أعلى العوائد في أرقى المواقع الجغرافية."
    }
  ];

  return (
    <section dir="rtl" className="py-40 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-600 font-black uppercase tracking-[0.4em] text-xs">خدمات عالمية المستوى</span>
            <h2 className="text-5xl md:text-7xl font-heading font-black text-primary-900 dark:text-white mt-6 leading-tight">
              حلول عقارية <br />
              <span className="text-slate-400">للمستقبل</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/contact">
              <button className="btn-premium border-2 border-primary-900 text-primary-900 dark:text-white dark:border-white hover:bg-primary-900 hover:text-white dark:hover:bg-white dark:hover:text-primary-950">
                احصل على استشارة مجانية
              </button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
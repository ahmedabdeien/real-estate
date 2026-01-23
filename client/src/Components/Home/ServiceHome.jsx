import React from 'react';
import { motion } from 'framer-motion';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow } from "react-icons/bs";

const ServiceCard = ({ icon: Icon, title, text }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -12 }}
    className="group bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-premium border border-slate-100 dark:border-slate-700 transition-all duration-500 hover:shadow-premium-xl hover:border-accent-600/30"
  >
    <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-accent-600 mb-8 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent-600/10 group-hover:bg-accent-600/0 transition-colors" />
      <Icon className="text-4xl relative z-10" />
    </div>
    <h3 className="text-2xl font-heading font-black text-primary-900 dark:text-white mb-4">
      {title}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 leading-loose text-lg">
      {text}
    </p>
  </motion.div>
);

export default function ServiceHome() {
  const services = [
    {
      icon: BsBuildingCheck,
      title: "تطوير عقاري متكامل",
      text: "من التخطيط إلى التنفيذ، نتولى جميع جوانب تطوير المشاريع العقارية لضمان أفضل النتائج المعمارية والاستثمارية."
    },
    {
      icon: BsBriefcase,
      title: "استشارات قانونية",
      text: "نضمن سلامة جميع الإجراءات القانونية عبر طاقم متخصص يوفر لك الحماية الكاملة في كافة تعاملاتك العقارية."
    },
    {
      icon: BsArrowRepeat,
      title: "خدمات ما بعد البيع",
      text: "التزامنا لا ينتهي عند التسليم؛ نحن معك دائماً لتقديم الدعم الفني والصيانة والخدمات التي تضمن لك إقامة مريحة."
    },
    {
      icon: BsGraphUpArrow,
      title: "تحليلات السوق",
      text: "نقدم لك قراءات دقيقة وتحليلات لاتجاهات السوق لضمان تحقيق أعلى العوائد على استثمارك مع شركة الصرح."
    }
  ];

  return (
    <div dir="rtl" className="py-32 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent-600 font-black uppercase tracking-[0.3em] text-[10px]">نقدم حلولاً ذكية</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-900 dark:text-white mt-4">
            خدماتنا المتكاملة
          </h2>
          <div className="h-1 w-20 bg-accent-600 mx-auto mt-6 rounded-full" />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
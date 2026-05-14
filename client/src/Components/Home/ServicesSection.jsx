import React from 'react';
import { motion } from 'framer-motion';
import { FaHome, FaChartLine, FaKey } from 'react-icons/fa';

const SERVICES = [
  {
    icon: FaHome,
    title: 'بيع وشراء العقارات',
    desc: 'نوفر لك أفضل الخيارات العقارية بأسعار تنافسية في أرقى المناطق مع ضمان شفافية كاملة في جميع المعاملات.',
    color: 'from-[#8A6924] to-[#DFBA6B]',
  },
  {
    icon: FaKey,
    title: 'تأجير العقارات',
    desc: 'خدمات تأجير متكاملة للوحدات السكنية والتجارية مع إدارة احترافية للعقود والصيانة الدورية.',
    color: 'from-[#12283C] to-[#1e3a5c]',
  },
  {
    icon: FaChartLine,
    title: 'الاستشارات العقارية',
    desc: 'فريق من الخبراء المتخصصين يقدم استشارات موثوقة لمساعدتك في اتخاذ أفضل القرارات الاستثمارية.',
    color: 'from-[#6b5219] to-[#8A6924]',
  },
];

export default function ServicesSection() {
  return (
    <section className="py-20 bg-[#faf8f4]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-badge">خدماتنا</span>
          <h2 className="text-[#12283C] font-black text-3xl md:text-4xl mb-3">
            ماذا نقدم لك؟
          </h2>
          <p className="text-[#6b5e3e] text-sm max-w-md mx-auto">
            نقدم حلولاً عقارية شاملة تلبي احتياجاتك بكفاءة عالية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-white border border-[#8A6924]/10 p-8 hover:border-[#8A6924]/30 hover:shadow-premium-lg transition-all duration-300 group"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${service.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <service.icon size={22} className="text-white" />
              </div>
              <h3 className="text-[#12283C] font-black text-lg mb-3">{service.title}</h3>
              <p className="text-[#6b5e3e] text-sm leading-relaxed">{service.desc}</p>
              <div className="mt-4 w-8 h-0.5 bg-[#8A6924] group-hover:w-16 transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow, BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ServiceCard = ({ icon: Icon, title, text, index }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -15, scale: 1.02 }}
      className="group relative bg-white dark:bg-slate-800 p-12 rounded-none shadow-premium border border-slate-100 dark:border-slate-700 transition-all duration-700 hover:shadow-premium-xl hover:border-accent-600/50 overflow-hidden"
    >
      {/* Decorative Background */}
      <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-32 h-32 bg-accent-600/5 rounded-none -z-0 transition-all duration-700 group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:bg-accent-600/10`} />

      <div className="relative z-10">
        <div className="w-24 h-24 rounded-none bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-accent-600 mb-10 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500 shadow-premium">
          <Icon className="text-5xl" />
        </div>

        <h3 className="text-xl font-heading font-black text-primary-900 dark:text-white mb-6 group-hover:text-accent-600 transition-colors">
          {title}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 leading-loose text-lg mb-8">
          {text}
        </p>

        <div className="flex items-center gap-2 text-accent-600 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {t('discover_more')} {isRtl ? <BsArrowLeft size={16} /> : <BsArrowRight size={16} />}
        </div>
      </div>
    </motion.div>
  );
};

export default function ServiceHome() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const services = [
    {
      icon: BsBuildingCheck,
      title: t('service_1_title'),
      text: t('service_1_desc')
    },
    {
      icon: BsBriefcase,
      title: t('service_2_title'),
      text: t('service_2_desc')
    },
    {
      icon: BsArrowRepeat,
      title: t('service_3_title'),
      text: t('service_3_desc')
    },
    {
      icon: BsGraphUpArrow,
      title: t('service_4_title'),
      text: t('service_4_desc')
    }
  ];

  return (
    <section id="services" dir="rtl" className="py-40 bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/5 rounded-none blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-900/5 rounded-none blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className={`flex flex-col lg:flex-row ${isRtl ? 'items-end' : 'items-start'} justify-between mb-24 gap-12`}>
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-accent-600 font-black uppercase tracking-[0.4em] text-xs">{t('world_class_services')}</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-900 dark:text-white mt-6 leading-tight">
              {t('real_estate_solutions')} <br />
              <span className="text-slate-400">{t('for_future')}</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/contact">
              <button className="btn-premium border-2 border-primary-900 text-primary-900 dark:text-white dark:border-white hover:bg-primary-900 hover:text-white dark:hover:bg-white dark:hover:text-primary-950">
                {t('get_consultation_free')}
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
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronUp, Building, Home, Briefcase, Leaf, Award, ShieldCheck } from 'lucide-react';
import LogoelsarhTwo from '../../assets/images/logo_e_w.png';
import TeamMembers from './TeamMembers'; // New component
import Testimonials from './Testimonials'; // New component

// Enhanced theme configuration with CSS variables
const THEME = {
  colors: {
    primary: {
      default: 'var(--primary)',
      dark: 'var(--primary-dark)'
    },
    secondary: {
      default: 'var(--secondary)',
      dark: 'var(--secondary-dark)'
    },
    accent: {
      default: 'var(--accent)',
      dark: 'var(--accent-dark)'
    }
  }
};

// Responsive image configuration
const IMAGE_CONFIG = {
  services: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    loading: "lazy",
    format: "webp"
  }
};

// Enhanced animations with reduced motion support
const createAnimations = (reduceMotion) => ({
  fadeIn: {
    initial: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : -20 },
    transition: { duration: 0.6 }
  },
  slideIn: {
    initial: { opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: reduceMotion ? 1 : 0, x: reduceMotion ? 0 : -20 },
    transition: { duration: 0.6 }
  },
  scale: {
    initial: { scale: reduceMotion ? 1 : 0.95, opacity: reduceMotion ? 1 : 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: reduceMotion ? 1 : 0.95, opacity: reduceMotion ? 1 : 0 },
    transition: { type: "spring", stiffness: 300 }
  }
});

// Enhanced services data with responsive images
const SERVICES = [
  {
    title: "سكني",
    images: {
      webp: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      jpg: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    alt: "صورة للمشاريع السكنية",
    description: "مشاريع سكنية فاخرة تلبي احتياجات العائلة العصرية",
    icon: <Home aria-hidden="true" />
  },
  {
    title: "إداري",
    images: {
      webp: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      jpg: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    alt: "صورة للمشاريع الإدارية",
    description: "مساحات مكتبية حديثة مصممة للإنتاجية والراحة",
    icon: <Briefcase aria-hidden="true" />
  },
  {
    title: "تجاري",
    images: {
      webp: "https://images.pexels.com/photos/27452443/pexels-photo-27452443/free-photo-of-a-large-shopping-mall-with-escalators-and-glass-doors.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      jpg: "https://images.pexels.com/photos/27452443/pexels-photo-27452443/free-photo-of-a-large-shopping-mall-with-escalators-and-glass-doors.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    },
    alt: "صورة للمشاريع التجارية",
    description: "مراكز تسوق وأسواق تجارية بمواقع استراتيجية",
    icon: <Building aria-hidden="true" />
  }
];

// Enhanced features with proper icons
const FEATURES = [
  {
    title: "جودة لا مثيل لها",
    description: "معايير بناء استثنائية تضمن الجودة والمتانة",
    icon: <ShieldCheck size={32} aria-hidden="true" />
  },
  {
    title: "تصاميم مبتكرة",
    description: "أساليب معمارية معاصرة تجمع بين الجمال والوظيفة",
    icon: <Award size={32} aria-hidden="true" />
  },
  {
    title: "استدامة بيئية",
    description: "ممارسات صديقة للبيئة وحلول مستدامة",
    icon: <Leaf size={32} aria-hidden="true" />
  }
];

const ScrollToTop = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  const checkScroll = useCallback(() => {
    setIsVisible(window.pageYOffset > 300);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [checkScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-8 right-8 p-3 bg-primary/90 text-white rounded-full shadow-lg hover:bg-primary transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileFocus={{ scale: 1.1 }}
          aria-label="العودة إلى الأعلى"
        >
          <ChevronUp size={24} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

const ServiceCard = React.memo(({ images, title, description, alt, icon }) => {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (

    <motion.article
      className="group relative rounded-lg  overflow-hidden hover:shadow-xl transition-shadow duration-300"
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => !prefersReducedMotion && setIsHovered(true)}
      onHoverEnd={() => !prefersReducedMotion && setIsHovered(false)}
      role="region"
      aria-labelledby={`service-${title}`}
    >
      <div className="relative h-80">

        <picture>
          <source srcSet={images.webp} type="image/webp" />
          <div className='bg-black/50  absolute inset-0 z-10 flex items-center justify-center'></div>
          <img
            src={images.jpg}
            alt={alt}
            loading={IMAGE_CONFIG.services.loading}
            sizes={IMAGE_CONFIG.services.sizes}
            className="w-full h-full object-cover transition-transform duration-500 ease-out  "
            style={{ transform: isHovered && !prefersReducedMotion ? 'scale(1.1)' : 'scale(1)' }}
          />
        </picture>
        <div className="absolute inset-0 z-20 bg-primary/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-white" aria-hidden="true">
            {icon}
          </div>
          <h3 id={`service-${title}`} className="text-3xl font-semibold text-white">
            {title}
          </h3>
          <p className="text-white/90 text-lg transition-opacity duration-300">
            {description}
          </p>
        </div>
      </div>
    </motion.article>
  );
});

const FeatureCard = React.memo(({ title, description, icon }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-6 rounded-lg border hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center"
      whileHover={prefersReducedMotion ? {} : { y: -5 }}
      role="region"
      aria-labelledby={`feature-${title}`}
    >
      <div className="text-primary dark:text-secondary mb-4" aria-hidden="true">
        {icon}
      </div>
      <h4 id={`feature-${title}`} className="text-xl font-semibold mb-2">
        {title}
      </h4>
      <p className="text-zinc-700 dark:text-gray-300">
        {description}
      </p>
    </motion.div>
  );
});

const ContentSection = React.memo(({ title, children, className = "", id }) => {
  const prefersReducedMotion = useReducedMotion();
  const animations = createAnimations(prefersReducedMotion);

  return (
    <motion.section
      {...animations.slideIn}
      className={`bg-white dark:bg-gray-700 rounded-lg shadow-md p-8 mb-6 space-y-6 ${className}`}
      id={id}
      role="region"
      aria-labelledby={`section-${id}`}
    >
      <h2 id={`section-${id}`} className="text-3xl font-bold text-primary dark:text-secondary">
        {title}
      </h2>
      {children}
    </motion.section>
  );
});

function About() {
  const prefersReducedMotion = useReducedMotion();
  const animations = useMemo(() => createAnimations(prefersReducedMotion), [prefersReducedMotion]);

  return (
    <div dir="rtl" className="bg-white dark:bg-slate-900 overflow-hidden pb-24">
      <Helmet>
        <title>عن الصرح | خبرة 20 عاماً في الاستثمار العقاري</title>
        <meta name="description" content="تعرف على شركة الصرح للاستثمار العقاري، شركة رائدة في مجال التطوير العقاري في مصر بخبرة تمتد لأكثر من 20 عاماً." />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-primary-950 py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0yMCAyMHYyMGgyMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] " />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 inline-block"
          >
            تاريخ من الإنجازات
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-black text-white mb-8"
          >
            من نحن
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed"
          >
            نحن القوة التي تساهم في صياغة مستقبل العقار في مصر، نجمع بين الخبرة العريقة والتكنولوجيا الحديثة لنقدم لك مساحات معيشية تتجاوز أحلامك.
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 -mt-12 relative z-20 space-y-24">

        {/* Story Section */}
        <section className="bg-white dark:bg-slate-800 p-12 md:p-20 rounded-[48px] shadow-premium border border-slate-100 dark:border-slate-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-heading font-black text-primary-900 dark:text-white leading-tight">
                خبرة أكثر من <span className="text-accent-600">20 عاماً</span> <br />في قلب السوق المصري
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-loose text-justify">
                شركة الصرح هي شركة ذات إستراتيجية شاملة لمستقبل العمار في مصر، تعتمد على الدراسات العلمية والتكنولوجيا المتطورة التي تواكب النهضة العقارية العالمية. منذ عام 2004 ونحن نهدف إلى إحداث تطور معماري غير مسبوق في مصر يضاهي التطور العالمي في كافة المجالات.
              </p>
              <div className="pt-6">
                <blockquote className="text-2xl font-black text-primary-950 dark:text-accent-500 border-r-8 border-accent-600 pr-8 italic">
                  "نحن لا نبني مجرد جدران، نحن نبني إرثاً للأجيال القادمة."
                </blockquote>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-accent-600/10 rounded-[64px] blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
                alt="Modern Building"
                className="relative rounded-[56px] shadow-premium-xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-premium border border-slate-100 dark:border-slate-700 hidden md:block">
                <p className="text-5xl font-black text-accent-600">+20</p>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-2">سنة من التميز</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values/Features */}
        <section className="space-y-16">
          <div className="text-center">
            <span className="text-accent-600 font-black uppercase text-xs tracking-widest">قيمنا الجوهرية</span>
            <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white mt-4">ما يميز شركة الصرح</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {FEATURES.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[40px] border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 group shadow-premium hover:shadow-premium-xl">
                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-slate-900 shadow-premium flex items-center justify-center text-accent-600 mb-8 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-heading font-black text-primary-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Strategy Section */}
        <section className="bg-primary-950 rounded-[64px] p-12 md:p-24 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                alt="Vision"
                className="rounded-[48px] shadow-2xl h-[400px] w-full object-cover"
              />
            </div>
            <div className="space-y-8">
              <span className="text-accent-500 font-black uppercase text-xs tracking-widest">رؤيتنا الإستراتيجية</span>
              <h2 className="text-4xl font-heading font-black text-white">تحقيق طموحات عملائنا</h2>
              <p className="text-xl text-slate-300 leading-loose">
                تهدف شركة الصرح إلى تلبية كافة متطلبات عملائها من خلال بناء مشاريع بجودة عالية ذات مستويات عالية من الأمان وبأرقى وأحدث التصميمات الاحترافية وفي أقل وقت ممكن. كما نقدم خدمات التشطيب الإبداعية للشقق والفلل والشركات، معتمدين على نخبة من المهندسين والفنيين المحترفين.
              </p>
              <Link to="/Contact" className="btn-premium bg-accent-600 text-white inline-block">تواصل معنا اليوم</Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="space-y-16">
          <div className="text-center">
            <span className="text-accent-600 font-black uppercase text-xs tracking-widest">مجالات تخصصنا</span>
            <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white mt-4">خدمات وحلول عقارية متكاملة</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <div key={idx} className="group relative h-[500px] rounded-[48px] overflow-hidden shadow-premium">
                <img src={service.images.webp} alt={service.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-12 text-center text-white space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center text-accent-500">
                    {service.icon}
                  </div>
                  <h3 className="text-3xl font-heading font-black">{service.title}</h3>
                  <p className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="space-y-16">
          <div className="text-center">
            <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white">فريق العمل</h2>
          </div>
          <TeamMembers />
        </section>

        {/* Testimonials */}
        <section className="space-y-16">
          <div className="text-center">
            <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white">ثقة عملائنا</h2>
          </div>
          <Testimonials />
        </section>

      </main>
      <ScrollToTop />
    </div>
  );
}

export default About;
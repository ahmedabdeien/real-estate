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
    <>
      <Helmet>
        <title>شركة الصرح للاستثمار العقاري - من نحن</title>
        <meta
          name="description"
          content="تعرف على شركة الصرح للاستثمار العقاري، شركة رائدة في مجال التطوير العقاري في مصر"
        />
        <meta property="og:title" content="شركة الصرح للاستثمار العقاري - من نحن" />
        <meta property="og:type" content="website" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        
        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "شركة الصرح للاستثمار العقاري",
            "description": "شركة رائدة في مجال التطوير العقاري في مصر",
            "logo": LogoelsarhTwo,
            "founders": [],
            "foundingDate": "2004",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "مصر"
            }
          })}
        </script>
      </Helmet>
      
      <main 
        dir="rtl" 
        className="bg-stone-100 dark:bg-gray-900 py-8 min-h-screen"
        role="main"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...animations.fadeIn}>

            <div className="space-y-12">
              <ContentSection title="عن الصرح" id="about">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-xl leading-relaxed">
                    شركة الصرح للاستثمار العقاري خبرة اكثرمن 20 عـامًا  ذات إستراتيجية شاملة لمستقبل المعمــار فـي مصـر تعتمـد علـى الدراسات العلميـة والتكنولوجيـا المتطـورة التـى تواكب النهضـة العقارية  العالمية 
                    شركة تهدف إلى إحداث تطور معمارى غير مسبوق فى مصر يضاهـي التطـور الـذي تشهده في كافة المجالات الأخرى.
                  </p>
                  
                  <blockquote className="text-xl font-medium text-primary dark:text-secondary border-r-4 border-primary dark:border-secondary pr-6 my-8">
                    شركة الصرح ليست مجرد شركة عقارية، بل هي قوة ثاقبة تعمل على تغيير وجه مصر وصياغة مساحات معيشية تتجاوز التوقعات.
                  </blockquote>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    
                    {FEATURES.map((feature, index) => (
                      <FeatureCard key={index} {...feature} />
                    ))}
                  </div>
                </div>
              </ContentSection>

              <ContentSection title="رؤيتنا" id="vision">
                <p className="text-xl text-zinc-700 dark:text-gray-300 leading-relaxed">
                  تهدف شركه الصرح الي تلبية كافه متطلبات عملائها من خلال بناء مشاريع بجودة عالية ذات مستويات عاليه من الامان وبأرقي وأحدث التصميمات الاحترافيه وفي أقل وقت ممكن، كما تقدم الشركه خدمات التشطيب لكل من الشقق السكنيه والفلل والقصور والمنازل والشركات والمحلات تجاريه والمطاعم، وغيره من أعمال التشطيبات الداخلية الإبداعية، كما تهدف الشركة إلي تحقيق أعلي درجات النجاح وإرضاء العميل معتمدين في ذلك على الالتزام بالتنفيذ في الوقت المحدد وكذلك يتم تنفيذ جميع الأعمال بواسطة مهندسين وفنيين محترفين.
                </p>
              </ContentSection>

              <ContentSection title="خدماتنا" id="services">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {SERVICES.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                  ))}
                </div>
              </ContentSection>

              {/* New Team Section */}
              <ContentSection title="فريقنا" id="team">
                <TeamMembers />
              </ContentSection>

              {/* New Testimonials Section */}
              <ContentSection title="آراء العملاء" id="testimonials">
                <Testimonials />
              </ContentSection>
            </div>
          </motion.div>
        </div>

        <ScrollToTop />
      </main>
    </>
  );
}

export default About;
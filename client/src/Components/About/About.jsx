import React, { useCallback, useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from 'lucide-react';
import LogoelsarhTwo from '../../assets/images/logo_e_w.png'
// Theme configuration
const THEME = {
  colors: {
    primary: {
      default: '#033E8A',
      dark: '#022a5e'
    },
    secondary: {
      default: '#FF9505',
      dark: '#cc7704'
    },
    accent: {
      default: '#a98105',
      dark: '#846404'
    }
  }
};

// Animation variants
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.6 }
  },
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.6 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { type: "spring", stiffness: 300 }
  }
};

const SERVICES = [
  {
    title: "سكني",
    image: "/images/residential.jpg",
    alt: "صورة للمشاريع السكنية",
    description: "مشاريع سكنية فاخرة تلبي احتياجات العائلة العصرية"
  },
  {
    title: "إداري",
    image: "/images/administrative.jpg",
    alt: "صورة للمشاريع الإدارية",
    description: "مساحات مكتبية حديثة مصممة للإنتاجية والراحة"
  },
  {
    title: "تجاري",
    image: "/images/commercial.jpg",
    alt: "صورة للمشاريع التجارية",
    description: "مراكز تسوق وأسواق تجارية بمواقع استراتيجية"
  }
];

const FEATURES = [
  {
    title: "جودة لا مثيل لها",
    description: "معايير بناء استثنائية تضمن الجودة والمتانة",
    icon: "🏗️"
  },
  {
    title: "تصاميم مبتكرة",
    description: "أساليب معمارية معاصرة تجمع بين الجمال والوظيفة",
    icon: "✨"
  },
  {
    title: "وحدات متنوعة",
    description: "خيارات متعددة تلبي مختلف الاحتياجات والأذواق",
    icon: "🏠"
  },
  {
    title: "مجتمعات نابضة",
    description: "مرافق متكاملة ووسائل راحة عصرية",
    icon: "🌟"
  },
  {
    title: "استدامة بيئية",
    description: "ممارسات صديقة للبيئة وحلول مستدامة",
    icon: "🌱"
  }
];

// Scroll to top button component
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
          className="fixed bottom-8 right-8 p-3 bg-primary/90 text-white rounded-full shadow-lg hover:bg-primary transition-colors duration-300"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          whileHover={{ scale: 1.1 }}
          aria-label="العودة إلى الأعلى"
        >
          <ChevronUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

const ServiceCard = React.memo(({ image, title, description, alt }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.article
      className="group relative border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out"
        style={{ 
          backgroundImage: `url(${image})`,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
        role="img"
        aria-label={alt}
      />
      <motion.div 
        className="relative w-full h-80 backdrop-blur-sm"
        initial={{ backgroundColor: 'rgba(3, 62, 138, 0.8)' }}
        animate={{ 
          backgroundColor: isHovered ? 'rgba(3, 62, 138, 0.9)' : 'rgba(3, 62, 138, 0.8)'
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <motion.h3 
            className="text-4xl font-semibold text-white mb-4"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          <motion.p
            className="text-white/90 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            {description}
          </motion.p>
        </div>
      </motion.div>
    </motion.article>
  );
});

const FeatureCard = React.memo(({ title, description, icon }) => (
  <motion.div 
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    whileHover={{ y: -5 }}
  >
    <span className="text-4xl mb-4 block" role="img" aria-label={title}>
      {icon}
    </span>
    <h4 className="text-xl font-semibold text-primary dark:text-secondary mb-2">
      {title}
    </h4>
    <p className="text-zinc-700 dark:text-gray-300">
      {description}
    </p>
  </motion.div>
));

const ContentSection = React.memo(({ title, children, className = "" }) => (
  <motion.section 
    {...animations.slideIn}
    className={`bg-white dark:bg-gray-700 rounded-lg shadow-md p-8 mb-6 space-y-6 ${className}`}
  >
    <h2 className="text-3xl font-bold text-primary dark:text-secondary">
      {title}
    </h2>
    {children}
  </motion.section>
));

function About() {
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
      </Helmet>
      
      <main 
        dir="rtl" 
        className="bg-stone-100  dark:from-gray-900 dark:to-gray-800 py-8 min-h-screen"
        role="main"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div {...animations.fadeIn}>
            <header className="mb-12">
              <motion.div 
                className="relative h-64 rounded-2xl overflow-hidden shadow-xl"
                {...animations.scale}
              >
                <div className="absolute inset-0 bg-[#033e8a] " />
                <div className="relative h-full flex flex-col justify-center items-center text-center p-8">
                  <motion.div 
                    className="  p-8 rounded-2xl flex justify-center items-center flex-col"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <img 
                      src={LogoelsarhTwo}
                      alt="شعار شركة الصرح"
                      className="w-32 h-auto object-contain mb-6"
                      loading="eager"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </header>

            <div className="space-y-12">
              <ContentSection title="عن الصرح">
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

              <ContentSection title="رؤيتنا">
                <p className="text-xl text-zinc-700 dark:text-gray-300 leading-relaxed">
                  تهدف شركه الصرح الي تلبية كافه متطلبات عملائها من خلال بناء مشاريع بجودة عالية ذات مستويات عاليه من الامان وبأرقي وأحدث التصميمات الاحترافيه وفي أقل وقت ممكن، كما تقدم الشركه خدمات التشطيب لكل من الشقق السكنيه والفلل والقصور والمنازل والشركات والمحلات تجاريه والمطاعم، وغيره من أعمال التشطيبات الداخلية الإبداعية، كما تهدف الشركة إلي تحقيق أعلي درجات النجاح وإرضاء العميل معتمدين في ذلك على الالتزام بالتنفيذ في الوقت المحدد وكذلك يتم تنفيذ جميع الأعمال بواسطة مهندسين وفنيين محترفين.
                </p>
              </ContentSection>

              <ContentSection title="خدماتنا">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {SERVICES.map((service, index) => (
                    <ServiceCard key={index} {...service} />
                  ))}
                </div>
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
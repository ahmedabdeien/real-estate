import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpShort   } from 'react-icons/bs';
import { FiClock, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { SocialMediaSecondary } from '../SocialMedia/SocialMediaLink';
import { useEffect, useState } from 'react';

const FooterSection = ({ title, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="space-y-4"
  >
    <h6 className="text-xl font-semibold text-gray-800 dark:text-gray-200 relative pb-2 after:absolute after:bottom-0 after:right-0 after:w-12 after:h-1 after:bg-[#ff9505]">
      {title}
    </h6>
    <ul className="space-y-3 text-gray-600 dark:text-gray-400">
      {children}
    </ul>
  </motion.div>
);

export default function Footer() {
  const [showButton, setShowButton] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    setScrollProgress(progress);
    setShowButton(window.scrollY > 500);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer dir="rtl" className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showButton && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative group p-2 bg-gradient-to-br from-[#ff9505] to-[#ff6b00] rounded-full shadow-xl hover:shadow-2xl transition-all"
              aria-label="Scroll to top"
            >
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping-slow" />
              
              {/* Progress Ring */}
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-current text-white/20"
                  strokeWidth="2"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-current text-white"
                  strokeWidth="2"
                  fill="transparent"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * scrollProgress) / 100}
                />
              </svg>

              <BsArrowUpShort   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-white transform group-hover:-translate-y-1 transition-transform" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Content */}
      <div className="container mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {/* Work Hours Section */}
        <FooterSection title="ساعات العمل">
          <motion.li 
            className="flex items-center space-x-2"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FiClock className="text-[#ff9505]" />
            <span>السبت - الخميس: 10 صباحاً - 5 مساءً</span>
          </motion.li>
        </FooterSection>

        {/* Quick Links Section */}
        <FooterSection title="روابط سريعة">
          {['الصفحة الرئيسية', 'المشاريع', 'عن الصرح', 'تسجيل الدخول'].map((link, index) => (
            <motion.li
              key={index}
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link
                to={`/${link === 'الصفحة الرئيسية' ? '' : link}`}
                className="hover:text-[#ff9505] transition-colors duration-200 flex items-center"
              >
                <span className="w-2 h-2 bg-[#ff9505] rounded-full mr-2" />
                {link}
              </Link>
            </motion.li>
          ))}
        </FooterSection>

        {/* Contact Section */}
        <FooterSection title="اتصل بنا">
          <motion.li 
            className="flex items-start space-x-2"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FiMapPin className="text-[#ff9505] mt-1" />
            <div>
              <p>14 شارع المختار من شارع النصر</p>
              <p>المعادي الجديدة، القاهرة</p>
            </div>
          </motion.li>
          <motion.li 
            className="flex items-center space-x-2"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FiMail className="text-[#ff9505]" />
            <a href="mailto:elsarhegypt@gmail.com" className="hover:text-[#ff9505] transition-colors">
              elsarhegypt@gmail.com
            </a>
          </motion.li>
          <motion.li 
            className="flex items-center space-x-2"
            whileHover={{ x: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <FiPhone className="text-[#ff9505]" />
            <a href="tel:+0227547988" className="hover:text-[#ff9505] transition-colors">
              0227547988
            </a>
          </motion.li>
        </FooterSection>
      </div>

      {/* Footer Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border-t border-gray-100 dark:border-gray-800 bg-[#004483] dark:bg-gray-800"
      >
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white dark:text-gray-300 text-center md:text-left">
            © {new Date().getFullYear()}{' '}
            <a href="#" className="hover:underline hover:text-[#ff9505] transition-colors">
              الصرح للاستثمار العقاري
            </a>
            . جميع الحقوق محفوظة
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex space-x-4"
          >
            <SocialMediaSecondary />
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
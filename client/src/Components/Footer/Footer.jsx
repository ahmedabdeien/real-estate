"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpShort, BsChevronRight } from 'react-icons/bs';
import { FiClock, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { SocialMediaSecondary } from '../SocialMedia/SocialMediaLink';
import { useEffect, useState } from 'react';
import Logoelsarh from '../../assets/images/logoElsarh.png';

const FooterSection = ({ title, children }) => (
  <div className="space-y-6">
    <h4 className="text-lg font-heading font-bold text-white tracking-wide uppercase">
      {title}
    </h4>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export default function Footer() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const footerLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'المشاريع', path: '/Project' },
    { name: 'من نحن', path: '/About' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  return (
    <footer dir="rtl" className="bg-primary-950 text-slate-400 font-body border-t border-slate-800">
      {/* Premium Scroll Top Button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 left-8 z-50 p-3 bg-accent-600 text-white rounded-full shadow-premium-xl hover:bg-accent-500 transition-all hover:-translate-y-1 active:scale-95"
          >
            <BsArrowUpShort size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 lg:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">

          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img src={Logoelsarh} alt="Logo" className="w-14 brightness-0 invert" />
              <div>
                <h2 className="text-xl font-heading font-black text-white leading-none">الصرح</h2>
                <p className="text-[10px] text-accent-500 font-bold tracking-widest mt-1">للاستثمار العقاري</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              شركة الصرح للاستثمار العقاري، خبرة أكثر من 20 عاماً في بناء المستقبل المعماري في مصر باستخدام أحدث التقنيات العالمية.
            </p>
            <div className="flex pt-4">
              <SocialMediaSecondary />
            </div>
          </div>

          {/* Quick Links */}
          <FooterSection title="روابط سريعة">
            <ul className="grid grid-cols-1 gap-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 text-sm hover:text-white transition-colors"
                  >
                    <BsChevronRight size={10} className="text-accent-600 transition-transform group-hover:translate-x-1" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterSection>

          {/* Contact Info */}
          <FooterSection title="اتصل بنا">
            <ul className="space-y-4">
              <li className="flex gap-4">
                <FiMapPin className="text-accent-600 mt-1 shrink-0" size={18} />
                <span className="text-sm leading-relaxed">
                  14 شارع المختار من شارع النصر، المعادي الجديدة، القاهرة
                </span>
              </li>
              <li className="flex items-center gap-4">
                <FiPhone className="text-accent-600 shrink-0" size={18} />
                <a href="tel:+201212622210" className="text-sm hover:text-white transition-colors">01212622210</a>
              </li>
              <li className="flex items-center gap-4">
                <FiMail className="text-accent-600 shrink-0" size={18} />
                <a href="mailto:elsarhegypt@gmail.com" className="text-sm hover:text-white transition-colors">elsarhegypt@gmail.com</a>
              </li>
            </ul>
          </FooterSection>

          {/* Working Hours */}
          <FooterSection title="ساعات العمل">
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <FiClock className="text-accent-600" />
                <span className="text-sm font-bold text-white">السبت - الخميس</span>
              </div>
              <p className="text-xs text-slate-500">من الساعة 10:00 صباحاً حتى 05:00 مساءً</p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs text-slate-500">الجمعة عطلة رسمية</span>
              </div>
            </div>
          </FooterSection>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-8 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs tracking-wide">
            &copy; {new Date().getFullYear()} شركة الصرح للاستثمار العقاري. جميع الحقوق محفوظة.
          </p>
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest">
            Expertly Crafted for Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowUpShort, BsChevronRight } from 'react-icons/bs';
import { FiClock, FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { SocialMediaSecondary } from '../SocialMedia/SocialMediaLink';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
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
    { name: 'تواصل معنا', path: '/Contact' },
  ];

  const { t, i18n } = useTranslation();
  const { config } = useSelector((state) => state.config);
  const isRtl = i18n.language === 'ar';
  const currentLang = i18n.language;

  // Fetch dynamic pages (e.g. Privacy, Terms)
  const [dynamicPages, setDynamicPages] = useState([]);
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/cms/pages');
        const data = await res.json();
        if (res.ok) {
          setDynamicPages(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchPages();
  }, []);

  return (
    <footer dir={isRtl ? 'rtl' : 'ltr'} className="bg-slate-50 text-slate-600 font-body border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand & Bio */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={(config.logo && config.logo.startsWith('http')) ? config.logo : Logoelsarh}
                alt={config.siteName}
                className="w-12 h-auto"
              />
              <div>
                <h2 className="text-lg font-black text-primary-900 uppercase tracking-tight">{config.siteName || t('welcome_title_1')}</h2>
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase block">Real Estate Investment</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500">
              {t('about_desc').substring(0, 100)}...
            </p>
            <div className="flex gap-4 pt-2">
              <SocialMediaSecondary links={config.socialLinks} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-primary-900 uppercase tracking-wide text-sm mb-6">{t('quick_links')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="hover:text-primary-600 transition-colors">{t('home')}</Link></li>
              <li><Link to="/Project" className="hover:text-primary-600 transition-colors">{t('listings')}</Link></li>
              <li><Link to="/About" className="hover:text-primary-600 transition-colors">{t('about')}</Link></li>
              <li><Link to="/Contact" className="hover:text-primary-600 transition-colors">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-primary-900 uppercase tracking-wide text-sm mb-6">{t('contact_us')}</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <FiMapPin className="text-primary-600 shrink-0 mt-1" />
                <span>{config?.contact?.maadiBranchAddress || '14 Mokhtar St, New Maadi, Cairo, Egypt'}</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="text-primary-600 shrink-0" />
                <a href={`tel:${config?.contact?.phone}`} className="hover:text-primary-600 dir-ltr">{config?.contact?.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="text-primary-600 shrink-0" />
                <a href={`mailto:${config?.contact?.email}`} className="hover:text-primary-600">{config?.contact?.email}</a>
              </li>
            </ul>
          </div>

          {/* Legal / Hours */}
          <div>
            <h4 className="font-bold text-primary-900 uppercase tracking-wide text-sm mb-6">{t('working_hours')}</h4>
            <div className="text-sm space-y-2 text-slate-500">
              <p className="flex justify-between border-b border-slate-200 pb-2">
                <span>{t('saturday')} - {t('thursday')}</span>
                <span className="font-bold text-slate-700">10:00 - 17:00</span>
              </p>
              <p className="flex justify-between pt-2">
                <span>{t('friday')}</span>
                <span className="text-red-500 font-bold">{t('closed')}</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} {config.siteName || 'El Sarh'}. {t('all_rights_reserved')}.</p>
          <div className="flex gap-6">
            {dynamicPages.map(page => (
              <Link key={page._id} to={`/p/${page.slug}`} className="hover:text-primary-600 transition-colors">
                {page.title[currentLang] || page.title['en']}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
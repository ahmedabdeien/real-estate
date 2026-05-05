"use client";
import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from "flowbite-react";
import Logoelsarh from '../../assets/images/logoElsarh.png';
import {
  FaComments, FaColumns, FaCoins, FaCogs,
  FaDoorOpen, FaMoon, FaUser, FaSun, FaTimes,
  FaChevronDown, FaBars
} from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme } = useSelector(state => state.theme);
  const { currentUser } = useSelector(state => state.user);
  const { config } = useSelector(state => state.config);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const [dynamicPages, setDynamicPages] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Fetch generic pages for menu
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const currentLang = i18n.language;

  const navLinks = [
    { title: t('home'), path: '/' },
    { title: t('listings'), path: '/Project' },
    ...dynamicPages.map(page => ({
      title: page.title[currentLang] || page.title['en'],
      path: `/p/${page.slug}`
    })),
    { title: 'News & Blog', path: '/Blogs' },
    { title: t('about'), path: '/About' },
    { title: t('contact'), path: '/Contact' },
    ...(currentUser?.isAdmin ? [{ title: t('admin'), path: '/Dashboard?tab=dashbordData' }] : []),
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignout = async () => {
    try {
      dispatch(logOutUserStart());
      const res = await fetch('/api/user/signout', { method: "POST" });
      if (!res.ok) throw new Error('Failed to logout');
      dispatch(logOutUserSuccess());
    } catch (error) {
      dispatch(logOutUserFailure(error.message));
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] shadow-odoo font-body bg-secondary text-white border-b border-secondary-800">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex justify-between items-center">
        
        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={(config.logo && config.logo.startsWith('http')) ? config.logo : Logoelsarh}
              alt={config.siteName}
              className="h-8 w-auto object-contain brightness-0 invert"
            />
            <div className="hidden md:block">
              <h1 className="text-lg font-black leading-none tracking-tight uppercase">
                {config.siteName?.split(' ')[0] || t('welcome').split(' ')[0]}
              </h1>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className={`hidden lg:flex items-center gap-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  text-sm font-medium transition-colors border-b-2 pt-1 pb-1
                  ${isActive ? 'text-primary border-primary' : 'text-slate-300 border-transparent hover:text-white'}
                `}
              >
                {link.title}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right Utilities */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-secondary-800 rounded-sm px-3 py-1.5 border border-secondary-700 focus-within:border-primary transition-all">
            <BsSearch className="text-slate-400" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className="bg-transparent border-none focus:ring-0 text-xs w-40 text-white placeholder:text-slate-400 p-0 ml-2"
            />
          </div>

          <LanguageSwitcher />

          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Avatar img={currentUser.avatar} size="sm" className="rounded-sm overflow-hidden" />
                <span className="hidden md:block text-sm font-medium">{currentUser.username}</span>
                <FaChevronDown size={10} />
              </button>
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-slate-800 rounded-sm shadow-odoo-hover border border-slate-100 dark:border-slate-700 overflow-hidden z-50 text-slate-800"
                  >
                    <div className="p-2" dir={isRtl ? 'rtl' : 'ltr'}>
                      <UserMenuItem icon={<FaUser />} text={t('favorites')} href="/Dashboard?tab=Favorites" onClick={() => setIsUserMenuOpen(false)} />
                      {(currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
                        <>
                          <UserMenuItem icon={<FaColumns />} text={t('admin')} href="/CreatePage" onClick={() => setIsUserMenuOpen(false)} />
                          {currentUser.role === 'Admin' && (
                            <UserMenuItem icon={<FaCogs />} text="Admin Settings" href="/Admin-Settings" onClick={() => setIsUserMenuOpen(false)} />
                          )}
                          <UserMenuItem icon={<FaCoins />} text={t('sales')} href="/Dashboard?tab=dashbordData" onClick={() => setIsUserMenuOpen(false)} />
                        </>
                      )}
                      <UserMenuItem icon={<FaCogs />} text={t('settings')} href="/Settings" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                      <UserMenuItem icon={<FaDoorOpen />} text={t('logout')} onClick={handleSignout} isRed />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/Signin" className="text-sm font-bold bg-primary text-white px-5 py-2 rounded-sm hover:bg-primary-700 transition-colors uppercase tracking-wide">
              {t('login')}
            </Link>
          )}

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-primary transition-colors"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-primary-950/40 backdrop-blur-sm z-[110] lg:hidden"
            />

            <motion.div
              initial={{ x: isRtl ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRtl ? '100%' : '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 ${isRtl ? 'right-0' : 'left-0'} w-full sm:w-80 bg-white shadow-2xl z-[120] lg:hidden flex flex-col`}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <img src={Logoelsarh} alt="El Sarh" className="h-10 w-auto" />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto py-8 px-6 space-y-2" dir={isRtl ? 'rtl' : 'ltr'}>
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) => `
                      block px-4 py-4 rounded-none text-sm font-bold uppercase tracking-widest transition-all
                      ${isActive
                        ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary-600'}
                    `}
                  >
                    {link.title}
                  </NavLink>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {t('contact_us')}
                </p>
                <div className="space-y-4">
                  <a href={`tel:${config?.contact?.phone}`} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                      <FaDoorOpen size={14} />
                    </div>
                    {config?.contact?.phone}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

const UserMenuItem = ({ icon, text, href, onClick, isRed = false }) => {
  const content = (
    <div className={`
      flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-none cursor-pointer
      transition-all duration-200
      ${isRed
        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-primary-600'}
    `} onClick={onClick}>
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </div>
  );

  return href ? <Link to={href} className="block no-underline">{content}</Link> : content;
};
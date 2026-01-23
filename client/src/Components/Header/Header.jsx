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
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme } = useSelector(state => state.theme);
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);

  const navLinks = [
    { title: 'الرئيسية', path: '/' },
    { title: 'المشاريع', path: '/Project' },
    { title: 'من نحن', path: '/About' },
    { title: 'اتصل بنا', path: '/contact' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
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
    <header className={`
      fixed top-0 left-0 right-0 z-[100] transition-all duration-500
      ${isScrolled
        ? 'py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-premium border-b border-slate-200/50 dark:border-slate-700/50'
        : 'py-5 bg-transparent'}
    `}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center transition-all duration-300">

          {/* Brand/Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: -5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img src={Logoelsarh} alt="Logo" className="w-12 md:w-14" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-black tracking-tight text-primary-900 dark:text-white leading-none">
                الصرح
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-accent-600 font-bold mt-0.5">
                للاستثمار العقاري
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `
                  px-5 py-2.5 rounded-full font-heading font-semibold text-sm transition-all duration-300
                  ${isActive
                    ? 'bg-primary-900 text-white shadow-premium'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                `}
              >
                {link.title}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2.5 rounded-full glass-card hover:bg-accent-500/10 dark:hover:bg-accent-500/20 transition-all text-slate-700 dark:text-slate-200 shadow-premium border border-slate-200 dark:border-slate-700"
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} className="text-accent-500" />}
            </button>

            {/* User Logic */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-4 glass-card rounded-full hover:shadow-premium-lg transition-all border border-slate-200 dark:border-slate-700"
                >
                  <div className="hidden md:block text-right mr-2 rtl:ml-2 rtl:mr-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize font-medium">
                      {currentUser.isAdmin ? 'Admin' : 'Member'}
                    </p>
                  </div>
                  <Avatar img={currentUser.avatar} rounded size="sm" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-premium-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="p-2" dir="rtl">
                        <UserMenuItem icon={<FaUser />} text="حسابي" href="/Dashboard?tab=Profile" onClick={() => setIsUserMenuOpen(false)} />
                        {currentUser.isAdmin && (
                          <>
                            <UserMenuItem icon={<FaColumns />} text="إنشاء صفحة" href="/CreatePage" onClick={() => setIsUserMenuOpen(false)} />
                            <UserMenuItem icon={<FaCoins />} text="لوحة التحكم" href="/Dashboard?tab=dashbordData" onClick={() => setIsUserMenuOpen(false)} />
                          </>
                        )}
                        <UserMenuItem icon={<FaCogs />} text="الإعدادات" href="/Settings" onClick={() => setIsUserMenuOpen(false)} />
                        <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                        <UserMenuItem icon={<FaDoorOpen />} text="تسجيل الخروج" onClick={handleSignout} isRed />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/Signin">
                <button className="btn-premium bg-primary-900 text-white hover:bg-slate-800 shadow-premium text-sm py-2 px-6">
                  دخول
                </button>
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white"
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-premium-xl z-50 lg:hidden flex flex-col pt-24 px-8"
          >
            <div className="space-y-4" dir="rtl">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    block text-xl font-heading font-bold transition-all
                    ${isActive ? 'text-accent-600' : 'text-slate-800 dark:text-white'}
                  `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.title}
                </NavLink>
              ))}
              <div className="my-8 border-t border-slate-100 dark:border-slate-800" />
              {!currentUser && (
                <Link to="/Signin" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full btn-premium bg-primary-900 text-white">
                    تسجيل الدخول
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

const UserMenuItem = ({ icon, text, href, onClick, isRed = false }) => {
  const content = (
    <div className={`
      flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl cursor-pointer
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
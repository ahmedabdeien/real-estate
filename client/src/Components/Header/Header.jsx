"use client";
import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from "flowbite-react";
import Logoelsarh from '../../assets/images/logoElsarh.png';
import { 
  FaComments, FaColumns, FaCoins, FaCogs, 
  FaDoorOpen, FaMoon, FaUser, FaSun, FaTimes 
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
    { title: 'الصفحة الرئيسية', path: '/' },
    { title: 'المشروعات', path: '/Project' },
    { title: 'معلومات عنا', path: '/About' },
    { title: 'تواصل معنا', path: '/contact' },
    currentUser ? { title: 'المفضلة', path: '/favorites' }:""
  ];

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
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

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? (theme === 'dark' ? '#3b82f6' : '#2563eb') : 'inherit',
  });

  const menuVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: '100%' }
  };

  const userMenuVariants = {
    open: { opacity: 1, y: 0, scale: 1 },
    closed: { opacity: 0, y: -20, scale: 0.95 }
  };

  return (
    <header className={`
      w-full z-50  top-0 sticky bg-white dark:bg-gray-900/90 opacity-100
      transition-all duration-300 ease-in-out  container
      ${isScrolled != isScrolled == 'bg-white/90 dark:bg-gray-900/95 shadow-sm backdrop-blur-lg opacity-100'}
    `}>
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="z-50 group">
          <motion.img 
            src={Logoelsarh} 
            alt="Elsarh Logo"
            className="w-14 transition-transform group-hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={navLinkStyle}
              className="px-4 py-2 relative group font-medium text-gray-700 dark:text-gray-300"
            >
              {link.title}
              <motion.div
                className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100"
                initial={false}
                animate={{ scaleX: location.pathname === link.path ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </NavLink>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'light' ? (
              <FaMoon className="text-xl text-gray-800" />
            ) : (
              <FaSun className="text-xl text-amber-400" />
            )}
          </motion.button>

          {/* User Menu */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar 
                  img={currentUser.avatar}
                  alt="User"
                  rounded
                  className="cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                />
              </motion.div>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={userMenuVariants}
                    className="absolute right-0 top-14 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                              border border-gray-100 dark:border-gray-700 origin-top-right"
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <div className="p-2" dir="rtl">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {currentUser.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-1 mt-2">
                        <UserMenuItem
                          icon={<FaUser />}
                          text="حسابي"
                          href="/Dashboard?tab=Profile"
                          onClick={() => setIsUserMenuOpen(false)}
                        />

                        {currentUser.isAdmin && (
                          <>
                            <UserMenuItem
                              icon={<FaColumns />}
                              text="إنشاء صفحة"
                              href="/CreatePage"
                              onClick={() => setIsUserMenuOpen(false)}
                            />
                            <UserMenuItem
                              icon={<FaCoins />}
                              text="لوحة المعلومات"
                              href="/Dashboard?tab=dashbordData"
                              onClick={() => setIsUserMenuOpen(false)}
                            />
                          </>
                        )}

                        {currentUser.isBroker && (
                          <UserMenuItem
                            icon={<FaComments />}
                            text="قائمة الرسائل"
                            href="/PageBroker"
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                        )}

                        <UserMenuItem
                          icon={<FaCogs />}
                          text="إعدادات"
                          href="/Settings"
                          onClick={() => setIsUserMenuOpen(false)}
                        />

                        <div className="border-t dark:border-gray-700 my-1" />

                        <UserMenuItem
                          icon={<FaDoorOpen />}
                          text="تسجيل الخروج"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            handleSignout();
                          }}
                          isRed
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to="/Signin"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg
                         hover:from-blue-700 hover:to-blue-600 transition-all shadow-sm"
              >
                تسجيل الدخول
              </NavLink>
            </motion.div>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? (
              <FaTimes className="text-xl" />
            ) : (
              <>
                <div className="w-6 h-0.5 bg-current" />
                <div className="w-6 h-0.5 bg-current my-1.5" />
                <div className="w-6 h-0.5 bg-current" />
              </>
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden"
            >
              <motion.nav
                ref={menuRef}
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-xl p-6"
              >
                <div className="flex justify-between items-center mb-8">
                  <img src={Logoelsarh} alt="Logo" className="w-12" />
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NavLink
                        to={link.path}
                        style={navLinkStyle}
                        className="block p-3 text-lg font-medium rounded-lg
                                 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.title}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

const UserMenuItem = ({ icon, text, href, onClick, isRed = false }) => {
  const content = (
    <motion.div
      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg cursor-pointer
        ${isRed 
          ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' 
          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'}
        transition-colors`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <span className="text-lg">{icon}</span>
      <span>{text}</span>
    </motion.div>
  );

  return href ? (
    <Link to={href} className="block no-underline">
      {content}
    </Link>
  ) : (
    content
  );
};
"use client";
import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Logoelsarh from '../../assets/images/logoElsarh.png';
import {
  FaColumns, FaCogs,
  FaDoorOpen, FaUser, FaTimes,
  FaBars, FaPhoneAlt
} from "react-icons/fa";
import { BsGrid1X2Fill } from "react-icons/bs";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const { config } = useSelector(state => state.config);
  const dispatch = useDispatch();
  const menuRef = useRef(null);
  const userMenuRef = useRef(null);
  const [dynamicPages, setDynamicPages] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch('/api/cms/pages');
        const data = await res.json();
        if (res.ok) setDynamicPages(data);
      } catch (err) {}
    };
    fetchPages();
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
    { title: t('home') || 'الرئيسية', path: '/' },
    { title: t('listings') || 'المشاريع', path: '/Project' },
    ...dynamicPages.map(p => ({
      title: p.title[currentLang] || p.title['ar'] || p.title['en'],
      path: `/p/${p.slug}`
    })),
    { title: t('blog') || 'المدونة', path: '/Blogs' },
    { title: t('about') || 'من نحن', path: '/About' },
    { title: t('contact') || 'اتصل بنا', path: '/Contact' },
  ];

  const handleSignout = async () => {
    try {
      dispatch(logOutUserStart());
      const res = await fetch('/api/user/signout', { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      dispatch(logOutUserSuccess());
    } catch (e) {
      dispatch(logOutUserFailure(e.message));
    }
  };

  return (
    <header
      dir="rtl"
      className="fixed top-0 inset-x-0 z-[100] transition-all duration-500 font-body"
      style={{
        background: isScrolled
          ? 'rgba(18,40,60,0.92)'
          : 'rgba(18,40,60,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isScrolled
          ? '1px solid rgba(223,186,107,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isScrolled ? '0 8px 40px rgba(18,40,60,0.4)' : 'none',
      }}
    >
      <div className="container mx-auto px-4 lg:px-12 h-[72px] flex items-center justify-between">

        {/* ===== شعار الشركة ===== */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div
            className="w-12 h-12 flex items-center justify-center overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(223,186,107,0.25)' }}
          >
            <img
              src={(config.logo && config.logo.startsWith('http')) ? config.logo : Logoelsarh}
              alt="الصرح للتطوير العقاري"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-black text-base leading-tight tracking-tight">
              الصرح
            </p>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#DFBA6B' }}>
              للعقارات
            </p>
          </div>
        </Link>

        {/* ===== روابط التنقل (Desktop) ===== */}
        <nav className="hidden lg:flex items-center">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-5 py-2 mx-0.5 text-xs font-bold tracking-widest transition-all duration-300 relative group ${
                  isActive
                    ? 'text-[#DFBA6B]'
                    : 'text-white/80 hover:text-[#DFBA6B]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.title}
                  <span
                    className="absolute bottom-0 right-0 left-0 h-0.5 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(to right, #8A6924, #DFBA6B)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'right',
                    }}
                  />
                  <span
                    className="absolute bottom-0 right-0 left-0 h-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:scale-x-100"
                    style={{
                      background: 'linear-gradient(to right, #8A6924, #DFBA6B)',
                      transform: 'scaleX(0)',
                      transformOrigin: 'right',
                    }}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ===== أدوات اليمين ===== */}
        <div className="flex items-center gap-3">
          {/* رقم الهاتف */}
          {config?.contact?.phone && (
            <a
              href={`tel:${config.contact.phone}`}
              className="hidden xl:flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all duration-300"
              style={{
                background: 'rgba(138,105,36,0.2)',
                border: '1px solid rgba(223,186,107,0.3)',
                color: '#DFBA6B',
              }}
            >
              <FaPhoneAlt size={11} />
              <span dir="ltr">{config.contact.phone}</span>
            </a>
          )}

          {/* حساب المستخدم */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 transition-all duration-300"
                style={{
                  background: 'rgba(138,105,36,0.2)',
                  border: '1px solid rgba(223,186,107,0.3)',
                }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="text-xs font-bold text-white hidden sm:block max-w-[80px] truncate">
                  {currentUser.name?.split(' ')[0]}
                </span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-0 top-full mt-2 w-56 overflow-hidden z-50"
                    style={{
                      background: 'rgba(18,40,60,0.95)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid rgba(223,186,107,0.2)',
                      boxShadow: '0 20px 60px rgba(18,40,60,0.6)',
                    }}
                  >
                    {/* هيدر المستخدم */}
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(223,186,107,0.1)' }}>
                      <p className="text-xs font-black text-white">{currentUser.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#DFBA6B' }}>{currentUser.email}</p>
                    </div>

                    <div className="py-1.5">
                      <UserMenuItem icon={<FaUser />} text="ملفي الشخصي" href="/Dashboard?tab=Profile" onClick={() => setIsUserMenuOpen(false)} />
                      {(currentUser.isAdmin || currentUser.role === 'Sales') && (
                        <>
                          <UserMenuItem icon={<BsGrid1X2Fill />} text="لوحة التحكم" href="/Dashboard?tab=dashbordData" onClick={() => setIsUserMenuOpen(false)} />
                          <UserMenuItem icon={<FaColumns />} text="إضافة مشروع" href="/CreatePage" onClick={() => setIsUserMenuOpen(false)} />
                          {currentUser.isAdmin && (
                            <UserMenuItem icon={<FaCogs />} text="إعدادات الموقع" href="/Admin-Settings" onClick={() => setIsUserMenuOpen(false)} />
                          )}
                        </>
                      )}
                    </div>

                    <div className="py-1.5 border-t" style={{ borderColor: 'rgba(223,186,107,0.1)' }}>
                      <button
                        onClick={() => { handleSignout(); setIsUserMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <FaDoorOpen size={14} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/Signin"
              className="px-5 py-2.5 text-xs font-black tracking-widest transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(138,105,36,0.35)',
              }}
            >
              دخول
            </Link>
          )}

          {/* زر القائمة Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white/80 hover:text-[#DFBA6B] transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {isMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ===== Mobile Drawer ===== */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-[110] lg:hidden"
              style={{ background: 'rgba(18,40,60,0.7)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-[280px] z-[120] lg:hidden flex flex-col overflow-hidden"
              style={{
                background: 'rgba(18,40,60,0.97)',
                backdropFilter: 'blur(32px)',
                borderLeft: '1px solid rgba(223,186,107,0.15)',
              }}
            >
              {/* هيدر الدرج */}
              <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(223,186,107,0.12)' }}>
                <div className="flex items-center gap-3">
                  <img src={Logoelsarh} alt="الصرح" className="h-9 w-auto" />
                  <span className="text-white font-black text-sm">{config.siteName || 'الصرح للتطوير العقاري'}</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="text-white/50 hover:text-[#DFBA6B] transition-colors">
                  <FaTimes size={18} />
                </button>
              </div>

              {/* روابط الدرج */}
              <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3.5 text-sm font-bold tracking-wide transition-all ${
                          isActive
                            ? 'text-[#DFBA6B] bg-white/5'
                            : 'text-white/70 hover:text-[#DFBA6B] hover:bg-white/5'
                        }`
                      }
                      style={({ isActive }) => ({
                        borderRight: isActive ? '3px solid #8A6924' : '3px solid transparent',
                      })}
                    >
                      {link.title}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* قدم الدرج */}
              {config?.contact?.phone && (
                <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(223,186,107,0.12)' }}>
                  <a
                    href={`tel:${config.contact.phone}`}
                    className="flex items-center gap-3 text-sm font-bold"
                    style={{ color: '#DFBA6B' }}
                  >
                    <FaPhoneAlt size={14} />
                    <span dir="ltr">{config.contact.phone}</span>
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

const UserMenuItem = ({ icon, text, href, onClick }) => {
  const inner = (
    <div
      className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-white/70 hover:text-[#DFBA6B] hover:bg-white/5 transition-all cursor-pointer"
      onClick={onClick}
    >
      <span className="text-sm">{icon}</span>
      <span>{text}</span>
    </div>
  );
  return href ? <Link to={href} className="block">{inner}</Link> : inner;
};

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
  FaBars, FaBell, FaChevronDown, FaGear, FaPalette,
  FaArrowRightFromBracket, FaCrown, FaMoon, FaSun, FaRotateLeft, FaWandMagicSparkles,
} from 'react-icons/fa6';
import { toggleSidebar, setSidebarMobile } from '../../store/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { logout, exitImpersonation } from '../../store/authSlice';
import { setUserTheme, resetUserTheme } from '../../store/themeSlice';
import { useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../dashboard/NotificationsDropdown';
import CommandPalette from '../ui/CommandPalette';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const company  = useSelector(s => s.auth.company);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const theme = useSelector(s => s.theme);

  const { isImpersonating } = useSelector(s => s.auth);
  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const handleExitImpersonation = () => { dispatch(exitImpersonation()); navigate('/dashboard'); };

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-5 py-2.5 border-b"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', minHeight: 58, backdropFilter: 'blur(8px)' }}
    >
      {/* Hamburger - mobile */}
      <button
        className="lg:hidden btn btn-ghost btn-icon p-2 rounded-lg"
        onClick={() => dispatch(setSidebarMobile(true))}
      >
        <FaBars className="text-base" style={{ color: 'var(--color-text-muted)' }} />
      </button>

      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}>
          <FaCrown className="text-[10px]" style={{ color: '#f59e0b' }} />
          <span>تعمل كمدير شركة</span>
          <button onClick={handleExitImpersonation}
            className="mr-1 px-2 py-0.5 rounded font-bold transition-colors hover:bg-amber-200"
            style={{ color: '#92400e' }}>
            العودة ←
          </button>
        </div>
      )}

      {/* Search / Command Palette trigger */}
      <div className="flex-1">
        <CommandPalette />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">

        {/* Dark mode quick toggle */}
        <button
          className="p-2.5 rounded-lg transition-colors hover:bg-gray-100"
          onClick={() => dispatch(setUserTheme({ darkMode: !theme.darkMode }))}
          title={theme.darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          style={{ color: 'var(--color-text-muted)' }}
        >
          {theme.darkMode ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
        </button>

        {/* Personal theme customizer */}
        <div className="relative">
          <button
            className="p-2.5 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => { setShowCustomizer(!showCustomizer); setShowNotifs(false); setShowProfile(false); }}
            title="مظهري الشخصي"
            style={{ color: showCustomizer ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          >
            <FaWandMagicSparkles className="text-base" />
          </button>
          <AnimatePresence>
            {showCustomizer && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute left-0 top-11 w-72 card shadow-xl z-50 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-dark)' }}>مظهري الشخصي</p>
                  <button onClick={() => dispatch(resetUserTheme())}
                    className="flex items-center gap-1 text-[11px] font-bold cursor-pointer bg-transparent border-none"
                    style={{ color: 'var(--color-primary)' }}>
                    <FaRotateLeft className="text-[9px]" /> استعادة الافتراضي
                  </button>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  تفضيلاتك تُحفظ في متصفحك ولا تؤثر على باقي المستخدمين.
                </p>

                {/* Primary color */}
                <label className="block text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>اللون الأساسي</label>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {['#da1f27', '#009756', '#fbb140', '#2563eb', '#7c3aed', '#0d9488', '#db2777', '#231f20'].map(c => (
                    <button key={c} onClick={() => dispatch(setUserTheme({ primaryColor: c }))}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        background: c,
                        transform: theme.primaryColor === c ? 'scale(1.2)' : 'scale(1)',
                        border: theme.primaryColor === c ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: theme.primaryColor === c ? `0 0 0 2px ${c}` : 'none',
                        cursor: 'pointer',
                      }} />
                  ))}
                  <div className="relative w-7 h-7">
                    <input type="color" value={theme.primaryColor || '#da1f27'}
                      onChange={e => dispatch(setUserTheme({ primaryColor: e.target.value }))}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                    <div className="w-7 h-7 rounded-full border-2 border-dashed flex items-center justify-center text-[9px] font-black"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>+</div>
                  </div>
                </div>

                {/* Accent color */}
                <label className="block text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>لون التمييز</label>
                <div className="flex gap-1.5 mb-4 flex-wrap">
                  {['#fbb140', '#da1f27', '#009756', '#2563eb', '#7c3aed', '#db2777'].map(c => (
                    <button key={c} onClick={() => dispatch(setUserTheme({ accentColor: c }))}
                      className="w-7 h-7 rounded-full transition-transform"
                      style={{
                        background: c,
                        transform: theme.accentColor === c ? 'scale(1.2)' : 'scale(1)',
                        border: theme.accentColor === c ? '2px solid #fff' : '2px solid transparent',
                        boxShadow: theme.accentColor === c ? `0 0 0 2px ${c}` : 'none',
                        cursor: 'pointer',
                      }} />
                  ))}
                </div>

                {/* Dark mode */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-dark)' }}>الوضع الليلي</span>
                  <button onClick={() => dispatch(setUserTheme({ darkMode: !theme.darkMode }))}
                    className="relative w-10 h-5.5 rounded-full transition-all"
                    style={{ backgroundColor: theme.darkMode ? 'var(--color-primary)' : 'var(--color-border)', height: 22, cursor: 'pointer', border: 'none' }}>
                    <div className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-all"
                      style={{ width: 18, height: 18, left: theme.darkMode ? 20 : 2 }} />
                  </button>
                </div>

                {/* Font scale */}
                <label className="block text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>حجم الخط</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: '93.75%', label: 'صغير' },
                    { value: '100%',   label: 'عادي' },
                    { value: '106.25%', label: 'كبير' },
                  ].map(o => (
                    <button key={o.value} onClick={() => dispatch(setUserTheme({ fontScale: o.value }))}
                      className="py-1.5 rounded-lg text-[11px] font-bold transition-all"
                      style={{
                        border: '1px solid',
                        borderColor: (theme.fontScale || '100%') === o.value ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: (theme.fontScale || '100%') === o.value ? 'var(--color-primary)' : 'transparent',
                        color: (theme.fontScale || '100%') === o.value ? '#fff' : 'var(--color-text-dark)',
                        cursor: 'pointer',
                      }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2.5 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            style={{ color: 'var(--color-text-muted)' }}
          >
            <FaBell className="text-base" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute left-0 top-11 w-80 card shadow-xl z-50"
              >
                <NotificationsDropdown onClose={() => setShowNotifs(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-gray-100"
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--color-text-dark)' }}>
                {user?.name}
              </p>
              <p className="text-[10px] leading-tight flex items-center gap-1" style={{ color: user?.isSuperAdmin ? '#b8860b' : 'var(--color-text-muted)' }}>
                {user?.isSuperAdmin && <FaCrown className="text-[9px]" style={{ color: '#fbb140' }} />}
                {user?.isSuperAdmin ? 'مشرف عام' : user?.role?.label || 'مستخدم'}
              </p>
            </div>
            <FaChevronDown className="text-[10px] hidden sm:block" style={{ color: 'var(--color-text-muted)' }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="absolute left-0 top-12 w-52 card shadow-xl z-50 py-1.5 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: 'var(--color-primary)' }}>
                      {user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-dark)' }}>{user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                    </div>
                  </div>
                  {company?.name && (
                    <div className="mt-2 text-[10px] font-semibold px-2 py-1 rounded-lg w-fit"
                      style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}>
                      {company.name}
                    </div>
                  )}
                </div>
                {/* Menu items */}
                <div className="py-1">
                  <Link to="/settings" onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                    style={{ color: 'var(--color-text-dark)' }}>
                    <FaGear className="text-xs" style={{ color: 'var(--color-text-muted)' }} />
                    الإعدادات
                  </Link>
                  <Link to="/theme" onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
                    style={{ color: 'var(--color-text-dark)' }}>
                    <FaPalette className="text-xs" style={{ color: 'var(--color-text-muted)' }} />
                    الثيم والمظهر
                  </Link>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)' }} className="py-1">
                  <button onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-sm transition-colors text-right"
                    style={{ color: '#b91c1c' }}>
                    <FaArrowRightFromBracket className="text-xs" />
                    تسجيل الخروج
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

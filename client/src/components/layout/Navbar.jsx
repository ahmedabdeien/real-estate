import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaBell, FaChevronDown, FaUser, FaGear, FaPalette, FaArrowRightFromBracket } from 'react-icons/fa6';
import { toggleSidebar, setSidebarMobile } from '../../store/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/authSlice';
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

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

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

      {/* Search / Command Palette trigger */}
      <div className="flex-1">
        <CommandPalette />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">

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
              <p className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
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

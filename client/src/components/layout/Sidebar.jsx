import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGauge, FaBuilding, FaCity, FaUsers,
  FaFileContract, FaFileInvoice, FaMoneyBillWave,
  FaGear, FaPalette, FaBell, FaComments, FaClipboardList,
  FaArrowRightFromBracket, FaChevronDown, FaBuildingColumns,
  FaLayerGroup, FaUserTie, FaChevronLeft, FaChevronRight,
  FaFolderOpen, FaChartBar, FaShield, FaCalendarCheck,
  FaBullhorn, FaNewspaper, FaWandMagicSparkles, FaImages, FaLock,
  FaCodeBranch,
} from 'react-icons/fa6';
import { logout } from '../../store/authSlice';
import { toggleSidebar, setSidebarMobile } from '../../store/uiSlice';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import logoWhite from '../../assets/logo-white.svg';
import logoIconDark from '../../assets/logo-icon-dark.svg';

const SIDEBAR_BG   = 'var(--sidebar-bg, #0F0E0E)';
const ITEM_COLOR   = 'var(--sidebar-text, rgba(255,255,255,0.68))';
const ITEM_HOVER   = 'rgba(255,255,255,0.06)';
const GROUP_COLOR  = 'var(--sidebar-group, rgba(255,255,255,0.28))';
const ACTIVE_BG    = 'var(--sidebar-active-bg, rgba(218,31,39,0.35))';
const ACTIVE_COLOR = 'var(--sidebar-active-color, #ff7b82)';

const menuGroups = [
  {
    label: 'الرئيسية',
    items: [{ label: 'لوحة التحكم', icon: FaGauge, path: '/dashboard' }],
  },
  {
    label: 'العقارات',
    items: [
      { label: 'المشاريع',  icon: FaCity,    path: '/properties' },
      { label: 'الوحدات',   icon: FaBuilding, path: '/units' },
      { label: 'العملاء',   icon: FaUserTie,  path: '/customers' },
    ],
  },
  {
    label: 'المالية',
    items: [
      { label: 'العقود',       icon: FaFileContract,    path: '/contracts',    module: 'contracts' },
      { label: 'الأقساط',      icon: FaCalendarCheck,   path: '/installments', module: 'installments' },
      { label: 'الفواتير',     icon: FaFileInvoice,     path: '/invoices',     module: 'accounting' },
      { label: 'المدفوعات',    icon: FaMoneyBillWave,   path: '/payments',     module: 'accounting' },
      { label: 'المصروفات',    icon: FaBuildingColumns, path: '/expenses',     module: 'accounting' },
    ],
  },
  {
    label: 'التقارير',
    items: [{ label: 'التقارير والإحصاءات', icon: FaChartBar, path: '/reports', module: 'reports' }],
  },
  {
    label: 'التواصل',
    items: [
      { label: 'الإشعارات',        icon: FaBell,     path: '/notifications', module: 'notifications' },
      { label: 'الرسائل الداخلية',  icon: FaComments, path: '/chat',          module: 'notifications' },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { label: 'المستخدمون',         icon: FaUsers,         path: '/users' },
      { label: 'الأدوار والصلاحيات',  icon: FaShield,        path: '/roles',     module: 'roles' },
      { label: 'المستندات',           icon: FaFolderOpen,    path: '/documents', module: 'documents' },
      { label: 'سجل العمليات',       icon: FaClipboardList,  path: '/audit',     module: 'activity' },
    ],
  },
  {
    label: 'التسويق',
    items: [
      { label: 'محرر الموقع',  icon: FaWandMagicSparkles, path: '/marketing/cms',   module: 'theme' },
      { label: 'المقالات',     icon: FaNewspaper,          path: '/marketing/blogs', module: 'theme' },
      { label: 'مكتبة الصور', icon: FaImages,             path: '/marketing/media', module: 'media' },
    ],
  },
  {
    label: 'الإعدادات',
    items: [
      { label: 'الثيم والمظهر',    icon: FaPalette,    path: '/theme',    module: 'theme' },
      { label: 'الإعدادات',       icon: FaGear,       path: '/settings' },
      { label: 'سجل التحديثات',   icon: FaCodeBranch, path: '/updates' },
    ],
  },
];

const superAdminGroup = {
  label: 'المشرف العام',
  items: [
    { label: 'إدارة الشركات', icon: FaLayerGroup, path: '/super/companies' },
    { label: 'خطط الاشتراك',  icon: FaFolderOpen,  path: '/super/plans' },
  ],
};

const SidebarItem = ({ item, collapsed }) => {
  const Icon = item.icon;
  const { can } = usePlanFeatures();
  const locked = item.module && !can(item.module);

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      className="group flex items-center gap-3 px-3 py-[9px] rounded-lg text-sm transition-all duration-150 relative outline-none"
      style={({ isActive }) => ({
        backgroundColor: isActive ? ACTIVE_BG   : 'transparent',
        color:           isActive ? ACTIVE_COLOR : locked ? 'rgba(255,255,255,0.35)' : ITEM_COLOR,
        fontWeight:      isActive ? 700 : 500,
      })}
      onMouseEnter={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.backgroundColor = ITEM_HOVER; }}
      onMouseLeave={e => { if (!e.currentTarget.dataset.active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute right-0 top-[6px] bottom-[6px] w-[3px] rounded-full"
              style={{ backgroundColor: ACTIVE_COLOR }}
            />
          )}
          <Icon className="text-[15px] flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.16 }}
                className="truncate leading-none flex-1"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {locked && !collapsed && (
            <FaLock className="text-[10px] opacity-50 flex-shrink-0" />
          )}
        </>
      )}
    </NavLink>
  );
};

const SidebarContent = ({ collapsed }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const [openGroups, setOpenGroups] = useState(
    () => Object.fromEntries([...menuGroups, superAdminGroup].map(g => [g.label, true]))
  );

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };
  const toggle = (label) => setOpenGroups(p => ({ ...p, [label]: !p[label] }));

  const allGroups = user?.isSuperAdmin
    ? [superAdminGroup, ...menuGroups]
    : menuGroups.filter(g => g.label !== 'التسويق');

  return (
    <div className="flex flex-col h-full select-none" style={{ backgroundColor: SIDEBAR_BG }}>

      {/* ── Logo ── */}
      <div
        className={`flex items-center ${collapsed ? 'justify-center px-2' : 'px-5'} py-[18px]`}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', minHeight: 68 }}
      >
        {collapsed ? (
          <img src={logoIconDark} alt="EgyEstate" className="w-9 h-9 object-contain" />
        ) : (
          <img src={logoWhite} alt="EgyEstate" className="h-9 object-contain" />
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-[1px]"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {allGroups.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed ? (
              <button
                onClick={() => toggle(group.label)}
                className="w-full flex items-center justify-between px-3 py-[5px] mb-[3px] text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors rounded"
                style={{ color: GROUP_COLOR, letterSpacing: '0.12em' }}
              >
                <span>{group.label}</span>
                <FaChevronDown
                  className="text-[9px] transition-transform duration-200"
                  style={{ transform: openGroups[group.label] ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                />
              </button>
            ) : (
              <div className="h-px mx-2 my-2" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            )}
            <AnimatePresence initial={false}>
              {(collapsed || openGroups[group.label]) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden space-y-[2px]"
                >
                  {group.items.map(item => (
                    <SidebarItem key={item.path} item={item} collapsed={collapsed} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* ── User footer ── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px 10px' }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 mb-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: 'var(--sidebar-active-color, #da1f27)' }}
            >
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name}</p>
              <p className="text-xs truncate" style={{ color: GROUP_COLOR }}>
                {user?.isSuperAdmin ? 'مشرف عام' : user?.role?.label || ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: 'var(--sidebar-active-color, #da1f27)' }}>
              {user?.name?.charAt(0)}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,80,80,0.85)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,50,50,0.12)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          title={collapsed ? 'تسجيل الخروج' : undefined}
        >
          <FaArrowRightFromBracket className="flex-shrink-0 text-sm" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarCollapsed, sidebarMobileOpen } = useSelector(s => s.ui);

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 62 : 262 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="hidden lg:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden z-30"
        style={{ boxShadow: '2px 0 12px rgba(0,0,0,0.18)' }}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="hidden lg:flex fixed z-40 items-center justify-center w-5 h-8 rounded-full shadow-md"
        style={{
          right: sidebarCollapsed ? 50 : 250,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          transition: 'right 0.3s cubic-bezier(.4,0,.2,1)',
          border: 'none',
        }}
      >
        {sidebarCollapsed ? <FaChevronLeft className="text-[10px]" /> : <FaChevronRight className="text-[10px]" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => dispatch(setSidebarMobile(false))}
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-64 lg:hidden"
            >
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

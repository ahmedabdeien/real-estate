import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/authSlice';
import {
  FaMagnifyingGlass, FaGauge, FaCity, FaBuilding, FaUserTie,
  FaFileContract, FaFileInvoice, FaMoneyBillWave, FaBuildingColumns,
  FaChartBar, FaBell, FaComments, FaUsers, FaShield, FaClipboardList,
  FaPalette, FaGear, FaLayerGroup, FaFolderOpen, FaArrowRightFromBracket,
  FaKeyboard, FaCalendarCheck, FaClock, FaFire,
} from 'react-icons/fa6';

const ALL_COMMANDS = [
  { id: 'dashboard',     label: 'لوحة التحكم',         path: '/dashboard',       icon: FaGauge,                group: 'الصفحات',     shortcut: 'D' },
  { id: 'properties',   label: 'المشاريع',              path: '/properties',      icon: FaCity,                 group: 'الصفحات',     shortcut: 'P' },
  { id: 'units',        label: 'الوحدات',               path: '/units',           icon: FaBuilding,             group: 'الصفحات' },
  { id: 'customers',    label: 'العملاء',               path: '/customers',       icon: FaUserTie,              group: 'الصفحات',     shortcut: 'C' },
  { id: 'contracts',    label: 'العقود',                path: '/contracts',       icon: FaFileContract,         group: 'الصفحات' },
  { id: 'installments', label: 'الأقساط',               path: '/installments',    icon: FaCalendarCheck,        group: 'الصفحات' },
  { id: 'invoices',     label: 'الفواتير',              path: '/invoices',        icon: FaFileInvoice,          group: 'الصفحات' },
  { id: 'payments',     label: 'المدفوعات',             path: '/payments',        icon: FaMoneyBillWave,        group: 'الصفحات' },
  { id: 'expenses',     label: 'المصروفات',             path: '/expenses',        icon: FaBuildingColumns,      group: 'الصفحات' },
  { id: 'reports',      label: 'التقارير والإحصاءات',   path: '/reports',         icon: FaChartBar,             group: 'الصفحات',     shortcut: 'R' },
  { id: 'notifications',label: 'الإشعارات',             path: '/notifications',   icon: FaBell,                 group: 'الصفحات' },
  { id: 'chat',         label: 'الرسائل الداخلية',      path: '/chat',            icon: FaComments,             group: 'الصفحات' },
  { id: 'users',        label: 'المستخدمون',            path: '/users',           icon: FaUsers,                group: 'الإدارة' },
  { id: 'roles',        label: 'الأدوار والصلاحيات',   path: '/roles',           icon: FaShield,               group: 'الإدارة' },
  { id: 'audit',        label: 'سجل العمليات',          path: '/audit',           icon: FaClipboardList,        group: 'الإدارة' },
  { id: 'theme',        label: 'الثيم والمظهر',         path: '/theme',           icon: FaPalette,              group: 'الإعدادات' },
  { id: 'settings',     label: 'الإعدادات',             path: '/settings',        icon: FaGear,                 group: 'الإعدادات' },
  { id: 'companies',    label: 'إدارة الشركات',         path: '/super/companies', icon: FaLayerGroup,           group: 'المشرف العام' },
  { id: 'plans',        label: 'خطط الاشتراك',          path: '/super/plans',     icon: FaFolderOpen,           group: 'المشرف العام' },
  { id: 'logout',       label: 'تسجيل الخروج',          action: 'logout',         icon: FaArrowRightFromBracket, group: 'الحساب' },
];

const SHORTCUTS = { KeyD: '/dashboard', KeyP: '/properties', KeyC: '/customers', KeyR: '/reports' };

const RECENT_KEY = 'cp_recent';
const getRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } };
const addRecent = (id) => {
  const prev = getRecent().filter(x => x !== id).slice(0, 4);
  localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev]));
};

const CommandPalette = () => {
  const [open, setOpen]         = useState(false);
  const [query, setQuery]       = useState('');
  const [selected, setSelected] = useState(0);
  const [recent, setRecent]     = useState(getRecent);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(p => !p);
        setQuery('');
        setSelected(0);
        setRecent(getRecent());
      }
      if (!open && e.altKey && !e.ctrlKey && !e.metaKey) {
        const dest = SHORTCUTS[e.code];
        if (dest) { e.preventDefault(); navigate(dest); }
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, navigate]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40); }, [open]);

  const filtered = query
    ? ALL_COMMANDS.filter(c => c.label.includes(query) || c.group?.includes(query))
    : ALL_COMMANDS.filter(c => recent.includes(c.id))
        .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));

  const grouped = filtered.reduce((acc, cmd) => {
    const g = query ? cmd.group : 'الأخيرة';
    if (!acc[g]) acc[g] = [];
    acc[g].push(cmd);
    return acc;
  }, {});

  if (!query && filtered.length === 0) {
    grouped['الصفحات'] = ALL_COMMANDS.filter(c => c.group === 'الصفحات').slice(0, 5);
  }

  const flat = Object.values(grouped).flat();

  const execute = useCallback((cmd) => {
    setOpen(false);
    setQuery('');
    addRecent(cmd.id);
    setRecent(getRecent());
    if (cmd.action === 'logout') { dispatch(logout()); navigate('/login'); }
    else if (cmd.path) navigate(cmd.path);
  }, [navigate, dispatch]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, flat.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && flat[selected]) execute(flat[selected]);
  };

  let globalIdx = 0;

  return (
    <>
      <button
        onClick={() => { setOpen(true); setQuery(''); setSelected(0); setRecent(getRecent()); }}
        className="hidden md:flex items-center gap-2.5 px-3 py-2 rounded-xl border text-sm transition-all hover:shadow-sm"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-background)', minWidth: 220 }}
        title="Ctrl+K"
      >
        <FaMagnifyingGlass className="text-xs opacity-60" />
        <span className="flex-1 text-right text-xs opacity-70">بحث سريع في النظام...</span>
        <kbd className="text-[10px] px-1.5 py-0.5 rounded-md font-mono"
          style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          Ctrl K
        </kbd>
      </button>

      {createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              style={{ zIndex: 99999 }}
              onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="fixed top-[10%] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
              style={{
                zIndex: 100000,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
                  <FaMagnifyingGlass className="text-white text-sm" />
                </div>
                <input
                  ref={inputRef}
                  className="flex-1 bg-transparent outline-none text-base font-medium"
                  style={{ color: 'var(--color-text-dark)' }}
                  placeholder="ابحث عن صفحة، إجراء، أو عميل..."
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0); }}
                  onKeyDown={handleKey}
                />
                {query && (
                  <button onClick={() => { setQuery(''); setSelected(0); inputRef.current?.focus(); }}
                    className="text-xs px-2 py-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--color-background)' }}>
                    مسح
                  </button>
                )}
                <kbd className="text-[10px] px-2 py-1 rounded-lg border font-mono flex-shrink-0"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-background)' }}>
                  ESC
                </kbd>
              </div>

              {/* Context bar */}
              {!query && (
                <div className="flex items-center gap-2 px-5 py-2.5"
                  style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
                  <FaClock className="text-xs opacity-40" />
                  <span className="text-xs opacity-50">مؤخراً — اكتب للبحث في كل الصفحات</span>
                  <div className="mr-auto flex items-center gap-1.5 text-[10px] opacity-40">
                    <FaFire className="text-xs" />
                    <span>مرحباً {user?.name?.split(' ')[0]}</span>
                  </div>
                </div>
              )}

              {/* Results */}
              <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                {flat.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMagnifyingGlass className="text-3xl mx-auto mb-3 opacity-20" />
                    <p className="text-sm opacity-40">لا توجد نتائج لـ "{query}"</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([group, items]) => (
                    <div key={group} className="py-1">
                      <p className="px-5 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                        style={{ color: 'var(--color-text-muted)' }}>
                        {group === 'الأخيرة' && <FaClock className="text-[10px]" />}
                        {group}
                      </p>
                      {items.map((cmd) => {
                        const idx = globalIdx++;
                        const isSelected = idx === selected;
                        const Icon = cmd.icon;
                        const isCurrent = cmd.path && location.pathname === cmd.path;
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => execute(cmd)}
                            onMouseEnter={() => setSelected(idx)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-right transition-all"
                            style={{
                              backgroundColor: isSelected
                                ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                                : 'transparent',
                              color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-dark)',
                            }}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                              style={{
                                backgroundColor: isSelected || isCurrent
                                  ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                                  : 'var(--color-background)',
                              }}>
                              <Icon className="text-sm"
                                style={{ color: isSelected || isCurrent ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                            </div>
                            <span className="flex-1 text-sm font-medium">{cmd.label}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
                                الصفحة الحالية
                              </span>
                            )}
                            {cmd.shortcut && !isCurrent && (
                              <kbd className="text-[10px] px-1.5 py-0.5 rounded-md border font-mono"
                                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-background)' }}>
                                Alt+{cmd.shortcut}
                              </kbd>
                            )}
                            {isSelected && !isCurrent && (
                              <span className="text-[10px] opacity-40">Enter ↵</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-5 px-5 py-3 text-[11px]"
                style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'var(--color-background)' }}>
                <span className="flex items-center gap-1.5">
                  <kbd className="border rounded-md px-1.5 py-0.5 font-mono" style={{ borderColor: 'var(--color-border)' }}>↑↓</kbd>
                  تنقل
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="border rounded-md px-1.5 py-0.5 font-mono" style={{ borderColor: 'var(--color-border)' }}>Enter</kbd>
                  فتح
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="border rounded-md px-1.5 py-0.5 font-mono" style={{ borderColor: 'var(--color-border)' }}>Esc</kbd>
                  إغلاق
                </span>
                <span className="mr-auto opacity-60 flex items-center gap-1"><FaKeyboard className="text-[10px]" /> Ctrl+K</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
};

export default CommandPalette;

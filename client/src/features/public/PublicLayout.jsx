import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars, FaXmark, FaChevronDown, FaArrowLeft,
  FaLinkedin, FaXTwitter, FaYoutube, FaInstagram,
  FaEnvelope, FaPhone, FaLocationDot,
  FaCircleCheck,
} from 'react-icons/fa6';
import logoWhite from '../../assets/logo-white.svg';

const P    = '#c8161d';
const A    = '#fbb140';
const DARK = '#231f20';

/* ─── NAV DATA ─── */
const NAV_LINKS = [
  { label: 'المميزات', to: '/#features' },
  { label: 'الأسعار',  to: '/#pricing' },
  { label: 'كيف يعمل', to: '/#how' },
];

const FOOTER_COLS = [
  {
    title: 'المنتج',
    links: [
      { label: 'المميزات',   to: '/#features' },
      { label: 'الأسعار',    to: '/#pricing' },
      { label: 'كيف يعمل',  to: '/#how' },
      { label: 'آراء العملاء', to: '/#testimonials' },
    ],
  },
  {
    title: 'الموارد',
    links: [
      { label: 'تسجيل الدخول', to: '/login' },
    ],
  },
  {
    title: 'قانوني',
    links: [
      { label: 'شروط الاستخدام', to: '/terms' },
      { label: 'سياسة الخصوصية', to: '/privacy' },
    ],
  },
];

/* ─── MEGA DROPDOWN ─── */
const MegaDropdown = ({ item, isLight }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const isActive = item.children?.some(c => location.pathname === c.to);
  const timer = useRef(null);

  const show  = () => { clearTimeout(timer.current); setOpen(true); };
  const hide  = () => { timer.current = setTimeout(() => setOpen(false), 120); };

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        className={`flex items-center gap-1 text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 ${
          isLight
            ? isActive
              ? 'text-gray-900 bg-gray-100'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            : isActive
              ? 'text-white bg-white/10'
              : 'text-white/70 hover:text-white hover:bg-white/8'
        }`}>
        {item.label}
        <FaChevronDown className={`text-[8px] transition-transform duration-200 ${open ? 'rotate-180' : ''} opacity-60`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onMouseEnter={show} onMouseLeave={hide}
            className="absolute top-full right-0 mt-2 w-72 rounded-2xl overflow-hidden shadow-2xl z-50 border"
            style={{ background: '#1a1212', borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="p-2">
              {item.children.map((c) => {
                const Icon = c.icon;
                const active = location.pathname === c.to;
                return (
                  <Link key={c.to} to={c.to}
                    className={`flex items-start gap-3 px-3 py-3 rounded-xl transition-all group ${
                      active ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                      style={{ background: active ? `${P}30` : 'rgba(255,255,255,0.06)' }}>
                      <Icon className="text-xs" style={{ color: active ? P : 'rgba(255,255,255,0.5)' }} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-none mb-1 ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                        {c.label}
                      </p>
                      <p className="text-xs text-white/35 leading-snug">{c.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── PUBLIC NAV ─── */
export const PublicNav = ({ transparent = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExp, setMobileExp]   = useState({});
  const [scrollY, setScrollY]       = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); setMobileExp({}); }, [location.pathname]);

  const scrolled = scrollY > 40;
  /* When transparent: start clear, go frosted-dark after scroll.
     When not transparent: always dark solid. */
  const showSolid = !transparent || scrolled;

  return (
    <>
      <header
        className={`${transparent ? 'fixed' : 'sticky'} inset-x-0 top-0 z-50 transition-all duration-300`}
        style={{
          background: showSolid
            ? scrolled && transparent
              ? 'rgba(35,31,32,0.92)'
              : DARK
            : 'transparent',
          backdropFilter: showSolid ? 'blur(16px) saturate(1.5)' : 'none',
          borderBottom: showSolid ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>

        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <img
              src={logoWhite}
              alt="EgyEstate"
              className="h-8 object-contain transition-all"
            />
          </Link>

          {/* ── Desktop Links ── */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(l =>
              l.children ? (
                <MegaDropdown key={l.label} item={l} isLight={false} />
              ) : (
                <Link key={l.to} to={l.to}
                  className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 ${
                    location.pathname === l.to
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/8'
                  }`}>
                  {l.label}
                </Link>
              )
            )}
          </nav>

          {/* ── CTA ── */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <Link to="/login"
              className="text-sm font-medium text-white/60 hover:text-white px-3 py-2 rounded-xl transition-all hover:bg-white/5">
              تسجيل الدخول
            </Link>
            <Link to="/login"
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: P, boxShadow: `0 2px 12px ${P}60` }}>
              ابدأ مجاناً
              <FaArrowLeft className="text-[10px]" />
            </Link>
          </div>

          {/* ── Mobile Burger ── */}
          <button
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-all"
            onClick={() => setMobileOpen(v => !v)}>
            {mobileOpen ? <FaXmark className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t"
              style={{ background: '#1a1212', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="px-5 py-4 space-y-1 max-h-[80vh] overflow-y-auto">

                {NAV_LINKS.map(l => l.children ? (
                  <div key={l.label}>
                    <button
                      onClick={() => setMobileExp(p => ({ ...p, [l.label]: !p[l.label] }))}
                      className="w-full flex items-center justify-between text-sm font-semibold text-white/70 hover:text-white py-3 px-3 rounded-xl hover:bg-white/5 transition-all">
                      <span>{l.label}</span>
                      <FaChevronDown className={`text-[9px] opacity-50 transition-transform ${mobileExp[l.label] ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {mobileExp[l.label] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden">
                          <div className="pr-3 space-y-0.5 pb-2">
                            {l.children.map(c => {
                              const Icon = c.icon;
                              return (
                                <Link key={c.to} to={c.to}
                                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm transition-all ${
                                    location.pathname === c.to
                                      ? 'text-white bg-white/8'
                                      : 'text-white/50 hover:text-white hover:bg-white/5'
                                  }`}>
                                  <Icon className="text-xs flex-shrink-0" style={{ color: location.pathname === c.to ? P : undefined }} />
                                  {c.label}
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link key={l.to} to={l.to}
                    className={`flex items-center text-sm font-semibold py-3 px-3 rounded-xl transition-all ${
                      location.pathname === l.to
                        ? 'text-white bg-white/8'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}>
                    {l.label}
                  </Link>
                ))}

                <div className="pt-4 pb-2 border-t border-white/5 mt-2 space-y-2">
                  <Link to="/login"
                    className="block text-center py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                    تسجيل الدخول
                  </Link>
                  <Link to="/login"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: P }}>
                    ابدأ مجاناً — 14 يوم مجاني
                    <FaArrowLeft className="text-[10px]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer for sticky (non-transparent) nav */}
      {!transparent && <div className="h-[68px]" />}
    </>
  );
};

/* ─── FOOTER ─── */
export const PublicFooter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  return (
    <footer style={{ background: DARK }}>

      {/* Newsletter strip */}
      <div style={{ background: `${P}12`, borderTop: `1px solid ${P}25`, borderBottom: `1px solid ${P}25` }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-white font-black text-base">ابقَ على اطلاع دائم</p>
            <p className="text-white/45 text-sm mt-0.5">تحديثات المنتج ونصائح عقارية حصرية</p>
          </div>
          {done ? (
            <div className="flex items-center gap-2 text-green-400 font-semibold text-sm">
              <FaCircleCheck />  تم الاشتراك، شكراً!
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); email && setDone(true); }}
              className="flex gap-2 w-full md:w-auto">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني..."
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              />
              <button type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 flex-shrink-0"
                style={{ background: P }}>
                اشترك
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-5">
          <img src={logoWhite} alt="EgyEstate" className="h-8 object-contain" />
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            منصة SaaS متكاملة لإدارة الشركات العقارية في العالم العربي — المشاريع والعقود والمحاسبة والتقارير.
          </p>
          {/* Status */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">جميع الأنظمة تعمل</span>
          </div>
          {/* Socials */}
          <div className="flex gap-2 pt-1">
            {[
              { Icon: FaLinkedin,  href: '#' },
              { Icon: FaXTwitter,  href: '#' },
              { Icon: FaYoutube,   href: '#' },
              { Icon: FaInstagram, href: '#' },
            ].map(({ Icon, href }, i) => (
              <a key={i} href={href}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map(col => (
          <div key={col.title}>
            <p className="text-white font-black text-sm mb-5 tracking-wide">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="text-sm text-white/38 hover:text-white/80 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/28">
            <span className="flex items-center gap-1.5"><FaPhone className="text-[10px]" />+20 100 000 0000</span>
            <span className="flex items-center gap-1.5"><FaEnvelope className="text-[10px]" />hello@egyestate.com</span>
            <span className="flex items-center gap-1.5"><FaLocationDot className="text-[10px]" />القاهرة، مصر</span>
          </div>
          <p className="text-xs text-white/22">© {new Date().getFullYear()} EgyEstate · صُنع في مصر</p>
        </div>
      </div>
    </footer>
  );
};

/* ─── LAYOUT WRAPPER ─── */
const PublicLayout = ({ children, navTransparent = false }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: '#fafafa' }}>
    <PublicNav transparent={navTransparent} />
    <main>{children}</main>
    <PublicFooter />
  </div>
);

export default PublicLayout;

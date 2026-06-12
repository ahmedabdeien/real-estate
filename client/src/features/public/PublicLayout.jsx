import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  FaBars, FaXmark, FaArrowLeft,
  FaLinkedin, FaXTwitter, FaYoutube, FaInstagram,
  FaEnvelope, FaPhone, FaLocationDot, FaCircleCheck,
} from 'react-icons/fa6';
import logo from '../../assets/logo.svg';
import logoWhite from '../../assets/logo-white.svg';
import { pagesAPI } from '../../api/services';

const RED    = '#da1f27';
const GREEN  = '#009756';
const YELLOW = '#fbb140';
const DARK   = '#231f20';

/* ─── NAV DATA ─── */
const STATIC_LINKS = [
  { label: 'المميزات', to: '/#features' },
  { label: 'الأسعار',  to: '/#pricing' },
  { label: 'كيف يعمل', to: '/#how' },
];

const FOOTER_COLS = [
  {
    title: 'المنتج',
    links: [
      { label: 'المميزات',  to: '/#features' },
      { label: 'الأسعار',   to: '/#pricing' },
      { label: 'كيف يعمل', to: '/#how' },
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

/* ─── PUBLIC NAV — light design ─── */
export const PublicNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const { data: navPages } = useQuery({
    queryKey: ['public-nav-pages'],
    queryFn: () => pagesAPI.getNavPages().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const allLinks = [
    ...STATIC_LINKS,
    ...(navPages || []).map(p => ({ label: p.title, to: `/p/${p.slug}` })),
  ];

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white" style={{ borderBottom: '1px solid #ededed' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src={logo} alt="EgyEstate" className="h-9 object-contain" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {allLinks.map(l => (
            <Link key={l.to} to={l.to}
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-2.5 flex-shrink-0">
          <Link to="/login"
            className="text-sm font-bold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: DARK }}>
            تسجيل الدخول
          </Link>
          <Link to="/login"
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: GREEN }}>
            ابدأ مجاناً
            <FaArrowLeft className="text-[10px]" />
          </Link>
        </div>

        {/* Mobile burger */}
        <button
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <FaXmark className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white border-t" style={{ borderColor: '#ededed' }}>
            <div className="px-5 py-4 space-y-1">
              {allLinks.map(l => (
                <Link key={l.to} to={l.to}
                  className="block text-sm font-semibold py-3 px-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  {l.label}
                </Link>
              ))}
              <div className="pt-3 border-t mt-2 space-y-2" style={{ borderColor: '#ededed' }}>
                <Link to="/login" className="block text-center py-3 rounded-lg text-sm font-bold text-white" style={{ background: DARK }}>
                  تسجيل الدخول
                </Link>
                <Link to="/login" className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold text-white" style={{ background: GREEN }}>
                  ابدأ مجاناً
                  <FaArrowLeft className="text-[10px]" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

/* ─── FOOTER ─── */
export const PublicFooter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  const SOCIAL = [
    { Icon: FaInstagram,  color: '#e1306c' },
    { Icon: FaYoutube,    color: '#ff0000' },
    { Icon: FaXTwitter,   color: '#fff' },
    { Icon: FaLinkedin,   color: '#0a66c2' },
  ];

  return (
    <footer style={{ background: DARK, direction: 'rtl' }}>

      {/* Top color bar — 4 brand stripes */}
      <div style={{ display: 'flex', height: 4 }}>
        {[RED, YELLOW, GREEN, DARK].map((c, i) => (
          <div key={i} style={{ flex: 1, background: i === 3 ? 'rgba(255,255,255,0.12)' : c }} />
        ))}
      </div>

      {/* Newsletter strip */}
      <div style={{ background: `${RED}18`, borderBottom: `1px solid ${RED}30` }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-black text-base" style={{ color: '#fff' }}>ابقَ على اطلاع دائم</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>تحديثات المنتج ونصائح عقارية حصرية</p>
          </div>
          {done ? (
            <div className="flex items-center gap-2 font-bold text-sm" style={{ color: GREEN }}>
              <FaCircleCheck /> تم الاشتراك، شكراً!
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); email && setDone(true); }}
              className="flex gap-2 w-full md:w-auto">
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني..."
                className="flex-1 md:w-64 px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${RED}50` }}
              />
              <button type="submit"
                className="px-5 py-2.5 rounded-xl font-bold text-white text-sm flex-shrink-0"
                style={{ background: RED }}>
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
          <img src={logoWhite} alt="EgyEstate" className="h-9 object-contain" />
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            منصة SaaS متكاملة لإدارة الشركات العقارية في العالم العربي — المشاريع والعقود والمحاسبة والتقارير.
          </p>

          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: `${GREEN}15`, border: `1px solid ${GREEN}40` }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
            <span className="text-xs font-semibold" style={{ color: GREEN }}>جميع الأنظمة تعمل</span>
          </div>

          {/* Social icons */}
          <div className="flex gap-2.5 pt-1">
            {SOCIAL.map(({ Icon, color }, i) => (
              <a key={i} href="#"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.45)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.color = color; e.currentTarget.style.borderColor = `${color}50`; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_COLS.map((col, ci) => {
          const accent = [RED, YELLOW, GREEN][ci] || RED;
          return (
            <div key={col.title}>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: accent }} />
                <p className="font-black text-sm text-white tracking-wide">{col.title}</p>
              </div>
              <ul className="space-y-3">
                {col.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to}
                      className="text-sm transition-colors"
                      style={{ color: 'rgba(255,255,255,0.42)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = accent; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.42)'; }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <span className="flex items-center gap-1.5">
              <FaPhone className="text-[10px]" style={{ color: RED }} />
              +20 100 000 0000
            </span>
            <span className="flex items-center gap-1.5">
              <FaEnvelope className="text-[10px]" style={{ color: YELLOW }} />
              hello@egyestate.com
            </span>
            <span className="flex items-center gap-1.5">
              <FaLocationDot className="text-[10px]" style={{ color: GREEN }} />
              القاهرة، مصر
            </span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            © {new Date().getFullYear()} EgyEstate · صُنع في مصر
          </p>
        </div>
      </div>

      {/* Bottom color bar */}
      <div style={{ display: 'flex', height: 3 }}>
        {[GREEN, YELLOW, RED, DARK].map((c, i) => (
          <div key={i} style={{ flex: 1, background: i === 3 ? 'rgba(255,255,255,0.08)' : c }} />
        ))}
      </div>
    </footer>
  );
};

/* ─── LAYOUT WRAPPER ─── */
const PublicLayout = ({ children }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: '#fafafc' }}>
    <PublicNav />
    <main>{children}</main>
    <PublicFooter />
  </div>
);

export default PublicLayout;

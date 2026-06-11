import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBars, FaXmark, FaArrowLeft,
  FaLinkedin, FaXTwitter, FaYoutube, FaInstagram,
  FaEnvelope, FaPhone, FaLocationDot, FaCircleCheck,
} from 'react-icons/fa6';
import logo from '../../assets/logo.svg';
import logoWhite from '../../assets/logo-white.svg';

const RED    = '#da1f27';
const GREEN  = '#009756';
const YELLOW = '#fbb140';
const DARK   = '#231f20';

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

  return (
    <header className="sticky top-0 inset-x-0 z-50 bg-white" style={{ borderBottom: '1px solid #ededed' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-[72px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link to="/" className="flex items-center flex-shrink-0">
          <img src={logo} alt="EgyEstate" className="h-9 object-contain" />
        </Link>

        {/* Desktop links */}
        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(l => (
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
              {NAV_LINKS.map(l => (
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

/* ─── FOOTER (dark) ─── */
export const PublicFooter = () => {
  const [email, setEmail] = useState('');
  const [done, setDone]   = useState(false);

  return (
    <footer style={{ background: DARK }}>

      {/* Newsletter strip */}
      <div style={{ background: `${RED}12`, borderTop: `1px solid ${RED}25`, borderBottom: `1px solid ${RED}25` }}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div>
            <p className="text-white font-black text-base">ابقَ على اطلاع دائم</p>
            <p className="text-white/45 text-sm mt-0.5">تحديثات المنتج ونصائح عقارية حصرية</p>
          </div>
          {done ? (
            <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: GREEN }}>
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
                style={{ background: RED }}>
                اشترك
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-5">
          <img src={logoWhite} alt="EgyEstate" className="h-8 object-contain" />
          <p className="text-white/40 text-sm leading-relaxed max-w-xs">
            منصة SaaS متكاملة لإدارة الشركات العقارية في العالم العربي — المشاريع والعقود والمحاسبة والتقارير.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,151,86,0.1)', border: '1px solid rgba(0,151,86,0.3)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: GREEN }} />
            <span className="text-xs font-medium" style={{ color: '#34d399' }}>جميع الأنظمة تعمل</span>
          </div>
          <div className="flex gap-2 pt-1">
            {[FaLinkedin, FaXTwitter, FaYoutube, FaInstagram].map((Icon, i) => (
              <a key={i} href="#"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white/30 hover:text-white hover:bg-white/8 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        {FOOTER_COLS.map(col => (
          <div key={col.title}>
            <p className="text-white font-black text-sm mb-5 tracking-wide">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/38 hover:text-white/80 transition-colors">
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
const PublicLayout = ({ children }) => (
  <div dir="rtl" style={{ minHeight: '100vh', background: '#fafafc' }}>
    <PublicNav />
    <main>{children}</main>
    <PublicFooter />
  </div>
);

export default PublicLayout;

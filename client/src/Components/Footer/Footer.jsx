"use client";
import { Link } from 'react-router-dom';
import { FiMapPin, FiMail, FiPhone } from 'react-icons/fi';
import { BsArrowLeft } from 'react-icons/bs';
import { SocialMediaSecondary } from '../SocialMedia/SocialMediaLink';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logoElsarh.png';

export default function Footer() {
  const { config }  = useSelector(s => s.config);
  const [dynamicPages, setDynamicPages] = useState([]);

  useEffect(() => {
    fetch('/api/cms/pages')
      .then(r => r.ok ? r.json() : [])
      .then(d => setDynamicPages(d))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { name: 'الرئيسية',   path: '/' },
    { name: 'المشاريع',   path: '/Project' },
    { name: 'من نحن',     path: '/About' },
    { name: 'المدونة',    path: '/Blogs' },
    { name: 'تواصل معنا', path: '/Contact' },
  ];

  return (
    <footer
      dir="rtl"
      className="relative overflow-hidden"
      style={{ background: '#12283C' }}
    >
      {/* زخرفة */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(223,186,107,0.4), transparent)' }}
      />

      <div className="container mx-auto px-4 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* ===== الهوية ===== */}
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="w-12 h-12 flex items-center justify-center overflow-hidden shrink-0"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(223,186,107,0.2)' }}
              >
                <img
                  src={(config.logo?.startsWith?.('http') ? config.logo : Logoelsarh) || Logoelsarh}
                  alt={config.siteName}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">{config.siteName || 'الصرح للتطوير العقاري'}</p>
                <p className="text-[10px] font-bold tracking-widest mt-0.5" style={{ color: '#DFBA6B' }}>للاستثمار العقاري</p>
              </div>
            </Link>

            <p className="text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {config?.footer?.about || 'منذ عام 2004 ونحن نعيد تعريف مفهوم السكن الفاخر في مصر، بمعايير بناء عالمية وخدمة تفوق التوقعات.'}
            </p>

            <SocialMediaSecondary />
          </div>

          {/* ===== روابط سريعة ===== */}
          <div>
            <h4
              className="text-xs font-black tracking-[0.3em] uppercase mb-6 pb-3"
              style={{ color: '#DFBA6B', borderBottom: '1px solid rgba(223,186,107,0.15)' }}
            >
              روابط سريعة
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(l => (
                <li key={l.path}>
                  <Link
                    to={l.path}
                    className="flex items-center gap-2 text-sm transition-all duration-300 group"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    <BsArrowLeft
                      size={11}
                      className="transition-transform duration-300 group-hover:-translate-x-1"
                      style={{ color: '#8A6924' }}
                    />
                    <span className="group-hover:text-[#DFBA6B] transition-colors">{l.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== معلومات التواصل ===== */}
          <div>
            <h4
              className="text-xs font-black tracking-[0.3em] uppercase mb-6 pb-3"
              style={{ color: '#DFBA6B', borderBottom: '1px solid rgba(223,186,107,0.15)' }}
            >
              تواصل معنا
            </h4>
            <ul className="space-y-4">
              {config?.contact?.maadiBranchAddress && (
                <li className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(138,105,36,0.2)', border: '1px solid rgba(223,186,107,0.15)' }}
                  >
                    <FiMapPin size={13} style={{ color: '#DFBA6B' }} />
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {config.contact.maadiBranchAddress}
                  </span>
                </li>
              )}
              {config?.contact?.phone && (
                <li className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(138,105,36,0.2)', border: '1px solid rgba(223,186,107,0.15)' }}
                  >
                    <FiPhone size={13} style={{ color: '#DFBA6B' }} />
                  </div>
                  <a href={`tel:${config.contact.phone}`} dir="ltr" className="text-xs font-bold transition-colors hover:text-[#DFBA6B]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {config.contact.phone}
                  </a>
                </li>
              )}
              {config?.contact?.email && (
                <li className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(138,105,36,0.2)', border: '1px solid rgba(223,186,107,0.15)' }}
                  >
                    <FiMail size={13} style={{ color: '#DFBA6B' }} />
                  </div>
                  <a href={`mailto:${config.contact.email}`} className="text-xs transition-colors hover:text-[#DFBA6B]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {config.contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* ===== ساعات العمل ===== */}
          <div>
            <h4
              className="text-xs font-black tracking-[0.3em] uppercase mb-6 pb-3"
              style={{ color: '#DFBA6B', borderBottom: '1px solid rgba(223,186,107,0.15)' }}
            >
              ساعات العمل
            </h4>
            <div
              className="p-5 space-y-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {(config?.footer?.workingHours || 'السبت - الخميس: 10:00 - 17:00').split(':')[0]}
                </span>
                <span className="text-xs font-black" style={{ color: '#DFBA6B' }}>
                  {(config?.footer?.workingHours || 'السبت - الخميس: 10:00 - 17:00').split(':').slice(1).join(':').trim() || '10:00 - 17:00'}
                </span>
              </div>
              <div
                className="h-px"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>الجمعة</span>
                <span className="text-xs font-black text-red-400">مغلق</span>
              </div>
            </div>

            {/* CTA */}
            <Link to="/Contact" className="block mt-4">
              <button
                className="w-full py-3 text-xs font-black tracking-widest transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                  color: 'white',
                  boxShadow: '0 4px 16px rgba(138,105,36,0.35)',
                }}
              >
                احجز استشارة مجانية
              </button>
            </Link>
          </div>
        </div>

        {/* ===== البار السفلي ===== */}
        <div
          className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[11px]"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          <p>
            &copy; {new Date().getFullYear()} {config.siteName || 'الصرح للتطوير العقاري'} — {config?.footer?.copyright || 'جميع الحقوق محفوظة'}.
          </p>
          <div className="flex items-center gap-5">
            {dynamicPages.map(p => (
              <Link
                key={p._id}
                to={`/p/${p.slug}`}
                className="hover:text-[#DFBA6B] transition-colors"
              >
                {p.title?.ar || p.title?.en || ''}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

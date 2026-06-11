import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft } from 'react-icons/fa6';

const DARK = '#231f20';
const PRIMARY = '#c8161d';

const PageHero = ({ tag, title, subtitle, breadcrumb, actions, center = true }) => (
  <div className="relative overflow-hidden" style={{ background: DARK }}>
    {/* Subtle dot pattern */}
    <div className="absolute inset-0 opacity-[0.07]"
      style={{ backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: PRIMARY }} />

    <div className={`relative max-w-5xl mx-auto px-5 py-16 md:py-20 ${center ? 'text-center' : ''}`}>
      {breadcrumb && (
        <div className="flex items-center gap-1.5 text-xs text-white/40 mb-5 flex-wrap" style={center ? { justifyContent: 'center' } : {}}>
          <Link to="/" className="hover:text-white/70 transition-colors">الرئيسية</Link>
          {breadcrumb.map((b, i) => (
            <React.Fragment key={i}>
              <FaChevronLeft className="text-[9px]" />
              {b.href ? <Link to={b.href} className="hover:text-white/70 transition-colors">{b.label}</Link> : <span>{b.label}</span>}
            </React.Fragment>
          ))}
        </div>
      )}
      {tag && (
        <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
          style={{ background: `${PRIMARY}28`, color: '#ff9196', border: `1px solid ${PRIMARY}40` }}>
          {tag}
        </span>
      )}
      <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">{title}</h1>
      {subtitle && (
        <p className="text-white/55 max-w-2xl text-base md:text-lg leading-relaxed" style={center ? { margin: '0 auto' } : {}}>
          {subtitle}
        </p>
      )}
      {actions && <div className={`flex gap-3 mt-7 flex-wrap ${center ? 'justify-center' : ''}`}>{actions}</div>}
    </div>
  </div>
);

export default PageHero;

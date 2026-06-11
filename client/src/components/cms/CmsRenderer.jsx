/**
 * CmsRenderer — renders CMS page sections into beautiful UI blocks.
 * Each section type has its own renderer component.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  FaChevronDown, FaStar, FaCheck, FaXmark, FaEnvelope,
  FaArrowLeft, FaPlay, FaQuoteRight,
} from 'react-icons/fa6';
import { resolveIcon } from '../ui/IconPicker';

const P = '#c8161d';
const A = '#fbb140';

/* ── helpers ─────────────────────────────────────────────── */
function Pill({ children, color = P }) {
  return (
    <span className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
      style={{ background: `${color}18`, color }}>
      {children}
    </span>
  );
}

function SectionWrap({ children, className = '', style = {} }) {
  return (
    <section className={`py-16 px-4 ${className}`} style={style}>
      <div className="max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function SectionHead({ title, subtitle, pill, pillColor }) {
  return (
    <div className="text-center mb-12">
      {pill && <Pill color={pillColor}>{pill}</Pill>}
      {title && <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: 'var(--color-text-dark, #1a1a1a)' }}>{title}</h2>}
      {subtitle && <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: '#6b7280' }}>{subtitle}</p>}
    </div>
  );
}

function AnimCounter({ to, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  const numericTo = parseInt(String(to).replace(/\D/g, '')) || 0;
  const hasSuffix = String(to).replace(/[0-9,٠-٩]/g, '');

  useEffect(() => {
    if (!inView || numericTo === 0) return;
    let n = 0;
    const step = Math.ceil(numericTo / 50);
    const t = setInterval(() => {
      n = Math.min(n + step, numericTo);
      setVal(n);
      if (n >= numericTo) clearInterval(t);
    }, 20);
    return () => clearInterval(t);
  }, [inView, numericTo]);

  return <span ref={ref}>{val.toLocaleString('ar-EG')}{hasSuffix || suffix}</span>;
}

function CTAButton({ btn }) {
  const styles = {
    primary:   { background: P, color: '#fff' },
    secondary: { background: 'transparent', color: '#fff', border: '2px solid rgba(255,255,255,0.4)' },
    accent:    { background: A, color: '#1a1a1a' },
  };
  const s = styles[btn.variant] || styles.primary;
  const isExternal = btn.link?.startsWith('http');
  const cls = 'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90';
  return isExternal
    ? <a href={btn.link} className={cls} style={s} target="_blank" rel="noreferrer">{btn.label}</a>
    : <Link to={btn.link || '/login'} className={cls} style={s}>{btn.label}</Link>;
}

/* ── Section Renderers ───────────────────────────────────── */

/* HERO */
function HeroSection({ section }) {
  return (
    <section className="relative min-h-[560px] flex items-center justify-center text-center px-4 py-24 overflow-hidden">
      {section.bgImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${section.bgImage})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(15,5,5,0.82) 0%, rgba(30,10,10,0.70) 100%)' }} />
        </>
      )}
      {!section.bgImage && (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${P} 0%, #1a0e0e 100%)` }} />
      )}
      <div className="relative z-10 max-w-4xl mx-auto">
        {section.subtitle && <Pill color={A}>{section.subtitle}</Pill>}
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          {section.title}
        </motion.h1>
        {section.body && (
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="text-lg text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            {section.body}
          </motion.p>
        )}
        {section.buttons?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap gap-3 justify-center">
            {section.buttons.map((btn, i) => <CTAButton key={i} btn={btn} />)}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* STATS */
function StatsSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
      {(section.title || section.subtitle) && <SectionHead title={section.title} subtitle={section.subtitle} />}
      <div className={`grid gap-8 text-center ${section.items?.length <= 3 ? 'grid-cols-' + section.items.length : 'grid-cols-2 md:grid-cols-4'}`}>
        {(section.items || []).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <p className="text-4xl md:text-5xl font-black mb-1" style={{ color: P }}>
              <AnimCounter to={item.value} />
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{item.label}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrap>
  );
}

/* FEATURES */
function FeaturesSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fafafa' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="المميزات" pillColor={P} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(section.items || []).map((item, i) => {
          const Icon = resolveIcon(item.icon);
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${P}12`, color: P }}>
                {Icon && <Icon className="text-lg" />}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: '#1a1a1a' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionWrap>
  );
}

/* PRICING */
function PricingSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="الأسعار" pillColor="#15803d" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {(section.items || []).map((plan, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-7 border-2 flex flex-col ${plan.featured ? 'scale-105' : ''}`}
            style={{ borderColor: plan.featured ? P : '#e5e7eb', background: plan.featured ? `${P}06` : '#fff' }}>
            {plan.featured && (
              <span className="text-xs font-bold px-3 py-1 rounded-full self-start mb-4"
                style={{ background: P, color: '#fff' }}>الأكثر شيوعاً</span>
            )}
            <h3 className="font-black text-xl mb-1" style={{ color: '#1a1a1a' }}>{plan.name || plan.title}</h3>
            <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{plan.desc}</p>
            <div className="mb-6">
              <span className="text-4xl font-black" style={{ color: plan.featured ? P : '#1a1a1a' }}>{plan.price || plan.value}</span>
              {plan.period && <span className="text-sm mr-1" style={{ color: '#9ca3af' }}>/{plan.period}</span>}
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {(plan.features || plan.items || []).map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                  <FaCheck className="text-green-500 text-xs flex-shrink-0" />
                  {typeof f === 'string' ? f : f.text}
                </li>
              ))}
            </ul>
            <Link to="/login"
              className="block text-center py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: plan.featured ? P : '#f3f4f6', color: plan.featured ? '#fff' : '#374151' }}>
              {plan.cta || 'ابدأ الآن'}
            </Link>
          </motion.div>
        ))}
      </div>
    </SectionWrap>
  );
}

/* FAQ */
function FaqSection({ section }) {
  const [open, setOpen] = useState(null);
  return (
    <SectionWrap style={{ background: '#fafafa' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="الأسئلة الشائعة" pillColor="#0891b2" />
      <div className="max-w-3xl mx-auto space-y-3">
        {(section.items || []).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#e5e7eb' }}>
            <button className="w-full flex items-center justify-between px-6 py-4 text-right gap-4"
              onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{item.q}</span>
              <FaChevronDown className={`text-xs flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
                style={{ color: '#9ca3af' }} />
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                  transition={{ duration: 0.22 }} className="overflow-hidden">
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </SectionWrap>
  );
}

/* CTA */
function CtaSection({ section }) {
  return (
    <section className="py-20 px-4 text-center text-white relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${P} 0%, #1a0e0e 100%)` }}>
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="relative max-w-3xl mx-auto">
        {section.subtitle && <Pill color={A}>{section.subtitle}</Pill>}
        <h2 className="text-3xl md:text-4xl font-black mb-4">{section.title}</h2>
        {section.body && <p className="text-white/70 mb-8 text-base">{section.body}</p>}
        <div className="flex flex-wrap gap-3 justify-center">
          {(section.buttons || []).map((btn, i) => <CTAButton key={i} btn={btn} />)}
          {!section.buttons?.length && (
            <Link to="/login" className="px-8 py-3 rounded-xl text-sm font-bold"
              style={{ background: A, color: '#1a1a1a' }}>ابدأ مجاناً</Link>
          )}
        </div>
      </div>
    </section>
  );
}

/* TESTIMONIALS */
function TestimonialsSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="آراء العملاء" pillColor="#be185d" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(section.items || []).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <FaQuoteRight className="text-2xl mb-4" style={{ color: `${P}30` }} />
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#374151' }}>{item.text}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: P }}>
                  {item.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#1a1a1a' }}>{item.name}</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>{item.role}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(n => (
                  <FaStar key={n} className="text-xs" style={{ color: n <= (item.rating || 5) ? A : '#e5e7eb' }} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrap>
  );
}

/* TEAM */
function TeamSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fafafa' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="فريق العمل" pillColor="#0d9488" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(section.items || []).map((member, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 text-center hover:shadow-md transition-shadow">
            {member.photo
              ? <img src={member.photo} alt={member.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2" style={{ borderColor: `${P}20` }} />
              : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-2xl mx-auto mb-3"
                  style={{ background: `linear-gradient(135deg, ${P}, #7c0f13)` }}>
                  {member.name?.charAt(0)}
                </div>
              )
            }
            <h4 className="font-bold text-sm mb-0.5" style={{ color: '#1a1a1a' }}>{member.name}</h4>
            <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>{member.role}</p>
            {member.bio && <p className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>{member.bio}</p>}
            {member.linkedin && (
              <a href={member.linkedin} target="_blank" rel="noreferrer"
                className="inline-block mt-3 text-xs font-medium hover:underline" style={{ color: '#0077b5' }}>LinkedIn</a>
            )}
          </motion.div>
        ))}
      </div>
    </SectionWrap>
  );
}

/* PARTNERS */
function PartnersSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff', borderTop: '1px solid #f0f0f0' }}>
      {section.title && <SectionHead title={section.title} subtitle={section.subtitle} />}
      <div className="flex flex-wrap items-center justify-center gap-8">
        {(section.items || []).map((partner, i) => (
          <motion.a key={i} href={partner.link || '#'} target="_blank" rel="noreferrer"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2 group transition-opacity hover:opacity-70">
            {partner.logo
              ? <img src={partner.logo} alt={partner.name} className="h-10 object-contain grayscale group-hover:grayscale-0 transition-all" />
              : <span className="text-base font-bold" style={{ color: '#9ca3af' }}>{partner.name}</span>
            }
          </motion.a>
        ))}
      </div>
    </SectionWrap>
  );
}

/* PROCESS */
function ProcessSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fafafa' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="كيف يعمل" pillColor="#ea580c" />
      <div className="relative max-w-4xl mx-auto">
        <div className="hidden md:block absolute top-8 right-8 left-8 h-0.5"
          style={{ background: `linear-gradient(to left, transparent, ${P}40, transparent)` }} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(section.items || []).map((step, i) => {
            const Icon = resolveIcon(step.icon);
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative z-10"
                  style={{ background: `${P}12`, color: P }}>
                  {Icon && <Icon className="text-2xl" />}
                  <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full text-xs font-black flex items-center justify-center text-white"
                    style={{ background: P }}>{i + 1}</span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: '#1a1a1a' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrap>
  );
}

/* GALLERY */
function GallerySection({ section }) {
  const [active, setActive] = useState(null);
  return (
    <SectionWrap style={{ background: '#fff' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="معرض الصور" pillColor="#db2777" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(section.items || []).map((img, i) => (
          <motion.button key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            onClick={() => setActive(img)}
            className="relative overflow-hidden rounded-2xl aspect-video group">
            <img src={img.url} alt={img.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            {img.caption && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-sm font-medium">{img.caption}</p>
              </div>
            )}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setActive(null)}>
            <button className="absolute top-4 left-4 text-white text-2xl"><FaXmark /></button>
            <img src={active.url} alt={active.caption} className="max-w-full max-h-full rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrap>
  );
}

/* NEWSLETTER */
function NewsletterSection({ section }) {
  const [email, setEmail] = useState('');
  return (
    <section className="py-16 px-4" style={{ background: `${P}08` }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: `${P}15`, color: P }}>
          <FaEnvelope className="text-xl" />
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a1a' }}>{section.title}</h2>
        {section.subtitle && <p className="text-sm mb-2" style={{ color: '#6b7280' }}>{section.subtitle}</p>}
        {section.body && <p className="text-sm mb-6" style={{ color: '#6b7280' }}>{section.body}</p>}
        <div className="flex gap-3 max-w-md mx-auto" dir="rtl">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder={section.placeholder || 'أدخل بريدك الإلكتروني...'}
            className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2"
            style={{ borderColor: '#e5e7eb', fontFamily: 'Tajawal, sans-serif' }} />
          <button className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: P }}>
            {section.btnLabel || 'اشترك'}
          </button>
        </div>
      </div>
    </section>
  );
}

/* TIMELINE */
function TimelineSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="المسيرة" pillColor="#7c3aed" />
      <div className="max-w-3xl mx-auto relative">
        <div className="absolute right-6 top-0 bottom-0 w-0.5" style={{ background: `${P}20` }} />
        <div className="space-y-8">
          {(section.items || []).map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex gap-6 items-start">
              <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="text-sm font-black mb-1" style={{ color: P }}>{item.year}</p>
                <h4 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>{item.title}</h4>
                <p className="text-sm" style={{ color: '#6b7280' }}>{item.desc}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-white flex items-center justify-center flex-shrink-0 shadow-md"
                style={{ background: P, zIndex: 1 }}>
                <span className="text-white text-xs font-black">{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrap>
  );
}

/* VIDEO */
function VideoSection({ section }) {
  const [playing, setPlaying] = useState(false);
  const isEmbed = section.body?.includes('embed');
  return (
    <SectionWrap style={{ background: '#0e0808' }}>
      {(section.title || section.subtitle) && (
        <div className="text-center mb-10">
          {section.title && <h2 className="text-3xl font-black text-white mb-2">{section.title}</h2>}
          {section.subtitle && <p className="text-white/60">{section.subtitle}</p>}
        </div>
      )}
      <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden aspect-video bg-black">
        {isEmbed && playing ? (
          <iframe src={section.body} className="w-full h-full" allowFullScreen title={section.title} />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a0e0e, #0e0808)' }}>
            <button onClick={() => setPlaying(true)}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style={{ background: P }}>
              <FaPlay className="text-2xl mr-1" />
            </button>
          </div>
        )}
      </div>
    </SectionWrap>
  );
}

/* MAP */
function MapSection({ section }) {
  return (
    <section>
      {(section.title || section.subtitle) && (
        <SectionWrap style={{ background: '#fff', paddingBottom: 0 }}>
          <SectionHead title={section.title} subtitle={section.subtitle} />
        </SectionWrap>
      )}
      {section.body && (
        <div className="h-96">
          <iframe src={section.body} className="w-full h-full border-0" allowFullScreen title="map" />
        </div>
      )}
    </section>
  );
}

/* COMPARISON */
function ComparisonSection({ section }) {
  const plans = [
    section.planBasic || 'أساسي',
    section.planPro || 'احترافي',
    section.planEnterprise || 'مؤسسي',
  ];
  return (
    <SectionWrap style={{ background: '#fafafa' }}>
      <SectionHead title={section.title} subtitle={section.subtitle} pill="مقارنة الخطط" pillColor="#b45309" />
      <div className="max-w-4xl mx-auto overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-right py-4 px-4 font-bold text-sm" style={{ color: '#6b7280' }}>الميزة</th>
              {plans.map((p, i) => (
                <th key={i} className="py-4 px-4 text-center font-bold text-sm"
                  style={{ color: i === 1 ? P : '#1a1a1a' }}>
                  {p}
                  {i === 1 && <span className="block text-xs font-normal" style={{ color: P }}>الأكثر شيوعاً</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(section.items || []).map((row, i) => (
              <tr key={i} className="border-t" style={{ borderColor: '#f0f0f0' }}>
                <td className="py-3.5 px-4 text-sm font-medium" style={{ color: '#374151' }}>{row.feature}</td>
                {['basic', 'pro', 'enterprise'].map((plan, j) => (
                  <td key={j} className="py-3.5 px-4 text-center">
                    {row[plan]
                      ? <FaCheck className="inline text-green-500 text-sm" />
                      : <FaXmark className="inline text-gray-300 text-sm" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrap>
  );
}

/* CUSTOM */
function CustomSection({ section }) {
  return (
    <SectionWrap style={{ background: '#fff' }}>
      {(section.title || section.subtitle) && <SectionHead title={section.title} subtitle={section.subtitle} />}
      {section.body && (
        <div className="max-w-4xl mx-auto prose prose-sm"
          dangerouslySetInnerHTML={{ __html: section.body }} />
      )}
    </SectionWrap>
  );
}

/* ── Main Renderer ───────────────────────────────────────── */
const RENDERERS = {
  hero:         HeroSection,
  stats:        StatsSection,
  features:     FeaturesSection,
  pricing:      PricingSection,
  faq:          FaqSection,
  cta:          CtaSection,
  testimonials: TestimonialsSection,
  team:         TeamSection,
  partners:     PartnersSection,
  process:      ProcessSection,
  gallery:      GallerySection,
  newsletter:   NewsletterSection,
  timeline:     TimelineSection,
  video:        VideoSection,
  map:          MapSection,
  comparison:   ComparisonSection,
  custom:       CustomSection,
};

const CmsRenderer = ({ sections = [] }) => {
  const sorted = [...sections].sort((a, b) => a.order - b.order).filter(s => s.visible !== false);
  return (
    <div dir="rtl">
      {sorted.map((section) => {
        const Component = RENDERERS[section.type];
        if (!Component) return null;
        return <Component key={section.key} section={section} />;
      })}
    </div>
  );
};

export default CmsRenderer;

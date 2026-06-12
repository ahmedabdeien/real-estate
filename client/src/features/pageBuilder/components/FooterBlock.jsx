import React from 'react';
import { useNode } from '@craftjs/core';
import {
  FaTrash, FaBuilding, FaFacebook, FaXTwitter,
  FaInstagram, FaLinkedin, FaYoutube, FaWhatsapp,
  FaPhone, FaEnvelope, FaLocationDot,
} from 'react-icons/fa6';

const SOCIAL_ICONS = {
  facebook: FaFacebook, twitter: FaXTwitter, instagram: FaInstagram,
  linkedin: FaLinkedin, youtube: FaYoutube, whatsapp: FaWhatsapp,
};

function FooterSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">اسم العلامة</label>
        <input value={props.brand} onChange={e => setProp(p => p.brand = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الوصف</label>
        <textarea rows={2} value={props.about} onChange={e => setProp(p => p.about = e.target.value)} className="input text-xs resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">اللون المميز</label>
          <input type="color" value={props.accent} onChange={e => setProp(p => p.accent = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <input value={props.phone} onChange={e => setProp(p => p.phone = e.target.value)} placeholder="رقم الهاتف" dir="ltr" className="input text-xs" />
        <input value={props.email} onChange={e => setProp(p => p.email = e.target.value)} placeholder="البريد الإلكتروني" dir="ltr" className="input text-xs" />
        <input value={props.address} onChange={e => setProp(p => p.address = e.target.value)} placeholder="العنوان" className="input text-xs" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">روابط سريعة ({props.links.length})</p>
        {props.links.map((l, i) => (
          <div key={i} className="flex gap-1 mb-2">
            <input value={l.label} onChange={e => setProp(p => { p.links[i].label = e.target.value; })} placeholder="النص" className="input text-xs flex-1" />
            <input value={l.href} dir="ltr" onChange={e => setProp(p => { p.links[i].href = e.target.value; })} placeholder="#" className="input text-xs w-20" />
            <button onClick={() => setProp(p => { p.links.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.links.push({ label: 'رابط', href: '#' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة رابط
        </button>
      </div>
      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500">روابط التواصل (اترك فارغاً للإخفاء)</p>
        {Object.keys(SOCIAL_ICONS).map(key => (
          <input key={key} value={props.social?.[key] || ''} dir="ltr"
            onChange={e => setProp(p => { p.social = { ...p.social, [key]: e.target.value }; })}
            placeholder={key} className="input text-xs w-full" />
        ))}
      </div>
    </div>
  );
}

const defaultLinks = [
  { label: 'الرئيسية', href: '#' },
  { label: 'المميزات', href: '#features' },
  { label: 'الأسعار', href: '#pricing' },
];

export function FooterBlock({
  brand = 'شركتك', about = 'نقدم حلولاً عقارية متكاملة لعملائنا في جميع أنحاء المنطقة.',
  links = defaultLinks, social = { facebook: '#', instagram: '#' },
  phone = '+20 100 000 0000', email = 'info@company.com', address = 'القاهرة، مصر',
  bg = '#231f20', accent = '#da1f27',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const activeSocial = Object.entries(SOCIAL_ICONS).filter(([key]) => social?.[key]);
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 36,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaBuilding style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{brand}</span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>{about}</p>
          {activeSocial.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              {activeSocial.map(([key, Icon]) => (
                <a key={key} href={social[key]} onClick={e => e.preventDefault()}
                  style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Icon style={{ fontSize: 14 }} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 16, borderRadius: 4, background: accent, display: 'inline-block' }} />
            روابط سريعة
          </p>
          {links.map((l, i) => (
            <a key={i} href={l.href} onClick={e => e.preventDefault()}
              style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', padding: '5px 0' }}>
              {l.label}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 4, height: 16, borderRadius: 4, background: accent, display: 'inline-block' }} />
            تواصل معنا
          </p>
          {[
            [FaPhone, phone],
            [FaEnvelope, email],
            [FaLocationDot, address],
          ].filter(([, v]) => v).map(([Icon, value], i) => (
            <p key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>
              <Icon style={{ fontSize: 12, color: accent, flexShrink: 0 }} />
              {value}
            </p>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          © {new Date().getFullYear()} {brand} — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}

FooterBlock.craft = {
  displayName: 'فوتر',
  props: {
    brand: 'شركتك', about: 'نقدم حلولاً عقارية متكاملة لعملائنا في جميع أنحاء المنطقة.',
    links: defaultLinks, social: { facebook: '#', instagram: '#' },
    phone: '+20 100 000 0000', email: 'info@company.com', address: 'القاهرة، مصر',
    bg: '#231f20', accent: '#da1f27',
  },
  related: { settings: FooterSettings },
};

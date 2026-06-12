import React from 'react';
import { useNode } from '@craftjs/core';
import {
  FaFacebook, FaXTwitter, FaInstagram, FaLinkedin,
  FaYoutube, FaWhatsapp, FaTiktok, FaSnapchat,
} from 'react-icons/fa6';

const PLATFORMS = {
  facebook:  { Icon: FaFacebook,  color: '#1877f2', label: 'فيسبوك' },
  twitter:   { Icon: FaXTwitter,  color: '#231f20', label: 'إكس' },
  instagram: { Icon: FaInstagram, color: '#e1306c', label: 'إنستجرام' },
  linkedin:  { Icon: FaLinkedin,  color: '#0a66c2', label: 'لينكدإن' },
  youtube:   { Icon: FaYoutube,   color: '#ff0000', label: 'يوتيوب' },
  whatsapp:  { Icon: FaWhatsapp,  color: '#25d366', label: 'واتساب' },
  tiktok:    { Icon: FaTiktok,    color: '#231f20', label: 'تيك توك' },
  snapchat:  { Icon: FaSnapchat,  color: '#f7c600', label: 'سناب شات' },
};

function SocialSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">حجم الأيقونة</label>
          <input type="number" value={props.size} onChange={e => setProp(p => p.size = Number(e.target.value))} className="input text-sm" />
        </div>
      </div>
      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500">روابط المنصات (اترك فارغاً للإخفاء)</p>
        {Object.entries(PLATFORMS).map(([key, { label }]) => (
          <div key={key}>
            <label className="block text-[10px] font-semibold text-gray-400 mb-0.5">{label}</label>
            <input value={props.links?.[key] || ''} dir="ltr"
              onChange={e => setProp(p => { p.links = { ...p.links, [key]: e.target.value }; })}
              placeholder={`https://${key}.com/...`} className="input text-xs w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const defaultLinks = { facebook: '#', instagram: '#', whatsapp: '#' };

export function SocialBlock({ title = 'تابعنا على', links = defaultLinks, bg = '#ffffff', size = 22 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const active = Object.entries(PLATFORMS).filter(([key]) => links?.[key]);
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '36px 24px', textAlign: 'center', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      {title && <p style={{ fontSize: 16, fontWeight: 800, color: '#231f20', margin: '0 0 18px' }}>{title}</p>}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
        {active.length === 0 && (
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>أضف روابط المنصات من لوحة الخصائص</p>
        )}
        {active.map(([key, { Icon, color }]) => (
          <a key={key} href={links[key]} onClick={e => e.preventDefault()}
            style={{
              width: size * 2, height: size * 2, borderRadius: '50%',
              background: `${color}14`, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1.5px solid ${color}30`,
            }}>
            <Icon style={{ fontSize: size }} />
          </a>
        ))}
      </div>
    </div>
  );
}

SocialBlock.craft = {
  displayName: 'روابط التواصل',
  props: { title: 'تابعنا على', links: defaultLinks, bg: '#ffffff', size: 22 },
  related: { settings: SocialSettings },
};

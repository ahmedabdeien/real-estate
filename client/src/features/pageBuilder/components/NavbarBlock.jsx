import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash, FaBuilding } from 'react-icons/fa6';

function NavbarSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">اسم العلامة</label>
        <input value={props.brand} onChange={e => setProp(p => p.brand = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رابط اللوجو (اختياري)</label>
        <input value={props.logoUrl || ''} dir="ltr" onChange={e => setProp(p => p.logoUrl = e.target.value)} placeholder="https://..." className="input text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون النص</label>
          <input type="color" value={props.textColor} onChange={e => setProp(p => p.textColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">نص زر CTA</label>
          <input value={props.ctaText} onChange={e => setProp(p => p.ctaText = e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون زر CTA</label>
          <input type="color" value={props.ctaColor} onChange={e => setProp(p => p.ctaColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الروابط ({props.links.length})</p>
        {props.links.map((l, i) => (
          <div key={i} className="flex gap-1 mb-2">
            <input value={l.label} onChange={e => setProp(p => { p.links[i].label = e.target.value; })} placeholder="النص" className="input text-xs flex-1" />
            <input value={l.href} dir="ltr" onChange={e => setProp(p => { p.links[i].href = e.target.value; })} placeholder="#" className="input text-xs w-20" />
            <button onClick={() => setProp(p => { p.links.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.links.push({ label: 'رابط جديد', href: '#' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة رابط
        </button>
      </div>
    </div>
  );
}

const defaultLinks = [
  { label: 'الرئيسية', href: '#' },
  { label: 'المميزات', href: '#features' },
  { label: 'الأسعار', href: '#pricing' },
  { label: 'تواصل معنا', href: '#contact' },
];

export function NavbarBlock({
  brand = 'شركتك', logoUrl = '', links = defaultLinks,
  bg = '#ffffff', textColor = '#231f20', ctaText = 'ابدأ الآن', ctaColor = '#da1f27',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        background: bg, padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, flexWrap: 'wrap',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {logoUrl ? (
          <img src={logoUrl} alt={brand} style={{ height: 34, objectFit: 'contain' }} />
        ) : (
          <div style={{ width: 34, height: 34, borderRadius: 9, background: ctaColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaBuilding style={{ color: '#fff', fontSize: 15 }} />
          </div>
        )}
        <span style={{ fontSize: 17, fontWeight: 900, color: textColor }}>{brand}</span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {links.map((l, i) => (
          <a key={i} href={l.href} onClick={e => e.preventDefault()}
            style={{ color: textColor, fontSize: 14, fontWeight: 600, textDecoration: 'none', padding: '6px 12px', borderRadius: 8, opacity: 0.85 }}>
            {l.label}
          </a>
        ))}
      </nav>

      {ctaText && (
        <a href="#" onClick={e => e.preventDefault()}
          style={{ background: ctaColor, color: '#fff', fontSize: 13, fontWeight: 800, padding: '9px 20px', borderRadius: 10, textDecoration: 'none' }}>
          {ctaText}
        </a>
      )}
    </div>
  );
}

NavbarBlock.craft = {
  displayName: 'شريط تنقل',
  props: { brand: 'شركتك', logoUrl: '', links: defaultLinks, bg: '#ffffff', textColor: '#231f20', ctaText: 'ابدأ الآن', ctaColor: '#da1f27' },
  related: { settings: NavbarSettings },
};

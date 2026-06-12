import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash } from 'react-icons/fa6';

function LogosSettings() {
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
          <label className="block text-xs font-semibold text-gray-500 mb-1">تدرج رمادي</label>
          <input type="checkbox" checked={props.grayscale} onChange={e => setProp(p => p.grayscale = e.target.checked)} className="w-5 h-5 mt-2" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الشعارات ({props.logos.length})</p>
        {props.logos.map((l, i) => (
          <div key={i} className="flex gap-1 mb-2">
            <input value={l} onChange={e => setProp(p => { p.logos[i] = e.target.value; })} placeholder="رابط الشعار" dir="ltr" className="input text-xs flex-1" />
            <button onClick={() => setProp(p => { p.logos.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.logos.push(''))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة شعار
        </button>
      </div>
    </div>
  );
}

export function LogosBlock({ title = 'يثق بنا أكثر من 200 شركة', logos = ['', '', '', ''], bg = '#fafafc', grayscale = true }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '40px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#9ca3af', margin: '0 0 28px', letterSpacing: 1 }}>{title}</p>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 48 }}>
        {logos.map((src, i) => src ? (
          <img key={i} src={src} alt={`logo-${i}`}
            style={{ height: 36, objectFit: 'contain', filter: grayscale ? 'grayscale(1) opacity(0.55)' : 'none' }} />
        ) : (
          <div key={i} style={{ width: 110, height: 36, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>
            شعار {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

LogosBlock.craft = {
  displayName: 'شعارات العملاء',
  props: { title: 'يثق بنا أكثر من 200 شركة', logos: ['', '', '', ''], bg: '#fafafc', grayscale: true },
  related: { settings: LogosSettings },
};

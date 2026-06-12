import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash } from 'react-icons/fa6';

function TimelineSettings() {
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
          <label className="block text-xs font-semibold text-gray-500 mb-1">اللون المميز</label>
          <input type="color" value={props.accent} onChange={e => setProp(p => p.accent = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">المحطات ({props.items.length})</p>
        {props.items.map((it, i) => (
          <div key={i} className="space-y-1 mb-3 p-2 rounded-lg bg-gray-50">
            <div className="flex gap-1">
              <input value={it.date} onChange={e => setProp(p => { p.items[i].date = e.target.value; })} placeholder="2024" className="input text-xs w-20" />
              <input value={it.title} onChange={e => setProp(p => { p.items[i].title = e.target.value; })} placeholder="العنوان" className="input text-xs flex-1" />
              <button onClick={() => setProp(p => { p.items.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
            </div>
            <input value={it.text} onChange={e => setProp(p => { p.items[i].text = e.target.value; })} placeholder="الوصف" className="input text-xs w-full" />
          </div>
        ))}
        <button onClick={() => setProp(p => p.items.push({ date: '2026', title: 'محطة جديدة', text: 'وصف المحطة' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة محطة
        </button>
      </div>
    </div>
  );
}

const defaultItems = [
  { date: '2022', title: 'التأسيس', text: 'انطلقنا برؤية واضحة لتغيير سوق العقارات' },
  { date: '2023', title: 'التوسع', text: 'افتتحنا 3 فروع جديدة ووصلنا لـ500 عميل' },
  { date: '2024', title: 'الريادة', text: 'أصبحنا من أكبر المنصات العقارية في المنطقة' },
];

export function TimelineBlock({ title = 'رحلتنا', items = defaultItems, bg = '#ffffff', accent = '#da1f27' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '56px clamp(16px, 5vw, 40px)', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#231f20', margin: '0 0 44px' }}>{title}</h2>
      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative' }}>
        {/* الخط الرأسي */}
        <div style={{ position: 'absolute', top: 6, bottom: 6, right: 9, width: 2, background: `${accent}30` }} />
        {items.map((it, i) => (
          <div key={i} style={{ position: 'relative', paddingRight: 38, paddingBottom: i === items.length - 1 ? 0 : 30 }}>
            {/* النقطة */}
            <span style={{
              position: 'absolute', right: 0, top: 4,
              width: 20, height: 20, borderRadius: '50%',
              background: bg, border: `4px solid ${accent}`,
              boxSizing: 'border-box',
            }} />
            <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 800, color: accent, background: `${accent}12`, padding: '3px 12px', borderRadius: 99, marginBottom: 8 }}>
              {it.date}
            </span>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#231f20', margin: 0 }}>{it.title}</p>
            <p style={{ fontSize: 13.5, color: '#6b7280', margin: '6px 0 0', lineHeight: 1.8 }}>{it.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

TimelineBlock.craft = {
  displayName: 'خط زمني',
  props: { title: 'رحلتنا', items: defaultItems, bg: '#ffffff', accent: '#da1f27' },
  related: { settings: TimelineSettings },
};

import React from 'react';
import { useNode } from '@craftjs/core';
import { FaQuoteRight, FaStar, FaTrash } from 'react-icons/fa6';

function TestimonialsSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عنوان القسم</label>
        <input value={props.heading} onChange={e => setProp(p => p.heading = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
        <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الآراء ({props.items.length})</p>
        {props.items.map((it, i) => (
          <div key={i} className="mb-3 p-2 rounded border bg-gray-50 space-y-1 relative">
            <textarea rows={2} value={it.text} onChange={e => setProp(p => { p.items[i].text = e.target.value; })} placeholder="نص الرأي" className="input text-xs resize-none" />
            <div className="flex gap-1">
              <input value={it.name} onChange={e => setProp(p => { p.items[i].name = e.target.value; })} placeholder="الاسم" className="input text-xs flex-1" />
              <input value={it.role} onChange={e => setProp(p => { p.items[i].role = e.target.value; })} placeholder="الوظيفة" className="input text-xs flex-1" />
            </div>
            <button onClick={() => setProp(p => { p.items.splice(i, 1); })}
              className="absolute top-1 left-1 p-1 rounded text-red-400 hover:bg-red-50"><FaTrash size={10} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.items.push({ text: 'تجربة رائعة!', name: 'اسم العميل', role: 'مدير شركة' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة رأي
        </button>
      </div>
    </div>
  );
}

const defaultItems = [
  { text: 'المنصة غيّرت طريقة إدارتنا للمشاريع بالكامل، كل شيء في مكان واحد.', name: 'أحمد محمد', role: 'مدير شركة عقارية' },
  { text: 'دعم فني سريع وواجهة سهلة، أنصح بها أي شركة عقارية.', name: 'سارة علي', role: 'مديرة مبيعات' },
  { text: 'التقارير المالية وفرت علينا ساعات عمل أسبوعيًا.', name: 'محمود حسن', role: 'محاسب أول' },
];

export function TestimonialsBlock({ heading = 'آراء عملائنا', items = defaultItems, bg = '#f9fafb' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '60px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#231f20', marginBottom: 40 }}>{heading}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {items.map((it, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #f3f4f6' }}>
              <FaQuoteRight size={18} style={{ color: '#c8161d', opacity: .3, marginBottom: 12 }} />
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, margin: '0 0 16px' }}>{it.text}</p>
              <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                {Array.from({ length: 5 }).map((_, s) => <FaStar key={s} size={11} style={{ color: '#fbb140' }} />)}
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#231f20', margin: 0 }}>{it.name}</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{it.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

TestimonialsBlock.craft = {
  displayName: 'آراء العملاء',
  props: { heading: 'آراء عملائنا', items: defaultItems, bg: '#f9fafb' },
  related: { settings: TestimonialsSettings },
};

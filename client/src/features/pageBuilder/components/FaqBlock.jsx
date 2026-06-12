import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { FaChevronDown, FaTrash } from 'react-icons/fa6';

function FaqSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عنوان القسم</label>
        <input value={props.heading} onChange={e => setProp(p => p.heading = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">لون التمييز</label>
        <input type="color" value={props.accent} onChange={e => setProp(p => p.accent = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الأسئلة ({props.items.length})</p>
        {props.items.map((it, i) => (
          <div key={i} className="mb-3 p-2 rounded border bg-gray-50 space-y-1 relative">
            <input value={it.q} onChange={e => setProp(p => { p.items[i].q = e.target.value; })} placeholder="السؤال" className="input text-xs" />
            <textarea rows={2} value={it.a} onChange={e => setProp(p => { p.items[i].a = e.target.value; })} placeholder="الإجابة" className="input text-xs resize-none" />
            <button onClick={() => setProp(p => { p.items.splice(i, 1); })}
              className="absolute top-1 left-1 p-1 rounded text-red-400 hover:bg-red-50"><FaTrash size={10} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.items.push({ q: 'سؤال جديد؟', a: 'الإجابة هنا.' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة سؤال
        </button>
      </div>
    </div>
  );
}

const defaultItems = [
  { q: 'كيف أبدأ الاستخدام؟', a: 'سجّل حسابًا جديدًا وابدأ خلال دقائق بدون أي تعقيدات.' },
  { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكنك الإلغاء في أي وقت بدون أي التزامات.' },
  { q: 'هل بياناتي آمنة؟', a: 'نستخدم أعلى معايير التشفير والحماية لبياناتك.' },
];

export function FaqBlock({ heading = 'الأسئلة الشائعة', items = defaultItems, accent = '#c8161d' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const [open, setOpen] = useState(0);
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ padding: '60px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#231f20', marginBottom: 36 }}>{heading}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((it, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
              <button onClick={() => setOpen(open === i ? -1 : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#231f20', textAlign: 'right' }}>
                {it.q}
                <FaChevronDown size={12} style={{ color: accent, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
              </button>
              {open === i && (
                <p style={{ padding: '0 20px 16px', margin: 0, fontSize: 14, color: '#6b7280', lineHeight: 1.8 }}>{it.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

FaqBlock.craft = {
  displayName: 'أسئلة شائعة',
  props: { heading: 'الأسئلة الشائعة', items: defaultItems, accent: '#c8161d' },
  related: { settings: FaqSettings },
};

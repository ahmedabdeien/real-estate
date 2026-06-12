import React from 'react';
import { useNode } from '@craftjs/core';
import { FaQuoteRight } from 'react-icons/fa6';

function QuoteSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الاقتباس</label>
        <textarea rows={4} value={props.quote} onChange={e => setProp(p => p.quote = e.target.value)} className="input text-xs resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الاسم</label>
          <input value={props.author} onChange={e => setProp(p => p.author = e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الصفة</label>
          <input value={props.role} onChange={e => setProp(p => p.role = e.target.value)} className="input text-sm" />
        </div>
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
    </div>
  );
}

export function QuoteBlock({
  quote = 'هذه المنصة غيّرت طريقة إدارتنا للعقارات بالكامل — أنصح بها أي شركة عقارية تبحث عن النمو.',
  author = 'أحمد محمد', role = 'مدير شركة عقارية',
  bg = '#fafafc', accent = '#da1f27',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '48px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <FaQuoteRight style={{ fontSize: 34, color: accent, opacity: 0.85, marginBottom: 18 }} />
        <p style={{ fontSize: 'clamp(16px, 2.4vw, 21px)', fontWeight: 600, color: '#231f20', lineHeight: 2, margin: 0 }}>
          {quote}
        </p>
        <div style={{ width: 40, height: 3, borderRadius: 4, background: accent, margin: '24px auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 800, color: '#231f20', margin: 0 }}>{author}</p>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>{role}</p>
      </div>
    </div>
  );
}

QuoteBlock.craft = {
  displayName: 'اقتباس',
  props: {
    quote: 'هذه المنصة غيّرت طريقة إدارتنا للعقارات بالكامل — أنصح بها أي شركة عقارية تبحث عن النمو.',
    author: 'أحمد محمد', role: 'مدير شركة عقارية', bg: '#fafafc', accent: '#da1f27',
  },
  related: { settings: QuoteSettings },
};

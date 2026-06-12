import React from 'react';
import { useNode, Element } from '@craftjs/core';
import { ButtonBlock } from './ButtonBlock';
import { TextBlock } from './TextBlock';

function HeroSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان الرئيسي</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص الفرعي</label>
        <textarea rows={3} value={props.subtitle} onChange={e => setProp(p => p.subtitle = e.target.value)} className="input text-sm resize-none" />
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
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الحشو العمودي (px)</label>
        <input type="number" value={props.paddingY} onChange={e => setProp(p => p.paddingY = Number(e.target.value))} className="input text-sm" />
      </div>
    </div>
  );
}

export function HeroBlock({ title = 'عنوان القسم الرئيسي', subtitle = 'وصف مختصر يشرح خدماتك أو منتجك بشكل واضح وجذاب للزوار.', bg = '#231f20', textColor = '#ffffff', paddingY = 80 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        background: bg,
        padding: `${paddingY}px clamp(16px, 5vw, 40px)`,
        textAlign: 'center',
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
      }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ color: textColor, fontSize: 'clamp(26px, 5vw, 42px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.3 }}>{title}</h1>
        <p style={{ color: textColor, fontSize: 'clamp(14px, 2.4vw, 18px)', margin: '0 0 32px', opacity: 0.85, lineHeight: 1.8 }}>{subtitle}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ background: '#c8161d', color: '#fff', padding: '14px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>ابدأ الآن</a>
          <a href="#" onClick={e => e.preventDefault()} style={{ background: 'transparent', color: textColor, padding: '14px 36px', borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-block', border: `2px solid ${textColor}` }}>اعرف أكثر</a>
        </div>
      </div>
    </div>
  );
}

HeroBlock.craft = {
  displayName: 'قسم البطولة',
  props: { title: 'عنوان القسم الرئيسي', subtitle: 'وصف مختصر يشرح خدماتك أو منتجك بشكل واضح وجذاب للزوار.', bg: '#231f20', textColor: '#ffffff', paddingY: 80 },
  rules: { canMoveIn: () => false },
  related: { settings: HeroSettings },
};

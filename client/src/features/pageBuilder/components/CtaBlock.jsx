import React from 'react';
import { useNode } from '@craftjs/core';

function CtaSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص الفرعي</label>
        <input value={props.subtitle} onChange={e => setProp(p => p.subtitle = e.target.value)} className="input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">نص الزر</label>
          <input value={props.btnLabel} onChange={e => setProp(p => p.btnLabel = e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">رابط الزر</label>
          <input value={props.btnHref} onChange={e => setProp(p => p.btnHref = e.target.value)} className="input text-sm" style={{ direction: 'ltr' }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الزر</label>
          <input type="color" value={props.btnBg} onChange={e => setProp(p => p.btnBg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

export function CtaBlock({
  title = 'جاهز للبدء؟', subtitle = 'انضم لمئات الشركات التي تدير أعمالها معنا.',
  btnLabel = 'ابدأ الآن مجاناً', btnHref = '/login', bg = '#c8161d', btnBg = '#ffffff',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '56px 24px', textAlign: 'center', outline: isSelected ? '2px dashed #fbb140' : '2px dashed transparent' }}>
      <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, margin: '0 0 10px' }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 16, margin: '0 0 28px' }}>{subtitle}</p>
      <a href={btnHref} onClick={e => e.preventDefault()}
        style={{ background: btnBg, color: bg, padding: '14px 40px', borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>
        {btnLabel}
      </a>
    </div>
  );
}

CtaBlock.craft = {
  displayName: 'دعوة لإجراء',
  props: { title: 'جاهز للبدء؟', subtitle: 'انضم لمئات الشركات التي تدير أعمالها معنا.', btnLabel: 'ابدأ الآن مجاناً', btnHref: '/login', bg: '#c8161d', btnBg: '#ffffff' },
  related: { settings: CtaSettings },
};

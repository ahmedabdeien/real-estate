import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash } from 'react-icons/fa6';

function StepsSettings() {
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
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الأرقام</label>
          <input type="color" value={props.accentColor} onChange={e => setProp(p => p.accentColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الخطوات ({props.steps.length})</p>
        {props.steps.map((s, i) => (
          <div key={i} className="space-y-1 mb-3 p-2 rounded-lg bg-gray-50">
            <div className="flex gap-1">
              <input value={s.title} onChange={e => setProp(p => { p.steps[i].title = e.target.value; })} placeholder="عنوان الخطوة" className="input text-xs flex-1" />
              <button onClick={() => setProp(p => { p.steps.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
            </div>
            <input value={s.text} onChange={e => setProp(p => { p.steps[i].text = e.target.value; })} placeholder="وصف الخطوة" className="input text-xs w-full" />
          </div>
        ))}
        <button onClick={() => setProp(p => p.steps.push({ title: 'خطوة جديدة', text: 'وصف الخطوة' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة خطوة
        </button>
      </div>
    </div>
  );
}

const defaultSteps = [
  { title: 'سجّل حسابك', text: 'أنشئ حسابك مجاناً في أقل من دقيقة' },
  { title: 'أضف مشاريعك', text: 'أدخل بيانات مشاريعك ووحداتك العقارية' },
  { title: 'ابدأ الإدارة', text: 'تابع عقودك ومدفوعاتك من مكان واحد' },
];

export function StepsBlock({ title = 'كيف يعمل النظام؟', steps = defaultSteps, bg = '#ffffff', accentColor = '#da1f27' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '56px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 900, color: '#231f20', margin: '0 0 44px' }}>{title}</h2>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${Math.min(steps.length, 4)}, 1fr)`, gap: 28 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
              background: `${accentColor}12`, border: `2px solid ${accentColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: accentColor,
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: '#231f20', margin: 0 }}>{s.title}</p>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.7 }}>{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

StepsBlock.craft = {
  displayName: 'خطوات العمل',
  props: { title: 'كيف يعمل النظام؟', steps: defaultSteps, bg: '#ffffff', accentColor: '#da1f27' },
  related: { settings: StepsSettings },
};

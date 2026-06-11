import React from 'react';
import { useNode } from '@craftjs/core';
import { FaCircleCheck, FaTrash } from 'react-icons/fa6';

function PricingSettings() {
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
        <p className="text-xs font-semibold text-gray-500 mb-2">الباقات ({props.plans.length})</p>
        {props.plans.map((pl, i) => (
          <div key={i} className="mb-3 p-2 rounded border bg-gray-50 space-y-1 relative">
            <div className="flex gap-1">
              <input value={pl.name} onChange={e => setProp(p => { p.plans[i].name = e.target.value; })} placeholder="الاسم" className="input text-xs flex-1" />
              <input value={pl.price} onChange={e => setProp(p => { p.plans[i].price = e.target.value; })} placeholder="299" className="input text-xs w-20" />
            </div>
            <textarea rows={2} value={pl.features.join('\n')}
              onChange={e => setProp(p => { p.plans[i].features = e.target.value.split('\n'); })}
              placeholder="ميزة في كل سطر" className="input text-xs resize-none" />
            <label className="flex items-center gap-1.5 text-xs text-gray-600">
              <input type="checkbox" checked={pl.featured} onChange={e => setProp(p => { p.plans[i].featured = e.target.checked; })} />
              باقة مميزة
            </label>
            <button onClick={() => setProp(p => { p.plans.splice(i, 1); })}
              className="absolute top-1 left-1 p-1 rounded text-red-400 hover:bg-red-50"><FaTrash size={10} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.plans.push({ name: 'باقة جديدة', price: '199', period: 'شهريًا', features: ['ميزة 1', 'ميزة 2'], featured: false }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة باقة
        </button>
      </div>
    </div>
  );
}

const defaultPlans = [
  { name: 'الأساسية', price: '299', period: 'شهريًا', features: ['حتى 50 وحدة', 'مستخدمان', 'تقارير أساسية'], featured: false },
  { name: 'الاحترافية', price: '599', period: 'شهريًا', features: ['وحدات غير محدودة', '10 مستخدمين', 'تقارير متقدمة', 'دعم أولوية'], featured: true },
  { name: 'المؤسسات', price: '999', period: 'شهريًا', features: ['كل شيء غير محدود', 'مستخدمون غير محدودين', 'مدير حساب مخصص'], featured: false },
];

export function PricingBlock({ heading = 'باقات الأسعار', plans = defaultPlans, accent = '#c8161d' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ padding: '60px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 1050, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#231f20', marginBottom: 40 }}>{heading}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: 20, alignItems: 'start' }}>
          {plans.map((pl, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: 16, padding: 28,
              border: pl.featured ? `2px solid ${accent}` : '1px solid #e5e7eb',
              boxShadow: pl.featured ? `0 8px 24px ${accent}20` : 'none',
              position: 'relative',
            }}>
              {pl.featured && (
                <span style={{ position: 'absolute', top: -12, right: 24, background: accent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 20 }}>الأكثر شيوعًا</span>
              )}
              <p style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', margin: '0 0 8px' }}>{pl.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 20 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: '#231f20' }}>{pl.price}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>ج.م / {pl.period}</span>
              </div>
              <a href="#" onClick={e => e.preventDefault()}
                style={{
                  display: 'block', textAlign: 'center', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 20,
                  background: pl.featured ? accent : '#f3f4f6',
                  color: pl.featured ? '#fff' : '#231f20',
                }}>
                ابدأ الآن
              </a>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pl.features.filter(Boolean).map((f, fi) => (
                  <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
                    <FaCircleCheck size={13} style={{ color: accent, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

PricingBlock.craft = {
  displayName: 'باقات الأسعار',
  props: { heading: 'باقات الأسعار', plans: defaultPlans, accent: '#c8161d' },
  related: { settings: PricingSettings },
};

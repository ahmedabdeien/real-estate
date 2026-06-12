import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash } from 'react-icons/fa6';

function StatsSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الأرقام</label>
          <input type="color" value={props.numColor} onChange={e => setProp(p => p.numColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الإحصائيات ({props.stats.length})</p>
        {props.stats.map((s, i) => (
          <div key={i} className="flex gap-1 mb-2">
            <input value={s.value} onChange={e => setProp(p => { p.stats[i].value = e.target.value; })} placeholder="+500" className="input text-xs w-20" />
            <input value={s.label} onChange={e => setProp(p => { p.stats[i].label = e.target.value; })} placeholder="عميل" className="input text-xs flex-1" />
            <button onClick={() => setProp(p => { p.stats.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.stats.push({ value: '+100', label: 'إحصائية' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة إحصائية
        </button>
      </div>
    </div>
  );
}

const defaultStats = [
  { value: '+500', label: 'عميل سعيد' },
  { value: '+1200', label: 'وحدة مُدارة' },
  { value: '98%', label: 'نسبة الرضا' },
  { value: '24/7', label: 'دعم فني' },
];

export function StatsBlock({ stats = defaultStats, bg = '#231f20', numColor = '#fbb140' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '48px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(26px, 4.5vw, 36px)', fontWeight: 900, color: numColor, margin: 0 }}>{s.value}</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', margin: '6px 0 0' }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

StatsBlock.craft = {
  displayName: 'شريط إحصائيات',
  props: { stats: defaultStats, bg: '#231f20', numColor: '#fbb140' },
  related: { settings: StatsSettings },
};

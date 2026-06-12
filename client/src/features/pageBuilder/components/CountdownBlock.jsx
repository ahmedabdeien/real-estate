import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';

function CountdownSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">تاريخ الانتهاء</label>
        <input type="datetime-local" value={props.targetDate} onChange={e => setProp(p => p.targetDate = e.target.value)} className="input text-sm" dir="ltr" />
      </div>
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
    </div>
  );
}

const UNITS = [
  { key: 'days',    label: 'يوم' },
  { key: 'hours',   label: 'ساعة' },
  { key: 'minutes', label: 'دقيقة' },
  { key: 'seconds', label: 'ثانية' },
];

const calcRemaining = (target) => {
  const diff = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
};

export function CountdownBlock({ title = 'العرض ينتهي خلال', targetDate = '2026-12-31T23:59', bg = '#231f20', numColor = '#fbb140' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const [time, setTime] = useState(() => calcRemaining(targetDate));

  useEffect(() => {
    const t = setInterval(() => setTime(calcRemaining(targetDate)), 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '48px 24px', textAlign: 'center', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <p style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '0 0 28px' }}>{title}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
        {UNITS.map(({ key, label }) => (
          <div key={key} style={{
            minWidth: 84, padding: '16px 12px', borderRadius: 14,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <p style={{ fontSize: 34, fontWeight: 900, color: numColor, margin: 0, fontVariantNumeric: 'tabular-nums' }}>
              {String(time[key]).padStart(2, '0')}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '4px 0 0' }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

CountdownBlock.craft = {
  displayName: 'عداد تنازلي',
  props: { title: 'العرض ينتهي خلال', targetDate: '2026-12-31T23:59', bg: '#231f20', numColor: '#fbb140' },
  related: { settings: CountdownSettings },
};

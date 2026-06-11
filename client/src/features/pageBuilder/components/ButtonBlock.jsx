import React from 'react';
import { useNode } from '@craftjs/core';

function ButtonSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">نص الزر</label>
        <input value={props.label} onChange={e => setProp(p => p.label = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الرابط (href)</label>
        <input value={props.href} onChange={e => setProp(p => p.href = e.target.value)} className="input text-sm" placeholder="/contact" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون النص</label>
          <input type="color" value={props.color} onChange={e => setProp(p => p.color = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">المحاذاة</label>
        <select value={props.align} onChange={e => setProp(p => p.align = e.target.value)} className="input text-sm">
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الحجم</label>
        <select value={props.size} onChange={e => setProp(p => p.size = e.target.value)} className="input text-sm">
          <option value="sm">صغير</option>
          <option value="md">متوسط</option>
          <option value="lg">كبير</option>
        </select>
      </div>
    </div>
  );
}

export function ButtonBlock({ label = 'اضغط هنا', href = '#', bg = '#c8161d', color = '#ffffff', align = 'center', size = 'md' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const pad = size === 'sm' ? '8px 20px' : size === 'lg' ? '16px 40px' : '12px 30px';
  const fSize = size === 'sm' ? 13 : size === 'lg' ? 18 : 15;
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ textAlign: align, outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <a href={href}
        onClick={e => e.preventDefault()}
        style={{ background: bg, color, padding: pad, borderRadius: 10, fontWeight: 700, fontSize: fSize, display: 'inline-block', textDecoration: 'none' }}>
        {label}
      </a>
    </div>
  );
}

ButtonBlock.craft = {
  displayName: 'زر',
  props: { label: 'اضغط هنا', href: '#', bg: '#c8161d', color: '#ffffff', align: 'center', size: 'md' },
  related: { settings: ButtonSettings },
};

import React from 'react';
import { useNode } from '@craftjs/core';

function DividerSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">اللون</label>
        <input type="color" value={props.color} onChange={e => setProp(p => p.color = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">السُمك (px)</label>
          <input type="number" value={props.thickness} onChange={e => setProp(p => p.thickness = Number(e.target.value))} className="input text-sm" min={1} max={10} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الهامش العمودي (px)</label>
          <input type="number" value={props.margin} onChange={e => setProp(p => p.margin = Number(e.target.value))} className="input text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النوع</label>
        <select value={props.style} onChange={e => setProp(p => p.style = e.target.value)} className="input text-sm">
          <option value="solid">صلب</option>
          <option value="dashed">متقطع</option>
          <option value="dotted">منقط</option>
        </select>
      </div>
    </div>
  );
}

export function DividerBlock({ color = '#e5e7eb', thickness = 1, margin = 16, style: borderStyle = 'solid' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent', padding: `${margin}px 0` }}>
      <hr style={{ border: 'none', borderTop: `${thickness}px ${borderStyle} ${color}`, margin: 0 }} />
    </div>
  );
}

DividerBlock.craft = {
  displayName: 'خط فاصل',
  props: { color: '#e5e7eb', thickness: 1, margin: 16, style: 'solid' },
  related: { settings: DividerSettings },
};

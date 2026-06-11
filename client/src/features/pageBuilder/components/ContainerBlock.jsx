import React from 'react';
import { useNode, Element } from '@craftjs/core';

function ContainerSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
        <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-8 rounded cursor-pointer" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">تبطين داخلي (px)</label>
        <input type="number" value={props.padding} onChange={e => setProp(p => p.padding = Number(e.target.value))} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الحد الأقصى للعرض</label>
        <select value={props.maxWidth} onChange={e => setProp(p => p.maxWidth = e.target.value)} className="input text-sm">
          <option value="100%">كامل العرض</option>
          <option value="1200px">1200px</option>
          <option value="960px">960px</option>
          <option value="720px">720px</option>
        </select>
      </div>
    </div>
  );
}

export function ContainerBlock({ bg = '#ffffff', padding = 40, maxWidth = '1200px', children }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        background: bg,
        padding,
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
        minHeight: 60,
      }}
    >
      <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
    </div>
  );
}

ContainerBlock.craft = {
  displayName: 'قسم',
  props: { bg: '#ffffff', padding: 40, maxWidth: '1200px' },
  rules: { canDrop: () => true, canMoveIn: () => true },
  related: { settings: ContainerSettings },
};

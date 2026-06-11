import React from 'react';
import { useNode } from '@craftjs/core';

function SpacerSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الارتفاع (px)</label>
        <input type="number" value={props.height} onChange={e => setProp(p => p.height = Number(e.target.value))} className="input text-sm" min={4} max={300} />
      </div>
    </div>
  );
}

export function SpacerBlock({ height = 40 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ height, outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent', position: 'relative' }}>
      {isSelected && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', background: '#f9fafb', padding: '2px 8px', borderRadius: 4 }}>{height}px</span>
        </div>
      )}
    </div>
  );
}

SpacerBlock.craft = {
  displayName: 'مسافة فارغة',
  props: { height: 40 },
  related: { settings: SpacerSettings },
};

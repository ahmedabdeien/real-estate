import React from 'react';
import { useNode, useEditor, Element } from '@craftjs/core';
import { ContainerBlock } from './ContainerBlock';

function ColumnsSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عدد الأعمدة</label>
        <select value={props.cols} onChange={e => setProp(p => p.cols = Number(e.target.value))} className="input text-sm">
          <option value={2}>عمودان</option>
          <option value={3}>3 أعمدة</option>
          <option value={4}>4 أعمدة</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الفراغ بين الأعمدة (px)</label>
        <input type="number" value={props.gap} onChange={e => setProp(p => p.gap = Number(e.target.value))} className="input text-sm" />
      </div>
    </div>
  );
}

function ColumnDropZone({ index }) {
  const { connectors: { connect } } = useNode();
  return (
    <div ref={connect} style={{ flex: 1, minHeight: 80, background: '#f9fafb', borderRadius: 8, padding: 16, border: '2px dashed #e5e7eb' }}>
    </div>
  );
}
ColumnDropZone.craft = { displayName: 'عمود', rules: { canMoveIn: () => true } };

export function ColumnsBlock({ cols = 2, gap = 24, children }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
        padding: 8,
      }}>
      {children || Array.from({ length: cols }).map((_, i) => (
        <div key={i} style={{ minHeight: 80, background: '#f9fafb', borderRadius: 8, border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
          أسقط هنا
        </div>
      ))}
    </div>
  );
}

ColumnsBlock.craft = {
  displayName: 'أعمدة',
  props: { cols: 2, gap: 24 },
  rules: { canDrop: () => true, canMoveIn: () => true },
  related: { settings: ColumnsSettings },
};

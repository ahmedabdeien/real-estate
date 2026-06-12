import React from 'react';
import { useNode } from '@craftjs/core';
import { FaLocationDot } from 'react-icons/fa6';

function MapSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رابط تضمين خرائط جوجل</label>
        <textarea rows={3} value={props.embedUrl} onChange={e => setProp(p => p.embedUrl = e.target.value)}
          placeholder="https://www.google.com/maps/embed?..." dir="ltr" className="input text-xs resize-none" />
        <p className="text-[10px] text-gray-400 mt-1">من خرائط جوجل: مشاركة ← تضمين خريطة ← انسخ رابط src</p>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الارتفاع (px)</label>
        <input type="number" value={props.height} onChange={e => setProp(p => p.height = Number(e.target.value))} className="input text-sm" />
      </div>
    </div>
  );
}

export function MapBlock({ embedUrl = '', height = 380 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      {embedUrl ? (
        <iframe src={embedUrl} title="map" width="100%" height={height}
          style={{ border: 0, display: 'block', pointerEvents: isSelected ? 'none' : 'auto' }}
          allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <div style={{ height, background: '#e8ecef', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FaLocationDot style={{ fontSize: 32, color: '#da1f27' }} />
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0, fontWeight: 600 }}>أضف رابط تضمين خرائط جوجل من لوحة الخصائص</p>
        </div>
      )}
    </div>
  );
}

MapBlock.craft = {
  displayName: 'خريطة',
  props: { embedUrl: '', height: 380 },
  related: { settings: MapSettings },
};

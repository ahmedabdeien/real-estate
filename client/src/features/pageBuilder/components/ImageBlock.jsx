import React from 'react';
import { useNode } from '@craftjs/core';
import { FaImage } from 'react-icons/fa6';

function ImageSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رابط الصورة</label>
        <input value={props.src} onChange={e => setProp(p => p.src = e.target.value)} className="input text-sm" placeholder="https://..." />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص البديل</label>
        <input value={props.alt} onChange={e => setProp(p => p.alt = e.target.value)} className="input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">العرض</label>
          <input value={props.width} onChange={e => setProp(p => p.width = e.target.value)} className="input text-sm" placeholder="100%" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الارتفاع</label>
          <input value={props.height} onChange={e => setProp(p => p.height = e.target.value)} className="input text-sm" placeholder="auto" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الحواف الدائرية (px)</label>
        <input type="number" value={props.borderRadius} onChange={e => setProp(p => p.borderRadius = Number(e.target.value))} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">المحاذاة</label>
        <select value={props.align} onChange={e => setProp(p => p.align = e.target.value)} className="input text-sm">
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
    </div>
  );
}

export function ImageBlock({ src = '', alt = 'صورة', width = '100%', height = 'auto', borderRadius = 8, align = 'center' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ textAlign: align, outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      {src ? (
        <img src={src} alt={alt} style={{ width, height, borderRadius, display: 'inline-block', objectFit: 'cover' }} />
      ) : (
        <div style={{ width, height: height === 'auto' ? 200 : height, borderRadius, background: '#f3f4f6', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, color: '#9ca3af' }}>
          <FaImage size={32} />
          <span style={{ fontSize: 13 }}>أضف رابط الصورة</span>
        </div>
      )}
    </div>
  );
}

ImageBlock.craft = {
  displayName: 'صورة',
  props: { src: '', alt: 'صورة', width: '100%', height: 'auto', borderRadius: 8, align: 'center' },
  related: { settings: ImageSettings },
};

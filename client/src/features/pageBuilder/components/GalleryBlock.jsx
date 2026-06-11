import React from 'react';
import { useNode } from '@craftjs/core';
import { FaImages, FaTrash } from 'react-icons/fa6';

function GallerySettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عدد الأعمدة</label>
        <select value={props.cols} onChange={e => setProp(p => p.cols = Number(e.target.value))} className="input text-sm">
          <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الفراغ (px)</label>
          <input type="number" value={props.gap} onChange={e => setProp(p => p.gap = Number(e.target.value))} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">الحواف (px)</label>
          <input type="number" value={props.borderRadius} onChange={e => setProp(p => p.borderRadius = Number(e.target.value))} className="input text-sm" />
        </div>
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الصور ({props.images.length})</p>
        {props.images.map((img, i) => (
          <div key={i} className="flex gap-1 mb-2">
            <input value={img} onChange={e => setProp(p => { p.images[i] = e.target.value; })}
              placeholder="https://..." className="input text-xs flex-1" style={{ direction: 'ltr' }} />
            <button onClick={() => setProp(p => { p.images.splice(i, 1); })}
              className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
          </div>
        ))}
        <button onClick={() => setProp(p => p.images.push(''))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة صورة
        </button>
      </div>
    </div>
  );
}

export function GalleryBlock({ images = ['', '', ''], cols = 3, gap = 12, borderRadius = 12 }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ padding: '24px 16px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, maxWidth: 1100, margin: '0 auto' }}>
        {images.map((src, i) => src ? (
          <img key={i} src={src} alt="" style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius }} />
        ) : (
          <div key={i} style={{ height: 220, borderRadius, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
            <FaImages size={28} />
          </div>
        ))}
      </div>
    </div>
  );
}

GalleryBlock.craft = {
  displayName: 'معرض صور',
  props: { images: ['', '', ''], cols: 3, gap: 12, borderRadius: 12 },
  related: { settings: GallerySettings },
};

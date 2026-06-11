import React from 'react';
import { useNode } from '@craftjs/core';

function TextSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص</label>
        <textarea rows={3} value={props.text} onChange={e => setProp(p => p.text = e.target.value)} className="input text-sm resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">نوع العنصر</label>
        <select value={props.tag} onChange={e => setProp(p => p.tag = e.target.value)} className="input text-sm">
          {['h1','h2','h3','h4','p','span'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">حجم الخط (px)</label>
          <input type="number" value={props.fontSize} onChange={e => setProp(p => p.fontSize = Number(e.target.value))} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">اللون</label>
          <input type="color" value={props.color} onChange={e => setProp(p => p.color = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الوزن</label>
        <select value={props.fontWeight} onChange={e => setProp(p => p.fontWeight = e.target.value)} className="input text-sm">
          <option value="normal">عادي</option>
          <option value="600">شبه عريض</option>
          <option value="700">عريض</option>
          <option value="900">أعرض</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">المحاذاة</label>
        <select value={props.textAlign} onChange={e => setProp(p => p.textAlign = e.target.value)} className="input text-sm">
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
    </div>
  );
}

export function TextBlock({ text = 'انقر لتعديل النص', tag = 'p', fontSize = 16, color = '#231f20', fontWeight = 'normal', textAlign = 'right' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const Tag = tag;
  return (
    <Tag
      ref={ref => connect(drag(ref))}
      style={{
        fontSize, color, fontWeight, textAlign,
        margin: 0,
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
        cursor: 'default',
        lineHeight: 1.7,
      }}
    >
      {text}
    </Tag>
  );
}

TextBlock.craft = {
  displayName: 'نص',
  props: { text: 'انقر لتعديل النص', tag: 'p', fontSize: 16, color: '#231f20', fontWeight: 'normal', textAlign: 'right' },
  related: { settings: TextSettings },
};

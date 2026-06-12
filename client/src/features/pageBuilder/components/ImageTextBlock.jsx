import React from 'react';
import { useNode } from '@craftjs/core';
import { FaImage } from 'react-icons/fa6';

function ImageTextSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص</label>
        <textarea rows={4} value={props.text} onChange={e => setProp(p => p.text = e.target.value)} className="input text-xs resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رابط الصورة</label>
        <input value={props.image || ''} dir="ltr" onChange={e => setProp(p => p.image = e.target.value)} placeholder="https://..." className="input text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">موضع الصورة</label>
          <select value={props.imageSide} onChange={e => setProp(p => p.imageSide = e.target.value)} className="input text-sm">
            <option value="start">البداية</option>
            <option value="end">النهاية</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">نص الزر (اختياري)</label>
          <input value={props.btnText || ''} onChange={e => setProp(p => p.btnText = e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الزر</label>
          <input type="color" value={props.btnColor} onChange={e => setProp(p => p.btnColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

export function ImageTextBlock({
  title = 'قسم صورة ونص',
  text = 'اشرح ميزة منتجك أو خدمتك هنا بنص واضح بجانب صورة معبرة — التصميم يتكيف تلقائياً مع الموبايل.',
  image = '', imageSide = 'start', bg = '#ffffff',
  btnText = '', btnColor = '#da1f27',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '56px clamp(16px, 5vw, 40px)', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{
        maxWidth: 1050, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))',
        gap: 40, alignItems: 'center',
        direction: imageSide === 'end' ? 'ltr' : 'rtl',
      }}>
        {/* الصورة */}
        <div>
          {image ? (
            <img src={image} alt={title} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 380 }} />
          ) : (
            <div style={{ width: '100%', height: 280, borderRadius: 16, background: '#f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <FaImage style={{ fontSize: 34, color: '#d1d5db' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>أضف رابط صورة من الخصائص</span>
            </div>
          )}
        </div>
        {/* النص */}
        <div style={{ direction: 'rtl', textAlign: 'right' }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: '#231f20', margin: '0 0 14px' }}>{title}</h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 2, margin: 0 }}>{text}</p>
          {btnText && (
            <a href="#" onClick={e => e.preventDefault()}
              style={{ display: 'inline-block', marginTop: 22, background: btnColor, color: '#fff', padding: '12px 30px', borderRadius: 10, fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              {btnText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

ImageTextBlock.craft = {
  displayName: 'صورة ونص',
  props: {
    title: 'قسم صورة ونص',
    text: 'اشرح ميزة منتجك أو خدمتك هنا بنص واضح بجانب صورة معبرة — التصميم يتكيف تلقائياً مع الموبايل.',
    image: '', imageSide: 'start', bg: '#ffffff', btnText: '', btnColor: '#da1f27',
  },
  related: { settings: ImageTextSettings },
};

import React from 'react';
import { useNode } from '@craftjs/core';
import { FaPhone, FaEnvelope, FaLocationDot } from 'react-icons/fa6';

function ContactSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.heading} onChange={e => setProp(p => p.heading = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">رقم الهاتف</label>
        <input value={props.phone} onChange={e => setProp(p => p.phone = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">البريد الإلكتروني</label>
        <input value={props.email} onChange={e => setProp(p => p.email = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.address} onChange={e => setProp(p => p.address = e.target.value)} className="input text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
          <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الأيقونة</label>
          <input type="color" value={props.iconColor} onChange={e => setProp(p => p.iconColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

export function ContactSection({ heading = 'تواصل معنا', phone = '01000000000', email = 'info@example.com', address = 'القاهرة، مصر', bg = '#ffffff', iconColor = '#c8161d' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const items = [
    { icon: FaPhone, label: 'الهاتف', value: phone },
    { icon: FaEnvelope, label: 'البريد', value: email },
    { icon: FaLocationDot, label: 'العنوان', value: address },
  ];
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '60px clamp(16px, 5vw, 40px)', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 800, color: '#231f20', marginBottom: 40 }}>{heading}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {items.map(({ icon: Icon, label, value }, i) => (
            <div key={i} style={{ textAlign: 'center', padding: 24, borderRadius: 12, border: '1px solid #f3f4f6' }}>
              <div style={{ width: 56, height: 56, background: `${iconColor}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Icon size={22} style={{ color: iconColor }} />
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#231f20', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, background: '#f9fafb', borderRadius: 12, padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
            <input disabled placeholder="الاسم الكامل" style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', width: '100%' }} />
            <input disabled placeholder="رقم الهاتف" style={{ padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', width: '100%' }} />
          </div>
          <textarea disabled rows={4} placeholder="رسالتك هنا..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#fff', resize: 'none', boxSizing: 'border-box' }} />
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button disabled style={{ background: iconColor, color: '#fff', padding: '12px 36px', borderRadius: 10, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'default' }}>إرسال الرسالة</button>
          </div>
        </div>
      </div>
    </div>
  );
}

ContactSection.craft = {
  displayName: 'قسم التواصل',
  props: { heading: 'تواصل معنا', phone: '01000000000', email: 'info@example.com', address: 'القاهرة، مصر', bg: '#ffffff', iconColor: '#c8161d' },
  rules: { canMoveIn: () => false },
  related: { settings: ContactSettings },
};

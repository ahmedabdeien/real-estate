import React from 'react';
import { useNode } from '@craftjs/core';
import {
  FaRocket, FaShield, FaChartLine, FaHeadset, FaGears, FaBolt,
  FaHouse, FaKey, FaHandshake, FaCreditCard, FaUsers, FaStar,
} from 'react-icons/fa6';

export const ICONBOX_ICONS = {
  rocket: FaRocket, shield: FaShield, chart: FaChartLine, headset: FaHeadset,
  gears: FaGears, bolt: FaBolt, house: FaHouse, key: FaKey,
  handshake: FaHandshake, card: FaCreditCard, users: FaUsers, star: FaStar,
};

function IconBoxSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">الأيقونة</label>
        <div className="grid grid-cols-6 gap-1">
          {Object.entries(ICONBOX_ICONS).map(([key, Icon]) => (
            <button key={key} onClick={() => setProp(p => p.icon = key)}
              className="p-2 rounded-lg border flex items-center justify-center transition-all"
              style={{
                borderColor: props.icon === key ? '#da1f27' : '#e5e7eb',
                background: props.icon === key ? '#fef2f2' : '#fff',
                color: props.icon === key ? '#da1f27' : '#6b7280',
                cursor: 'pointer',
              }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">النص</label>
        <textarea rows={3} value={props.text} onChange={e => setProp(p => p.text = e.target.value)} className="input text-xs resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">لون الأيقونة</label>
          <input type="color" value={props.iconColor} onChange={e => setProp(p => p.iconColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">المحاذاة</label>
          <select value={props.align} onChange={e => setProp(p => p.align = e.target.value)} className="input text-sm">
            <option value="center">وسط</option>
            <option value="right">يمين</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export function IconBoxBlock({
  icon = 'rocket', title = 'ميزة رائعة',
  text = 'وصف مختصر للميزة وكيف تفيد عملاءك في تحقيق أهدافهم.',
  iconColor = '#da1f27', align = 'center',
}) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  const Icon = ICONBOX_ICONS[icon] || FaRocket;
  return (
    <div ref={ref => connect(drag(ref))}
      style={{
        padding: '28px 24px', textAlign: align,
        outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent',
      }}>
      <div style={{
        width: 58, height: 58, borderRadius: 16,
        background: `${iconColor}12`, border: `1.5px solid ${iconColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: align === 'center' ? '0 auto 16px' : '0 0 16px',
      }}>
        <Icon style={{ fontSize: 24, color: iconColor }} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 800, color: '#231f20', margin: 0 }}>{title}</p>
      <p style={{ fontSize: 13.5, color: '#6b7280', margin: '8px 0 0', lineHeight: 1.8 }}>{text}</p>
    </div>
  );
}

IconBoxBlock.craft = {
  displayName: 'صندوق أيقونة',
  props: { icon: 'rocket', title: 'ميزة رائعة', text: 'وصف مختصر للميزة وكيف تفيد عملاءك في تحقيق أهدافهم.', iconColor: '#da1f27', align: 'center' },
  related: { settings: IconBoxSettings },
};

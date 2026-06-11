import React from 'react';
import { useNode } from '@craftjs/core';
import {
  FaStar, FaRocket, FaShield, FaGear, FaBolt, FaHeart, FaChartLine,
  FaUsers, FaBuilding, FaPhone, FaEnvelope, FaCircleCheck, FaCrown,
  FaGlobe, FaLock, FaMobileScreen, FaCloudArrowUp, FaHeadset, FaWallet,
  FaHandshake, FaAward, FaLightbulb, FaClock, FaMapLocationDot,
} from 'react-icons/fa6';

const ICONS = {
  star: FaStar, rocket: FaRocket, shield: FaShield, gear: FaGear,
  bolt: FaBolt, heart: FaHeart, chart: FaChartLine, users: FaUsers,
  building: FaBuilding, phone: FaPhone, envelope: FaEnvelope,
  check: FaCircleCheck, crown: FaCrown, globe: FaGlobe, lock: FaLock,
  mobile: FaMobileScreen, cloud: FaCloudArrowUp, headset: FaHeadset,
  wallet: FaWallet, handshake: FaHandshake, award: FaAward,
  lightbulb: FaLightbulb, clock: FaClock, map: FaMapLocationDot,
};

const ICON_LABELS = {
  star: 'نجمة', rocket: 'صاروخ', shield: 'درع', gear: 'ترس',
  bolt: 'برق', heart: 'قلب', chart: 'رسم بياني', users: 'مستخدمون',
  building: 'مبنى', phone: 'هاتف', envelope: 'بريد', check: 'صح',
  crown: 'تاج', globe: 'كرة أرضية', lock: 'قفل', mobile: 'موبايل',
  cloud: 'سحابة', headset: 'سماعة دعم', wallet: 'محفظة',
  handshake: 'مصافحة', award: 'جائزة', lightbulb: 'فكرة', clock: 'ساعة', map: 'خريطة',
};

function FeatureGridSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  const updateFeature = (i, key, val) => setProp(p => { p.features[i][key] = val; });
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عنوان القسم</label>
        <input value={props.heading} onChange={e => setProp(p => p.heading = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">عدد الأعمدة</label>
        <select value={props.cols} onChange={e => setProp(p => p.cols = Number(e.target.value))} className="input text-sm">
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">لون الأيقونة</label>
        <input type="color" value={props.iconColor} onChange={e => setProp(p => p.iconColor = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الميزات ({props.features.length})</p>
        {props.features.map((f, i) => (
          <div key={i} className="mb-3 p-2 rounded border bg-gray-50 space-y-1">
            <input value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)} placeholder="العنوان" className="input text-xs" />
            <input value={f.desc} onChange={e => updateFeature(i, 'desc', e.target.value)} placeholder="الوصف" className="input text-xs" />
            <select value={f.icon || 'star'} onChange={e => updateFeature(i, 'icon', e.target.value)} className="input text-xs">
              {Object.keys(ICONS).map(k => <option key={k} value={k}>{ICON_LABELS[k]}</option>)}
            </select>
          </div>
        ))}
        <button onClick={() => setProp(p => p.features.push({ title: 'ميزة جديدة', desc: 'وصف الميزة هنا', icon: 'star' }))}
          style={{ width: '100%', padding: '6px', borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة ميزة
        </button>
      </div>
    </div>
  );
}

const defaultFeatures = [
  { title: 'سرعة فائقة', desc: 'منصة مُحسَّنة لأداء استثنائي في كل جهاز.', icon: 'rocket' },
  { title: 'أمان متقدم', desc: 'بياناتك محمية بأعلى معايير التشفير والحماية.', icon: 'shield' },
  { title: 'مرونة تامة', desc: 'قابل للتخصيص الكامل ليناسب احتياجاتك.', icon: 'gear' },
];

export function FeatureGrid({ heading = 'مميزاتنا', features = defaultFeatures, cols = 3, bg = '#f9fafb', iconColor = '#c8161d' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '60px 40px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {heading && <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 800, color: '#231f20', marginBottom: 40 }}>{heading}</h2>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 }}>
          {features.map((f, i) => {
            const Icon = ICONS[f.icon] || FaStar;
            return (
              <div key={i} style={{ background: '#ffffff', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: `${iconColor}15`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} style={{ color: iconColor }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#231f20', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

FeatureGrid.craft = {
  displayName: 'شبكة المميزات',
  props: { heading: 'مميزاتنا', features: defaultFeatures, cols: 3, bg: '#f9fafb', iconColor: '#c8161d' },
  rules: { canMoveIn: () => false },
  related: { settings: FeatureGridSettings },
};

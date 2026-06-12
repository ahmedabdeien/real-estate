import React from 'react';
import { useNode } from '@craftjs/core';
import { FaTrash, FaUser } from 'react-icons/fa6';

function TeamSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
  return (
    <div className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
        <input value={props.title} onChange={e => setProp(p => p.title = e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">لون الخلفية</label>
        <input type="color" value={props.bg} onChange={e => setProp(p => p.bg = e.target.value)} className="w-full h-9 rounded cursor-pointer" />
      </div>
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">الأعضاء ({props.members.length})</p>
        {props.members.map((m, i) => (
          <div key={i} className="space-y-1 mb-3 p-2 rounded-lg bg-gray-50">
            <div className="flex gap-1">
              <input value={m.name} onChange={e => setProp(p => { p.members[i].name = e.target.value; })} placeholder="الاسم" className="input text-xs flex-1" />
              <button onClick={() => setProp(p => { p.members.splice(i, 1); })} className="p-1.5 rounded text-red-500 hover:bg-red-50"><FaTrash size={11} /></button>
            </div>
            <input value={m.role} onChange={e => setProp(p => { p.members[i].role = e.target.value; })} placeholder="المنصب" className="input text-xs w-full" />
            <input value={m.image || ''} onChange={e => setProp(p => { p.members[i].image = e.target.value; })} placeholder="رابط الصورة (اختياري)" dir="ltr" className="input text-xs w-full" />
          </div>
        ))}
        <button onClick={() => setProp(p => p.members.push({ name: 'عضو جديد', role: 'المنصب', image: '' }))}
          style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px dashed #d1d5db', fontSize: 12, color: '#6b7280', cursor: 'pointer', background: 'white' }}>
          + إضافة عضو
        </button>
      </div>
    </div>
  );
}

const defaultMembers = [
  { name: 'أحمد محمد', role: 'المدير التنفيذي', image: '' },
  { name: 'سارة علي', role: 'مديرة التسويق', image: '' },
  { name: 'محمود حسن', role: 'مدير المبيعات', image: '' },
];

export function TeamBlock({ title = 'فريق العمل', members = defaultMembers, bg = '#ffffff' }) {
  const { connectors: { connect, drag }, isSelected } = useNode(s => ({ isSelected: s.events.selected }));
  return (
    <div ref={ref => connect(drag(ref))}
      style={{ background: bg, padding: '56px 24px', outline: isSelected ? '2px dashed #c8161d' : '2px dashed transparent' }}>
      <h2 style={{ textAlign: 'center', fontSize: 30, fontWeight: 900, color: '#231f20', margin: '0 0 40px' }}>{title}</h2>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${Math.min(members.length, 4)}, 1fr)`, gap: 28 }}>
        {members.map((m, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            {m.image ? (
              <img src={m.image} alt={m.name} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block', border: '3px solid #da1f27' }} />
            ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#f3f4f6', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #da1f27' }}>
                <FaUser style={{ fontSize: 36, color: '#9ca3af' }} />
              </div>
            )}
            <p style={{ fontSize: 16, fontWeight: 800, color: '#231f20', margin: 0 }}>{m.name}</p>
            <p style={{ fontSize: 13, color: '#da1f27', margin: '4px 0 0', fontWeight: 600 }}>{m.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

TeamBlock.craft = {
  displayName: 'فريق العمل',
  props: { title: 'فريق العمل', members: defaultMembers, bg: '#ffffff' },
  related: { settings: TeamSettings },
};

import React from 'react';

const COLORS = ['#c8161d', '#1d4ed8', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d'];

function colorFromStr(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function Avatar({ name = '', src, size = 36, className = '' }) {
  const initials = name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
  const bg = colorFromStr(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-black flex-shrink-0 text-white select-none ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
      title={name}
    >
      {initials}
    </div>
  );
}

export function AvatarGroup({ users = [], max = 4, size = 32 }) {
  const visible = users.slice(0, max);
  const rest = users.length - max;

  return (
    <div className="flex items-center" style={{ direction: 'ltr' }}>
      {visible.map((u, i) => (
        <div key={u._id || i} style={{ marginRight: i > 0 ? -size * 0.3 : 0, zIndex: visible.length - i }}>
          <Avatar name={u.name || ''} src={u.avatar} size={size} className="border-2 border-white" />
        </div>
      ))}
      {rest > 0 && (
        <div
          className="rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 border-2 border-white"
          style={{ width: size, height: size, background: '#6b7280', fontSize: size * 0.32, marginRight: -size * 0.3 }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}

export default Avatar;

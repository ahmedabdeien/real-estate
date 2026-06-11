import React from 'react';

const COLORS = {
  success: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', dot: '#22C55E' },
  danger:  { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA', dot: '#EF4444' },
  warning: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A', dot: '#F59E0B' },
  info:    { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  default: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB', dot: '#9CA3AF' },
  primary: { bg: '#FEE2E2', text: '#C8161D', border: '#FCA5A5', dot: '#EF4444' },
  gold:    { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', dot: '#F59E0B' },
  purple:  { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE', dot: '#A78BFA' },
  teal:    { bg: '#CCFBF1', text: '#0D9488', border: '#99F6E4', dot: '#14B8A6' },
};

const Badge = ({ children, color = 'default', dot, size = 'sm' }) => {
  const c = COLORS[color] || COLORS.default;
  return (
    <span
      className="inline-flex items-center gap-1 font-semibold"
      style={{
        background:  c.bg,
        color:       c.text,
        border:      `1px solid ${c.border}`,
        borderRadius: '5px',
        padding:     size === 'sm' ? '2px 7px' : '3px 9px',
        fontSize:    size === 'sm' ? '11px' : '12px',
        lineHeight:  '1.6',
        whiteSpace:  'nowrap',
      }}
    >
      {dot && (
        <span className="rounded-full flex-shrink-0"
          style={{ width: 6, height: 6, background: c.dot }} />
      )}
      {children}
    </span>
  );
};

export default Badge;

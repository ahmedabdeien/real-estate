// Design System — Odoo-inspired, company colors
// Primary gold #8A6924 | Light gold #DFBA6B | Navy #12283C | Cream #faf8f4

import React from 'react';
import { TbLoaderQuarter } from 'react-icons/tb';

// ─────────── DSButton ───────────
export function DSButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) {
  const sizes = {
    sm: { padding: '6px 14px', fontSize: 12 },
    md: { padding: '9px 20px', fontSize: 13 },
    lg: { padding: '12px 28px', fontSize: 14 },
  };
  const variants = {
    primary: {
      background: '#8A6924',
      color: 'white',
      border: '1px solid #8A6924',
    },
    outline: {
      background: 'white',
      color: '#8A6924',
      border: '1.5px solid #8A6924',
    },
    ghost: {
      background: 'transparent',
      color: '#374151',
      border: '1px solid #e5e7eb',
    },
    danger: {
      background: '#dc2626',
      color: 'white',
      border: '1px solid #dc2626',
    },
    navy: {
      background: '#12283C',
      color: '#DFBA6B',
      border: '1px solid #12283C',
    },
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontWeight: 700,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    ...sizes[size] || sizes.md,
    ...variants[variant] || variants.primary,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={baseStyle}
      className={className}
      {...rest}
    >
      {loading && <TbLoaderQuarter size={14} className="animate-spin" />}
      {children}
    </button>
  );
}

// ─────────── DSCard ───────────
export function DSCard({
  children,
  goldTop = false,
  padding = 20,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        borderTop: goldTop ? '3px solid #8A6924' : undefined,
        padding,
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
}

// ─────────── DSBadge ───────────
export function DSBadge({ children, variant = 'info' }) {
  const map = {
    success: { bg: '#dcfce7', color: '#16a34a' },
    warning: { bg: '#fef9c3', color: '#ca8a04' },
    danger:  { bg: '#fee2e2', color: '#dc2626' },
    info:    { bg: '#dbeafe', color: '#2563eb' },
    gold:    { bg: 'rgba(138,105,36,0.12)', color: '#8A6924' },
    navy:    { bg: 'rgba(18,40,60,0.1)', color: '#12283C' },
  };
  const s = map[variant] || map.info;
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        display: 'inline-block',
        borderRadius: 99,
      }}
    >
      {children}
    </span>
  );
}

// ─────────── DSInput ───────────
export function DSInput({
  label,
  error,
  hint,
  id,
  className = '',
  style = {},
  ...rest
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && (
        <label
          htmlFor={id}
          style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`ds-input ${className}`}
        style={{
          border: `1.5px solid ${error ? '#dc2626' : '#d1d5db'}`,
          borderRadius: 2,
          background: 'white',
          padding: '9px 13px',
          fontSize: 13,
          width: '100%',
          outline: 'none',
          transition: 'border-color 0.15s',
          color: '#12283C',
          ...style,
        }}
        {...rest}
      />
      {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 11, color: '#6b7280' }}>{hint}</span>}
    </div>
  );
}

// ─────────── DSTable ───────────
export function DSTable({ columns = [], rows = [], emptyText = 'لا توجد بيانات' }) {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        overflow: 'hidden',
      }}
    >
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {columns.map((col, i) => (
              <th
                key={i}
                style={{
                  padding: '10px 16px',
                  textAlign: 'right',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr
                key={ri}
                style={{ borderBottom: '1px solid #f3f4f6' }}
              >
                {columns.map((col, ci) => (
                  <td
                    key={ci}
                    style={{ padding: '10px 16px', color: '#374151', verticalAlign: 'middle' }}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─────────── DSPageHeader ───────────
export function DSPageHeader({ title, subtitle, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
      }}
      dir="rtl"
    >
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 900, color: '#12283C', margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─────────── DSSection ───────────
export function DSSection({ children, title, subtitle, style = {}, divider = false }) {
  return (
    <section
      dir="rtl"
      style={{
        padding: '64px 0',
        background: 'white',
        borderTop: divider ? '1px solid #e5e7eb' : undefined,
        ...style,
      }}
    >
      {(title || subtitle) && (
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          {title && (
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#12283C', margin: '0 0 8px 0' }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{subtitle}</p>
          )}
          <div
            style={{
              width: 40,
              height: 3,
              background: 'linear-gradient(to right, #8A6924, #DFBA6B)',
              margin: '12px auto 0',
            }}
          />
        </div>
      )}
      {children}
    </section>
  );
}

// ─────────── DSStat ───────────
export function DSStat({ number, label, icon: Icon, color = '#8A6924' }) {
  return (
    <DSCard
      style={{
        textAlign: 'center',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {Icon && (
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `${color}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 4,
          }}
        >
          <Icon size={20} style={{ color }} />
        </div>
      )}
      <span style={{ fontSize: 28, fontWeight: 900, color: '#12283C', lineHeight: 1 }}>
        {number}
      </span>
      <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{label}</span>
    </DSCard>
  );
}

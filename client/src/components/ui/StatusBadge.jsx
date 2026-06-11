import React from 'react';
import { FaCircleCheck, FaCircleXmark, FaClock, FaTriangleExclamation, FaCircle } from 'react-icons/fa6';

const STATUS_MAP = {
  // Contracts
  active:      { label: 'نشط',        color: '#059669', bg: '#d1fae5', icon: FaCircleCheck },
  completed:   { label: 'منتهي',      color: '#6b7280', bg: '#f3f4f6', icon: FaCircleCheck },
  cancelled:   { label: 'ملغي',       color: '#ef4444', bg: '#fee2e2', icon: FaCircleXmark },
  terminated:  { label: 'مُنهى',      color: '#7c3aed', bg: '#ede9fe', icon: FaCircleXmark },
  draft:       { label: 'مسودة',      color: '#6b7280', bg: '#f3f4f6', icon: FaCircle },
  // Invoices / Payments
  paid:        { label: 'مدفوع',      color: '#059669', bg: '#d1fae5', icon: FaCircleCheck },
  partial:     { label: 'جزئي',       color: '#d97706', bg: '#fef3c7', icon: FaClock },
  overdue:     { label: 'متأخر',      color: '#dc2626', bg: '#fee2e2', icon: FaTriangleExclamation },
  sent:        { label: 'مرسل',       color: '#2563eb', bg: '#dbeafe', icon: FaClock },
  pending:     { label: 'معلق',       color: '#d97706', bg: '#fef3c7', icon: FaClock },
  // Units
  available:   { label: 'متاحة',      color: '#059669', bg: '#d1fae5', icon: FaCircleCheck },
  reserved:    { label: 'محجوزة',     color: '#2563eb', bg: '#dbeafe', icon: FaClock },
  sold:        { label: 'مباعة',      color: '#6b7280', bg: '#f3f4f6', icon: FaCircleCheck },
  rented:      { label: 'مؤجرة',      color: '#7c3aed', bg: '#ede9fe', icon: FaCircleCheck },
  maintenance: { label: 'صيانة',      color: '#f59e0b', bg: '#fef3c7', icon: FaTriangleExclamation },
  // Generic
  inactive:    { label: 'غير نشط',   color: '#6b7280', bg: '#f3f4f6', icon: FaCircle },
  online:      { label: 'متصل',       color: '#059669', bg: '#d1fae5', icon: FaCircleCheck },
};

export function StatusBadge({ status, label: overrideLabel, size = 'sm', dot = false }) {
  const cfg = STATUS_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6', icon: FaCircle };
  const Icon = cfg.icon;
  const label = overrideLabel || cfg.label;

  if (dot) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{label}</span>
      </div>
    );
  }

  const padding = size === 'lg' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-xl ${padding}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon className="text-[10px] flex-shrink-0" />
      {label}
    </span>
  );
}

export function getStatusConfig(status) {
  return STATUS_MAP[status] || { label: status, color: '#6b7280', bg: '#f3f4f6', icon: FaCircle };
}

export default StatusBadge;

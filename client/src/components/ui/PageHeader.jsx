import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronLeft, FaHouse } from 'react-icons/fa6';

const CRUMBS = {
  '/dashboard':          [{ label: 'الرئيسية' }],
  '/properties':         [{ label: 'العقارات' }, { label: 'المشاريع' }],
  '/units':              [{ label: 'العقارات' }, { label: 'الوحدات' }],
  '/customers':          [{ label: 'العقارات' }, { label: 'العملاء' }],
  '/contracts':          [{ label: 'المالية' }, { label: 'العقود' }],
  '/installments':       [{ label: 'المالية' }, { label: 'الأقساط' }],
  '/invoices':           [{ label: 'المالية' }, { label: 'الفواتير' }],
  '/payments':           [{ label: 'المالية' }, { label: 'المدفوعات' }],
  '/expenses':           [{ label: 'المالية' }, { label: 'المصروفات' }],
  '/reports':            [{ label: 'التقارير' }],
  '/notifications':      [{ label: 'التواصل' }, { label: 'الإشعارات' }],
  '/chat':               [{ label: 'التواصل' }, { label: 'الرسائل' }],
  '/users':              [{ label: 'الإدارة' }, { label: 'المستخدمون' }],
  '/roles':              [{ label: 'الإدارة' }, { label: 'الأدوار' }],
  '/audit':              [{ label: 'الإدارة' }, { label: 'سجل العمليات' }],
  '/changelog':          [{ label: 'الإعدادات' }, { label: 'سجل التحديثات' }],
  '/updates':            [{ label: 'الإعدادات' }, { label: 'سجل التحديثات' }],
  '/theme':              [{ label: 'الإعدادات' }, { label: 'الثيم' }],
  '/settings':           [{ label: 'الإعدادات' }],
  '/super/companies':    [{ label: 'المشرف العام' }, { label: 'الشركات' }],
  '/super/plans':        [{ label: 'المشرف العام' }, { label: 'الباقات' }],
  '/marketing/cms':      [{ label: 'التسويق' }, { label: 'محرر الموقع' }],
  '/marketing/blogs':    [{ label: 'التسويق' }, { label: 'المقالات' }],
  '/marketing/media':    [{ label: 'التسويق' }, { label: 'مكتبة الصور' }],
};

const PageHeader = ({ title, subtitle, actions, breadcrumb, stats }) => {
  const location = useLocation();
  const crumbs = CRUMBS[location.pathname] || [];

  return (
    <div className="mb-5">
      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs mb-2.5" aria-label="breadcrumb">
          <Link to="/dashboard"
            className="flex items-center transition-colors hover:text-red-600"
            style={{ color: 'var(--color-text-faint)' }}>
            <FaHouse className="text-[10px]" />
          </Link>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              <FaChevronLeft className="text-[8px]" style={{ color: 'var(--color-border-strong)' }} />
              <span style={{
                color: i === crumbs.length - 1 ? 'var(--color-text-medium)' : 'var(--color-text-faint)',
                fontWeight: i === crumbs.length - 1 ? 600 : 400,
              }}>
                {c.label}
              </span>
            </React.Fragment>
          ))}
          {breadcrumb && (
            <>
              <FaChevronLeft className="text-[8px]" style={{ color: 'var(--color-border-strong)' }} />
              <span style={{ color: 'var(--color-text-medium)', fontWeight: 600 }}>{breadcrumb}</span>
            </>
          )}
        </nav>
      )}

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-dark)', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>

      {/* Stats chips — compact, inline */}
      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {stats.map((s, i) => (
            <div key={i} className="stat-chip">
              {s.icon && <s.icon style={{ fontSize: 10, color: s.color }} />}
              <span style={{ color: 'var(--color-text-muted)' }}>{s.label}</span>
              <span className="font-bold" style={{ color: s.color || 'var(--color-text-dark)' }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageHeader;

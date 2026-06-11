import React from 'react';
import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

export function SearchInput({ value, onChange, placeholder = 'بحث...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <FaMagnifyingGlass
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-dark)',
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
        >
          <FaXmark className="text-xs" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      )}
    </div>
  );
}

export function FilterSelect({ value, onChange, options = [], placeholder = 'الكل', className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer ${className}`}
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        color: value ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function FilterBar({ children, className = '', activeCount = 0, onClear }) {
  return (
    <div
      className={`rounded-2xl border p-3 flex flex-wrap gap-3 items-center ${className}`}
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {children}
      {activeCount > 0 && onClear && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80 mr-auto"
          style={{ background: 'var(--color-primary)15', color: 'var(--color-primary)' }}
        >
          <FaXmark className="text-[10px]" />
          مسح الفلاتر ({activeCount})
        </button>
      )}
    </div>
  );
}

export function ViewToggle({ view, onChange, options = [{ value: 'list', icon: null }, { value: 'grid', icon: null }] }) {
  return (
    <div
      className="flex rounded-xl overflow-hidden border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
    >
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all"
          style={{
            background: view === o.value ? 'var(--color-primary)' : 'transparent',
            color: view === o.value ? 'white' : 'var(--color-text-muted)',
          }}
        >
          {o.icon && <o.icon className="text-sm" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;

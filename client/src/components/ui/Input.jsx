import React from 'react';

const Input = React.forwardRef(({ label, error, hint, className = '', prefix, suffix, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <div className="relative flex items-center">
      {prefix && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center"
          style={{ color: 'var(--color-text-muted)' }}>
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={`input ${prefix ? 'pr-10' : ''} ${suffix ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-200' : ''} ${className}`}
        {...props}
      />
      {suffix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center"
          style={{ color: 'var(--color-text-muted)' }}>
          {suffix}
        </span>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">{error}</p>}
    {hint && !error && <p className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;

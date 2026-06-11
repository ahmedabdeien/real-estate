import React from 'react';

const Select = React.forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={`input appearance-none ${error ? 'border-red-500' : ''} ${className}`} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;

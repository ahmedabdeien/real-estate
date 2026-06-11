import React from 'react';

const Textarea = React.forwardRef(({ label, error, className = '', rows = 3, ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <textarea ref={ref} rows={rows} className={`input resize-none ${error ? 'border-red-500' : ''} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';
export default Textarea;

import React from 'react';
import { FaSpinner } from 'react-icons/fa6';

const LoadingSpinner = ({ size = 'md', fullScreen, text }) => {
  const sizes = { sm: 'text-lg', md: 'text-3xl', lg: 'text-5xl' };
  if (fullScreen) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-white/70 backdrop-blur-sm gap-3">
      <FaSpinner className={`animate-spin text-4xl`} style={{ color: 'var(--color-primary)' }} />
      {text && <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{text}</p>}
    </div>
  );
  return (
    <div className="flex items-center justify-center p-8">
      <FaSpinner className={`animate-spin ${sizes[size]}`} style={{ color: 'var(--color-primary)' }} />
    </div>
  );
};

export default LoadingSpinner;

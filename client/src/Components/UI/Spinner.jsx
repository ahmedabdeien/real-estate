import React from 'react';

export default function Spinner({ size = 'md', color = 'gold', className = '' }) {
  const sizes = { sm: 'w-5 h-5 border-[3px]', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  const colors = {
    gold: 'border-[#DFBA6B]/30 border-t-[#DFBA6B]',
    navy: 'border-[#12283C]/30 border-t-[#12283C]',
    white: 'border-white/30 border-t-white',
  };
  return (
    <div
      className={`${sizes[size]} rounded-full animate-spin ${colors[color]} ${className}`}
    />
  );
}

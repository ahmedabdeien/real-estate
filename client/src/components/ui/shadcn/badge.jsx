import * as React from 'react';
import { cn } from '../../../lib/utils';

const badgeVariants = {
  default:  'border-transparent bg-[#da1f27]/10 text-[#da1f27]',
  accent:   'border-transparent bg-[#fbb140]/15 text-[#fbb140]',
  outline:  'border-white/20 text-white/70',
  success:  'border-transparent bg-green-100 text-green-700',
  muted:    'border-transparent bg-gray-100 text-gray-600',
};

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
      badgeVariants[variant],
      className
    )} {...props} />
  );
}

export { Badge };

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:   'bg-[#da1f27] text-white hover:bg-[#7a0a00] shadow-sm',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm',
        ghost:     'hover:bg-gray-100 text-gray-700',
        outline:   'border border-white/20 text-white hover:border-white/40 hover:bg-white/5',
        accent:    'bg-[#fbb140] text-white hover:bg-[#b8902e] shadow-sm',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-5',
        lg:   'h-12 px-7 text-base',
        xl:   'h-14 px-9 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const classes = cn(buttonVariants({ variant, size }), className);
  // asChild: render the child element itself (like Radix Slot) instead of a nested <button>
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ref,
      className: cn(classes, children.props.className),
    });
  }
  return <button ref={ref} className={classes} {...props}>{children}</button>;
});
Button.displayName = 'Button';

export { Button, buttonVariants };

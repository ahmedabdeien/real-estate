import React from 'react';
import { FaBoxOpen } from 'react-icons/fa6';
import Button from './Button';

const EmptyState = ({ title = 'لا توجد بيانات', description, action, actionLabel, icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-3xl text-gray-400">
      {icon || <FaBoxOpen />}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-sm mb-6 max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
    {action && actionLabel && (
      <Button onClick={action}>{actionLabel}</Button>
    )}
  </div>
);

export default EmptyState;

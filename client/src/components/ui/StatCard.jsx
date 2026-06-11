import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

const COLOR_MAP = {
  primary: '#C8161D',
  success: '#059669',
  warning: '#D97706',
  info:    '#2563EB',
  accent:  '#F59E0B',
  purple:  '#7C3AED',
};

const StatCard = ({ title, value, icon, color = 'primary', change, suffix = '', sub, delay = 0 }) => {
  const hex = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="card p-4 flex items-start gap-3.5 card-hover"
      style={{ borderRight: `3px solid ${hex}` }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: `${hex}12`, color: hex }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {title}
        </p>
        <p className="text-xl font-bold truncate leading-tight" style={{ color: 'var(--color-text-dark)' }}>
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : (value ?? '—')}
          {suffix && <span className="text-sm font-normal mr-1" style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
        </p>
        {sub && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-faint)' }}>{sub}</p>
        )}
        {change !== undefined && (
          <div className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-1.5 py-0.5 rounded ${
            change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {change >= 0
              ? <FaArrowTrendUp className="text-[9px]" />
              : <FaArrowTrendDown className="text-[9px]" />}
            {change >= 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;

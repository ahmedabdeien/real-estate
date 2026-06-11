import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowTrendUp, FaArrowTrendDown, FaMinus } from 'react-icons/fa6';
import { ProgressBar } from './ProgressBar';

export function KpiCard({
  title,
  value,
  suffix = '',
  sub,
  icon: Icon,
  color = 'var(--color-primary)',
  trend,
  trendLabel,
  progress,
  progressMax,
  delay = 0,
  onClick,
  active = false,
}) {
  const hasTrend = trend !== undefined && trend !== null;
  const isUp   = trend > 0;
  const isFlat = trend === 0;

  const displayValue = typeof value === 'number'
    ? value.toLocaleString('en-US')
    : (value ?? '—');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      onClick={onClick}
      className={`rounded-2xl border p-5 relative overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
      style={{
        background: 'var(--color-surface)',
        borderColor: active ? color : 'var(--color-border)',
        boxShadow: active ? `0 0 0 2px ${color}` : undefined,
      }}
    >
      {/* Top accent - solid, no gradient */}
      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-2xl" style={{ background: color }} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-2 truncate" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
          <p className="text-3xl font-black leading-none tabular-nums" style={{ color: 'var(--color-text-dark)' }}>
            {displayValue}
            {suffix && <span className="text-sm font-semibold opacity-60 mr-1">{suffix}</span>}
          </p>
          {sub && <p className="text-xs mt-1.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>}
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}15`, color }}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>

      {hasTrend && (
        <div className="flex items-center gap-1.5 mt-3">
          <div
            className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              background: isFlat ? '#f3f4f6' : isUp ? '#d1fae5' : '#fee2e2',
              color:      isFlat ? '#6b7280' : isUp ? '#059669' : '#dc2626',
            }}
          >
            {isFlat ? <FaMinus className="text-[9px]" /> : isUp ? <FaArrowTrendUp className="text-[9px]" /> : <FaArrowTrendDown className="text-[9px]" />}
            {Math.abs(trend)}%
          </div>
          {trendLabel && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{trendLabel}</span>
          )}
        </div>
      )}

      {progress !== undefined && (
        <ProgressBar
          value={progress}
          max={progressMax || 100}
          color={color}
          height={4}
          animated
          className="mt-3"
        />
      )}
    </motion.div>
  );
}

export default KpiCard;

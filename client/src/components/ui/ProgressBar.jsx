import React from 'react';
import { motion } from 'framer-motion';

export function ProgressBar({
  value = 0,
  max = 100,
  color = 'var(--color-primary)',
  height = 8,
  label,
  showPercent = false,
  animated = true,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
          {showPercent && <span className="text-xs font-black tabular-nums" style={{ color }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className="w-full overflow-hidden"
        style={{ height, borderRadius: height / 2, background: 'var(--color-border)' }}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: height / 2 }}
          />
        ) : (
          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: height / 2 }} />
        )}
      </div>
    </div>
  );
}

export function MultiProgress({ segments = [], height = 10, label }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <div>
      {label && <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>}
      <div className="flex w-full overflow-hidden gap-px" style={{ height, borderRadius: height / 2 }}>
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.value / total) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            style={{ background: seg.color, height: '100%' }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{seg.label}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-text-dark)' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar;

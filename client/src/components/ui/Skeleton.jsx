import React from 'react';

export function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: 'var(--color-border)', ...style }}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="rounded-2xl border p-5 space-y-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2 w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-2" style={{ width: `${100 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 px-4 pb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 rounded-xl" style={{ background: 'var(--color-surface)' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3 flex-1" style={{ opacity: 1 - c * 0.1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;

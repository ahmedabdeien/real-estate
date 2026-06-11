import React from 'react';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa6';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  /* build page numbers with ellipsis */
  const getPages = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const arr = [];
    arr.push(1);
    if (page > 3) arr.push('…');
    for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) arr.push(p);
    if (page < pages - 2) arr.push('…');
    arr.push(pages);
    return arr;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {start.toLocaleString('en-US')}–{end.toLocaleString('en-US')} من {total.toLocaleString('en-US')} سجل
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-30 hover:bg-gray-100"
          style={{ color: 'var(--color-text-muted)' }}>
          <FaChevronRight />
        </button>
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-xs"
              style={{ color: 'var(--color-text-muted)' }}>…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
              style={p === page
                ? { backgroundColor: 'var(--color-primary)', color: '#fff', boxShadow: '0 2px 8px color-mix(in srgb, var(--color-primary) 35%, transparent)' }
                : { color: 'var(--color-text-dark)' }}
              onMouseEnter={e => { if (p !== page) e.currentTarget.style.backgroundColor = 'var(--color-background)'; }}
              onMouseLeave={e => { if (p !== page) e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {p}
            </button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-all disabled:opacity-30 hover:bg-gray-100"
          style={{ color: 'var(--color-text-muted)' }}>
          <FaChevronLeft />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

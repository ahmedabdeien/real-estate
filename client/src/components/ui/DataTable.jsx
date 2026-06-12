import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaMagnifyingGlass, FaXmark, FaTableCells,
  FaArrowUp, FaArrowDown, FaArrowsUpDown,
  FaSliders, FaFileExcel,
} from 'react-icons/fa6';
import Pagination from './Pagination';

const exportToExcel = async (data, columns, filename = 'export') => {
  const XLSX = await import('xlsx');
  const headers = columns.filter(c => c.accessor).map(c => c.header);
  const rows = data.map(row => columns.filter(c => c.accessor).map(c => row[c.accessor] ?? ''));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

/* Convert legacy {header, accessor, render} → TanStack column def */
const buildColumns = (cols) =>
  cols.map((col) => ({
    id:     col.key || col.header,
    header: col.header,
    enableSorting: !!col.sortable,
    size:   col.width ? parseInt(col.width) : undefined,
    cell:   ({ row }) =>
      col.render
        ? col.render(row.original)
        : col.accessor
          ? row.original[col.accessor]
          : null,
  }));

/* ─── Column Visibility Dropdown ─── */
const VisibilityMenu = ({ table, onClose }) => (
  <div className="absolute left-0 top-9 z-50 card p-2 min-w-[160px] shadow-lg" style={{ direction: 'rtl' }}>
    {table.getAllLeafColumns().map(col => (
      <label key={col.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-gray-50 text-xs select-none"
        style={{ color: 'var(--color-text-medium)' }}>
        <input type="checkbox" className="accent-red-600 w-3.5 h-3.5"
          checked={col.getIsVisible()}
          onChange={col.getToggleVisibilityHandler()} />
        {col.columnDef.header}
      </label>
    ))}
  </div>
);

const DataTable = ({
  columns: rawColumns,
  data = [],
  loading,
  total,
  page,
  pages,
  limit,
  onPageChange,
  onSearch,
  searchPlaceholder = 'بحث...',
  actions,
  title,
  density = 'normal',
  exportFilename,
}) => {
  const [searchVal, setSearchVal]   = useState('');
  const [sorting,   setSorting]     = useState([]);
  const [showVis,   setShowVis]     = useState(false);

  const columns = useMemo(() => buildColumns(rawColumns), [rawColumns]);

  const table = useReactTable({
    data,
    columns,
    state:            { sorting },
    onSortingChange:  setSorting,
    getCoreRowModel:  getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting:    false,
  });

  const handleSearch = (v) => {
    setSearchVal(v);
    onSearch?.(v);
  };

  const rowPad = density === 'compact' ? 'py-2' : 'py-3';

  return (
    <div className="card overflow-hidden">

      {/* ── Toolbar ── */}
      {(title || onSearch || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}>

          {title && (
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text-dark)' }}>
              {title}
            </span>
          )}

          <div className="flex items-center gap-2 mr-auto flex-wrap">
            {onSearch && (
              <div className="relative">
                <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]"
                  style={{ color: 'var(--color-text-faint)' }} />
                <input
                  className="input pr-8 w-52 text-xs py-1.5"
                  placeholder={searchPlaceholder}
                  value={searchVal}
                  onChange={e => handleSearch(e.target.value)}
                />
                <AnimatePresence>
                  {searchVal && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => handleSearch('')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                      <FaXmark className="text-[9px]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Export to Excel */}
            {exportFilename && (
              <button
                onClick={() => exportToExcel(data, rawColumns, exportFilename)}
                className="btn btn-ghost btn-icon-sm"
                title="تصدير Excel"
                style={{ color: '#16a34a' }}>
                <FaFileExcel className="text-xs" />
              </button>
            )}

            {/* Column visibility toggle */}
            <div className="relative">
              <button onClick={() => setShowVis(v => !v)}
                className="btn btn-ghost btn-icon-sm"
                title="إظهار/إخفاء الأعمدة"
                style={{ color: showVis ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                <FaSliders className="text-xs" />
              </button>
              <AnimatePresence>
                {showVis && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowVis(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      className="relative z-50">
                      <VisibilityMenu table={table} onClose={() => setShowVis(false)} />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {actions}
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(header => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined,
                               cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                      className={header.column.getCanSort() ? 'select-none hover:bg-gray-50 transition-colors' : ''}>
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="opacity-40 hover:opacity-80 transition-opacity">
                            {sorted === 'asc'  ? <FaArrowUp   className="text-[9px]" style={{ color: 'var(--color-primary)', opacity: 1 }} />
                           : sorted === 'desc' ? <FaArrowDown className="text-[9px]" style={{ color: 'var(--color-primary)', opacity: 1 }} />
                           :                    <FaArrowsUpDown className="text-[9px]" />}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, ri) => (
                <tr key={ri}>
                  {rawColumns.map((_, ci) => (
                    <td key={ci}>
                      <div className="shimmer h-3.5 rounded" style={{ width: `${45 + (ci * 13) % 42}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={rawColumns.length}>
                  <div className="flex flex-col items-center gap-3 py-14">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--color-surface-2)' }}>
                      <FaTableCells className="text-lg" style={{ color: 'var(--color-text-faint)' }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {searchVal ? `لا نتائج لـ "${searchVal}"` : 'لا توجد بيانات'}
                      </p>
                      {searchVal && (
                        <button onClick={() => handleSearch('')}
                          className="text-xs mt-1.5 font-semibold"
                          style={{ color: 'var(--color-primary)' }}>
                          مسح البحث
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, ri) => (
                <motion.tr key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.12, delay: Math.min(ri * 0.015, 0.15) }}
                  className="group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className={rowPad}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer / Pagination ── */}
      {!loading && total > 0 && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          <Pagination page={page} pages={pages} total={total} limit={limit} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  );
};

export default DataTable;

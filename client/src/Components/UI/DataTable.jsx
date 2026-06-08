/**
 * DataTable — مكوّن جدول شامل يستخدم TanStack Table v8
 * يدعم: pagination، sorting، filtering، column visibility، row selection
 */
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  FaChevronUp, FaChevronDown, FaChevronRight, FaChevronLeft,
  FaAnglesRight, FaAnglesLeft, FaMagnifyingGlass, FaTableColumns,
  FaSpinner, FaInbox,
} from "react-icons/fa6";

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  totalCount,
  // Server-side pagination
  pageIndex: externalPage,
  pageSize: externalSize = 15,
  onPageChange,
  onPageSizeChange,
  // Client-side pagination (when no server callbacks)
  clientPagination = false,
  // Search
  globalFilter: externalFilter,
  onFilterChange,
  searchPlaceholder = "بحث...",
  // Selection
  enableRowSelection = false,
  onSelectionChange,
  // Actions bar slot
  toolbar,
  // Empty state
  emptyMessage = "لا توجد بيانات",
  emptyIcon,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [showColPicker, setShowColPicker] = useState(false);

  const isServerPaginated = typeof onPageChange === "function";

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: externalFilter ?? globalFilter,
      pagination: isServerPaginated
        ? { pageIndex: externalPage ?? 0, pageSize: externalSize }
        : undefined,
    },
    enableRowSelection,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      if (onSelectionChange) {
        const next = typeof updater === "function" ? updater(rowSelection) : updater;
        onSelectionChange(Object.keys(next).map((i) => data[parseInt(i)]));
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: onFilterChange ?? setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: clientPagination ? getPaginationRowModel() : undefined,
    manualPagination: isServerPaginated,
    rowCount: isServerPaginated ? (totalCount ?? data.length) : undefined,
    pageCount: isServerPaginated && totalCount
      ? Math.ceil(totalCount / externalSize)
      : undefined,
  });

  const currentPage = isServerPaginated ? (externalPage ?? 0) : table.getState().pagination?.pageIndex ?? 0;
  const currentSize = isServerPaginated ? externalSize : table.getState().pagination?.pageSize ?? externalSize;
  const totalPages = isServerPaginated
    ? (totalCount ? Math.ceil(totalCount / currentSize) : 1)
    : table.getPageCount?.() ?? 1;

  const handlePageChange = (p) => {
    if (isServerPaginated) onPageChange(p);
    else table.setPageIndex(p);
  };

  return (
    <div className="flex flex-col gap-3" dir="rtl">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            value={(onFilterChange ? externalFilter : globalFilter) ?? ""}
            onChange={(e) => onFilterChange ? onFilterChange(e.target.value) : setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pr-9 pl-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-all"
          />
        </div>

        {/* Custom toolbar slot */}
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}

        {/* Column visibility */}
        <div className="relative">
          <button
            onClick={() => setShowColPicker((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 transition-all"
          >
            <FaTableColumns className="w-3.5 h-3.5" />
            الأعمدة
          </button>
          {showColPicker && (
            <div className="absolute left-0 top-10 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 min-w-[160px]">
              {table.getAllLeafColumns().filter((c) => c.id !== "select" && c.id !== "actions").map((col) => (
                <label key={col.id} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={col.getIsVisible()}
                    onChange={col.getToggleVisibilityHandler()}
                    className="w-3.5 h-3.5 accent-[color:var(--primary)]"
                  />
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Selection count */}
        {enableRowSelection && Object.keys(rowSelection).length > 0 && (
          <span className="text-xs text-[color:var(--primary)] font-semibold bg-[color:var(--primary)]/10 px-3 py-1.5 rounded-lg">
            تم اختيار {Object.keys(rowSelection).length} صف
          </span>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap
                        ${header.column.getCanSort() ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" : ""}`}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-1.5 justify-start">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-300 dark:text-gray-600">
                              {{ asc: <FaChevronUp className="w-2.5 h-2.5 text-[color:var(--primary)]" />, desc: <FaChevronDown className="w-2.5 h-2.5 text-[color:var(--primary)]" /> }[header.column.getIsSorted()] ?? <FaChevronDown className="w-2.5 h-2.5 opacity-30" />}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <FaSpinner className="w-6 h-6 animate-spin text-[color:var(--primary)] mx-auto mb-2" />
                    <p className="text-sm text-gray-400">جاري التحميل...</p>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <div className="text-4xl mb-3">{emptyIcon || "📭"}</div>
                    <p className="text-sm text-gray-400">{emptyMessage}</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
                      ${row.getIsSelected() ? "bg-[color:var(--primary)]/5 dark:bg-[color:var(--primary)]/10" : ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {(clientPagination || isServerPaginated) && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>عرض</span>
              <select
                value={currentSize}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  if (isServerPaginated) onPageSizeChange?.(s);
                  else table.setPageSize(s);
                }}
                className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 outline-none"
              >
                {[10, 15, 25, 50].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>صف لكل صفحة</span>
              {totalCount != null && (
                <span className="mr-2">· الإجمالي: <strong>{totalCount}</strong></span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <PagBtn onClick={() => handlePageChange(0)} disabled={currentPage === 0} icon={<FaAnglesRight className="w-3 h-3" />} />
              <PagBtn onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} icon={<FaChevronRight className="w-3 h-3" />} />
              <span className="text-xs text-gray-600 dark:text-gray-400 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 min-w-[80px] text-center">
                {currentPage + 1} / {totalPages}
              </span>
              <PagBtn onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} icon={<FaChevronLeft className="w-3 h-3" />} />
              <PagBtn onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} icon={<FaAnglesLeft className="w-3 h-3" />} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PagBtn({ onClick, disabled, icon }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
    </button>
  );
}

// ── Checkbox column helper ─────────────────────────────────────────
export function checkboxColumn() {
  return {
    id: "select",
    size: 40,
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="w-4 h-4 accent-[color:var(--primary)] cursor-pointer"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="w-4 h-4 accent-[color:var(--primary)] cursor-pointer"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

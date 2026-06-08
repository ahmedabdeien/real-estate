/**
 * useTableState — Manages server-side table state (pagination + search + filters)
 * Works with DataTable component and TanStack Query
 *
 * Usage:
 *   const table = useTableState({ defaultPageSize: 15 });
 *   const { data } = useLeads(table.queryParams);
 *   <DataTable {...table.tableProps} data={data?.leads} totalCount={data?.total} />
 */
import { useState, useCallback, useMemo, useRef } from "react";
import { useDebounce } from "./useDebounce";

export function useTableState({
  defaultPageSize  = 15,
  defaultSort      = "-createdAt",
  defaultFilters   = {},
  debounceMs       = 350,
} = {}) {
  const [page,       setPage]       = useState(0);
  const [pageSize,   setPageSize]   = useState(defaultPageSize);
  const [search,     setSearch]     = useState("");
  const [sort,       setSort]       = useState(defaultSort);
  const [filters,    setFilters]    = useState(defaultFilters);

  const debouncedSearch = useDebounce(search, debounceMs);

  const resetPage = useCallback(() => setPage(0), []);

  const handleSearch = useCallback((v) => { setSearch(v); setPage(0); }, []);
  const handleFilter = useCallback((key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(0);
  }, []);
  const clearFilters = useCallback(() => { setFilters(defaultFilters); setPage(0); }, [defaultFilters]);

  /** Params to pass to TanStack Query hook */
  const queryParams = useMemo(() => ({
    page:   page + 1,
    limit:  pageSize,
    search: debouncedSearch || undefined,
    sort:   sort || undefined,
    ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== "")),
  }), [page, pageSize, debouncedSearch, sort, filters]);

  /** Props to spread onto <DataTable> */
  const tableProps = useMemo(() => ({
    pageIndex:      page,
    pageSize,
    onPageChange:   setPage,
    onPageSizeChange: (s) => { setPageSize(s); setPage(0); },
    globalFilter:   search,
    onFilterChange: handleSearch,
  }), [page, pageSize, search, handleSearch]);

  return {
    page, setPage,
    pageSize, setPageSize,
    search, setSearch: handleSearch,
    sort, setSort,
    filters, setFilter: handleFilter, clearFilters,
    queryParams,
    tableProps,
    resetPage,
  };
}

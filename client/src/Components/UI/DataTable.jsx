/**
 * DataTable — مكوّن جدول شامل يستخدم TanStack Table v8 (Mantine)
 * يدعم: pagination، sorting، filtering، column visibility، row selection
 */
import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import {
  MantineProvider, Box, Group, Stack, Text, TextInput, Table, Checkbox,
  Menu, ActionIcon, Pagination, Select, Loader, Badge,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaChevronUp, FaChevronDown, FaMagnifyingGlass, FaTableColumns,
} from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

function DataTableInner({
  data = [], columns = [], loading = false, totalCount,
  pageIndex: externalPage, pageSize: externalSize = 15, onPageChange, onPageSizeChange,
  clientPagination = false,
  globalFilter: externalFilter, onFilterChange, searchPlaceholder = "بحث...",
  enableRowSelection = false, onSelectionChange,
  toolbar, emptyMessage = "لا توجد بيانات", emptyIcon,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const isServerPaginated = typeof onPageChange === "function";

  const table = useReactTable({
    data, columns,
    state: {
      sorting, columnFilters, columnVisibility, rowSelection,
      globalFilter: externalFilter ?? globalFilter,
      pagination: isServerPaginated ? { pageIndex: externalPage ?? 0, pageSize: externalSize } : undefined,
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
    pageCount: isServerPaginated && totalCount ? Math.ceil(totalCount / externalSize) : undefined,
  });

  const currentPage = isServerPaginated ? (externalPage ?? 0) : table.getState().pagination?.pageIndex ?? 0;
  const currentSize = isServerPaginated ? externalSize : table.getState().pagination?.pageSize ?? externalSize;
  const totalPages = isServerPaginated ? (totalCount ? Math.ceil(totalCount / currentSize) : 1) : table.getPageCount?.() ?? 1;

  const handlePageChange = (p) => { if (isServerPaginated) onPageChange(p); else table.setPageIndex(p); };

  return (
    <Stack gap="sm" dir="rtl">
      <Group gap="sm" wrap="wrap">
        <TextInput
          style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
          leftSection={<FaMagnifyingGlass size={13} />}
          placeholder={searchPlaceholder}
          value={(onFilterChange ? externalFilter : globalFilter) ?? ""}
          onChange={(e) => onFilterChange ? onFilterChange(e.target.value) : setGlobalFilter(e.target.value)}
        />

        {toolbar && <Group gap={8}>{toolbar}</Group>}

        <Menu shadow="md" width={180} closeOnItemClick={false}>
          <Menu.Target>
            <ActionIcon variant="default" size="lg"><FaTableColumns size={13} /></ActionIcon>
          </Menu.Target>
          <Menu.Dropdown dir="rtl">
            <Menu.Label>الأعمدة</Menu.Label>
            {table.getAllLeafColumns().filter((c) => c.id !== "select" && c.id !== "actions").map((c) => (
              <Menu.Item key={c.id} closeMenuOnClick={false}>
                <Checkbox
                  size="xs" checked={c.getIsVisible()} onChange={c.getToggleVisibilityHandler()}
                  label={typeof c.columnDef.header === "string" ? c.columnDef.header : c.id}
                />
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>

        {enableRowSelection && Object.keys(rowSelection).length > 0 && (
          <Badge variant="light" color="brand" size="lg">تم اختيار {Object.keys(rowSelection).length} صف</Badge>
        )}
      </Group>

      <Box style={{ border: "1px solid var(--mantine-color-gray-2)", overflow: "hidden" }}>
        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead bg="gray.0">
              {table.getHeaderGroups().map((hg) => (
                <Table.Tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <Table.Th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: header.column.getCanSort() ? "pointer" : undefined, whiteSpace: "nowrap" }}
                    >
                      {header.isPlaceholder ? null : (
                        <Group gap={6} wrap="nowrap">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            {
                              asc: <FaChevronUp size={10} color="var(--mantine-color-brand-6)" />,
                              desc: <FaChevronDown size={10} color="var(--mantine-color-brand-6)" />,
                            }[header.column.getIsSorted()] ?? <FaChevronDown size={10} color="var(--mantine-color-gray-3)" />
                          )}
                        </Group>
                      )}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} py={64}>
                    <Stack align="center" gap={8}><Loader color="gray" size="sm" /><Text size="sm" c="dimmed">جاري التحميل...</Text></Stack>
                  </Table.Td>
                </Table.Tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={columns.length} py={64}>
                    <Stack align="center" gap={8}>
                      <Text fz={32}>{emptyIcon || "📭"}</Text>
                      <Text size="sm" c="dimmed">{emptyMessage}</Text>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <Table.Tr key={row.id} bg={row.getIsSelected() ? "brand.0" : undefined}>
                    {row.getVisibleCells().map((cell) => (
                      <Table.Td key={cell.id} style={{ whiteSpace: "nowrap" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>

        {(clientPagination || isServerPaginated) && (
          <Group justify="space-between" wrap="wrap" px="md" py="sm" bg="gray.0" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            <Group gap={8}>
              <Text size="xs" c="dimmed">عرض</Text>
              <Select
                w={70} size="xs" data={["10", "15", "25", "50"]} value={String(currentSize)}
                onChange={(v) => { const s = Number(v); if (isServerPaginated) onPageSizeChange?.(s); else table.setPageSize(s); }}
              />
              <Text size="xs" c="dimmed">صف لكل صفحة</Text>
              {totalCount != null && <Text size="xs" c="dimmed">· الإجمالي: <Text component="span" fw={700}>{totalCount}</Text></Text>}
            </Group>
            <Pagination size="sm" total={totalPages} value={currentPage + 1} onChange={(p) => handlePageChange(p - 1)} />
          </Group>
        )}
      </Box>
    </Stack>
  );
}

export default function DataTable(props) {
  return (
    <MantineProvider theme={mantineTheme}>
      <DataTableInner {...props} />
    </MantineProvider>
  );
}

// ── Checkbox column helper ─────────────────────────────────────────
export function checkboxColumn() {
  return {
    id: "select",
    size: 40,
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

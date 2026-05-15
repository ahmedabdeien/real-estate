import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, Check, X, Printer, Download, ChevronRight,
  BookOpen, Table2, MoreVertical, Search, AlertTriangle, GripVertical,
  FileSpreadsheet, Building2, RefreshCw, Settings2, Copy,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

// ─── helpers ─────────────────────────────────────────────────────────────────

const COLUMN_TYPES = [
  { value: "text",     label: "نص" },
  { value: "number",   label: "رقم" },
  { value: "currency", label: "عملة (ج.م)" },
  { value: "date",     label: "تاريخ" },
  { value: "select",   label: "قائمة" },
];

const LEDGER_COLORS = [
  "#2d5d89", "#16a34a", "#dc2626", "#d97706",
  "#7c3aed", "#0891b2", "#be185d", "#374151",
];

function formatCell(val, type) {
  if (val === undefined || val === null || val === "") return "";
  if (type === "currency") return Number(val).toLocaleString("ar-EG") + " ج";
  if (type === "number")   return Number(val).toLocaleString("ar-EG");
  if (type === "date")     return val ? new Date(val).toLocaleDateString("ar-EG") : "";
  return val;
}

function sumColumn(rows, colKey, type) {
  if (!["currency", "number"].includes(type)) return null;
  return rows.reduce((acc, r) => {
    const v = r.cells?.[colKey];
    return acc + (v ? Number(v) : 0);
  }, 0);
}

// ─── Modals ──────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mt-1">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">إلغاء</button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50">
          {loading ? "جاري الحذف..." : "حذف"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Ledger Form ─────────────────────────────────────────────────────────────

function LedgerForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name: "", description: "", branch: "", color: "#2d5d89", icon: "📒" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const ICONS = ["📒", "📗", "📘", "📕", "📙", "💼", "🏦", "📊", "🏢", "📋"];

  const submit = async () => {
    if (!form.name.trim()) return toast.error("اسم السجل مطلوب");
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch (e) { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الاسم *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: سجل المركز الرئيسي"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الوصف</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="وصف مختصر للسجل"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الفرع</label>
        <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
          placeholder="مثال: القاهرة، الإسكندرية، المركز الرئيسي"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">الأيقونة</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map((ic) => (
            <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${form.icon === ic ? "ring-2 ring-[#2d5d89] bg-[#2d5d89]/10 scale-110" : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"}`}>
              {ic}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اللون</label>
        <div className="flex gap-2">
          {LEDGER_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
              style={{ backgroundColor: c }}
              className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">إلغاء</button>
        <button onClick={submit} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}

// ─── Sheet Form ──────────────────────────────────────────────────────────────

function SheetForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || "");
  const [columns, setColumns] = useState(initial?.columns || [
    { key: "col1", label: "البيان",  type: "text",     width: 200 },
    { key: "col2", label: "المبلغ",  type: "currency", width: 150 },
    { key: "col3", label: "التاريخ", type: "date",     width: 140 },
    { key: "col4", label: "ملاحظات", type: "text",     width: 200 },
  ]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const addCol = () => {
    setColumns([...columns, { key: `col${Date.now()}`, label: "عمود جديد", type: "text", width: 150 }]);
  };
  const removeCol = (i) => setColumns(columns.filter((_, idx) => idx !== i));
  const updateCol = (i, field, val) => setColumns(columns.map((c, idx) => idx === i ? { ...c, [field]: val } : c));

  const submit = async () => {
    if (!name.trim()) return toast.error("اسم الجدول مطلوب");
    if (columns.length === 0) return toast.error("أضف عمود واحد على الأقل");
    setSaving(true);
    try { await onSave({ name, columns }); onClose(); }
    catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">اسم الجدول *</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="مثال: المصروفات الشهرية"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الأعمدة</label>
          <button onClick={addCol}
            className="flex items-center gap-1 text-xs text-[#2d5d89] hover:underline font-medium">
            <Plus className="w-3.5 h-3.5" /> إضافة عمود
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {columns.map((col, i) => (
            <div key={col.key} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input value={col.label} onChange={(e) => updateCol(i, "label", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
                placeholder="اسم العمود" />
              <select value={col.type} onChange={(e) => updateCol(i, "type", e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
                {COLUMN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {columns.length > 1 && (
                <button onClick={() => removeCol(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">إلغاء</button>
        <button onClick={submit} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium disabled:opacity-50">
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}

// ─── Inline Cell Editor ──────────────────────────────────────────────────────

function CellInput({ col, value, onChange, onBlur, onKeyDown }) {
  if (col.type === "select") {
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} onBlur={onBlur}
        autoFocus
        className="w-full h-full px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white text-sm focus:outline-none border-2 border-blue-400 rounded">
        <option value="">—</option>
        {(col.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const inputType = col.type === "date" ? "date" : col.type === "number" || col.type === "currency" ? "number" : "text";
  return (
    <input type={inputType} value={value || ""} onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur} onKeyDown={onKeyDown} autoFocus
      className="w-full h-full px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-white text-sm focus:outline-none border-2 border-blue-400 rounded" />
  );
}

// ─── Sheet Table ─────────────────────────────────────────────────────────────

function SheetTable({ ledgerId, sheet, onUpdate, printRef }) {
  const toast = useToast();
  const [rows, setRows] = useState(sheet.rows || []);
  const [editCell, setEditCell] = useState(null); // { rowIdx, colKey }
  const [cellVal, setCellVal] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [addingRow, setAddingRow] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const cols = sheet.columns || [];

  // ── inline editing ──
  const startEdit = (rowIdx, colKey) => {
    setEditCell({ rowIdx, colKey });
    setCellVal(rows[rowIdx]?.cells?.[colKey] ?? "");
  };

  const commitCell = async (rowIdx, colKey, val) => {
    const row = rows[rowIdx];
    if (!row) return;
    const newCells = { ...Object.fromEntries(row.cells || []), [colKey]: val };
    const updated = rows.map((r, i) => i === rowIdx ? { ...r, cells: newCells } : r);
    setRows(updated);
    setEditCell(null);
    try {
      await api.put(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${row._id}`, { cells: newCells });
    } catch { toast.error("فشل حفظ الخلية"); }
  };

  const handleCellBlur = () => {
    if (editCell) commitCell(editCell.rowIdx, editCell.colKey, cellVal);
  };

  const handleCellKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); commitCell(editCell.rowIdx, editCell.colKey, cellVal); }
    if (e.key === "Escape") setEditCell(null);
    if (e.key === "Tab") {
      e.preventDefault();
      const colIdx = cols.findIndex((c) => c.key === editCell.colKey);
      const nextColIdx = colIdx + 1;
      if (nextColIdx < cols.length) {
        commitCell(editCell.rowIdx, editCell.colKey, cellVal);
        setTimeout(() => startEdit(editCell.rowIdx, cols[nextColIdx].key), 0);
      } else if (editCell.rowIdx + 1 < rows.length) {
        commitCell(editCell.rowIdx, editCell.colKey, cellVal);
        setTimeout(() => startEdit(editCell.rowIdx + 1, cols[0].key), 0);
      }
    }
  };

  // ── add row ──
  const addRow = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows`, { cells: newRowData });
      setRows((prev) => [...prev, res.data.row]);
      setNewRowData({});
      setAddingRow(false);
      toast.success("تم إضافة السطر");
    } catch { toast.error("فشل إضافة السطر"); }
    finally { setSaving(false); }
  };

  // ── delete single row ──
  const deleteRow = async (rowId) => {
    try {
      await api.delete(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${rowId}`);
      setRows((prev) => prev.filter((r) => r._id !== rowId));
      setSelected((prev) => { const s = new Set(prev); s.delete(rowId); return s; });
    } catch { toast.error("فشل حذف السطر"); }
  };

  // ── bulk delete ──
  const bulkDelete = async () => {
    setDeleting(true);
    try {
      await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/bulk-delete`, { rowIds: [...selected] });
      setRows((prev) => prev.filter((r) => !selected.has(r._id)));
      setSelected(new Set());
      setConfirmBulk(false);
      toast.success("تم حذف الصفوف");
    } catch { toast.error("فشل الحذف"); }
    finally { setDeleting(false); }
  };

  const toggleRow = (id) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r._id)));
  };

  // ── print ──
  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html dir="rtl"><head>
        <meta charset="UTF-8"><title>${sheet.name}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; direction: rtl; padding: 20px; font-size: 12px; }
          h2 { color: #2d5d89; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #2d5d89; color: white; padding: 8px 12px; text-align: right; font-size: 12px; }
          td { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
          tr:nth-child(even) td { background: #f8fafc; }
          .total-row td { font-weight: bold; background: #f1f5f9; border-top: 2px solid #2d5d89; }
          @media print { button { display: none; } }
        </style>
      </head><body>
        <h2>${sheet.name}</h2>
        ${printContent || ""}
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── export CSV ──
  const exportCsv = () => {
    const header = cols.map((c) => `"${c.label}"`).join(",");
    const rowsData = (selected.size > 0 ? rows.filter((r) => selected.has(r._id)) : rows)
      .map((row) => cols.map((c) => {
        const val = row.cells?.[c.key] ?? "";
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(","));
    const csv = [header, ...rowsData].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${sheet.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const displayRows = selected.size > 0 && confirmBulk
    ? rows.filter((r) => selected.has(r._id))
    : rows;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-sm text-gray-500 dark:text-gray-400">{rows.length} سطر</span>
        {selected.size > 0 && (
          <span className="text-sm font-medium text-[#2d5d89]">({selected.size} محدد)</span>
        )}
        <div className="mr-auto flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={() => setConfirmBulk(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium">
              <Trash2 className="w-3.5 h-3.5" /> حذف المحدد ({selected.size})
            </button>
          )}
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium">
            <Download className="w-3.5 h-3.5" /> {selected.size > 0 ? "تحميل المحدد" : "CSV"}
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-medium">
            <Printer className="w-3.5 h-3.5" /> طباعة
          </button>
          <button onClick={() => setAddingRow(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> سطر جديد
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <div ref={printRef}>
          <table className="w-full min-w-max text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#2d5d89] text-white">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length}
                    onChange={toggleAll}
                    className="rounded border-white/40 text-white accent-white cursor-pointer" />
                </th>
                {cols.map((col) => (
                  <th key={col.key} className="px-3 py-3 text-right font-semibold whitespace-nowrap text-sm"
                    style={{ minWidth: col.width || 120, maxWidth: col.width || 200 }}>
                    {col.label}
                  </th>
                ))}
                <th className="w-12 px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !addingRow && (
                <tr>
                  <td colSpan={cols.length + 2} className="text-center py-12 text-gray-400 text-sm">
                    <Table2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    لا توجد بيانات — اضغط "سطر جديد" لإضافة البيانات
                  </td>
                </tr>
              )}
              {rows.map((row, rowIdx) => (
                <tr key={row._id}
                  className={`border-b border-gray-100 dark:border-gray-700 transition-colors ${
                    selected.has(row._id)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : rowIdx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                  } hover:bg-blue-50/50 dark:hover:bg-blue-900/10`}>
                  <td className="px-3 py-2 w-10">
                    <input type="checkbox" checked={selected.has(row._id)} onChange={() => toggleRow(row._id)}
                      className="rounded cursor-pointer accent-[#2d5d89]" />
                  </td>
                  {cols.map((col) => {
                    const isEditing = editCell?.rowIdx === rowIdx && editCell?.colKey === col.key;
                    const val = row.cells?.[col.key] ?? "";
                    return (
                      <td key={col.key} style={{ minWidth: col.width || 120 }}
                        className="px-1 py-1 cursor-pointer"
                        onDoubleClick={() => startEdit(rowIdx, col.key)}>
                        {isEditing ? (
                          <CellInput col={col} value={cellVal} onChange={setCellVal}
                            onBlur={handleCellBlur} onKeyDown={handleCellKey} />
                        ) : (
                          <div className="px-2 py-1 min-h-[28px] text-gray-800 dark:text-gray-200 text-sm whitespace-nowrap overflow-hidden text-ellipsis rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            {formatCell(val, col.type) || <span className="text-gray-300">—</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 w-12">
                    <button onClick={() => deleteRow(row._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* New row input */}
              {addingRow && (
                <tr className="bg-emerald-50/50 dark:bg-emerald-900/10 border-b border-emerald-100 dark:border-emerald-900/20">
                  <td className="px-3 py-2 w-10 text-emerald-500">
                    <Plus className="w-4 h-4 mx-auto" />
                  </td>
                  {cols.map((col) => (
                    <td key={col.key} className="px-1 py-1" style={{ minWidth: col.width || 120 }}>
                      <input
                        type={col.type === "date" ? "date" : col.type === "number" || col.type === "currency" ? "number" : "text"}
                        value={newRowData[col.key] || ""}
                        onChange={(e) => setNewRowData({ ...newRowData, [col.key]: e.target.value })}
                        placeholder={col.label}
                        className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <div className="flex flex-col gap-1">
                      <button onClick={addRow} disabled={saving}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setAddingRow(false); setNewRowData({}); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Totals row */}
              {rows.length > 0 && (
                <tr className="bg-[#f1f5f9] dark:bg-gray-700 font-bold border-t-2 border-[#2d5d89]/30">
                  <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" colSpan={2}>
                    الإجمالي
                  </td>
                  {cols.slice(1).map((col) => {
                    const total = sumColumn(rows, col.key, col.type);
                    return (
                      <td key={col.key} className="px-3 py-2 text-sm text-[#2d5d89] dark:text-blue-400 whitespace-nowrap">
                        {total !== null ? formatCell(total, col.type) : ""}
                      </td>
                    );
                  })}
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">انقر مرتين على أي خلية لتعديلها • Tab للانتقال • Enter للتأكيد • Esc للإلغاء</p>

      {/* Bulk delete confirm */}
      <ConfirmModal
        open={confirmBulk}
        onClose={() => setConfirmBulk(false)}
        onConfirm={bulkDelete}
        loading={deleting}
        title="حذف الصفوف المحددة"
        message={`هل تريد حذف ${selected.size} سطر؟ لا يمكن التراجع.`}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAccounting() {
  const { user } = useAuth();
  const toast = useToast();

  // Access check
  const hasAccess = user?.role === "admin" || user?.department === "accounts";

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLedger, setActiveLedger] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [fullLedger, setFullLedger] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);

  const [ledgerModal, setLedgerModal] = useState(false);
  const [editLedger, setEditLedger] = useState(null);
  const [sheetModal, setSheetModal] = useState(false);
  const [editSheet, setEditSheet] = useState(null);
  const [confirmDeleteLedger, setConfirmDeleteLedger] = useState(null);
  const [confirmDeleteSheet, setConfirmDeleteSheet] = useState(null);
  const [deletingLedger, setDeletingLedger] = useState(false);
  const [deletingSheet, setDeletingSheet] = useState(false);

  const printRef = useRef(null);

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const r = await api.get("/accounting");
      setLedgers(r.data.ledgers || []);
    } catch { toast.error("فشل تحميل السجلات"); }
    finally { setLoading(false); }
  };

  const loadFullLedger = async (id) => {
    setLoadingLedger(true);
    try {
      const r = await api.get(`/accounting/${id}`);
      setFullLedger(r.data.ledger);
      if (r.data.ledger.sheets?.length > 0) {
        setActiveSheet(r.data.ledger.sheets[0]);
      } else {
        setActiveSheet(null);
      }
    } catch { toast.error("فشل تحميل السجل"); }
    finally { setLoadingLedger(false); }
  };

  useEffect(() => { if (hasAccess) loadLedgers(); }, []);

  useEffect(() => {
    if (activeLedger) loadFullLedger(activeLedger._id);
    else { setFullLedger(null); setActiveSheet(null); }
  }, [activeLedger]);

  // ── Ledger CRUD ──
  const createLedger = async (form) => {
    const r = await api.post("/accounting", form);
    setLedgers((prev) => [r.data.ledger, ...prev]);
    toast.success("تم إنشاء السجل");
  };

  const updateLedger = async (form) => {
    const r = await api.put(`/accounting/${editLedger._id}`, form);
    setLedgers((prev) => prev.map((l) => l._id === editLedger._id ? { ...l, ...form } : l));
    if (activeLedger?._id === editLedger._id) setActiveLedger({ ...activeLedger, ...form });
    toast.success("تم تحديث السجل");
  };

  const deleteLedger = async () => {
    setDeletingLedger(true);
    try {
      await api.delete(`/accounting/${confirmDeleteLedger._id}`);
      setLedgers((prev) => prev.filter((l) => l._id !== confirmDeleteLedger._id));
      if (activeLedger?._id === confirmDeleteLedger._id) { setActiveLedger(null); setFullLedger(null); }
      setConfirmDeleteLedger(null);
      toast.success("تم حذف السجل");
    } catch { toast.error("فشل الحذف"); }
    finally { setDeletingLedger(false); }
  };

  // ── Sheet CRUD ──
  const createSheet = async (form) => {
    const r = await api.post(`/accounting/${activeLedger._id}/sheets`, form);
    const newSheet = r.data.sheet;
    setFullLedger((prev) => ({ ...prev, sheets: [...(prev.sheets || []), newSheet] }));
    setActiveSheet(newSheet);
    toast.success("تم إنشاء الجدول");
  };

  const updateSheet = async (form) => {
    await api.put(`/accounting/${activeLedger._id}/sheets/${editSheet._id}`, form);
    setFullLedger((prev) => ({
      ...prev,
      sheets: prev.sheets.map((s) => s._id === editSheet._id ? { ...s, ...form } : s),
    }));
    if (activeSheet?._id === editSheet._id) setActiveSheet((prev) => ({ ...prev, ...form }));
    toast.success("تم تحديث الجدول");
  };

  const deleteSheet = async () => {
    setDeletingSheet(true);
    try {
      await api.delete(`/accounting/${activeLedger._id}/sheets/${confirmDeleteSheet._id}`);
      const remaining = fullLedger.sheets.filter((s) => s._id !== confirmDeleteSheet._id);
      setFullLedger((prev) => ({ ...prev, sheets: remaining }));
      setActiveSheet(remaining[0] || null);
      setConfirmDeleteSheet(null);
      toast.success("تم حذف الجدول");
    } catch { toast.error("فشل الحذف"); }
    finally { setDeletingSheet(false); }
  };

  // ── Access denied ──
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">غير مصرح بالدخول</h2>
          <p className="text-gray-500 text-sm">هذه الصفحة مخصصة لقسم الحسابات والمديرين فقط</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden" dir="rtl">
      {/* ── Sidebar: Ledgers list ── */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">السجلات المحاسبية</h2>
            <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2d5d89] text-white hover:bg-[#245079]">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : ledgers.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-xs">لا توجد سجلات بعد</p>
              <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
                className="mt-3 text-xs text-[#2d5d89] hover:underline font-medium">
                إنشاء أول سجل
              </button>
            </div>
          ) : (
            ledgers.map((l) => (
              <button key={l._id} onClick={() => setActiveLedger(l)}
                className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors group ${
                  activeLedger?._id === l._id
                    ? "bg-[#2d5d89]/10 text-[#2d5d89]"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: l.color + "20" }}>
                  {l.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{l.name}</p>
                  {l.branch && <p className="text-xs text-gray-400 truncate">{l.branch}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditLedger(l); setLedgerModal(true); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteLedger(l); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-gray-900">
        {!activeLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileSpreadsheet className="w-20 h-20 text-gray-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">اختر سجلاً من القائمة</h3>
              <p className="text-gray-400 text-sm">أو أنشئ سجلاً جديداً لبدء إدارة الحسابات</p>
              <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-medium hover:bg-[#245079]">
                <Plus className="w-4 h-4" /> سجل جديد
              </button>
            </div>
          </div>
        ) : loadingLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Ledger header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: activeLedger.color + "20" }}>
                {activeLedger.icon}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{activeLedger.name}</h2>
                {activeLedger.branch && <p className="text-xs text-gray-400">{activeLedger.branch}</p>}
              </div>
              <div className="mr-auto flex items-center gap-2">
                <button onClick={() => loadFullLedger(activeLedger._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sheets tabs + content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sheet tabs */}
              <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 flex items-center gap-1 overflow-x-auto">
                {(fullLedger?.sheets || []).map((s) => (
                  <button key={s._id}
                    onClick={() => setActiveSheet(s)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors group ${
                      activeSheet?._id === s._id
                        ? "border-[#2d5d89] text-[#2d5d89]"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}>
                    <Table2 className="w-3.5 h-3.5" />
                    {s.name}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span onClick={(e) => { e.stopPropagation(); setEditSheet(s); setSheetModal(true); }}
                        className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400">
                        <Edit2 className="w-3 h-3" />
                      </span>
                      <span onClick={(e) => { e.stopPropagation(); setConfirmDeleteSheet(s); }}
                        className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
                <button onClick={() => { setEditSheet(null); setSheetModal(true); }}
                  className="flex items-center gap-1 px-3 py-3 text-sm text-gray-400 hover:text-[#2d5d89] whitespace-nowrap ml-2 border-b-2 border-transparent">
                  <Plus className="w-3.5 h-3.5" /> جدول جديد
                </button>
              </div>

              {/* Sheet content */}
              <div className="flex-1 overflow-hidden p-4">
                {!activeSheet ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Table2 className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-3">لا توجد جداول في هذا السجل</p>
                      <button onClick={() => { setEditSheet(null); setSheetModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm hover:bg-[#245079]">
                        <Plus className="w-4 h-4" /> إضافة جدول
                      </button>
                    </div>
                  </div>
                ) : (
                  <SheetTable
                    key={activeSheet._id}
                    ledgerId={activeLedger._id}
                    sheet={activeSheet}
                    onUpdate={(updated) => {
                      setFullLedger((prev) => ({
                        ...prev,
                        sheets: prev.sheets.map((s) => s._id === updated._id ? updated : s),
                      }));
                      setActiveSheet(updated);
                    }}
                    printRef={printRef}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {ledgerModal && (
          <Modal open={ledgerModal} onClose={() => setLedgerModal(false)}
            title={editLedger ? "تعديل السجل" : "سجل محاسبي جديد"}>
            <LedgerForm
              initial={editLedger}
              onSave={editLedger ? updateLedger : createLedger}
              onClose={() => setLedgerModal(false)}
            />
          </Modal>
        )}
        {sheetModal && (
          <Modal open={sheetModal} onClose={() => setSheetModal(false)}
            title={editSheet ? "تعديل الجدول" : "جدول جديد"} size="lg">
            <SheetForm
              initial={editSheet}
              onSave={editSheet ? updateSheet : createSheet}
              onClose={() => setSheetModal(false)}
            />
          </Modal>
        )}
      </AnimatePresence>

      <ConfirmModal
        open={!!confirmDeleteLedger}
        onClose={() => setConfirmDeleteLedger(null)}
        onConfirm={deleteLedger}
        loading={deletingLedger}
        title="حذف السجل"
        message={`هل تريد حذف السجل "${confirmDeleteLedger?.name}"؟ سيتم فقدان جميع الجداول والبيانات.`}
      />
      <ConfirmModal
        open={!!confirmDeleteSheet}
        onClose={() => setConfirmDeleteSheet(null)}
        onConfirm={deleteSheet}
        loading={deletingSheet}
        title="حذف الجدول"
        message={`هل تريد حذف الجدول "${confirmDeleteSheet?.name}"؟ سيتم فقدان جميع بيانات هذا الجدول.`}
      />
    </div>
  );
}

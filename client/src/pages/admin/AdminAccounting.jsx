import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, Check, X, Printer, Download, ChevronRight,
  BookOpen, Table2, Search, AlertTriangle, GripVertical,
  FileSpreadsheet, RefreshCw, Menu, Upload, ClipboardList,
  BookMarked, Calculator, DollarSign, TrendingUp, TrendingDown,
  PiggyBank, Wallet, CreditCard, Receipt, FileText, Layers,
  Archive, Building2, BarChart3,
} from "lucide-react";
import * as XLSX from "xlsx";
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
  "#2d5d89", "#1a7a4a", "#8b2500", "#5b2d89",
  "#89602d", "#2d7a89", "#333333",
];

const LEDGER_ICONS = [
  { name: "BookOpen",    Icon: BookOpen },
  { name: "BookMarked",  Icon: BookMarked },
  { name: "Calculator",  Icon: Calculator },
  { name: "DollarSign",  Icon: DollarSign },
  { name: "TrendingUp",  Icon: TrendingUp },
  { name: "TrendingDown",Icon: TrendingDown },
  { name: "PiggyBank",   Icon: PiggyBank },
  { name: "Wallet",      Icon: Wallet },
  { name: "CreditCard",  Icon: CreditCard },
  { name: "Receipt",     Icon: Receipt },
  { name: "FileText",    Icon: FileText },
  { name: "Layers",      Icon: Layers },
  { name: "Archive",     Icon: Archive },
  { name: "Building2",   Icon: Building2 },
  { name: "BarChart3",   Icon: BarChart3 },
];

function getLedgerIcon(iconName) {
  const found = LEDGER_ICONS.find((i) => i.name === iconName);
  return found ? found.Icon : BookOpen;
}

const ACTION_LABELS = { create: "أضاف", update: "عدّل", delete: "حذف" };

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
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
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
        <p className="text-gray-600 text-sm leading-relaxed mt-1">{message}</p>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">إلغاء</button>
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
  const [form, setForm] = useState(initial || { name: "", description: "", branch: "", color: "#2d5d89", icon: "BookOpen" });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const submit = async () => {
    if (!form.name.trim()) return toast.error("اسم السجل مطلوب");
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const SelectedIcon = getLedgerIcon(form.icon);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="مثال: سجل المركز الرئيسي"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="وصف مختصر للسجل"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الفرع</label>
        <input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
          placeholder="مثال: القاهرة، الإسكندرية"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الأيقونة</label>
        <div className="flex flex-wrap gap-2">
          {LEDGER_ICONS.map(({ name, Icon }) => (
            <button key={name} type="button" onClick={() => setForm({ ...form, icon: name })}
              title={name}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                form.icon === name
                  ? "ring-2 ring-[#2d5d89] bg-[#2d5d89]/10 scale-110"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}>
              <Icon className="w-5 h-5" style={{ color: form.icon === name ? form.color : "#6b7280" }} />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">اللون</label>
        <div className="flex gap-2">
          {LEDGER_COLORS.map((c) => (
            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
              style={{ backgroundColor: c }}
              className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-gray-400" : "hover:scale-110"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">إلغاء</button>
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم الجدول *</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          placeholder="مثال: المصروفات الشهرية"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">الأعمدة</label>
          <button onClick={addCol}
            className="flex items-center gap-1 text-xs text-[#2d5d89] hover:underline font-medium">
            <Plus className="w-3.5 h-3.5" /> إضافة عمود
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {columns.map((col, i) => (
            <div key={col.key} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <input value={col.label} onChange={(e) => updateCol(i, "label", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
                placeholder="اسم العمود" />
              <select value={col.type} onChange={(e) => updateCol(i, "type", e.target.value)}
                className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
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
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-gray-50">إلغاء</button>
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
        className="w-full h-full px-2 py-1 bg-blue-50 text-gray-900 text-sm focus:outline-none border-2 border-blue-400 rounded">
        <option value="">—</option>
        {(col.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  const inputType = col.type === "date" ? "date" : col.type === "number" || col.type === "currency" ? "number" : "text";
  return (
    <input type={inputType} value={value || ""} onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur} onKeyDown={onKeyDown} autoFocus
      className="w-full h-full px-2 py-1 bg-blue-50 text-gray-900 text-sm focus:outline-none border-2 border-blue-400 rounded" />
  );
}

// ─── Audit Log Panel ──────────────────────────────────────────────────────────

function AuditLogPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/accounting/audit-log")
      .then((r) => setLogs(r.data.logs || []))
      .catch(() => toast.error("فشل تحميل سجل العمليات"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-6 h-6 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-[#2d5d89]" />
        <h3 className="font-bold text-gray-900 text-base">سجل العمليات</h3>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{logs.length} عملية</span>
      </div>
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0">
            <tr className="bg-[#2d5d89] text-white">
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">المستخدم</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">البريد</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">العملية</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">العنصر</th>
              <th className="px-4 py-3 text-right font-semibold whitespace-nowrap">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">لا توجد عمليات مسجلة</td>
              </tr>
            )}
            {logs.map((log, i) => (
              <tr key={log._id || i}
                className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <td className="px-4 py-2.5 font-medium text-gray-800 whitespace-nowrap">{log.userName || "—"}</td>
                <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">{log.userEmail || "—"}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    log.action === "create" ? "bg-emerald-100 text-emerald-700" :
                    log.action === "delete" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{log.entityName || "—"}</td>
                <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString("ar-EG") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Sheet Table ─────────────────────────────────────────────────────────────

function SheetTable({ ledgerId, sheet, onUpdate, printRef }) {
  const toast = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState(sheet.rows || []);
  const [editCell, setEditCell] = useState(null);
  const [cellVal, setCellVal] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [addingRow, setAddingRow] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeTab, setActiveTab] = useState("table"); // "table" | "audit"
  const [quickFilter, setQuickFilter] = useState("");
  const [notePopover, setNotePopover] = useState(null); // { rowId, value }
  const fileInputRef = useRef(null);

  const cols = sheet.columns || [];
  const isAdmin = user?.role === "admin";

  // ── inline editing (keyed by rowId) ──
  const startEdit = (rowId, colKey) => {
    const row = rows.find((r) => r._id === rowId);
    setEditCell({ rowId, colKey });
    setCellVal(row?.cells?.[colKey] ?? "");
  };

  const commitCell = async (rowId, colKey, val) => {
    const row = rows.find((r) => r._id === rowId);
    if (!row) return;
    const newCells = { ...(row.cells || {}), [colKey]: val };
    setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, cells: newCells } : r));
    setEditCell(null);
    try {
      await api.put(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${rowId}`, { cells: newCells });
    } catch { toast.error("فشل حفظ الخلية"); }
  };

  const handleCellBlur = () => {
    if (editCell) commitCell(editCell.rowId, editCell.colKey, cellVal);
  };

  const handleCellKey = (e) => {
    if (!editCell) return;
    if (e.key === "Enter") { e.preventDefault(); commitCell(editCell.rowId, editCell.colKey, cellVal); }
    if (e.key === "Escape") setEditCell(null);
    if (e.key === "Tab") {
      e.preventDefault();
      const colIdx = cols.findIndex((c) => c.key === editCell.colKey);
      const nextColIdx = colIdx + 1;
      const curIdx = filteredRows.findIndex((r) => r._id === editCell.rowId);
      if (nextColIdx < cols.length) {
        commitCell(editCell.rowId, editCell.colKey, cellVal);
        setTimeout(() => startEdit(editCell.rowId, cols[nextColIdx].key), 0);
      } else if (curIdx + 1 < filteredRows.length) {
        commitCell(editCell.rowId, editCell.colKey, cellVal);
        const nextRowId = filteredRows[curIdx + 1]._id;
        setTimeout(() => startEdit(nextRowId, cols[0].key), 0);
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
    const visibleIds = (quickFilter.trim()
      ? rows.filter((r) => {
          const q = quickFilter.toLowerCase();
          return Object.values(r.cells || {}).some((v) => String(v ?? "").toLowerCase().includes(q));
        })
      : rows).map((r) => r._id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(visibleIds));
  };

  // ── Excel Import ──
  const handleExcelImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (rawData.length < 2) { toast.error("الملف فارغ أو لا يحتوي على بيانات"); return; }

      const headerRow = rawData[0];
      // Build columns from header row — all text type
      const newColumns = headerRow.map((h, i) => ({
        key: `col_${i}_${Date.now()}`,
        label: String(h || `عمود ${i + 1}`),
        type: "text",
        width: 150,
      }));

      // Create new sheet with these columns
      const sheetRes = await api.post(`/accounting/${ledgerId}/sheets`, {
        name: file.name.replace(/\.[^.]+$/, ""),
        columns: newColumns,
      });
      const newSheet = sheetRes.data.sheet;

      // Import rows
      const dataRows = rawData.slice(1);
      const importedRows = [];
      for (const row of dataRows) {
        if (row.every((c) => c === "" || c === null || c === undefined)) continue;
        const cells = {};
        newColumns.forEach((col, i) => { cells[col.key] = String(row[i] ?? ""); });
        try {
          const rowRes = await api.post(`/accounting/${ledgerId}/sheets/${newSheet._id}/rows`, { cells });
          importedRows.push(rowRes.data.row);
        } catch {}
      }

      toast.success(`تم استيراد ${importedRows.length} سطر من Excel`);
      // Notify parent to reload
      onUpdate && onUpdate({ ...newSheet, rows: importedRows });
    } catch (err) {
      toast.error("فشل استيراد الملف");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── print (all or selected only) ──
  const handlePrint = (onlySelected = false) => {
    const targetRows = onlySelected
      ? rows.filter((r) => selected.has(r._id))
      : rows;
    if (targetRows.length === 0) { toast.error("لا توجد صفوف للطباعة"); return; }

    const headHtml = `<tr>${cols.map((c) => `<th>${c.label}</th>`).join("")}</tr>`;
    const bodyHtml = targetRows.map((row) => {
      const cells = cols.map((c) => `<td>${formatCell(row.cells?.[c.key] ?? "", c.type) || ""}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    // Totals row
    const totalsCells = cols.map((c, i) => {
      if (i === 0) return `<td><b>الإجمالي</b></td>`;
      const t = sumColumn(targetRows, c.key, c.type);
      return `<td>${t !== null ? formatCell(t, c.type) : ""}</td>`;
    }).join("");
    const totalsHtml = `<tr class="total-row">${totalsCells}</tr>`;

    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html dir="rtl"><head>
        <meta charset="UTF-8"><title>${sheet.name}</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; direction: rtl; padding: 20px; font-size: 12px; }
          h2 { color: #2d5d89; margin-bottom: 4px; }
          .meta { color: #64748b; font-size: 11px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #2d5d89; color: white; padding: 8px 12px; text-align: right; font-size: 12px; }
          td { padding: 6px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right; }
          tr:nth-child(even) td { background: #f8fafc; }
          .total-row td { font-weight: bold; background: #dbeafe; border-top: 2px solid #2d5d89; color: #2d5d89; }
          @media print { button { display: none; } }
        </style>
      </head><body>
        <h2>${sheet.name}</h2>
        <p class="meta">${onlySelected ? `طباعة الصفوف المحددة (${targetRows.length})` : `كل الصفوف (${targetRows.length})`} — ${new Date().toLocaleString("ar-EG")}</p>
        <table>
          <thead>${headHtml}</thead>
          <tbody>${bodyHtml}${totalsHtml}</tbody>
        </table>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  // ── save row note ──
  const saveRowNote = async (rowId, value) => {
    const row = rows.find((r) => r._id === rowId);
    if (!row) return;
    const newCells = { ...(row.cells || {}), _notes: value };
    setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, cells: newCells } : r));
    setNotePopover(null);
    try {
      await api.put(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${rowId}`, { cells: newCells });
      toast.success("تم حفظ الملاحظة");
    } catch { toast.error("فشل حفظ الملاحظة"); }
  };

  // ── quick filter ──
  const filteredRows = quickFilter.trim()
    ? rows.filter((r) => {
        const q = quickFilter.toLowerCase();
        return Object.values(r.cells || {}).some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        );
      })
    : rows;

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

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar (admin only shows audit tab) */}
      {isAdmin && (
        <div className="flex items-center gap-1 mb-3 border-b border-gray-200 pb-0">
          <button onClick={() => setActiveTab("table")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "table" ? "border-[#2d5d89] text-[#2d5d89]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <Table2 className="w-3.5 h-3.5" /> البيانات
          </button>
          <button onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "audit" ? "border-[#2d5d89] text-[#2d5d89]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            <ClipboardList className="w-3.5 h-3.5" /> سجل العمليات
          </button>
        </div>
      )}

      {activeTab === "audit" && isAdmin ? (
        <AuditLogPanel />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm text-gray-500">{filteredRows.length} / {rows.length} سطر</span>
            {selected.size > 0 && (
              <span className="text-sm font-medium text-[#2d5d89]">({selected.size} محدد)</span>
            )}
            <div className="relative flex-1 min-w-40 max-w-xs">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="فلتر سريع..."
                className="w-full pr-8 pl-2 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
            <div className="mr-auto flex items-center gap-2 flex-wrap">
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
              {selected.size > 0 && (
                <button onClick={() => handlePrint(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-medium">
                  <Printer className="w-3.5 h-3.5" /> طباعة المحدد ({selected.size})
                </button>
              )}
              <button onClick={() => handlePrint(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium">
                <Printer className="w-3.5 h-3.5" /> طباعة الكل
              </button>
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-3.5 h-3.5" />
                {importing ? "جاري الاستيراد..." : "استيراد Excel"}
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelImport} />
              </label>
              <button onClick={() => setAddingRow(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-medium">
                <Plus className="w-3.5 h-3.5" /> سطر جديد
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
            <div ref={printRef}>
              <table className="w-full min-w-max text-sm">
                <thead className="sticky top-0 z-10 bg-[#2d5d89]">
                  <tr className="bg-[#2d5d89] text-white sticky top-0 z-10">
                    <th className="w-10 px-3 py-3 sticky top-0 bg-[#2d5d89] z-10">
                      <input type="checkbox"
                        checked={filteredRows.length > 0 && filteredRows.every((r) => selected.has(r._id))}
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
                  {filteredRows.length === 0 && !addingRow && (
                    <tr>
                      <td colSpan={cols.length + 2} className="text-center py-12 text-gray-400 text-sm">
                        <Table2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        لا توجد بيانات — اضغط "سطر جديد" لإضافة البيانات
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((row, rowIdx) => (
                    <tr key={row._id}
                      className={`border-b border-gray-100 transition-colors group ${
                        selected.has(row._id)
                          ? "bg-blue-50"
                          : rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      } hover:bg-blue-50/50`}>
                      <td className="px-3 py-2 w-10">
                        <input type="checkbox" checked={selected.has(row._id)} onChange={() => toggleRow(row._id)}
                          className="rounded cursor-pointer accent-[#2d5d89]" />
                      </td>
                      {cols.map((col) => {
                        const isEditing = editCell?.rowId === row._id && editCell?.colKey === col.key;
                        const val = row.cells?.[col.key] ?? "";
                        return (
                          <td key={col.key} style={{ minWidth: col.width || 120 }}
                            className="px-1 py-1 cursor-pointer"
                            onDoubleClick={() => startEdit(row._id, col.key)}>
                            {isEditing ? (
                              <CellInput col={col} value={cellVal} onChange={setCellVal}
                                onBlur={handleCellBlur} onKeyDown={handleCellKey} />
                            ) : (
                              <div className="px-2 py-1 min-h-[28px] text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis rounded hover:bg-gray-100">
                                {formatCell(val, col.type) || <span className="text-gray-300">—</span>}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-1 w-20 relative">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setNotePopover({ rowId: row._id, value: row.cells?._notes || "" })}
                            title={row.cells?._notes || "إضافة ملاحظة"}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                              row.cells?._notes
                                ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                : "text-gray-300 hover:text-amber-500 hover:bg-amber-50 opacity-0 group-hover:opacity-100"
                            }`}>
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteRow(row._id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {notePopover?.rowId === row._id && (
                          <div className="absolute left-0 top-9 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64" dir="rtl">
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">ملاحظة السطر</label>
                            <textarea
                              value={notePopover.value}
                              onChange={(e) => setNotePopover({ ...notePopover, value: e.target.value })}
                              rows={3}
                              className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none"
                              placeholder="اكتب ملاحظة..."
                              autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button onClick={() => setNotePopover(null)}
                                className="px-2 py-1 text-xs rounded-lg border border-gray-200 hover:bg-gray-50">إلغاء</button>
                              <button onClick={() => saveRowNote(row._id, notePopover.value)}
                                className="px-3 py-1 text-xs rounded-lg bg-[#2d5d89] text-white hover:bg-[#245079]">حفظ</button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* New row input */}
                  {addingRow && (
                    <tr className="bg-emerald-50/50 border-b border-emerald-100">
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
                            className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Totals row */}
                  {filteredRows.length > 0 && (
                    <tr className="bg-blue-50 font-bold border-t-2 border-[#2d5d89] sticky bottom-0">
                      <td className="px-3 py-3 text-xs text-[#2d5d89] whitespace-nowrap" colSpan={2}>
                        الإجمالي
                      </td>
                      {cols.slice(1).map((col) => {
                        const total = sumColumn(filteredRows, col.key, col.type);
                        return (
                          <td key={col.key} className="px-3 py-3 text-sm text-[#2d5d89] whitespace-nowrap font-bold">
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
        </>
      )}

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

  const hasAccess = user?.role === "admin" || user?.department === "accounts";

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLedger, setActiveLedger] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [fullLedger, setFullLedger] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar

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
    await api.put(`/accounting/${editLedger._id}`, form);
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">غير مصرح بالدخول</h2>
          <p className="text-gray-500 text-sm">هذه الصفحة مخصصة لقسم الحسابات والمديرين فقط</p>
        </div>
      </div>
    );
  }

  // Sidebar content (shared between desktop & mobile drawer)
  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 text-sm">السجلات المحاسبية</h2>
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
          ledgers.map((l) => {
            const LIcon = getLedgerIcon(l.icon);
            return (
              <button key={l._id} onClick={() => { setActiveLedger(l); setSidebarOpen(false); }}
                className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors group ${
                  activeLedger?._id === l._id
                    ? "bg-[#2d5d89]/10 text-[#2d5d89]"
                    : "hover:bg-gray-50 text-gray-700"
                }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: l.color + "20" }}>
                  <LIcon className="w-5 h-5" style={{ color: l.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{l.name}</p>
                  {l.branch && <p className="text-xs text-gray-400 truncate">{l.branch}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditLedger(l); setLedgerModal(true); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteLedger(l); }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">
      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">السجلات</h2>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex w-72 flex-shrink-0 bg-white border-l border-gray-100 flex-col">
        <SidebarContent />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc]">
        {!activeLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              {/* Mobile hamburger */}
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-4 flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm">
                <Menu className="w-4 h-4" /> عرض السجلات
              </button>
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
            <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
              {/* Mobile hamburger */}
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500">
                <Menu className="w-4 h-4" />
              </button>
              {(() => {
                const LIcon = getLedgerIcon(activeLedger.icon);
                return (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: activeLedger.color + "20" }}>
                    <LIcon className="w-5 h-5" style={{ color: activeLedger.color }} />
                  </div>
                );
              })()}
              <div>
                <h2 className="font-bold text-gray-900 text-base leading-tight">{activeLedger.name}</h2>
                {activeLedger.branch && <p className="text-xs text-gray-400">{activeLedger.branch}</p>}
              </div>
              <div className="mr-auto flex items-center gap-2">
                <button onClick={() => loadFullLedger(activeLedger._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sheets tabs + content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sheet tabs */}
              <div className="bg-white border-b border-gray-100 px-4 flex items-center gap-1 overflow-x-auto">
                {(fullLedger?.sheets || []).map((s) => (
                  <button key={s._id}
                    onClick={() => setActiveSheet(s)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors group ${
                      activeSheet?._id === s._id
                        ? "border-[#2d5d89] text-[#2d5d89]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}>
                    <Table2 className="w-3.5 h-3.5" />
                    {s.name}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span onClick={(e) => { e.stopPropagation(); setEditSheet(s); setSheetModal(true); }}
                        className="p-0.5 rounded hover:bg-gray-200 text-gray-400">
                        <Edit2 className="w-3 h-3" />
                      </span>
                      <span onClick={(e) => { e.stopPropagation(); setConfirmDeleteSheet(s); }}
                        className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500">
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
                        sheets: [...(prev?.sheets || []), updated],
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

import { useState, useEffect, useRef, useCallback, lazy, Suspense, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, Check, X, Printer, Download, ChevronRight, ChevronLeft,
  BookOpen, Table2, Search, AlertTriangle, GripVertical,
  FileSpreadsheet, RefreshCw, Menu, Upload, ClipboardList,
  BookMarked, Calculator, DollarSign, TrendingUp, TrendingDown,
  PiggyBank, Wallet, CreditCard, Receipt, FileText, Layers,
  Archive, Building2, BarChart3, FileDown, Copy as CopyIcon, Eye as EyeIcon, EyeOff,
  Sparkles, Grid3x3, Zap, Target, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  ChevronDown, ChevronUp, Tag, Filter, SortAsc, SortDesc, Sigma, Users,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";

import SpreadsheetEditor from "../../Components/admin/SpreadsheetEditor";
import InlineAiChat from "../../Components/UI/InlineAiChat";
import * as XLSX from "xlsx";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import HelpCard from "../../Components/UI/HelpCard";
import ArabicDatePicker from "../../Components/UI/ArabicDatePicker";

// ─── helpers ─────────────────────────────────────────────────────────────────

const COLUMN_TYPES = [
  { value: "text",       label: "نص" },
  { value: "number",     label: "رقم" },
  { value: "currency",   label: "عملة (ج.م)" },
  { value: "date",       label: "تاريخ" },
  { value: "select",     label: "قائمة" },
  { value: "percentage", label: "نسبة مئوية" },
  { value: "formula",    label: "معادلة" },
];

// Safe formula evaluator: substitutes column keys with their numeric values
// then evaluates a restricted math expression (digits + + - * / . ( ) only)
function evaluateFormula(formula, cells) {
  if (!formula) return "—";
  let expr = String(formula);
  // sort keys longest-first so col10 isn't partially replaced when col1 exists
  const keys = Object.keys(cells || {}).sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    const num = parseFloat(cells[key]);
    const safe = isFinite(num) ? num : 0;
    expr = expr.split(key).join(`(${safe})`);
  });
  // remove any remaining identifiers (other col refs) -> 0
  expr = expr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, "0");
  if (!/^[\d\s\+\-\*\/\.\(\)]+$/.test(expr)) return "—";
  try {
    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + expr + ')')();
    if (!isFinite(result)) return "—";
    return result;
  } catch {
    return "—";
  }
}

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
  if (type === "currency")   return Number(val).toLocaleString("ar-EG") + " ج";
  if (type === "number")     return Number(val).toLocaleString("ar-EG");
  if (type === "percentage") return Number(val).toLocaleString("ar-EG", { maximumFractionDigits: 2 }) + " %";
  if (type === "date")       return val ? new Date(val).toLocaleDateString("ar-EG") : "";
  return val;
}

// Returns the displayable cell value for a row, accounting for formula columns.
function getDisplayCellValue(row, col) {
  if (col.type === "formula") {
    const v = evaluateFormula(col.formula || "", row?.cells || {});
    return v;
  }
  return row?.cells?.[col.key] ?? "";
}

function sumColumn(rows, colKey, type, col) {
  if (!["currency", "number", "percentage", "formula"].includes(type)) return null;
  return rows.reduce((acc, r) => {
    let v;
    if (type === "formula" && col) {
      const computed = evaluateFormula(col.formula || "", r.cells || {});
      v = typeof computed === "number" ? computed : 0;
    } else {
      const raw = r.cells?.[colKey];
      v = raw ? Number(raw) : 0;
    }
    return acc + (isFinite(v) ? v : 0);
  }, 0);
}

// Quick stats for a numeric/currency/percentage/formula column
function colStats(rows, col) {
  const isNumeric = ["currency", "number", "percentage", "formula"].includes(col.type);
  if (!isNumeric) return null;
  const nums = rows
    .map((r) => {
      if (col.type === "formula") {
        const v = evaluateFormula(col.formula || "", r.cells || {});
        return typeof v === "number" ? v : null;
      }
      const raw = r.cells?.[col.key];
      const n = parseFloat(raw);
      return isFinite(n) ? n : null;
    })
    .filter((n) => n !== null);
  if (nums.length === 0) return { sum: 0, avg: 0, min: 0, max: 0, count: 0 };
  const sum = nums.reduce((a, b) => a + b, 0);
  return {
    sum,
    avg: sum / nums.length,
    min: Math.min(...nums),
    max: Math.max(...nums),
    count: nums.length,
  };
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
  const [saving,       setSaving]       = useState(false);
  const [showTemplates,setShowTemplates]= useState(!initial);
  const toast = useToast();

  const applyTemplate = (tpl) => {
    setName(tpl.name);
    setColumns(tpl.columns);
    setShowTemplates(false);
  };

  const addCol = () => {
    const nextNum = columns.length + 1;
    setColumns([...columns, { key: `col${nextNum}`, label: "عمود جديد", type: "text", width: 150 }]);
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
      {/* Template gallery */}
      {showTemplates && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">اختر نموذج جاهز</span>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-[#2d5d89] hover:underline">
              جدول فارغ
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-1">
            {FINANCIAL_TEMPLATES.map((tpl) => {
              const TplIcon = TEMPLATE_ICONS[tpl.id] || FileText;
              return (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                  className="flex flex-col items-start gap-1.5 p-3 rounded-xl border-2 border-gray-100 hover:border-[#2d5d89] hover:bg-[#2d5d89]/5 transition-all text-right">
                  <div className="w-7 h-7 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center">
                    <TplIcon className="w-3.5 h-3.5 text-[#2d5d89]" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">{tpl.name}</span>
                  <span className="text-[10px] text-gray-400">{tpl.columns.length} أعمدة</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-100 pt-3 mt-1">
            <p className="text-xs text-gray-400 text-center">أو أنشئ جدولاً مخصصاً من الصفر</p>
          </div>
        </div>
      )}
      {!showTemplates && !initial && (
        <button onClick={() => setShowTemplates(true)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-500 hover:border-[#2d5d89] hover:text-[#2d5d89] transition-colors">
          <Target className="w-3.5 h-3.5" /> استخدام نموذج جاهز
        </button>
      )}
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
            <div key={col.key} className="bg-gray-50 rounded-xl p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
                <input value={col.label} onChange={(e) => updateCol(i, "label", e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
                  placeholder="اسم العمود" />
                <select value={col.type} onChange={(e) => updateCol(i, "type", e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
                  {COLUMN_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <span className="px-2 py-1 rounded-lg bg-gray-200 text-gray-500 text-[10px] font-mono whitespace-nowrap">{col.key}</span>
                {columns.length > 1 && (
                  <button onClick={() => removeCol(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {col.type === "formula" && (
                <div className="pr-6 flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-bold">=</span>
                  <input
                    value={col.formula || ""}
                    onChange={(e) => updateCol(i, "formula", e.target.value)}
                    placeholder="مثال: col1 * col2 / 100"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-blue-200 bg-white text-gray-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
                  />
                </div>
              )}
              {col.type === "select" && (
                <div className="pr-6 flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-bold">الخيارات:</span>
                  <input
                    value={(col.options || []).join(",")}
                    onChange={(e) => updateCol(i, "options", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    placeholder="خيار1,خيار2,خيار3"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-purple-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-2">
          المعادلة: استخدم مفاتيح الأعمدة (مثلاً col1) مع العمليات الحسابية + − × ÷
        </p>
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
  if (col.type === "formula") {
    // Formula columns are read-only — show computed value & close immediately
    return (
      <div onBlur={onBlur} tabIndex={0}
        className="w-full h-full px-2 py-1 bg-gray-100 text-gray-500 text-sm flex items-center border-2 border-gray-300 rounded">
        محسوب تلقائيًا
      </div>
    );
  }
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
  const numericTypes = ["number", "currency", "percentage"];
  if (col.type === "date") {
    return (
      <ArabicDatePicker value={value || ""} onChange={(v) => { onChange(v); onBlur(); }} />
    );
  }
  const inputType = numericTypes.includes(col.type) ? "number" : "text";
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

// ─── Rates Panel ─────────────────────────────────────────────────────────────

function RatesPanel({ rows, cols }) {
  const numericCols = cols.filter((c) => ["currency", "number", "percentage", "formula"].includes(c.type));

  if (numericCols.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-center">
          <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">لا توجد أعمدة رقمية لعرض المعدلات</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {numericCols.map((c) => {
          const s = colStats(rows, c);
          if (!s) return null;
          return (
            <div key={c.key} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-900 text-sm">{c.label}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  {COLUMN_TYPES.find((t) => t.value === c.type)?.label}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المجموع:</span>
                  <span className="font-bold text-[#2d5d89]">{formatCell(s.sum, c.type)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">المتوسط:</span>
                  <span className="font-medium text-gray-700">{formatCell(s.avg, c.type)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">أعلى قيمة:</span>
                  <span className="font-medium text-emerald-700">{formatCell(s.max, c.type)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">أدنى قيمة:</span>
                  <span className="font-medium text-red-700">{formatCell(s.min, c.type)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 pt-1.5 mt-1.5">
                  <span className="text-gray-400 text-xs">عدد القيم:</span>
                  <span className="text-xs text-gray-500">{s.count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Ledger Summary ──────────────────────────────────────────────────────────

function LedgerSummary({ ledger }) {
  if (!ledger) return null;
  const sheets    = ledger.sheets || [];
  const totalRows = sheets.reduce((acc, s) => acc + (s.rows?.length || 0), 0);

  // Per-sheet currency totals
  const sheetTotals = sheets.map((s, idx) => {
    const cols  = s.columns || [];
    const rows  = s.rows    || [];
    const total = cols
      .filter((c) => c.type === "currency")
      .reduce((sum, c) => sum + (sumColumn(rows, c.key, c.type, c) || 0), 0);
    return { id: s._id, name: s.name.substring(0,16), color: CHART_COLORS[idx % CHART_COLORS.length], total, rowCount: rows.length };
  });

  const grandTotal = sheetTotals.reduce((a, b) => a + b.total, 0);

  const barData  = sheetTotals.map((s) => ({ name: s.name, القيمة: s.total }));
  const pieData  = sheetTotals.filter((s) => s.total > 0);

  return (
    <div className="space-y-4 overflow-auto h-full pb-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-[#2d5d89] to-[#1f4566] text-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs opacity-70 mb-1">إجمالي قيمة العملات</p>
          <p className="text-2xl font-bold">{formatCell(grandTotal, "currency")}</p>
          <p className="text-xs opacity-60 mt-1">{sheets.length} جدول · {totalRows} سطر</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">متوسط قيمة الجدول</p>
          <p className="text-2xl font-bold text-gray-800">{sheets.length > 0 ? formatCell(grandTotal / sheets.length, "currency") : "—"}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">أعلى جدول قيمةً</p>
          {sheetTotals.length > 0 ? (
            <>
              <p className="text-base font-bold text-[#2d5d89] truncate">{sheetTotals.sort((a,b)=>b.total-a.total)[0]?.name}</p>
              <p className="text-sm text-gray-600">{formatCell(Math.max(...sheetTotals.map(s=>s.total)), "currency")}</p>
            </>
          ) : <p className="text-gray-400 text-sm">—</p>}
        </div>
      </div>

      {/* Bar chart */}
      {barData.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2d5d89]" />
            مقارنة إجماليات الجداول
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top:5, right:5, left:5, bottom:30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize:10 }} width={65} tickFormatter={(v) => v.toLocaleString("ar-EG")} />
              <Tooltip formatter={(v) => formatCell(v, "currency")} />
              <Bar dataKey="القيمة" radius={[6,6,0,0]}>
                {barData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pie chart + list side by side */}
      {pieData.length > 1 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-600" />
            التوزيع النسبي
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <RePieChart>
                <Pie data={pieData} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCell(v, "currency")} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              {pieData.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="flex-1 text-gray-700 truncate">{s.name}</span>
                  <span className="font-bold text-gray-800 whitespace-nowrap">{formatCell(s.total, "currency")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sheets.length === 0 && (
        <div className="text-center py-12">
          <FileSpreadsheet className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">لا توجد جداول في هذا السجل بعد</p>
        </div>
      )}
    </div>
  );
}

// ─── Chart colors ─────────────────────────────────────────────────────────────
const CHART_COLORS = ["#2d5d89","#0F9D58","#F4B400","#DB4437","#9B59B6","#1ABC9C","#E67E22","#3498DB"];

// ─── Financial Charts Panel ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, valueCol, cols }) => {
  if (!active || !payload?.length) return null;
  const col = cols?.find((c) => c.key === valueCol);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 text-xs" dir="rtl">
      <p className="font-bold text-gray-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{col ? formatCell(p.value, col.type) : p.value}</p>
      ))}
    </div>
  );
};

function FinancialCharts({ rows, cols }) {
  const [chartType, setChartType] = useState("bar");

  // Initialize lazily from cols — no useEffect needed (avoids #185 infinite loop)
  const numericCols = useMemo(() => cols.filter((c) => ["currency","number","formula"].includes(c.type)), [cols]);
  const textCols    = useMemo(() => cols.filter((c) => ["text","select","date"].includes(c.type)),        [cols]);

  const [valueCol, setValueCol] = useState(() => cols.find((c) => ["currency","number","formula"].includes(c.type))?.key || "");
  const [groupBy,  setGroupBy]  = useState(() => cols.find((c) => ["text","select","date"].includes(c.type))?.key  || "");

  // Reset when cols structure changes (sheet switch)
  const colKeys = cols.map((c) => c.key).join(",");
  useEffect(() => {
    setValueCol((v) => cols.find((c) => c.key === v) ? v : (cols.find((c) => ["currency","number","formula"].includes(c.type))?.key || ""));
    setGroupBy ((g) => cols.find((c) => c.key === g) ? g : (cols.find((c) => ["text","select","date"].includes(c.type))?.key    || ""));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colKeys]);

  const activeValueCol = cols.find((c) => c.key === valueCol);
  const activeGroupCol = cols.find((c) => c.key === groupBy);

  // Build chart data grouped by the selected text column
  const chartData = useMemo(() => {
    if (!valueCol || !groupBy) return [];
    const groups = {};
    rows.forEach((r) => {
      const grp = r.cells?.[groupBy] || "غير محدد";
      const raw = r.cells?.[valueCol];
      let val = 0;
      if (activeValueCol?.type === "formula") {
        const ev = evaluateFormula(activeValueCol.formula || "", r.cells || {});
        val = typeof ev === "number" ? ev : 0;
      } else {
        val = parseFloat(raw) || 0;
      }
      if (!groups[grp]) groups[grp] = 0;
      groups[grp] += val;
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name: name.substring(0, 20), value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12);
  }, [rows, valueCol, groupBy, activeValueCol]);

  // Monthly trend data (if a date column exists)
  const dateCol = cols.find((c) => c.type === "date");
  const trendData = useMemo(() => {
    if (!dateCol || !valueCol) return [];
    const months = {};
    rows.forEach((r) => {
      const raw = r.cells?.[dateCol.key];
      if (!raw) return;
      try {
        const d = new Date(raw);
        if (isNaN(d)) return;
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
        const rawV = r.cells?.[valueCol];
        let val = 0;
        if (activeValueCol?.type === "formula") {
          const ev = evaluateFormula(activeValueCol.formula || "", r.cells || {});
          val = typeof ev === "number" ? ev : 0;
        } else { val = parseFloat(rawV) || 0; }
        if (!months[key]) months[key] = 0;
        months[key] += val;
      } catch {}
    });
    return Object.entries(months)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-12)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [rows, dateCol, valueCol, activeValueCol]);

  // KPI cards
  const stats = useMemo(() => {
    if (!activeValueCol) return null;
    return colStats(rows, activeValueCol);
  }, [rows, activeValueCol]);

  // tooltipProps passed to ChartTooltip via closure
  const fmtVal = useCallback((v) => activeValueCol ? formatCell(v, activeValueCol.type) : v, [activeValueCol]);

  if (numericCols.length === 0) return (
    <div className="flex items-center justify-center h-60">
      <div className="text-center">
        <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">أضف أعمدة رقمية أو عملة لعرض المخططات</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 overflow-auto pb-4 h-full">
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"المجموع",   value: formatCell(stats.sum,  activeValueCol?.type), icon: Sigma,         color:"#2d5d89" },
            { label:"المتوسط",   value: formatCell(stats.avg,  activeValueCol?.type), icon: Activity,      color:"#0F9D58" },
            { label:"أعلى قيمة",value: formatCell(stats.max,  activeValueCol?.type), icon: ArrowUpRight,  color:"#E67E22" },
            { label:"أدنى قيمة",value: formatCell(stats.min,  activeValueCol?.type), icon: ArrowDownRight, color:"#DB4437" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color + "18" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
              <p className="text-base font-bold text-gray-800 truncate">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 bg-gray-50 rounded-2xl p-3">
        {/* Chart type */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-200">
          {[
            { id:"bar",  label:"أعمدة",  Icon: BarChart3  },
            { id:"line", label:"خطي",    Icon: Activity   },
            { id:"area", label:"مساحي",  Icon: TrendingUp },
            { id:"pie",  label:"دائري",  Icon: PieChart   },
          ].map((t) => (
            <button key={t.id} onClick={() => setChartType(t.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                chartType === t.id ? "bg-[#2d5d89] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}>
              <t.Icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Group by */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
            <option value="">-- تجميع حسب --</option>
            {textCols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        {/* Value column */}
        <div className="flex items-center gap-1.5">
          <Sigma className="w-3.5 h-3.5 text-gray-400" />
          <select value={valueCol} onChange={(e) => setValueCol(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
            <option value="">-- قيمة المحور --</option>
            {numericCols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-600 mb-3">
            {activeValueCol?.label} حسب {activeGroupCol?.label}
          </p>
          <ResponsiveContainer width="100%" height={240}>
            {chartType === "pie" ? (
              <RePieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCell(v, "currency")} />
              </RePieChart>
            ) : chartType === "line" ? (
              <LineChart data={chartData} margin={{ top:5, right:5, left:5, bottom:30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize:10 }} width={60} tickFormatter={(v) => v.toLocaleString("ar-EG")} />
                <Tooltip formatter={(v) => formatCell(v, "currency")} />
                <Line type="monotone" dataKey="value" stroke="#2d5d89" strokeWidth={2} dot={{ fill:"#2d5d89", r:4 }} />
              </LineChart>
            ) : chartType === "area" ? (
              <AreaChart data={chartData} margin={{ top:5, right:5, left:5, bottom:30 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2d5d89" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2d5d89" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize:10 }} width={60} tickFormatter={(v) => v.toLocaleString("ar-EG")} />
                <Tooltip formatter={(v) => formatCell(v, "currency")} />
                <Area type="monotone" dataKey="value" stroke="#2d5d89" fill="url(#areaGrad)" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={chartData} margin={{ top:5, right:5, left:5, bottom:30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize:10 }} width={60} tickFormatter={(v) => v.toLocaleString("ar-EG")} />
                <Tooltip formatter={(v) => formatCell(v, "currency")} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly trend chart (if date column exists) */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-600 mb-3">
            <Activity className="w-3.5 h-3.5 inline ml-1 text-[#2d5d89]" />
            التطور الشهري — {activeValueCol?.label}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData} margin={{ top:5, right:5, left:5, bottom:5 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0F9D58" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0F9D58" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:9 }} />
              <YAxis tick={{ fontSize:9 }} width={55} tickFormatter={(v) => v.toLocaleString("ar-EG")} />
              <Tooltip formatter={(v) => formatCell(v, "currency")} />
              <Area type="monotone" dataKey="value" stroke="#0F9D58" fill="url(#trendGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {chartData.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">اختر عمود التجميع وعمود القيمة لعرض المخطط</p>
        </div>
      )}
    </div>
  );
}

// ─── Quick Entry Panel ────────────────────────────────────────────────────────
function QuickEntryPanel({ cols, onAdd, saving }) {
  const [data,   setData]   = useState({});
  const [count,  setCount]  = useState(0);
  const toast = useToast();

  const editableCols = cols.filter((c) => c.type !== "formula");

  const submit = async () => {
    const hasData = editableCols.some((c) => data[c.key]);
    if (!hasData) { toast.error("أدخل بيانات في حقل واحد على الأقل"); return; }
    await onAdd(data);
    setData({});
    setCount((n) => n + 1);
    toast.success("تم الإضافة");
  };

  return (
    <div className="bg-gradient-to-br from-[#2d5d89]/5 to-white rounded-2xl border border-[#2d5d89]/20 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#2d5d89] flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm">الإدخال السريع</span>
        {count > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
            تم إضافة {count}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {editableCols.map((col) => (
          <div key={col.key}>
            <label className="block text-[10px] font-medium text-gray-500 mb-0.5">{col.label}</label>
            {col.type === "select" ? (
              <select
                value={data[col.key] || ""}
                onChange={(e) => setData({ ...data, [col.key]: e.target.value })}
                className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5d89]">
                <option value="">-- اختر --</option>
                {(col.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={["number","currency","percentage"].includes(col.type) ? "number" : col.type === "date" ? "date" : "text"}
                value={data[col.key] || ""}
                onChange={(e) => setData({ ...data, [col.key]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={col.label}
                className="w-full px-2.5 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#2d5d89]"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <button onClick={submit} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#2d5d89] hover:bg-[#245079] text-white rounded-xl text-sm font-medium disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" />
          {saving ? "جاري الإضافة..." : "إضافة سطر (Enter ↵)"}
        </button>
      </div>
    </div>
  );
}

// ─── Financial Templates ──────────────────────────────────────────────────────
const TEMPLATE_ICONS = {
  income_statement: BarChart3,
  cashflow:         Wallet,
  payroll:          Users,
  expenses:         Receipt,
  contracts:        FileText,
  inventory:        Archive,
};

const FINANCIAL_TEMPLATES = [
  {
    id: "income_statement",
    name: "قائمة الدخل",
    columns: [
      { key:"col1", label:"البيان",     type:"text",     width:200 },
      { key:"col2", label:"الفئة",      type:"select",   width:140, options:["إيرادات","مصروفات","مصروفات إدارية","تكاليف"] },
      { key:"col3", label:"المبلغ",     type:"currency", width:150 },
      { key:"col4", label:"الشهر",      type:"select",   width:120, options:["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"] },
      { key:"col5", label:"السنة",      type:"number",   width:100 },
      { key:"col6", label:"ملاحظات",    type:"text",     width:200 },
    ],
  },
  {
    id: "cashflow",
    name: "التدفق النقدي",
    
    columns: [
      { key:"col1", label:"التاريخ",     type:"date",     width:140 },
      { key:"col2", label:"البيان",      type:"text",     width:200 },
      { key:"col3", label:"نوع الحركة", type:"select",   width:140, options:["وارد","صادر","تحويل"] },
      { key:"col4", label:"المبلغ",      type:"currency", width:150 },
      { key:"col5", label:"الرصيد",     type:"formula",  width:150, formula:"col4" },
      { key:"col6", label:"طريقة الدفع",type:"select",   width:140, options:["نقدي","بنك","شيك","تحويل"] },
      { key:"col7", label:"المرجع",      type:"text",     width:150 },
    ],
  },
  {
    id: "payroll",
    name: "مسير الرواتب",
    
    columns: [
      { key:"col1", label:"الموظف",      type:"text",     width:180 },
      { key:"col2", label:"الوظيفة",     type:"text",     width:150 },
      { key:"col3", label:"الراتب الأساسي",type:"currency",width:150 },
      { key:"col4", label:"البدلات",     type:"currency", width:130 },
      { key:"col5", label:"الخصومات",    type:"currency", width:130 },
      { key:"col6", label:"صافي الراتب",type:"formula",  width:150, formula:"col3 + col4 - col5" },
      { key:"col7", label:"تاريخ الصرف",type:"date",     width:140 },
    ],
  },
  {
    id: "expenses",
    name: "المصروفات اليومية",
    
    columns: [
      { key:"col1", label:"التاريخ",     type:"date",     width:140 },
      { key:"col2", label:"البند",       type:"text",     width:200 },
      { key:"col3", label:"الفئة",       type:"select",   width:150, options:["مواصلات","طعام","كهرباء","ماء","هاتف","إنترنت","صيانة","متفرقات"] },
      { key:"col4", label:"المبلغ",      type:"currency", width:150 },
      { key:"col5", label:"المسؤول",     type:"text",     width:150 },
      { key:"col6", label:"الفاتورة",    type:"text",     width:130 },
    ],
  },
  {
    id: "contracts",
    name: "العقود والمبيعات",
    
    columns: [
      { key:"col1", label:"رقم العقد",   type:"text",     width:140 },
      { key:"col2", label:"العميل",      type:"text",     width:180 },
      { key:"col3", label:"المشروع",     type:"text",     width:180 },
      { key:"col4", label:"قيمة العقد",  type:"currency", width:150 },
      { key:"col5", label:"المدفوع",     type:"currency", width:150 },
      { key:"col6", label:"المتبقي",     type:"formula",  width:150, formula:"col4 - col5" },
      { key:"col7", label:"تاريخ التعاقد",type:"date",   width:140 },
      { key:"col8", label:"الحالة",      type:"select",   width:130, options:["قيد التنفيذ","مكتمل","ملغي","متأخر"] },
    ],
  },
  {
    id: "inventory",
    name: "المخزون والمشتريات",
    
    columns: [
      { key:"col1", label:"الصنف",       type:"text",     width:200 },
      { key:"col2", label:"الكمية",      type:"number",   width:120 },
      { key:"col3", label:"سعر الوحدة", type:"currency", width:150 },
      { key:"col4", label:"الإجمالي",    type:"formula",  width:150, formula:"col2 * col3" },
      { key:"col5", label:"المورد",      type:"text",     width:180 },
      { key:"col6", label:"تاريخ الشراء",type:"date",    width:140 },
      { key:"col7", label:"الحالة",      type:"select",   width:130, options:["متوفر","نفد","طلبية معلقة"] },
    ],
  },
];

// ─── Sheet Table ─────────────────────────────────────────────────────────────

function SheetTable({ ledgerId, sheet, onUpdate, printRef }) {
  const toast = useToast();
  const { user } = useAuth();
  const [rows, setRows] = useState((sheet.rows || []).filter(Boolean));
  const [editCell, setEditCell] = useState(null);
  const [cellVal, setCellVal] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  const [addingRow, setAddingRow] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0); // 0-100
  const [importModal, setImportModal] = useState(null); // { fileName, headers, previewRows, allRows, columns, mode:"new"|"current" }
  const [activeTab, setActiveTab] = useState("table"); // "table" | "charts" | "quick" | "excel" | "rates" | "audit"
  const [statsOpen, setStatsOpen] = useState(false);
  const [formulaBarVal, setFormulaBarVal] = useState(""); // current cell value shown in formula bar
  const [selectedCell, setSelectedCell] = useState(null); // { rowIdx, colKey, rowId }
  const [quickFilter, setQuickFilter] = useState("");
  const [notePopover, setNotePopover] = useState(null); // { rowId, value }
  const [hiddenCols, setHiddenCols] = useState(new Set());
  const [colsMenuOpen, setColsMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState(14); // px
  const [showDeletedRows, setShowDeletedRows] = useState(false);
  const [colWidths, setColWidths] = useState({}); // { [colKey]: px }
  const [rowHeight, setRowHeight] = useState("normal"); // "compact" | "normal" | "comfortable"
  const [aiOpen, setAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  const getColWidth = (col) => colWidths[col.key] ?? col.width ?? 120;

  const handleColResize = (e, colKey, startWidth) => {
    e.preventDefault();
    const startX = e.clientX;
    const onMove = (me) => {
      // RTL: dragging left (decreasing clientX) → increasing width
      const delta = startX - me.clientX;
      setColWidths((prev) => ({ ...prev, [colKey]: Math.max(60, startWidth + delta) }));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const ROW_HEIGHTS = { compact: "py-0.5", normal: "py-2", comfortable: "py-4" };

  const allCols = sheet.columns || [];
  const cols = allCols.filter((c) => !hiddenCols.has(c.key));
  const toggleCol = (key) => setHiddenCols((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });
  const isAdmin = user?.role === "admin";

  // ── inline editing (keyed by rowId) ──
  const startEdit = (rowId, colKey, rowIdx) => {
    const col = cols.find((c) => c.key === colKey);
    if (col?.type === "formula") return;
    const row = rows.find((r) => r._id === rowId);
    const val = row?.cells?.[colKey] ?? "";
    setEditCell({ rowId, colKey });
    setCellVal(val);
    setSelectedCell({ rowIdx, colKey, rowId });
    setFormulaBarVal(col?.type === "formula" ? (col.formula || "") : val);
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
      if (isAdmin) {
        // Admin: soft delete — mark as deleted in local state
        setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, isDeleted: true, deletedAt: new Date() } : r));
      } else {
        setRows((prev) => prev.filter((r) => r._id !== rowId));
      }
      setSelected((prev) => { const s = new Set(prev); s.delete(rowId); return s; });
    } catch { toast.error("فشل حذف السطر"); }
  };

  // ── restore single row (admin only) ──
  const restoreRow = async (rowId) => {
    try {
      await api.put(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${rowId}/restore`);
      setRows((prev) => prev.map((r) => r._id === rowId ? { ...r, isDeleted: false, deletedAt: null } : r));
      toast.success("تم استعادة السطر");
    } catch { toast.error("فشل استعادة السطر"); }
  };

  // ── bulk delete ──
  const bulkDelete = async () => {
    setDeleting(true);
    try {
      await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/bulk-delete`, { rowIds: [...selected] });
      if (isAdmin) {
        // Admin: soft delete
        const selectedArr = [...selected];
        setRows((prev) => prev.map((r) => selectedArr.includes(r._id) ? { ...r, isDeleted: true, deletedAt: new Date() } : r));
      } else {
        setRows((prev) => prev.filter((r) => !selected.has(r._id)));
      }
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
      ? activeRows.filter((r) => {
          const q = quickFilter.toLowerCase();
          return Object.values(r.cells || {}).some((v) => String(v ?? "").toLowerCase().includes(q));
        })
      : activeRows).map((r) => r._id);
    const allSelected = visibleIds.every((id) => selected.has(id));
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(visibleIds));
  };

  // ── Smart column type detection ──────────────────────────────────────────
  const detectColType = (colIndex, dataRows) => {
    const samples = dataRows.slice(0, 80)
      .map((r) => r[colIndex])
      .filter((v) => v !== "" && v !== null && v !== undefined);
    if (samples.length === 0) return "text";

    const isDate = (v) => {
      if (v instanceof Date) return true;
      const s = String(v).trim();
      return /^\d{1,4}[-/]\d{1,2}[-/]\d{1,4}$/.test(s) || /^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(s);
    };
    const isNum = (v) => {
      if (typeof v === "number") return true;
      const cleaned = String(v).replace(/[\s,،]/g, "").replace(/^-/, "");
      return /^[\d.]+$/.test(cleaned) && !isNaN(parseFloat(cleaned));
    };

    const datePct = samples.filter(isDate).length / samples.length;
    const numPct  = samples.filter(isNum).length  / samples.length;

    if (datePct >= 0.7) return "date";
    if (numPct  >= 0.8) {
      const nums = samples.filter(isNum).map((v) => parseFloat(String(v).replace(/[\s,،]/g, "")));
      const avg  = nums.reduce((a, b) => a + b, 0) / nums.length;
      return avg > 500 ? "currency" : "number";
    }
    return "text";
  };

  // ── helper: serialise a raw cell value ──────────────────────────────────
  const serializeCell = (val) => {
    if (val == null) return "";
    if (val instanceof Date) return val.toISOString().slice(0, 10);
    if (typeof val === "boolean") return val ? "نعم" : "لا";
    return String(val).trim();
  };

  // ── helper: parse one workbook sheet into { headers, dataRows, columns } ─
  const parseWbSheet = (ws, sheetName) => {
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", blankrows: false, dateNF: "yyyy-mm-dd" });
    const firstIdx = rawData.findIndex((row) => row.some((c) => c !== ""));
    if (firstIdx === -1 || rawData.length - firstIdx < 2) return null;
    const headerRow = rawData[firstIdx];
    const dataRows  = rawData.slice(firstIdx + 1).filter((row) => row.some((c) => c !== "" && c !== null && c !== undefined));
    if (!dataRows.length) return null;
    const columns = headerRow.map((h, i) => ({
      key:   `col${i + 1}`,
      label: String(h || "").trim() || `عمود ${i + 1}`,
      type:  detectColType(i, dataRows),
      width: Math.min(220, Math.max(100, String(h || "").length * 10 + 60)),
    }));
    return { name: sheetName, headers: headerRow.map((h) => String(h || "").trim()), dataRows, columns };
  };

  // ── Excel / CSV / ODS Import — step 1: parse + show preview modal ────────
  const handleExcelImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const ext   = file.name.split(".").pop().toLowerCase();
      const isCSV = ext === "csv" || ext === "tsv";
      let wb;
      if (isCSV) {
        const text = await file.text();
        wb = XLSX.read(text, { type: "string", FS: ext === "tsv" ? "\t" : "," });
      } else {
        const buf = await file.arrayBuffer();
        wb = XLSX.read(new Uint8Array(buf), {
          type: "array", cellDates: true, cellNF: false, raw: false, WTF: false, dense: false,
        });
      }
      if (!wb?.SheetNames?.length) { toast.error("لا يمكن قراءة الملف — تأكد أنه صالح وغير محمي"); return; }

      // Parse ALL sheets in the workbook
      const parsedSheets = wb.SheetNames
        .map((sn) => parseWbSheet(wb.Sheets[sn], sn))
        .filter(Boolean);

      if (!parsedSheets.length) { toast.error("الملف فارغ أو لا يحتوي على بيانات"); return; }

      // All sheets checked by default; preview the first one
      const checkedSheets = new Set(parsedSheets.map((s) => s.name));

      setImportModal({
        fileName:      file.name,
        parsedSheets,           // all parsed sheets
        checkedSheets,          // which sheets to import (Set of names)
        previewSheetIdx: 0,     // which sheet to preview
        mode:          "new",   // "new" | "current"
      });
    } catch (err) {
      const msg = err?.message || "";
      if (msg.includes("password") || msg.includes("encrypt")) toast.error("الملف محمي بكلمة مرور — قم بإزالتها أولاً");
      else if (msg.includes("CFB") || msg.includes("magic")) toast.error("صيغة الملف غير مدعومة — جرب حفظه بصيغة .xlsx");
      else toast.error(`فشل قراءة الملف: ${msg || "تأكد أن الملف صالح"}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Import — step 2: confirm & bulk-send to API ──────────────────────────
  const confirmImport = async () => {
    if (!importModal) return;
    const { parsedSheets, checkedSheets, mode } = importModal;
    const sheetsToImport = parsedSheets.filter((s) => checkedSheets.has(s.name));
    if (!sheetsToImport.length) { toast.error("اختر ورقة واحدة على الأقل"); return; }

    setImporting(true);
    setImportProgress(0);

    const CHUNK = 1000;
    let totalRows = sheetsToImport.reduce((sum, s) => sum + s.dataRows.length, 0);
    let doneRows = 0;

    try {
      for (const ps of sheetsToImport) {
        let targetSheetId = sheet?._id;

        if (mode === "new" || sheetsToImport.length > 1) {
          const sheetRes = await api.post(`/accounting/${ledgerId}/sheets`, { name: ps.name, columns: ps.columns });
          targetSheetId = sheetRes.data.sheet._id;
        }

        const rowsPayload = ps.dataRows.map((row) => {
          const cells = {};
          ps.columns.forEach((col, i) => { cells[col.key] = serializeCell(row[i]); });
          return { cells };
        });

        for (let start = 0; start < rowsPayload.length; start += CHUNK) {
          const chunk = rowsPayload.slice(start, start + CHUNK);
          await api.post(`/accounting/${ledgerId}/sheets/${targetSheetId}/rows/bulk-import`, { rows: chunk });
          doneRows += chunk.length;
          setImportProgress(Math.round((doneRows / totalRows) * 100));
        }
      }

      const sheetWord = sheetsToImport.length > 1 ? `${sheetsToImport.length} أوراق` : `"${sheetsToImport[0].name}"`;
      toast.success(`تم استيراد ${doneRows} سطر من ${sheetWord} بنجاح`);
      setImportModal(null);
      onUpdate && onUpdate("reload");
    } catch (err) {
      toast.error("فشل الاستيراد — " + (err?.response?.data?.message || err?.message || "حاول مرة أخرى"));
    } finally {
      setImporting(false);
      setImportProgress(0);
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
      const cells = cols.map((c) => {
        const v = c.type === "formula"
          ? evaluateFormula(c.formula || "", row.cells || {})
          : (row.cells?.[c.key] ?? "");
        return `<td>${formatCell(v, c.type) || ""}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");

    // Totals row
    const totalsCells = cols.map((c, i) => {
      if (i === 0) return `<td><b>الإجمالي</b></td>`;
      const t = sumColumn(targetRows, c.key, c.type, c);
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
  const activeRows = showDeletedRows
    ? rows.filter((r) => r && r.isDeleted)
    : rows.filter((r) => r && !r.isDeleted);

  const filteredRows = quickFilter.trim()
    ? activeRows.filter((r) => {
        const q = quickFilter.toLowerCase();
        return Object.values(r.cells || {}).some((v) =>
          String(v ?? "").toLowerCase().includes(q)
        );
      })
    : activeRows;

  // ── export CSV ──
  const exportCsv = () => {
    const header = cols.map((c) => `"${c.label}"`).join(",");
    const rowsData = (selected.size > 0 ? rows.filter((r) => selected.has(r._id)) : rows)
      .map((row) => cols.map((c) => {
        const val = c.type === "formula"
          ? evaluateFormula(c.formula || "", row.cells || {})
          : (row.cells?.[c.key] ?? "");
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(","));
    const csv = [header, ...rowsData].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${sheet.name}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Excel export via Python microservice ──
  const exportExcelPython = async () => {
    const targetRows = selected.size > 0
      ? filteredRows.filter((r) => selected.has(r._id))
      : filteredRows;
    if (targetRows.length === 0) { toast.error("لا توجد بيانات للتصدير"); return; }

    const PYTHON_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";
    try {
      toast.info?.("جاري التصدير...");
      const res = await fetch(`${PYTHON_URL}/export/excel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheet_name: sheet.name,
          ledger_name: sheet.ledgerName || null,
          columns: cols.map((c) => ({ key: c.key, label: c.label, type: c.type, formula: c.formula || null })),
          rows: targetRows.map((r) => ({ cells: r.cells || {} })),
          include_totals: true,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "فشل التصدير");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sheet.name}_${new Date().toLocaleDateString("ar-EG").replace(/\//g, "-")}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير الملف بنجاح");
    } catch (err) {
      toast.error(`فشل التصدير: ${err.message}`);
    }
  };

  // ── AI data analysis ──
  const runAiAnalysis = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await api.post("/ai/analyze-data", {
        data: filteredRows.slice(0, 100),
        sheetName: sheet.name,
        question: aiQuery,
      });
      setAiResult(res.data.reply);
    } catch (err) {
      setAiResult(`فشل التحليل: ${err.response?.data?.message || err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">

      {/* ══ Excel Ribbon ══ */}
      <div className="flex-shrink-0 bg-[#217346] text-white">
        {/* View tabs (like Excel's ribbon tabs) */}
        <div className="flex items-center gap-0 px-2 pt-1">
          {[
            { id:"table",  label:"البيانات",    icon:Table2      },
            { id:"charts", label:"مخططات",      icon:BarChart3   },
            { id:"quick",  label:"إدخال سريع",  icon:Zap         },
            { id:"rates",  label:"معدلات",       icon:Activity    },
            { id:"excel",  label:"Excel",        icon:Grid3x3     },
            ...(isAdmin ? [{ id:"audit", label:"سجل العمليات", icon:ClipboardList }] : []),
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md transition-all whitespace-nowrap ${
                activeTab === id
                  ? "bg-white text-[#217346]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}>
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        {/* Ribbon tools (only for table view) */}
        {activeTab === "table" && (
          <div className="flex items-center gap-1 px-2 py-1.5 bg-white border-b border-gray-200 flex-wrap">
            {/* Group 1: Add/Import */}
            <div className="flex items-center gap-1">
              <button onClick={() => setAddingRow(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-[#217346] text-white hover:bg-[#1a5c38] transition-colors">
                <Plus className="w-3.5 h-3.5" /> إضافة صف
              </button>
              <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${importing ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-3.5 h-3.5 text-[#217346]" />
                {importing ? "استيراد..." : "استيراد Excel"}
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.ods,.tsv" className="hidden" onChange={handleExcelImport} />
              </label>
            </div>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            {/* Group 2: Export */}
            <div className="flex items-center gap-1">
              <button onClick={exportCsv} title="تصدير CSV"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={exportExcelPython} title="تصدير Excel"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#217346] border border-[#217346]/40 hover:bg-green-50 transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => handlePrint(false)} title="تصدير PDF"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            {/* Group 3: Print */}
            <div className="flex items-center gap-1">
              <button onClick={() => handlePrint(false)} title="طباعة"
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
              {selected.size > 0 && (
                <button onClick={() => handlePrint(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#2d5d89] border border-[#2d5d89]/40 hover:bg-blue-50 transition-colors">
                  <Printer className="w-3.5 h-3.5" /> طباعة المحدد ({selected.size})
                </button>
              )}
            </div>
            <div className="w-px h-5 bg-gray-300 mx-1" />
            {/* Group 4: View controls */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <button onClick={() => setColsMenuOpen((p) => !p)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                  <EyeIcon className="w-3.5 h-3.5" /> الأعمدة
                </button>
                {colsMenuOpen && (
                  <div className="absolute right-0 top-8 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 w-52 max-h-64 overflow-auto" dir="rtl">
                    <p className="text-[10px] font-bold text-gray-400 px-2 pb-1 uppercase">إظهار / إخفاء</p>
                    {allCols.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                        <input type="checkbox" checked={!hiddenCols.has(c.key)} onChange={() => toggleCol(c.key)} className="accent-[#217346]" />
                        <span className="flex-1 text-gray-700">{c.label}</span>
                        {hiddenCols.has(c.key) ? <EyeOff className="w-3 h-3 text-gray-300" /> : <EyeIcon className="w-3 h-3 text-[#217346]" />}
                      </label>
                    ))}
                    <div className="flex gap-1 mt-1 pt-1 border-t border-gray-100">
                      <button onClick={() => setHiddenCols(new Set())} className="flex-1 text-[10px] px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600">إظهار الكل</button>
                      <button onClick={() => setColsMenuOpen(false)} className="flex-1 text-[10px] px-2 py-1 rounded bg-[#217346] text-white">تم</button>
                    </div>
                  </div>
                )}
              </div>
              {/* Font size */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setFontSize(s => Math.max(10, s - 1))} className="px-1.5 py-1 hover:bg-gray-100 text-gray-600 text-xs">−</button>
                <span className="px-1.5 text-xs text-gray-600 min-w-[24px] text-center border-x border-gray-300">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(20, s + 1))} className="px-1.5 py-1 hover:bg-gray-100 text-gray-600 text-xs">+</button>
              </div>
              {/* Row height */}
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                {[{id:"compact",label:"م"},{id:"normal",label:"ع"},{id:"comfortable",label:"ر"}].map(({id,label})=>(
                  <button key={id} onClick={() => setRowHeight(id)} title={id === "compact" ? "مضغوط" : id === "normal" ? "عادي" : "مريح"}
                    className={`px-2 py-1 text-xs transition-colors ${rowHeight===id?"bg-[#217346] text-white":"hover:bg-gray-100 text-gray-600"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Search */}
            <div className="mr-auto relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="بحث في الجدول..."
                className="pr-7 pl-3 py-1 rounded border border-gray-300 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#217346] w-44" />
            </div>
            {/* Bulk delete */}
            {selected.size > 0 && (
              <button onClick={() => setConfirmBulk(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> حذف ({selected.size})
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ Formula Bar (Excel style) ══ */}
      {activeTab === "table" && (
        <div className="flex items-center gap-0 border-b border-gray-300 bg-white flex-shrink-0 h-8">
          {/* Name box */}
          <div className="w-24 border-l border-gray-300 h-full flex items-center justify-center px-2 bg-white flex-shrink-0">
            <span className="text-xs font-medium text-gray-600 font-mono">
              {selectedCell ? `${String.fromCharCode(65 + cols.findIndex(c=>c.key===selectedCell.colKey))}${(selectedCell.rowIdx||0)+1}` : ""}
            </span>
          </div>
          {/* fx icon */}
          <div className="w-8 h-full border-l border-gray-300 flex items-center justify-center flex-shrink-0 bg-gray-50">
            <span className="text-xs text-gray-500 font-italic font-serif italic select-none">fx</span>
          </div>
          {/* Formula input */}
          <input
            value={formulaBarVal}
            onChange={(e) => { setFormulaBarVal(e.target.value); setCellVal(e.target.value); }}
            onKeyDown={(e) => { if (e.key === "Enter" && editCell) { handleCellBlur(); } }}
            placeholder={selectedCell ? "" : "اختر خلية للتعديل..."}
            className="flex-1 h-full px-3 text-xs text-gray-800 focus:outline-none bg-white font-mono"
          />
        </div>
      )}

      {activeTab === "audit" && isAdmin ? (
        <AuditLogPanel />
      ) : activeTab === "charts" ? (
        <div className="flex-1 overflow-auto">
          <FinancialCharts rows={filteredRows} cols={allCols} />
        </div>
      ) : activeTab === "quick" ? (
        <div className="space-y-4 overflow-auto">
          <QuickEntryPanel
            cols={allCols}
            saving={saving}
            onAdd={async (data) => {
              setSaving(true);
              try {
                const res = await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows`, { cells: data });
                setRows((prev) => [...prev, res.data.row]);
              } catch { throw new Error("فشل الإضافة"); }
              finally { setSaving(false); }
            }}
          />
          {/* Also show table below quick entry */}
          <div className="rounded-2xl border border-gray-200 overflow-auto max-h-[40vh]">
            <table className="w-full min-w-max text-sm">
              <thead className="sticky top-0 bg-[#2d5d89] text-white">
                <tr>
                  {cols.map((c) => (
                    <th key={c.key} className="px-3 py-2 text-right text-xs font-semibold whitespace-nowrap">{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.slice(-20).reverse().map((row, i) => (
                  <tr key={row._id} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                    {cols.map((c) => (
                      <td key={c.key} className="px-3 py-1.5 text-xs text-gray-700 whitespace-nowrap">
                        {formatCell(getDisplayCellValue(row, c), c.type) || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "rates" ? (
        <RatesPanel rows={filteredRows} cols={cols} />
      ) : activeTab === "excel" ? (
        <div className="flex-1 overflow-hidden pb-2">
          <SpreadsheetEditor
            cols={cols}
            rows={filteredRows}
            sheetId={sheet?._id || "accounting"}
          />
        </div>
      ) : (
        <>
          {/* Stats bar (collapsible) */}
          {statsOpen && (
            <div className="overflow-x-auto border-b border-gray-200 bg-[#f9fafb] flex-shrink-0">
              <div className="flex gap-0 min-w-max">
                {cols.filter((c) => ["currency","number","percentage","formula"].includes(c.type)).map((c) => {
                  const s = colStats(filteredRows, c);
                  if (!s) return null;
                  return (
                    <div key={c.key} className="border-l border-gray-200 px-4 py-2 min-w-[140px]">
                      <p className="text-[10px] text-gray-400 truncate font-medium">{c.label}</p>
                      <p className="text-sm font-bold text-[#217346]">{formatCell(s.sum, c.type)}</p>
                      <div className="flex gap-3 mt-0.5 text-[10px] text-gray-400">
                        <span>م: {formatCell(s.avg, c.type)}</span>
                        <span>أعلى: {formatCell(s.max, c.type)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toolbar — Excel ribbon style */}
          <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center gap-1 flex-wrap mb-2">
            {/* Group 1: Search + row count */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input value={quickFilter} onChange={(e) => setQuickFilter(e.target.value)}
                  placeholder="بحث سريع..."
                  className="w-44 pr-8 pl-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#2d5d89] focus:border-[#2d5d89]" />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap font-medium bg-white border border-gray-200 px-2 py-1 rounded-lg">
                {filteredRows.length} / {activeRows.length} سطر
              </span>
              {selected.size > 0 && (
                <span className="text-xs font-semibold text-[#2d5d89] bg-[#2d5d89]/10 px-2 py-1 rounded-lg whitespace-nowrap">{selected.size} محدد</span>
              )}
              {isAdmin && rows.some(r => r.isDeleted) && (
                <button onClick={() => setShowDeletedRows(p => !p)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    showDeletedRows
                      ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}>
                  <Trash2 className="w-3.5 h-3.5" />
                  {showDeletedRows ? "عرض النشطة" : `محذوف (${rows.filter(r => r.isDeleted).length})`}
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Group 2: Primary actions */}
            <div className="flex items-center gap-1">
              <label className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-medium cursor-pointer border border-indigo-200 transition-colors ${importing ? "opacity-50 pointer-events-none" : ""}`}>
                <Upload className="w-3.5 h-3.5" />
                {importing ? "استيراد..." : "استيراد"}
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.ods,.tsv,.numbers" className="hidden" onChange={handleExcelImport} />
              </label>
              <button onClick={() => setAddingRow(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-semibold shadow-sm transition-colors">
                <Plus className="w-3.5 h-3.5" /> سطر جديد
              </button>
              {selected.size > 0 && (
                <button onClick={() => setConfirmBulk(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium border border-red-200">
                  <Trash2 className="w-3.5 h-3.5" /> حذف ({selected.size})
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Group 3: Export */}
            <div className="flex items-center gap-1">
              <button onClick={exportCsv}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-medium border border-gray-200 hover:border-emerald-300 transition-colors">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={exportExcelPython}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-green-50 text-green-700 text-xs font-medium border border-gray-200 hover:border-green-300 transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button onClick={() => handlePrint(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white hover:bg-red-50 text-red-600 rounded-lg border border-gray-200 hover:border-red-300 transition-colors font-medium">
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Group 4: Print */}
            <div className="flex items-center gap-1">
              {selected.size > 0 && (
                <button onClick={() => handlePrint(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-medium transition-colors">
                  <Printer className="w-3.5 h-3.5" /> طباعة ({selected.size})
                </button>
              )}
              <button onClick={() => handlePrint(false)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 transition-colors">
                <Printer className="w-3.5 h-3.5" /> طباعة
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />

            {/* Group 5: View controls */}
            <div className="flex items-center gap-1">
              {/* Columns visibility */}
              <div className="relative">
                <button onClick={() => setColsMenuOpen((p) => !p)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 transition-colors">
                  <EyeIcon className="w-3.5 h-3.5" /> الأعمدة
                </button>
                {colsMenuOpen && (
                  <div className="absolute left-0 top-9 z-30 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 w-56 max-h-72 overflow-auto" dir="rtl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase px-2 pb-1">إظهار/إخفاء الأعمدة</p>
                    {allCols.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={!hiddenCols.has(c.key)}
                          onChange={() => toggleCol(c.key)}
                          className="accent-[#2d5d89]"
                        />
                        <span className="flex-1 text-gray-700">{c.label}</span>
                        {hiddenCols.has(c.key) ? <EyeOff className="w-3 h-3 text-gray-300" /> : <EyeIcon className="w-3 h-3 text-[#2d5d89]" />}
                      </label>
                    ))}
                    <div className="flex justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
                      <button onClick={() => setHiddenCols(new Set())}
                        className="flex-1 text-[10px] px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600">إظهار الكل</button>
                      <button onClick={() => setColsMenuOpen(false)}
                        className="flex-1 text-[10px] px-2 py-1 rounded-lg bg-[#2d5d89] text-white hover:bg-[#245079]">تم</button>
                    </div>
                  </div>
                )}
              </div>
              {/* Font size */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white" title="حجم الخط">
                <button onClick={() => setFontSize(s => Math.max(10, s - 2))}
                  className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 text-sm font-bold transition-colors">−</button>
                <span className="px-1.5 text-xs text-gray-500 min-w-[28px] text-center border-x border-gray-200">{fontSize}</span>
                <button onClick={() => setFontSize(s => Math.min(24, s + 2))}
                  className="px-2 py-1.5 hover:bg-gray-100 text-gray-600 text-sm font-bold transition-colors">+</button>
              </div>
              {/* Row height */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white" title="ارتفاع الصفوف">
                {[
                  { id: "compact",     label: "م" },
                  { id: "normal",      label: "ع" },
                  { id: "comfortable", label: "و" },
                ].map(({ id, label }) => (
                  <button key={id} onClick={() => setRowHeight(id)} title={id === "compact" ? "مضغوط" : id === "normal" ? "عادي" : "مريح"}
                    className={`px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 first:border-l-0 ${
                      rowHeight === id ? "bg-[#2d5d89] text-white" : "text-gray-500 hover:bg-gray-50"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table — Excel style */}
          <div className="flex-1 overflow-auto border-t border-gray-300" style={{ background: "#fff" }}>
            <div ref={printRef}>
              <table className="w-full min-w-max border-collapse" style={{ fontSize: `${fontSize}px` }}>
                <thead className="sticky top-0 z-10">
                  <tr className="text-gray-600 bg-[#f2f2f2] border-b-2 border-gray-400" style={{ fontFamily: "Calibri, Arial, sans-serif" }}>
                    {/* Row # header */}
                    <th className="w-12 px-2 py-2 text-center text-xs font-normal text-gray-500 select-none border-l border-r border-gray-300 bg-[#f2f2f2] sticky right-0 z-20 border-b border-gray-400" style={{ minWidth: 40 }}></th>
                    {/* Checkbox header */}
                    <th className="w-8 px-2 py-2 bg-[#f2f2f2] border-l border-gray-300 border-b border-gray-400">
                      <input type="checkbox"
                        checked={filteredRows.length > 0 && filteredRows.every((r) => selected.has(r._id))}
                        onChange={toggleAll}
                        className="cursor-pointer accent-[#217346]" />
                    </th>
                    {cols.map((col, ci) => (
                      <th key={col.key}
                        className="px-3 py-2 text-right font-semibold whitespace-nowrap text-xs border-l border-gray-300 border-b border-gray-400 bg-[#f2f2f2] relative group/th select-none hover:bg-[#e8e8e8] transition-colors"
                        style={{ width: getColWidth(col), minWidth: 60 }}>
                        <span className="text-gray-700">{col.label}</span>
                        <div
                          className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[#217346] opacity-0 group-hover/th:opacity-100 transition-opacity"
                          onMouseDown={(e) => handleColResize(e, col.key, getColWidth(col))}
                        />
                      </th>
                    ))}
                    <th className="w-8 bg-[#f2f2f2] border-l border-gray-300 border-b border-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 && !addingRow && (
                    <tr>
                      <td colSpan={cols.length + 3} className="text-center py-12 text-gray-400 text-sm">
                        <Table2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        لا توجد بيانات — اضغط "سطر جديد" لإضافة البيانات
                      </td>
                    </tr>
                  )}
                  {filteredRows.map((row, rowIdx) => (
                    <tr key={row._id}
                      className={`border-b border-gray-100 transition-colors group ${
                        row.isDeleted
                          ? "bg-red-50/40 opacity-70"
                          : selected.has(row._id)
                          ? "bg-blue-50"
                          : rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      } hover:bg-blue-50/40`}>
                      {/* Row number — Excel style */}
                      <td className="w-12 px-2 text-center text-[11px] text-gray-500 select-none font-mono sticky right-0 z-10 border-l border-r border-gray-300 border-b border-gray-200"
                        style={{ background: selectedCell?.rowId === row._id ? "#dce6f1" : "#f2f2f2", minWidth: 40 }}>
                        {rowIdx + 1}
                      </td>
                      {/* Checkbox */}
                      <td className="px-2 w-8 border-l border-gray-200 border-b border-gray-200">
                        <input type="checkbox" checked={selected.has(row._id)} onChange={() => toggleRow(row._id)}
                          className="cursor-pointer accent-[#217346]" />
                      </td>
                      {cols.map((col, ci) => {
                        const isEditing = editCell?.rowId === row._id && editCell?.colKey === col.key;
                        const isSelected = selectedCell?.rowId === row._id && selectedCell?.colKey === col.key;
                        const val = col.type === "formula"
                          ? evaluateFormula(col.formula || "", row.cells || {})
                          : (row.cells?.[col.key] ?? "");
                        const isFormula = col.type === "formula";
                        return (
                          <td key={col.key}
                            style={{ width: getColWidth(col), minWidth: 60, maxWidth: getColWidth(col) }}
                            className={`border-l border-b border-gray-200 ${ROW_HEIGHTS[rowHeight]} cursor-pointer relative ${
                              isSelected ? "outline outline-2 outline-[#217346] outline-offset-[-2px] z-10" : ""
                            }`}
                            onClick={() => setSelectedCell({ rowIdx, colKey: col.key, rowId: row._id })}
                            onDoubleClick={() => startEdit(row._id, col.key, rowIdx)}>
                            {isEditing ? (
                              <CellInput col={col} value={cellVal} onChange={setCellVal}
                                onBlur={handleCellBlur} onKeyDown={handleCellKey} />
                            ) : (
                              <div className={`px-2 py-0.5 h-full whitespace-nowrap overflow-hidden text-ellipsis ${
                                isFormula ? "text-[#217346] font-medium" : "text-gray-800"
                              } ${isSelected ? "bg-[#e2efda]/50" : ""}`}
                                style={{ fontFamily: "Calibri, Arial, sans-serif" }}>
                                {formatCell(val, col.type) || ""}
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
                          {row.isDeleted ? (
                            isAdmin && (
                              <button onClick={() => restoreRow(row._id)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"
                                title="استعادة السطر">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            <button onClick={() => deleteRow(row._id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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
                      <td className="w-8 px-1 py-2 text-center text-[10px] text-emerald-400 select-none sticky right-0 bg-emerald-50/80 border-l border-emerald-100">*</td>
                      <td className="px-3 py-2 w-10 text-emerald-500">
                        <Plus className="w-4 h-4 mx-auto" />
                      </td>
                      {cols.map((col) => (
                        <td key={col.key} className="px-1 py-1" style={{ minWidth: col.width || 120 }}>
                          {col.type === "date" ? (
                            <ArabicDatePicker
                              value={newRowData[col.key] || ""}
                              onChange={(v) => setNewRowData({ ...newRowData, [col.key]: v })}
                              placeholder={col.label}
                            />
                          ) : (
                            <input
                              type={col.type === "number" || col.type === "currency" ? "number" : "text"}
                              value={newRowData[col.key] || ""}
                              onChange={(e) => setNewRowData({ ...newRowData, [col.key]: e.target.value })}
                              placeholder={col.label}
                              className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          )}
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
                    <tr className="bg-[#2d5d89]/5 font-bold border-t-2 border-[#2d5d89] sticky bottom-0">
                      <td className="w-8 px-1 py-3 sticky right-0 bg-[#2d5d89]/5 border-l border-[#2d5d89]/20" />
                      <td className="px-3 py-3 text-xs text-[#2d5d89] whitespace-nowrap font-bold" colSpan={2}>
                        الإجمالي
                      </td>
                      {cols.slice(1).map((col) => {
                        const total = sumColumn(filteredRows, col.key, col.type, col);
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

          {/* ── Excel Status Bar ── */}
          <div className="flex-shrink-0 bg-[#217346] text-white flex items-center justify-between px-4 py-1 text-xs select-none">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-white/70">
                <Table2 className="w-3 h-3" />
                {filteredRows.length} صف
                {selected.size > 0 && <span className="text-white font-semibold mr-2">• {selected.size} محدد</span>}
              </span>
              {(() => {
                const numCols = cols.filter(c => ["currency","number","formula"].includes(c.type));
                if (!numCols.length || !selected.size) return null;
                const vals = [];
                filteredRows.filter(r => selected.has(r._id)).forEach(r => {
                  numCols.forEach(c => {
                    const v = c.type === "formula" ? parseFloat(evaluateFormula(c.formula||"", r.cells||{})) : parseFloat(r.cells?.[c.key]);
                    if (!isNaN(v)) vals.push(v);
                  });
                });
                if (!vals.length) return null;
                const sum = vals.reduce((a,b)=>a+b,0);
                const avg = sum / vals.length;
                return (
                  <span className="flex items-center gap-3 text-white/80">
                    <span>المجموع: <strong className="text-white">{sum.toLocaleString("ar-EG")}</strong></span>
                    <span>المتوسط: <strong className="text-white">{avg.toFixed(2)}</strong></span>
                    <span>العدد: <strong className="text-white">{vals.length}</strong></span>
                  </span>
                );
              })()}
              <button onClick={() => setStatsOpen(p => !p)}
                className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
                <BarChart3 className="w-3 h-3" />
                {statsOpen ? "إخفاء المعدلات" : "عرض المعدلات"}
              </button>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              {Object.keys(colWidths).length > 0 && (
                <button onClick={() => setColWidths({})} className="hover:text-white transition-colors">إعادة ضبط الأعمدة</button>
              )}
              <span>انقر مرتين للتعديل</span>
            </div>
          </div>
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

      {/* Inline AI Chat — embedded at the bottom of every sheet */}
      <InlineAiChat
        context="accounting"
        pageData={{ sheetName: sheet?.name, rowCount: filteredRows.length, cols: cols.map(c => c.label) }}
      />

      {/* ── Excel Import Modal ── */}
      <AnimatePresence>
        {importModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget && !importing) setImportModal(null); }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
              dir="rtl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-l from-emerald-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">استيراد ملف Excel</h2>
                    <p className="text-xs text-gray-400 truncate max-w-xs">{importModal.fileName}</p>
                  </div>
                </div>
                <button onClick={() => !importing && setImportModal(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {(() => {
                  const totalRows = importModal.parsedSheets.reduce((s, p) => s + p.dataRows.length, 0);
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "إجمالي الصفوف", value: totalRows.toLocaleString("ar-EG"), IconComp: BarChart3, color: "bg-blue-50 text-blue-700", iconBg: "bg-blue-100 text-blue-600" },
                        { label: "عدد الأوراق",   value: importModal.parsedSheets.length,   IconComp: Layers,       color: "bg-purple-50 text-purple-700", iconBg: "bg-purple-100 text-purple-600" },
                        { label: "نوع الملف",     value: importModal.fileName.split(".").pop().toUpperCase(), IconComp: FileSpreadsheet, color: "bg-emerald-50 text-emerald-700", iconBg: "bg-emerald-100 text-emerald-600" },
                      ].map((s) => (
                        <div key={s.label} className={`rounded-xl p-3 ${s.color.split(" ")[0]} flex items-start gap-3`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg}`}>
                            <s.IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {importModal.parsedSheets.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500">أوراق الملف ({importModal.parsedSheets.length})</p>
                      <div className="flex gap-2">
                        <button onClick={() => setImportModal((m) => ({ ...m, checkedSheets: new Set(m.parsedSheets.map((s) => s.name)) }))}
                          className="text-[11px] text-emerald-600 hover:underline">تحديد الكل</button>
                        <button onClick={() => setImportModal((m) => ({ ...m, checkedSheets: new Set() }))}
                          className="text-[11px] text-gray-400 hover:underline">إلغاء الكل</button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {importModal.parsedSheets.map((ps, idx) => {
                        const checked = importModal.checkedSheets.has(ps.name);
                        const isPreviewed = importModal.previewSheetIdx === idx;
                        return (
                          <div key={ps.name}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border cursor-pointer transition-all ${isPreviewed ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-200 hover:bg-gray-50"}`}
                            onClick={() => setImportModal((m) => ({ ...m, previewSheetIdx: idx }))}
                          >
                            <input type="checkbox" checked={checked}
                              onChange={(e) => { e.stopPropagation(); setImportModal((m) => { const next = new Set(m.checkedSheets); checked ? next.delete(ps.name) : next.add(ps.name); return { ...m, checkedSheets: next }; }); }}
                              className="accent-emerald-600 w-4 h-4 flex-shrink-0"
                            />
                            <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="flex-1 text-sm font-medium text-gray-700 truncate">{ps.name}</span>
                            <span className="text-xs text-gray-400">{ps.dataRows.length} صف</span>
                            <span className="text-xs text-gray-400">{ps.columns.length} عمود</span>
                            {isPreviewed && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">معاينة</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {importModal.parsedSheets.length === 1 && cols.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">وجهة الاستيراد</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "new", label: "إنشاء جدول جديد", desc: "يُنشئ جدولاً جديداً في هذا السجل", icon: Plus },
                        { id: "current", label: "إضافة للجدول الحالي", desc: `إضافة للجدول: ${sheet?.name}`, icon: Table2 },
                      ].map(({ id, label, desc, icon: Icon }) => (
                        <button key={id} onClick={() => setImportModal((m) => ({ ...m, mode: id }))}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 text-right transition-all ${importModal.mode === id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-emerald-300"}`}>
                          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${importModal.mode === id ? "text-emerald-600" : "text-gray-400"}`} />
                          <div>
                            <p className={`text-xs font-semibold ${importModal.mode === id ? "text-emerald-700" : "text-gray-700"}`}>{label}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(() => {
                  const ps = importModal.parsedSheets[importModal.previewSheetIdx];
                  if (!ps) return null;
                  return (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">معاينة: <span className="text-emerald-600">{ps.name}</span> — أول {Math.min(6, ps.dataRows.length)} صفوف</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {ps.columns.map((c) => (
                          <span key={c.key} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-lg text-xs text-gray-700">
                            {c.label}<span className="text-[10px] text-gray-400 bg-white px-1 rounded">{COLUMN_TYPES.find((t) => t.value === c.type)?.label || c.type}</span>
                          </span>
                        ))}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="text-xs w-max min-w-full">
                          <thead className="bg-gray-50">
                            <tr>{ps.headers.map((h, i) => <th key={i} className="px-3 py-2 text-right font-semibold text-gray-600 whitespace-nowrap border-b border-gray-200">{h || `عمود ${i+1}`}</th>)}</tr>
                          </thead>
                          <tbody>
                            {ps.dataRows.slice(0, 6).map((row, ri) => (
                              <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                {ps.headers.map((_, ci) => <td key={ci} className="px-3 py-1.5 text-gray-700 whitespace-nowrap border-b border-gray-100 max-w-[160px] truncate">{serializeCell(row[ci]) || <span className="text-gray-300">—</span>}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {ps.dataRows.length > 6 && <p className="text-[11px] text-gray-400 mt-1.5 text-center">... و {(ps.dataRows.length - 6).toLocaleString("ar-EG")} صف آخر</p>}
                    </div>
                  );
                })()}
                {importing && importProgress > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>جاري الاستيراد...</span><span>{importProgress}%</span></div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 bg-gray-50/50">
                <button onClick={() => !importing && setImportModal(null)} disabled={importing}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">إلغاء</button>
                <button onClick={confirmImport} disabled={importing || importModal.checkedSheets.size === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
                  {importing ? <><RefreshCw className="w-4 h-4 animate-spin" /> جاري الاستيراد...</> : <><FileSpreadsheet className="w-4 h-4" /> استيراد {importModal.checkedSheets.size} {importModal.checkedSheets.size === 1 ? "ورقة" : "أوراق"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAccounting({ branch = null, branchLabel = null }) {
  const { user } = useAuth();
  const toast = useToast();

  const hasAccess = user?.role === "admin" || user?.department === "accounts" ||
    user?.allowedPages?.includes("accounting");

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLedger, setActiveLedger] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [fullLedger, setFullLedger] = useState(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile sidebar
  const [ledgerSidebarCollapsed, setLedgerSidebarCollapsed] = useState(false); // desktop collapse
  const [showLedgerSummary, setShowLedgerSummary] = useState(false);

  const [ledgerModal, setLedgerModal] = useState(false);
  const [editLedger, setEditLedger] = useState(null);
  const [sheetModal, setSheetModal] = useState(false);
  const [editSheet, setEditSheet] = useState(null);
  const [confirmDeleteLedger, setConfirmDeleteLedger] = useState(null);
  const [confirmDeleteSheet, setConfirmDeleteSheet] = useState(null);
  const [deletingLedger, setDeletingLedger] = useState(false);
  const [deletingSheet, setDeletingSheet] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [trashedLedgers, setTrashedLedgers] = useState([]);

  const printRef = useRef(null);

  const loadLedgers = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/accounting${branch ? `?branch=${branch}` : ""}`);
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

  const loadTrash = async () => {
    try { const res = await api.get("/accounting/trash"); setTrashedLedgers(res.data.ledgers || []); }
    catch { toast.error("فشل تحميل سلة المحذوفات"); }
  };
  const handleRestore = async (id) => {
    try { await api.put(`/accounting/${id}/restore`); toast.success("تم استعادة السجل"); loadTrash(); loadLedgers(); }
    catch { toast.error("فشل الاستعادة"); }
  };
  const handlePermanentDelete = async (id) => {
    try { await api.delete(`/accounting/${id}/permanent`); toast.success("تم الحذف النهائي"); loadTrash(); }
    catch { toast.error("فشل الحذف"); }
  };

  // ── Ledger CRUD ──
  const createLedger = async (form) => {
    const r = await api.post("/accounting", { ...form, branch: form.branch || branch || "main" });
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

  // ── duplicate sheet ──
  const duplicateSheet = async (s) => {
    try {
      const r = await api.post(`/accounting/${activeLedger._id}/sheets`, {
        name: `${s.name} (نسخة)`,
        columns: s.columns || [],
        icon: s.icon,
        color: s.color,
      });
      const newSheet = r.data.sheet;
      setFullLedger((prev) => ({ ...prev, sheets: [...(prev.sheets || []), newSheet] }));
      setActiveSheet(newSheet);
      toast.success("تم نسخ الجدول");
    } catch { toast.error("فشل نسخ الجدول"); }
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

  // ── inlined sidebar JSX (avoids component-in-render React error #185) ──
  const sidebarJSX = (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8eef4] bg-[#1e3a52] flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-[#7eb8e0]" />
          <span className="text-sm font-bold text-white">الدفاتر</span>
          {ledgers.length > 0 && (
            <span className="text-[10px] bg-white/10 text-[#7eb8e0] px-1.5 py-0.5 rounded-full font-medium">{ledgers.length}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {user?.role === "admin" && (
            <button onClick={() => { setShowTrash(true); loadTrash(); }}
              title="سلة المحذوفات"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-300 hover:bg-red-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
            title="دفتر جديد"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2d6fa8] text-white hover:bg-[#3a7fbf] shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ledger list */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 bg-[#1a3349]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-[#7eb8e0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : ledgers.length === 0 ? (
          <div className="text-center py-10 px-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/40 text-xs mb-3">لا توجد دفاتر بعد</p>
            <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d5d89] text-white text-xs font-medium hover:bg-[#3a6fa0] transition-colors">
              <Plus className="w-3.5 h-3.5" /> إنشاء دفتر
            </button>
          </div>
        ) : (
          ledgers.map((l) => {
            const LIcon = getLedgerIcon(l.icon);
            const isActive = activeLedger?._id === l._id;
            return (
              <button key={l._id} onClick={() => { setActiveLedger(l); setSidebarOpen(false); }}
                className={`w-full text-right px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all group relative ${
                  isActive ? "bg-[#2d5d89] text-white" : "hover:bg-white/5 text-white/60 hover:text-white"
                }`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: isActive ? "rgba(255,255,255,0.15)" : l.color + "30" }}>
                  <LIcon className="w-3.5 h-3.5" style={{ color: isActive ? "#fff" : l.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs truncate ${isActive ? "font-bold text-white" : "font-medium"}`}>{l.name}</p>
                  {l.branch && <p className={`text-[10px] truncate ${isActive ? "text-white/60" : "text-white/30"}`}>{l.branch === "main" ? "رئيسي" : "بني سويف"}</p>}
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span onClick={(e) => { e.stopPropagation(); setEditLedger(l); setLedgerModal(true); }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/20 text-white/40 hover:text-white transition-colors cursor-pointer">
                    <Edit2 className="w-3 h-3" />
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); setConfirmDeleteLedger(l); }}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/30 text-white/40 hover:text-red-300 transition-colors cursor-pointer">
                    <Trash2 className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Sidebar footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-[#1a3349] flex-shrink-0">
        <p className="text-[10px] text-white/20 text-center">نظام الحسابات — الصرح للتطوير العقاري</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-full overflow-hidden" dir="rtl">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 flex flex-col shadow-2xl">
            {sidebarJSX}
          </div>
        </div>
      )}

      {/* ── Desktop sidebar (collapsible) ── */}
      <div className={`hidden lg:flex flex-shrink-0 flex-col border-l border-[#1a3349] transition-all duration-200 ${ledgerSidebarCollapsed ? "w-10" : "w-56"}`}>
        {ledgerSidebarCollapsed ? (
          <div className="flex flex-col h-full bg-[#1a3349] items-center py-3 gap-3">
            <button onClick={() => setLedgerSidebarCollapsed(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors" title="فتح الدفاتر">
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto w-full px-1.5">
              {ledgers.map((l) => {
                const LIcon = getLedgerIcon(l.icon);
                const isActive = activeLedger?._id === l._id;
                return (
                  <button key={l._id} onClick={() => setActiveLedger(l)} title={l.name}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${isActive ? "bg-[#2d5d89]" : "hover:bg-white/10"}`}
                    style={{ backgroundColor: isActive ? l.color : undefined }}>
                    <LIcon className="w-3.5 h-3.5" style={{ color: isActive ? "#fff" : l.color }} />
                  </button>
                );
              })}
              <button onClick={() => { setEditLedger(null); setLedgerModal(true); }} title="دفتر جديد"
                className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            <button onClick={() => setLedgerSidebarCollapsed(true)}
              className="absolute top-3 left-2 z-10 w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-colors" title="طي القائمة">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {sidebarJSX}
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f0f4f8]">
        {!activeLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm font-medium">
                <Menu className="w-4 h-4" /> عرض الدفاتر
              </button>
              <div className="w-24 h-24 rounded-3xl bg-white shadow-lg flex items-center justify-center mx-auto mb-6 border border-gray-200">
                <BookOpen className="w-12 h-12 text-[#2d5d89]/30" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">نظام الحسابات</h3>
              <p className="text-gray-400 text-sm mb-6">اختر دفتراً من القائمة الجانبية أو أنشئ دفتراً جديداً</p>
              <button onClick={() => { setEditLedger(null); setLedgerModal(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-semibold hover:bg-[#245079] shadow-md transition-colors">
                <Plus className="w-4 h-4" /> دفتر جديد
              </button>
            </div>
          </div>
        ) : loadingLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Ledger top bar ── */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0 shadow-sm">
              <button onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
                <Menu className="w-4 h-4" />
              </button>
              {/* Ledger icon + name */}
              {(() => { const LIcon = getLedgerIcon(activeLedger.icon); return (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: activeLedger.color + "20" }}>
                  <LIcon className="w-4 h-4" style={{ color: activeLedger.color }} />
                </div>
              ); })()}
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">{activeLedger.name}</h2>
                {branchLabel && <p className="text-[10px] text-[#2d5d89] font-medium">{branchLabel}</p>}
              </div>
              {/* Sheet tabs row inside top bar */}
              <div className="flex-1 flex items-center gap-0 overflow-x-auto mr-2 border-r border-gray-200 pr-3">
                <button onClick={() => setShowLedgerSummary(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    showLedgerSummary ? "bg-[#2d5d89] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                  }`}>
                  <BarChart3 className="w-3 h-3" /> ملخص
                </button>
                {(fullLedger?.sheets || []).map((s) => {
                  const isActive = !showLedgerSummary && activeSheet?._id === s._id;
                  return (
                    <button key={s._id} onClick={() => { setShowLedgerSummary(false); setActiveSheet(s); }}
                      className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        isActive ? "bg-[#2d5d89] text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"
                      }`}>
                      <Table2 className="w-3 h-3" />
                      {s.name}
                      {isActive && (
                        <span className="flex gap-0.5 mr-1">
                          <span onClick={(e) => { e.stopPropagation(); setEditSheet(s); setSheetModal(true); }}
                            className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 cursor-pointer">
                            <Edit2 className="w-2.5 h-2.5" />
                          </span>
                          <span onClick={(e) => { e.stopPropagation(); setConfirmDeleteSheet(s); }}
                            className="w-4 h-4 flex items-center justify-center rounded hover:bg-red-400/30 cursor-pointer">
                            <X className="w-2.5 h-2.5" />
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
                <button onClick={() => { setEditSheet(null); setSheetModal(true); }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-[#2d5d89] hover:bg-blue-50 transition-all whitespace-nowrap">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              {/* Actions */}
              <button onClick={() => loadFullLedger(activeLedger._id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0" title="تحديث">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ── Sheet content (full height) ── */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {showLedgerSummary ? (
                <div className="flex-1 overflow-auto p-4">
                  <LedgerSummary ledger={fullLedger} />
                </div>
              ) : !activeSheet ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow border border-gray-200 flex items-center justify-center mx-auto mb-4">
                      <Table2 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">لا توجد جداول</p>
                    <p className="text-gray-400 text-sm mb-4">أضف جدولاً جديداً لبدء إدخال البيانات</p>
                    <button onClick={() => { setEditSheet(null); setSheetModal(true); }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm font-medium hover:bg-[#245079] shadow transition-colors">
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
                    if (updated === "reload") { loadFullLedger(activeLedger._id); return; }
                    if (!updated) return;
                    setFullLedger((prev) => ({
                      ...prev,
                      sheets: [...(prev?.sheets || []).filter(Boolean), updated],
                    }));
                    setActiveSheet(updated);
                  }}
                  printRef={printRef}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {ledgerModal && (
          <Modal open={ledgerModal} onClose={() => setLedgerModal(false)}
            title={editLedger ? "تعديل الدفتر" : "دفتر محاسبي جديد"}>
            <LedgerForm initial={editLedger} onSave={editLedger ? updateLedger : createLedger} onClose={() => setLedgerModal(false)} />
          </Modal>
        )}
        {sheetModal && (
          <Modal open={sheetModal} onClose={() => setSheetModal(false)}
            title={editSheet ? "تعديل الجدول" : "جدول جديد"} size="lg">
            <SheetForm initial={editSheet} onSave={editSheet ? updateSheet : createSheet} onClose={() => setSheetModal(false)} />
          </Modal>
        )}
      </AnimatePresence>

      <Modal open={showTrash} onClose={() => setShowTrash(false)} title="سلة المحذوفات" size="md">
        {trashedLedgers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">سلة المحذوفات فارغة</div>
        ) : (
          <div className="space-y-3">
            {trashedLedgers.map(l => (
              <div key={l._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{l.name}</p>
                  <p className="text-xs text-gray-400">
                    حُذف {l.deletedAt ? new Date(l.deletedAt).toLocaleDateString("ar-EG") : ""}
                    {l.deletedBy?.name && ` بواسطة ${l.deletedBy.name}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRestore(l._id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium hover:bg-emerald-600">استعادة</button>
                  <button onClick={() => handlePermanentDelete(l._id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">حذف نهائي</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!confirmDeleteLedger} onClose={() => setConfirmDeleteLedger(null)} onConfirm={deleteLedger} loading={deletingLedger}
        title="حذف الدفتر"
        message={user?.role === "admin" ? `هل تريد نقل الدفتر "${confirmDeleteLedger?.name}" إلى سلة المحذوفات؟` : `هل أنت متأكد من حذف الدفتر "${confirmDeleteLedger?.name}"؟`}
      />
      <ConfirmModal open={!!confirmDeleteSheet} onClose={() => setConfirmDeleteSheet(null)} onConfirm={deleteSheet} loading={deletingSheet}
        title="حذف الجدول"
        message={`هل تريد حذف الجدول "${confirmDeleteSheet?.name}"؟ سيتم فقدان جميع بيانات هذا الجدول.`}
      />
    </div>
  );
}

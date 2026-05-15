import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, Check, X, Printer, Download,
  BookOpen, Table2, LogOut, ShieldCheck, RefreshCw,
  AlertTriangle, GripVertical, FileSpreadsheet, Calculator,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ─── helpers ──────────────────────────────────────────────────────────────────
const COLUMN_TYPES = [
  { value: "text",     label: "نص" },
  { value: "number",   label: "رقم" },
  { value: "currency", label: "عملة (ج.م)" },
  { value: "date",     label: "تاريخ" },
  { value: "select",   label: "قائمة" },
];
const LEDGER_COLORS = ["#2d5d89","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#be185d","#374151"];
const ICONS = ["📒","📗","📘","📕","📙","💼","🏦","📊","🏢","📋"];

function fmt(val, type) {
  if (val === undefined || val === null || val === "") return "";
  if (type === "currency") return Number(val).toLocaleString("ar-EG") + " ج";
  if (type === "number")   return Number(val).toLocaleString("ar-EG");
  if (type === "date")     return val ? new Date(val).toLocaleDateString("ar-EG") : "";
  return val;
}
function colSum(rows, key, type) {
  if (!["currency","number"].includes(type)) return null;
  return rows.reduce((a, r) => a + (r.cells?.[key] ? Number(r.cells[key]) : 0), 0);
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (msg, type = "success") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  const ToastUI = () => (
    <div className="fixed bottom-6 left-6 z-50 space-y-2">
      {toasts.map(t => (
        <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          className={`px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg ${t.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {t.msg}
        </motion.div>
      ))}
    </div>
  );
  return { success: (m) => add(m, "success"), error: (m) => add(m, "error"), ToastUI };
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
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
          {loading ? "جاري..." : "حذف"}
        </button>
      </div>
    </Modal>
  );
}

// ─── LedgerForm ───────────────────────────────────────────────────────────────
function LedgerForm({ initial, onSave, onClose, toast }) {
  const [form, setForm] = useState(initial || { name: "", description: "", branch: "", color: "#2d5d89", icon: "📒" });
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    setSaving(true);
    try { await onSave(form); onClose(); } catch { toast.error("فشل الحفظ"); } finally { setSaving(false); }
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم *</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: فرع القاهرة"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الوصف</label>
        <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الفرع</label>
        <input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} placeholder="القاهرة / الإسكندرية / رئيسي"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">الأيقونة</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setForm({...form, icon: ic})}
              className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center ${form.icon===ic?"ring-2 ring-[#2d5d89] bg-blue-50 scale-110":"bg-gray-100 hover:bg-gray-200"}`}>{ic}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">اللون</label>
        <div className="flex gap-2">
          {LEDGER_COLORS.map(c => (
            <button key={c} type="button" onClick={() => setForm({...form, color: c})} style={{backgroundColor:c}}
              className={`w-8 h-8 rounded-lg ${form.color===c?"scale-125 ring-2 ring-offset-2 ring-gray-400":"hover:scale-110"}`} />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">إلغاء</button>
        <button onClick={submit} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-medium disabled:opacity-50">
          {saving ? "حفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}

// ─── SheetForm ────────────────────────────────────────────────────────────────
function SheetForm({ initial, onSave, onClose, toast }) {
  const [name, setName] = useState(initial?.name || "");
  const [columns, setColumns] = useState(initial?.columns || [
    {key:"col1",label:"البيان",type:"text",width:200},
    {key:"col2",label:"المبلغ",type:"currency",width:150},
    {key:"col3",label:"التاريخ",type:"date",width:140},
    {key:"col4",label:"ملاحظات",type:"text",width:200},
  ]);
  const [saving, setSaving] = useState(false);
  const addCol = () => setColumns([...columns, {key:`c${Date.now()}`,label:"عمود جديد",type:"text",width:150}]);
  const submit = async () => {
    if (!name.trim()) return toast.error("الاسم مطلوب");
    setSaving(true);
    try { await onSave({name, columns}); onClose(); } catch { toast.error("فشل الحفظ"); } finally { setSaving(false); }
  };
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم الجدول *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: المصروفات الشهرية"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">الأعمدة</label>
          <button onClick={addCol} className="text-xs text-[#2d5d89] hover:underline font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5"/>إضافة عمود</button>
        </div>
        <div className="space-y-2 max-h-56 overflow-y-auto">
          {columns.map((col,i) => (
            <div key={col.key} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0"/>
              <input value={col.label} onChange={e => setColumns(columns.map((c,idx) => idx===i?{...c,label:e.target.value}:c))}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d5d89]" />
              <select value={col.type} onChange={e => setColumns(columns.map((c,idx) => idx===i?{...c,type:e.target.value}:c))}
                className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none">
                {COLUMN_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              {columns.length>1 && <button onClick={() => setColumns(columns.filter((_,idx)=>idx!==i))} className="text-red-400 hover:text-red-600"><X className="w-4 h-4"/></button>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm">إلغاء</button>
        <button onClick={submit} disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-medium disabled:opacity-50">
          {saving ? "حفظ..." : "حفظ"}
        </button>
      </div>
    </div>
  );
}

// ─── SheetTable ───────────────────────────────────────────────────────────────
function SheetTable({ ledgerId, sheet, toast }) {
  const [rows, setRows] = useState(sheet.rows || []);
  const [editCell, setEditCell] = useState(null);
  const [cellVal, setCellVal] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [newRowData, setNewRowData] = useState({});
  const [addingRow, setAddingRow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const printRef = useRef(null);
  const cols = sheet.columns || [];

  const startEdit = (ri, ck) => { setEditCell({ri,ck}); setCellVal(rows[ri]?.cells?.[ck]??""); };
  const commitCell = async (ri, ck, val) => {
    const row = rows[ri]; if (!row) return;
    const newCells = {...Object.fromEntries(row.cells||[]), [ck]: val};
    setRows(rows.map((r,i)=>i===ri?{...r,cells:newCells}:r));
    setEditCell(null);
    try { await api.put(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${row._id}`, {cells:newCells}); }
    catch { toast.error("فشل حفظ الخلية"); }
  };

  const addRow = async () => {
    setSaving(true);
    try {
      const r = await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows`, {cells:newRowData});
      setRows(p=>[...p, r.data.row]); setNewRowData({}); setAddingRow(false); toast.success("تمت الإضافة");
    } catch { toast.error("فشل إضافة السطر"); } finally { setSaving(false); }
  };

  const deleteRow = async (id) => {
    try { await api.delete(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/${id}`); setRows(p=>p.filter(r=>r._id!==id)); }
    catch { toast.error("فشل الحذف"); }
  };

  const bulkDelete = async () => {
    setDeletingBulk(true);
    try {
      await api.post(`/accounting/${ledgerId}/sheets/${sheet._id}/rows/bulk-delete`, {rowIds:[...selected]});
      setRows(p=>p.filter(r=>!selected.has(r._id))); setSelected(new Set()); setConfirmBulk(false); toast.success("تم الحذف");
    } catch { toast.error("فشل الحذف"); } finally { setDeletingBulk(false); }
  };

  const exportCsv = () => {
    const src = selected.size>0 ? rows.filter(r=>selected.has(r._id)) : rows;
    const hdr = cols.map(c=>`"${c.label}"`).join(",");
    const data = src.map(row=>cols.map(c=>`"${String(row.cells?.[c.key]??"").replace(/"/g,'""')}"`).join(","));
    const blob = new Blob(["﻿"+[hdr,...data].join("\n")],{type:"text/csv;charset=utf-8;"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`${sheet.name}.csv`; a.click();
  };

  const handlePrint = () => {
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${sheet.name}</title>
    <style>body{font-family:'Segoe UI',sans-serif;direction:rtl;padding:20px;font-size:12px}
    h2{color:#2d5d89;margin-bottom:16px}table{width:100%;border-collapse:collapse}
    th{background:#2d5d89;color:white;padding:8px 12px;text-align:right;font-size:12px}
    td{padding:6px 12px;border-bottom:1px solid #e5e7eb;font-size:11px}
    tr:nth-child(even) td{background:#f8fafc}
    .total-row td{font-weight:bold;background:#f1f5f9;border-top:2px solid #2d5d89}
    @media print{button{display:none}}</style>
    </head><body><h2>${sheet.name}</h2>${printRef.current?.innerHTML||""}</body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-sm text-gray-500">{rows.length} سطر</span>
        {selected.size>0 && <span className="text-sm font-medium text-[#2d5d89]">({selected.size} محدد)</span>}
        <div className="mr-auto flex items-center gap-2">
          {selected.size>0 && <button onClick={()=>setConfirmBulk(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium">
            <Trash2 className="w-3.5 h-3.5"/> حذف ({selected.size})</button>}
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium">
            <Download className="w-3.5 h-3.5"/> {selected.size>0?"تحميل المحدد":"CSV"}</button>
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium">
            <Printer className="w-3.5 h-3.5"/> طباعة</button>
          <button onClick={()=>setAddingRow(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-xs font-medium">
            <Plus className="w-3.5 h-3.5"/> سطر جديد</button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
        <div ref={printRef}>
          <table className="w-full min-w-max text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#2d5d89] text-white">
                <th className="w-10 px-3 py-3">
                  <input type="checkbox" checked={rows.length>0&&selected.size===rows.length}
                    onChange={()=>setSelected(selected.size===rows.length?new Set():new Set(rows.map(r=>r._id)))}
                    className="accent-white cursor-pointer"/>
                </th>
                {cols.map(c=>(
                  <th key={c.key} className="px-3 py-3 text-right font-semibold whitespace-nowrap text-sm" style={{minWidth:c.width||120}}>
                    {c.label}
                  </th>
                ))}
                <th className="w-12 px-3 py-3"/>
              </tr>
            </thead>
            <tbody>
              {rows.length===0&&!addingRow&&(
                <tr><td colSpan={cols.length+2} className="text-center py-12 text-gray-400 text-sm">
                  <Table2 className="w-10 h-10 mx-auto mb-2 text-gray-300"/>
                  لا توجد بيانات — اضغط "سطر جديد"
                </td></tr>
              )}
              {rows.map((row,ri)=>(
                <tr key={row._id}
                  className={`border-b border-gray-100 transition-colors ${selected.has(row._id)?"bg-blue-50":ri%2===0?"bg-white":"bg-gray-50/50"} hover:bg-blue-50/50 group`}>
                  <td className="px-3 py-2 w-10">
                    <input type="checkbox" checked={selected.has(row._id)}
                      onChange={()=>setSelected(p=>{const s=new Set(p);s.has(row._id)?s.delete(row._id):s.add(row._id);return s;})}
                      className="accent-[#2d5d89] cursor-pointer"/>
                  </td>
                  {cols.map(col=>{
                    const isEd=editCell?.ri===ri&&editCell?.ck===col.key;
                    const val=row.cells?.[col.key]??"";
                    const itype=col.type==="date"?"date":col.type==="number"||col.type==="currency"?"number":"text";
                    return (
                      <td key={col.key} style={{minWidth:col.width||120}} className="px-1 py-1 cursor-pointer"
                        onDoubleClick={()=>startEdit(ri,col.key)}>
                        {isEd?(
                          <input type={itype} value={cellVal} onChange={e=>setCellVal(e.target.value)}
                            onBlur={()=>commitCell(ri,col.key,cellVal)}
                            onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();commitCell(ri,col.key,cellVal);}if(e.key==="Escape")setEditCell(null);}}
                            autoFocus className="w-full h-full px-2 py-1 bg-blue-50 text-gray-900 text-sm focus:outline-none border-2 border-blue-400 rounded"/>
                        ):(
                          <div className="px-2 py-1 min-h-[28px] text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis rounded hover:bg-gray-100">
                            {fmt(val,col.type)||<span className="text-gray-300">—</span>}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 w-12">
                    <button onClick={()=>deleteRow(row._id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5"/>
                    </button>
                  </td>
                </tr>
              ))}
              {addingRow&&(
                <tr className="bg-emerald-50/50 border-b border-emerald-100">
                  <td className="px-3 py-2 text-emerald-500"><Plus className="w-4 h-4 mx-auto"/></td>
                  {cols.map(col=>(
                    <td key={col.key} className="px-1 py-1" style={{minWidth:col.width||120}}>
                      <input type={col.type==="date"?"date":col.type==="number"||col.type==="currency"?"number":"text"}
                        value={newRowData[col.key]||""}
                        onChange={e=>setNewRowData({...newRowData,[col.key]:e.target.value})}
                        placeholder={col.label}
                        className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 text-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"/>
                    </td>
                  ))}
                  <td className="px-2 py-1">
                    <div className="flex flex-col gap-1">
                      <button onClick={addRow} disabled={saving}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Check className="w-3.5 h-3.5"/>
                      </button>
                      <button onClick={()=>{setAddingRow(false);setNewRowData({});}}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {rows.length>0&&(
                <tr className="bg-[#f1f5f9] font-bold border-t-2 border-[#2d5d89]/30">
                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap" colSpan={2}>الإجمالي</td>
                  {cols.slice(1).map(col=>{
                    const total=colSum(rows,col.key,col.type);
                    return <td key={col.key} className="px-3 py-2 text-sm text-[#2d5d89] whitespace-nowrap">{total!==null?fmt(total,col.type):""}</td>;
                  })}
                  <td/>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">انقر مرتين على أي خلية لتعديلها • Enter للتأكيد • Esc للإلغاء</p>

      <ConfirmModal open={confirmBulk} onClose={()=>setConfirmBulk(false)} onConfirm={bulkDelete} loading={deletingBulk}
        title="حذف الصفوف المحددة" message={`هل تريد حذف ${selected.size} سطر؟ لا يمكن التراجع.`}/>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLedger, setActiveLedger] = useState(null);
  const [fullLedger, setFullLedger] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [loadingL, setLoadingL] = useState(false);

  const [ledgerModal, setLedgerModal] = useState(false);
  const [editLedger, setEditLedger] = useState(null);
  const [sheetModal, setSheetModal] = useState(false);
  const [editSheet, setEditSheet] = useState(null);
  const [confirmDL, setConfirmDL] = useState(null);
  const [confirmDS, setConfirmDS] = useState(null);
  const [deletingL, setDeletingL] = useState(false);
  const [deletingS, setDeletingS] = useState(false);

  const loadLedgers = async () => {
    setLoading(true);
    try { const r = await api.get("/accounting"); setLedgers(r.data.ledgers||[]); }
    catch { toast.error("فشل تحميل السجلات"); } finally { setLoading(false); }
  };

  const loadFull = async (id) => {
    setLoadingL(true);
    try {
      const r = await api.get(`/accounting/${id}`);
      setFullLedger(r.data.ledger);
      setActiveSheet(r.data.ledger.sheets?.[0]||null);
    } catch { toast.error("فشل تحميل السجل"); } finally { setLoadingL(false); }
  };

  useEffect(()=>{ loadLedgers(); },[]);
  useEffect(()=>{ if(activeLedger) loadFull(activeLedger._id); else { setFullLedger(null); setActiveSheet(null); } },[activeLedger]);

  const createLedger = async (form) => {
    const r = await api.post("/accounting", form);
    setLedgers(p=>[r.data.ledger,...p]); toast.success("تم إنشاء السجل");
  };
  const updateLedger = async (form) => {
    await api.put(`/accounting/${editLedger._id}`, form);
    setLedgers(p=>p.map(l=>l._id===editLedger._id?{...l,...form}:l));
    if(activeLedger?._id===editLedger._id) setActiveLedger(p=>({...p,...form}));
    toast.success("تم التحديث");
  };
  const deleteLedger = async () => {
    setDeletingL(true);
    try {
      await api.delete(`/accounting/${confirmDL._id}`);
      setLedgers(p=>p.filter(l=>l._id!==confirmDL._id));
      if(activeLedger?._id===confirmDL._id){setActiveLedger(null);setFullLedger(null);}
      setConfirmDL(null); toast.success("تم الحذف");
    } catch { toast.error("فشل الحذف"); } finally { setDeletingL(false); }
  };

  const createSheet = async (form) => {
    const r = await api.post(`/accounting/${activeLedger._id}/sheets`, form);
    setFullLedger(p=>({...p,sheets:[...(p.sheets||[]),r.data.sheet]}));
    setActiveSheet(r.data.sheet); toast.success("تم إنشاء الجدول");
  };
  const updateSheet = async (form) => {
    await api.put(`/accounting/${activeLedger._id}/sheets/${editSheet._id}`, form);
    setFullLedger(p=>({...p,sheets:p.sheets.map(s=>s._id===editSheet._id?{...s,...form}:s)}));
    if(activeSheet?._id===editSheet._id) setActiveSheet(p=>({...p,...form}));
    toast.success("تم التحديث");
  };
  const deleteSheet = async () => {
    setDeletingS(true);
    try {
      await api.delete(`/accounting/${activeLedger._id}/sheets/${confirmDS._id}`);
      const rem=(fullLedger.sheets||[]).filter(s=>s._id!==confirmDS._id);
      setFullLedger(p=>({...p,sheets:rem})); setActiveSheet(rem[0]||null); setConfirmDS(null); toast.success("تم الحذف");
    } catch { toast.error("فشل الحذف"); } finally { setDeletingS(false); }
  };

  const roleLabel = { admin:"مدير عام", employee:"موظف", manager:"مدير قسم" };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]" dir="rtl">
      {/* ── Sidebar ── */}
      <div className="w-72 flex-shrink-0 bg-white border-l border-gray-100 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gradient-to-br from-[#1a3d5c] to-[#2d5d89]">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-white"/>
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">نظام الحسابات</p>
              <p className="text-white/50 text-xs">الصرح للتطوير العقاري</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-white/50 text-xs truncate">{roleLabel[user?.role]||user?.role}</p>
            </div>
            <button onClick={logout} title="تسجيل الخروج"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
              <LogOut className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">السجلات</span>
          <button onClick={()=>{setEditLedger(null);setLedgerModal(true);}}
            className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#2d5d89] text-white hover:bg-[#245079]">
            <Plus className="w-3.5 h-3.5"/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin"/></div>
          ) : ledgers.length===0 ? (
            <div className="text-center py-10 px-4">
              <BookOpen className="w-10 h-10 text-gray-200 mx-auto mb-2"/>
              <p className="text-gray-400 text-xs">لا توجد سجلات</p>
              <button onClick={()=>{setEditLedger(null);setLedgerModal(true);}} className="mt-2 text-xs text-[#2d5d89] hover:underline">إنشاء أول سجل</button>
            </div>
          ) : ledgers.map(l=>(
            <button key={l._id} onClick={()=>setActiveLedger(l)}
              className={`w-full text-right px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors group ${activeLedger?._id===l._id?"bg-[#2d5d89]/10 text-[#2d5d89]":"hover:bg-gray-50 text-gray-700"}`}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{backgroundColor:l.color+"20"}}>{l.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{l.name}</p>
                {l.branch&&<p className="text-xs text-gray-400 truncate">{l.branch}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <span onClick={e=>{e.stopPropagation();setEditLedger(l);setLedgerModal(true);}}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-400 cursor-pointer"><Edit2 className="w-3 h-3"/></span>
                <span onClick={e=>{e.stopPropagation();setConfirmDL(l);}}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-3 h-3"/></span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!activeLedger ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileSpreadsheet className="w-20 h-20 text-gray-200 mx-auto mb-4"/>
              <h3 className="text-xl font-bold text-gray-400 mb-2">اختر سجلاً من القائمة</h3>
              <p className="text-gray-400 text-sm">أو أنشئ سجلاً جديداً لبدء إدارة الحسابات</p>
              <button onClick={()=>{setEditLedger(null);setLedgerModal(true);}}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-medium hover:bg-[#245079]">
                <Plus className="w-4 h-4"/> سجل جديد
              </button>
            </div>
          </div>
        ) : loadingL ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Ledger header */}
            <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{backgroundColor:activeLedger.color+"20"}}>
                {activeLedger.icon}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base leading-tight">{activeLedger.name}</h2>
                {activeLedger.branch&&<p className="text-xs text-gray-400">{activeLedger.branch}</p>}
              </div>
              <button onClick={()=>loadFull(activeLedger._id)} className="mr-auto w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
                <RefreshCw className="w-4 h-4"/>
              </button>
            </div>

            {/* Sheet tabs */}
            <div className="bg-white border-b border-gray-100 px-4 flex items-center gap-1 overflow-x-auto">
              {(fullLedger?.sheets||[]).map(s=>(
                <button key={s._id} onClick={()=>setActiveSheet(s)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors group ${activeSheet?._id===s._id?"border-[#2d5d89] text-[#2d5d89]":"border-transparent text-gray-500 hover:text-gray-700"}`}>
                  <Table2 className="w-3.5 h-3.5"/>{s.name}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                    <span onClick={e=>{e.stopPropagation();setEditSheet(s);setSheetModal(true);}} className="p-0.5 rounded hover:bg-gray-200 text-gray-400 cursor-pointer"><Edit2 className="w-3 h-3"/></span>
                    <span onClick={e=>{e.stopPropagation();setConfirmDS(s);}} className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 cursor-pointer"><X className="w-3 h-3"/></span>
                  </div>
                </button>
              ))}
              <button onClick={()=>{setEditSheet(null);setSheetModal(true);}}
                className="flex items-center gap-1 px-3 py-3 text-sm text-gray-400 hover:text-[#2d5d89] whitespace-nowrap ml-2 border-b-2 border-transparent">
                <Plus className="w-3.5 h-3.5"/> جدول جديد
              </button>
            </div>

            {/* Sheet content */}
            <div className="flex-1 overflow-hidden p-4">
              {!activeSheet ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Table2 className="w-14 h-14 text-gray-200 mx-auto mb-3"/>
                    <p className="text-gray-400 text-sm mb-3">لا توجد جداول</p>
                    <button onClick={()=>{setEditSheet(null);setSheetModal(true);}}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm">
                      <Plus className="w-4 h-4"/> إضافة جدول
                    </button>
                  </div>
                </div>
              ) : (
                <SheetTable key={activeSheet._id} ledgerId={activeLedger._id} sheet={activeSheet} toast={toast}/>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {ledgerModal&&<Modal open title={editLedger?"تعديل السجل":"سجل جديد"} onClose={()=>setLedgerModal(false)}>
          <LedgerForm initial={editLedger} onSave={editLedger?updateLedger:createLedger} onClose={()=>setLedgerModal(false)} toast={toast}/>
        </Modal>}
        {sheetModal&&<Modal open title={editSheet?"تعديل الجدول":"جدول جديد"} onClose={()=>setSheetModal(false)} size="lg">
          <SheetForm initial={editSheet} onSave={editSheet?updateSheet:createSheet} onClose={()=>setSheetModal(false)} toast={toast}/>
        </Modal>}
      </AnimatePresence>

      <ConfirmModal open={!!confirmDL} onClose={()=>setConfirmDL(null)} onConfirm={deleteLedger} loading={deletingL}
        title="حذف السجل" message={`هل تريد حذف "${confirmDL?.name}"؟ سيتم فقدان كل البيانات.`}/>
      <ConfirmModal open={!!confirmDS} onClose={()=>setConfirmDS(null)} onConfirm={deleteSheet} loading={deletingS}
        title="حذف الجدول" message={`هل تريد حذف "${confirmDS?.name}"؟`}/>

      <toast.ToastUI/>
    </div>
  );
}

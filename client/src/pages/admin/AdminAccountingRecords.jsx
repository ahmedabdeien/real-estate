import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit2, X, Download, Search, AlertTriangle,
  BookOpen, TrendingUp, TrendingDown, Scale, Filter, Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import HelpCard from "../../Components/UI/HelpCard";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "accounting_records";

const ACCOUNTS = [
  "نقدية",
  "بنك",
  "ذمم مدينة",
  "ذمم دائنة",
  "إيرادات مبيعات",
  "مصاريف تشغيلية",
  "مصاريف إيجار",
  "رأس المال",
  "أرباح محتجزة",
  "مخزون",
  "أصول ثابتة",
  "قروض",
];

function uid() {
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function fmt(num) {
  if (num === null || num === undefined || num === "") return "0";
  return Number(num).toLocaleString("ar-EG", { maximumFractionDigits: 2 });
}

// ─── Entry Modal ──────────────────────────────────────────────────────────────

function EntryModal({ open, onClose, onSave, initial }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: today,
    description: "",
    debitAccount: ACCOUNTS[0],
    creditAccount: ACCOUNTS[1],
    amount: "",
  });
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        date: initial.date,
        description: initial.description,
        debitAccount: initial.debitAccount,
        creditAccount: initial.creditAccount,
        amount: initial.amount,
      });
    } else {
      setForm({
        date: today,
        description: "",
        debitAccount: ACCOUNTS[0],
        creditAccount: ACCOUNTS[1],
        amount: "",
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const submit = () => {
    if (!form.description.trim()) return toast.error("البيان مطلوب");
    if (!form.amount || Number(form.amount) <= 0) return toast.error("أدخل مبلغًا صحيحًا");
    if (form.debitAccount === form.creditAccount) return toast.error("الحساب المدين والدائن لا يمكن أن يكونا متطابقين");
    onSave({
      ...form,
      amount: Number(form.amount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose} dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">{initial ? "تعديل القيد" : "قيد محاسبي جديد"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">التاريخ *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">البيان *</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="مثال: تحصيل مبلغ من عميل"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-emerald-700 mb-1.5">مدين (Debit) *</label>
              <select
                value={form.debitAccount}
                onChange={(e) => setForm({ ...form, debitAccount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-emerald-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-1.5">دائن (Credit) *</label>
              <select
                value={form.creditAccount}
                onChange={(e) => setForm({ ...form, creditAccount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-red-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">المبلغ (ج.م) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm hover:bg-white">
            إلغاء
          </button>
          <button onClick={submit} className="flex-1 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium">
            {initial ? "حفظ التعديل" : "إضافة القيد"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAccountingRecords() {
  const { user } = useAuth();
  const toast = useToast();
  const hasAccess = user?.role === "admin" || user?.department === "accounts";

  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Load from localStorage
  useEffect(() => {
    if (!hasAccess) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecords(JSON.parse(raw));
    } catch {}
  }, [hasAccess]);

  // Persist
  useEffect(() => {
    if (!hasAccess) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {}
  }, [records, hasAccess]);

  const saveRecord = (data) => {
    if (editItem) {
      setRecords((prev) => prev.map((r) => r.id === editItem.id ? { ...r, ...data } : r));
      toast.success("تم تحديث القيد");
    } else {
      setRecords((prev) => [
        { id: uid(), createdAt: new Date().toISOString(), ...data },
        ...prev,
      ]);
      toast.success("تم إضافة القيد");
    }
    setModalOpen(false);
    setEditItem(null);
  };

  const deleteRecord = (id) => {
    if (!window.confirm("هل تريد حذف هذا القيد؟")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("تم حذف القيد");
  };

  // Filtering
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        const hit = (r.description || "").toLowerCase().includes(q)
          || (r.debitAccount || "").toLowerCase().includes(q)
          || (r.creditAccount || "").toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (accountFilter !== "all") {
        if (r.debitAccount !== accountFilter && r.creditAccount !== accountFilter) return false;
      }
      if (fromDate && r.date < fromDate) return false;
      if (toDate && r.date > toDate) return false;
      return true;
    });
  }, [records, search, accountFilter, fromDate, toDate]);

  const totals = useMemo(() => {
    const debit = filtered.reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const credit = debit; // double-entry — they're always equal
    return { debit, credit, balance: debit - credit };
  }, [filtered]);

  const exportCsv = () => {
    if (filtered.length === 0) return toast.error("لا توجد قيود للتصدير");
    const header = ["التاريخ", "البيان", "مدين", "دائن", "المبلغ"].join(",");
    const rows = filtered.map((r) => [
      r.date,
      `"${(r.description || "").replace(/"/g, '""')}"`,
      `"${r.debitAccount}"`,
      `"${r.creditAccount}"`,
      r.amount,
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounting-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف");
  };

  // ── Access denied ──
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-80" dir="rtl">
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

  return (
    <div className="p-4 sm:p-6 space-y-5" dir="rtl">
      <HelpCard
        title="دليل السجلات المحاسبية"
        tips={[
          "السجلات المحاسبية تعتمد نظام القيد المزدوج (مدين = دائن في كل قيد)",
          "اختر الحساب المدين والحساب الدائن لكل معاملة مالية",
          "الرصيد = إجمالي المدين - إجمالي الدائن",
          "يمكنك تصفية القيود حسب الحساب أو نطاق التاريخ",
          "صدّر البيانات بصيغة CSV للمراجعة في Excel",
        ]}
      />

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2d5d89]/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#2d5d89]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">السجلات المحاسبية</h1>
            <p className="text-xs text-gray-400">دفتر اليومية - قيود محاسبية مزدوجة</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
          <button onClick={() => { setEditItem(null); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> قيد جديد
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">إجمالي المدين</p>
              <p className="text-lg font-bold text-emerald-700">{fmt(totals.debit)} ج.م</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">إجمالي الدائن</p>
              <p className="text-lg font-bold text-red-700">{fmt(totals.credit)} ج.م</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#2d5d89]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">الرصيد</p>
              <p className={`text-lg font-bold ${totals.balance === 0 ? "text-[#2d5d89]" : "text-amber-600"}`}>
                {fmt(totals.balance)} ج.م
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث في البيان أو الحساب..."
              className="w-full pr-8 pl-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
            />
          </div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
          >
            <option value="all">كل الحسابات</option>
            {ACCOUNTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
              title="من تاريخ"
            />
            <span className="text-gray-400 text-xs">إلى</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2 py-2 rounded-xl border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
              title="إلى تاريخ"
            />
          </div>
          {(search || accountFilter !== "all" || fromDate || toDate) && (
            <button
              onClick={() => { setSearch(""); setAccountFilter("all"); setFromDate(""); setToDate(""); }}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" /> مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* ── Records Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">دفتر اليومية</h2>
          <span className="text-xs text-gray-400">{filtered.length} قيد</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-[#2d5d89] text-white">
              <tr>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap text-xs">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold text-xs">البيان</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap text-xs">مدين</th>
                <th className="px-4 py-3 text-right font-semibold whitespace-nowrap text-xs">دائن</th>
                <th className="px-4 py-3 text-left font-semibold whitespace-nowrap text-xs">المبلغ</th>
                <th className="px-3 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">لا توجد قيود — اضغط "قيد جديد" لإضافة أول قيد</p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`border-b border-gray-50 group hover:bg-blue-50/40 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                    >
                      <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap text-xs">
                        {new Date(r.date).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-2.5 text-gray-800 font-medium">{r.description}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                          {r.debitAccount}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium border border-red-100">
                          {r.creditAccount}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-left font-bold text-[#2d5d89] whitespace-nowrap">
                        {fmt(r.amount)} ج.م
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditItem(r); setModalOpen(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-100 text-gray-400 hover:text-blue-600"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRecord(r.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}

              {/* Totals row */}
              {filtered.length > 0 && (
                <tr className="bg-blue-50 font-bold border-t-2 border-[#2d5d89]">
                  <td colSpan={4} className="px-4 py-3 text-[#2d5d89] text-sm">الإجمالي</td>
                  <td className="px-4 py-3 text-left text-[#2d5d89] whitespace-nowrap">
                    {fmt(totals.debit)} ج.م
                  </td>
                  <td />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        ملاحظة: يتم حفظ القيود محليًا على جهازك حاليًا. سيتم لاحقًا ربطها بالخادم.
      </p>

      {/* ── Entry Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <EntryModal
            open={modalOpen}
            onClose={() => { setModalOpen(false); setEditItem(null); }}
            onSave={saveRecord}
            initial={editItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

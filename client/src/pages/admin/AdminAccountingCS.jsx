import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Trash2, Edit2, X, Check, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, BarChart3, FileText,
  ChevronDown, ChevronRight, Search, Filter, Download,
  BookMarked, Calculator, Layers, Activity, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Sigma, Target, Scale,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { id: "dashboard",       label: "لوحة القيادة",   icon: Activity   },
  { id: "accounts",        label: "شجرة الحسابات",  icon: BookOpen   },
  { id: "journal",         label: "القيود اليومية", icon: BookMarked },
  { id: "trial-balance",   label: "ميزان المراجعة", icon: Scale      },
  { id: "income-stmt",     label: "قائمة الدخل",    icon: TrendingUp },
  { id: "balance-sheet",   label: "الميزانية العمومية", icon: Layers },
];

const TYPE_COLORS = {
  أصول:        "text-blue-600 bg-blue-50",
  خصوم:        "text-red-600 bg-red-50",
  "حقوق ملكية": "text-purple-600 bg-purple-50",
  إيرادات:     "text-green-600 bg-green-50",
  مصروفات:    "text-orange-600 bg-orange-50",
};

const fmt = (n) => Number(n || 0).toLocaleString("ar-EG", { minimumFractionDigits: 2 });
const csApi = async (path, options = {}) => {
  const res = await api({ url: `/accounting-cs${path}`, ...options });
  return res.data;
};

// ═══════════════════════════════════════════════════════════════════
// Dashboard Panel
// ═══════════════════════════════════════════════════════════════════
function DashboardPanel({ branch }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    csApi(`/api/reports/dashboard?branch=${branch}`)
      .then((d) => setData(d.stats))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [branch]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-400">
      <AlertTriangle className="w-12 h-12 text-amber-400" />
      <p className="font-semibold text-gray-600">خدمة الحسابات C# غير متصلة</p>
      <p className="text-sm text-center max-w-sm">تأكد من تشغيل خدمة AccountingService على المنفذ 5050<br/>أو استخدم Docker Compose لتشغيل الخدمات</p>
      <code className="text-xs bg-gray-100 px-3 py-2 rounded-lg font-mono">docker compose up accounting-cs</code>
    </div>
  );

  const cards = [
    { label: "إجمالي القيود", value: data.totalEntries, icon: BookMarked, color: "bg-blue-500", sub: `${data.postedEntries} مرحّل` },
    { label: "إيرادات الشهر", value: fmt(data.monthlyRevenue) + " ج", icon: TrendingUp, color: "bg-green-500", sub: "إجمالي المبيعات" },
    { label: "مصروفات الشهر", value: fmt(data.monthlyExpense) + " ج", icon: TrendingDown, color: "bg-red-500", sub: "إجمالي المصروفات" },
    { label: "صافي الربح / الخسارة", value: fmt(data.monthlyNetIncome) + " ج", icon: data.monthlyNetIncome >= 0 ? ArrowUpRight : ArrowDownRight, color: data.monthlyNetIncome >= 0 ? "bg-emerald-500" : "bg-red-600", sub: "هذا الشهر" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6" dir="rtl">
      <h2 className="text-xl font-bold text-gray-800 mb-6">لوحة القيادة المحاسبية</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calculator className="w-4 h-4 text-[#217346]" /> ملخص القيود</h3>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/><span className="text-gray-600">مرحّلة: <strong>{data.postedEntries}</strong></span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"/><span className="text-gray-600">مسودة: <strong>{data.draftEntries}</strong></span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block"/><span className="text-gray-600">الإجمالي: <strong>{data.totalEntries}</strong></span></div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Chart of Accounts
// ═══════════════════════════════════════════════════════════════════
function AccountsPanel({ branch }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", type: "Asset", parentCode: "", description: "" });
  const toast = useToast();

  const load = useCallback(() => {
    setLoading(true);
    csApi(`/api/accounts?branch=${branch}`)
      .then((d) => setAccounts(d.accounts || []))
      .catch(() => setAccounts([]))
      .finally(() => setLoading(false));
  }, [branch]);

  useEffect(() => { load(); }, [load]);

  const filtered = accounts.filter(a =>
    a.Name?.includes(search) || a.Code?.includes(search) || a.TypeAr?.includes(search));

  const grouped = ["أصول", "خصوم", "حقوق ملكية", "إيرادات", "مصروفات"].map(type => ({
    type,
    items: filtered.filter(a => a.TypeAr === type),
  })).filter(g => g.items.length > 0);

  const handleSave = async () => {
    try {
      await csApi("/api/accounts", {
        method: "post",
        data: { ...form, branch },
      });
      toast.success("تم إضافة الحساب");
      setModal(null);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "فشل الحفظ");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir="rtl">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث في الحسابات..."
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} حساب</span>
        <button onClick={() => { setForm({ code: "", name: "", type: "Asset", parentCode: "", description: "" }); setModal("add"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38] transition-colors">
          <Plus className="w-4 h-4" /> حساب جديد
        </button>
        <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-[#f2f2f2] z-10">
              <tr className="text-gray-600 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-24">الكود</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300">اسم الحساب</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-32">النوع</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-24">الرئيسي</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ type, items }) => (
                <>
                  <tr key={type} className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={5} className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${TYPE_COLORS[type] || "text-gray-600 bg-gray-100"}`}>
                        {type} ({items.length})
                      </span>
                    </td>
                  </tr>
                  {items.map((a) => (
                    <tr key={a.Id} className="border-b border-gray-100 hover:bg-[#e8f5e9]/30 transition-colors group">
                      <td className="px-4 py-2.5 font-mono text-sm border-l border-gray-100 text-[#217346] font-semibold">{a.Code}</td>
                      <td className="px-4 py-2.5 border-l border-gray-100 text-gray-800">{a.Name}</td>
                      <td className="px-4 py-2.5 border-l border-gray-100">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[a.TypeAr] || "text-gray-600 bg-gray-100"}`}>{a.TypeAr}</span>
                      </td>
                      <td className="px-4 py-2.5 border-l border-gray-100 text-gray-400 text-xs font-mono">{a.ParentCode || "—"}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                          <button className="w-7 h-7 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {modal === "add" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">حساب جديد</h3>
                <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">الكود *</label>
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                      placeholder="1001" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#217346]" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">النوع *</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]">
                      <option value="Asset">أصول</option>
                      <option value="Liability">خصوم</option>
                      <option value="Equity">حقوق ملكية</option>
                      <option value="Revenue">إيرادات</option>
                      <option value="Expense">مصروفات</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">اسم الحساب *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="الصندوق النقدي" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">الحساب الرئيسي (اختياري)</label>
                  <input value={form.parentCode} onChange={e => setForm(f => ({ ...f, parentCode: e.target.value }))}
                    placeholder="1000" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#217346]" />
                </div>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
                <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38]">حفظ</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Journal Entries
// ═══════════════════════════════════════════════════════════════════
function JournalPanel({ branch }) {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "", reference: "", postImmediately: false,
    lines: [
      { accountId: "", debit: "", credit: "", description: "" },
      { accountId: "", debit: "", credit: "", description: "" },
    ],
  });
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, a] = await Promise.all([
        csApi(`/api/journal?branch=${branch}&page=${page}&limit=20`),
        csApi(`/api/accounts?branch=${branch}`),
      ]);
      setEntries(e.entries || []);
      setTotal(e.total || 0);
      setAccounts(a.accounts || []);
    } catch { setEntries([]); }
    finally { setLoading(false); }
  }, [branch, page]);

  useEffect(() => { load(); }, [load]);

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, { accountId: "", debit: "", credit: "", description: "" }] }));
  const removeLine = (i) => setForm(f => ({ ...f, lines: f.lines.filter((_, idx) => idx !== i) }));
  const updateLine = (i, k, v) => setForm(f => ({ ...f, lines: f.lines.map((l, idx) => idx === i ? { ...l, [k]: v } : l) }));

  const totalDebit  = form.lines.reduce((s, l) => s + (parseFloat(l.debit)  || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced  = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleSave = async () => {
    const lines = form.lines.map(l => ({
      accountId: parseInt(l.accountId), debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0, description: l.description,
    }));
    try {
      await csApi("/api/journal", {
        method: "post",
        data: { ...form, branch, lines, createdBy: "admin" },
      });
      toast.success("تم حفظ القيد");
      setModal(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "فشل الحفظ");
    }
  };

  const handlePost = async (id) => {
    try {
      await csApi(`/api/journal/${id}/post`, { method: "put" });
      toast.success("تم ترحيل القيد");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "فشل الترحيل");
    }
  };

  const STATUS_LABEL = { Draft: "مسودة", Posted: "مرحّل", Reversed: "معكوس" };
  const STATUS_COLOR = { Draft: "bg-yellow-100 text-yellow-700", Posted: "bg-green-100 text-green-700", Reversed: "bg-gray-100 text-gray-500" };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir="rtl">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <span className="text-sm text-gray-500">{total} قيد</span>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38] transition-colors">
          <Plus className="w-4 h-4" /> قيد جديد
        </button>
        <button onClick={load} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-[#f2f2f2] z-10">
              <tr className="text-gray-600 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-32">رقم القيد</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-28">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300">البيان</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-32">مدين</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-32">دائن</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-24">الحالة</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.Id} className="border-b border-gray-100 hover:bg-[#e8f5e9]/20 transition-colors group">
                  <td className="px-4 py-2.5 font-mono text-xs border-l border-gray-100 text-[#217346] font-semibold">{e.EntryNumber}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-gray-600 text-xs">{new Date(e.Date).toLocaleDateString("ar-EG")}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-gray-800">{e.Description}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-right font-mono text-sm text-blue-600">{fmt(e.totalDebit)}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-right font-mono text-sm text-red-600">{fmt(e.totalCredit)}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[e.status] || ""}`}>
                      {STATUS_LABEL[e.status] || e.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {e.status === "Draft" && (
                      <button onClick={() => handlePost(e.Id)}
                        className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors">
                        ترحيل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Entry Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" dir="rtl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">قيد محاسبي جديد</h3>
                <button onClick={() => setModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-auto p-5 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">التاريخ *</label>
                    <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">البيان *</label>
                    <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="وصف القيد المحاسبي..."
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
                  </div>
                </div>

                {/* Lines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">سطور القيد</label>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {isBalanced ? "متوازن" : `فرق: ${fmt(Math.abs(totalDebit - totalCredit))}`}
                    </span>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f2f2f2]">
                        <tr className="text-gray-500 text-xs">
                          <th className="px-3 py-2 text-right font-semibold border-l border-gray-200">الحساب</th>
                          <th className="px-3 py-2 text-right font-semibold border-l border-gray-200 w-28">مدين</th>
                          <th className="px-3 py-2 text-right font-semibold border-l border-gray-200 w-28">دائن</th>
                          <th className="px-3 py-2 text-right font-semibold border-l border-gray-200">البيان</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {form.lines.map((line, i) => (
                          <tr key={i} className="border-t border-gray-100">
                            <td className="px-2 py-1.5 border-l border-gray-100">
                              <select value={line.accountId} onChange={e => updateLine(i, "accountId", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#217346]">
                                <option value="">اختر الحساب...</option>
                                {accounts.map(a => (
                                  <option key={a.Id} value={a.Id}>{a.Code} - {a.Name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1.5 border-l border-gray-100">
                              <input type="number" value={line.debit} onChange={e => updateLine(i, "debit", e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-right font-mono focus:outline-none focus:ring-1 focus:ring-[#217346]" />
                            </td>
                            <td className="px-2 py-1.5 border-l border-gray-100">
                              <input type="number" value={line.credit} onChange={e => updateLine(i, "credit", e.target.value)}
                                placeholder="0.00"
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs text-right font-mono focus:outline-none focus:ring-1 focus:ring-[#217346]" />
                            </td>
                            <td className="px-2 py-1.5 border-l border-gray-100">
                              <input value={line.description} onChange={e => updateLine(i, "description", e.target.value)}
                                placeholder="تفاصيل..."
                                className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#217346]" />
                            </td>
                            <td className="px-1 text-center">
                              {form.lines.length > 2 && (
                                <button onClick={() => removeLine(i)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-gray-300 hover:text-red-500">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="px-3 py-1.5 text-xs text-gray-500 font-semibold">الإجمالي</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs font-bold text-blue-600">{fmt(totalDebit)}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs font-bold text-red-600">{fmt(totalCredit)}</td>
                          <td colSpan={2}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <button onClick={addLine} className="mt-2 flex items-center gap-1 text-xs text-[#217346] hover:underline font-medium">
                    <Plus className="w-3.5 h-3.5" /> إضافة سطر
                  </button>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.postImmediately} onChange={e => setForm(f => ({ ...f, postImmediately: e.target.checked }))}
                    className="accent-[#217346] w-4 h-4" />
                  <span className="text-sm text-gray-700">ترحيل فوري (مرحّل مباشرة)</span>
                </label>
              </div>
              <div className="px-5 pb-5 flex gap-3 border-t border-gray-100 pt-4">
                <button onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
                <button onClick={handleSave} disabled={!isBalanced}
                  className="flex-1 py-2.5 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38] disabled:opacity-50 transition-colors">
                  حفظ القيد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Trial Balance
// ═══════════════════════════════════════════════════════════════════
function TrialBalancePanel({ branch }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to,   setTo]   = useState(new Date().toISOString().slice(0, 10));

  const load = () => {
    setLoading(true);
    csApi(`/api/reports/trial-balance?branch=${branch}&from=${from}&to=${to}`)
      .then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [branch]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir="rtl">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
        <span className="text-gray-400 text-sm">إلى</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38]">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
        {data && (
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${data.isBalanced ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
            {data.isBalanced ? "الميزان متوازن" : "الميزان غير متوازن!"}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin" /></div>
        ) : data?.lines?.length ? (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 bg-[#f2f2f2] z-10">
              <tr className="text-gray-600 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-20">الكود</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300">اسم الحساب</th>
                <th className="px-4 py-3 text-right font-semibold border-l border-gray-300 w-24">النوع</th>
                <th className="px-4 py-3 text-left font-semibold border-l border-gray-300 w-36">مدين</th>
                <th className="px-4 py-3 text-left font-semibold border-l border-gray-300 w-36">دائن</th>
                <th className="px-4 py-3 text-left font-semibold w-36">الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map((l) => (
                <tr key={l.Code} className="border-b border-gray-100 hover:bg-[#e8f5e9]/20 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs border-l border-gray-100 text-[#217346] font-semibold">{l.Code}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-gray-800">{l.Name}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[l.Type] || "text-gray-600 bg-gray-100"}`}>{l.Type}</span>
                  </td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-right font-mono text-blue-600">{l.Debit > 0 ? fmt(l.Debit) : "—"}</td>
                  <td className="px-4 py-2.5 border-l border-gray-100 text-right font-mono text-red-600">{l.Credit > 0 ? fmt(l.Credit) : "—"}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${l.Balance >= 0 ? "text-green-700" : "text-red-600"}`}>{fmt(Math.abs(l.Balance))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#f2f2f2] border-t-2 border-gray-400 sticky bottom-0">
              <tr className="font-bold">
                <td colSpan={3} className="px-4 py-3 text-right text-gray-700">الإجمالي</td>
                <td className="px-4 py-3 text-right font-mono text-blue-700 border-l border-gray-300">{fmt(data.totalDebit)}</td>
                <td className="px-4 py-3 text-right font-mono text-red-700 border-l border-gray-300">{fmt(data.totalCredit)}</td>
                <td className="px-4 py-3"></td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">لا توجد بيانات في الفترة المحددة</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Income Statement
// ═══════════════════════════════════════════════════════════════════
function IncomeStatementPanel({ branch }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10));
  const [to,   setTo]   = useState(new Date().toISOString().slice(0, 10));

  const load = () => {
    setLoading(true);
    csApi(`/api/reports/income-statement?branch=${branch}&from=${from}&to=${to}`)
      .then(d => setData(d.statement)).catch(() => setData(null)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [branch]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" dir="rtl">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
        <span className="text-gray-400 text-sm">إلى</span>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#217346]" />
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#217346] text-white text-sm font-semibold hover:bg-[#1a5c38]">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin" /></div>
        ) : data ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-center text-gray-800">قائمة الدخل</h2>
            <p className="text-center text-sm text-gray-500">من {new Date(data.From).toLocaleDateString("ar-EG")} إلى {new Date(data.To).toLocaleDateString("ar-EG")}</p>
            {/* Revenues */}
            <div className="bg-green-50 rounded-2xl border border-green-200 overflow-hidden">
              <div className="bg-green-600 text-white px-5 py-3 flex items-center justify-between">
                <span className="font-bold">الإيرادات</span>
                <span className="font-bold font-mono">{fmt(data.Revenues.reduce((s, r) => s + r.Balance, 0))} ج</span>
              </div>
              <div className="divide-y divide-green-100">
                {data.Revenues.map(r => (
                  <div key={r.Code} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-sm text-gray-700">{r.Name}</span>
                    <span className="font-mono text-sm text-green-700 font-semibold">{fmt(r.Balance)} ج</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Expenses */}
            <div className="bg-red-50 rounded-2xl border border-red-200 overflow-hidden">
              <div className="bg-red-600 text-white px-5 py-3 flex items-center justify-between">
                <span className="font-bold">المصروفات</span>
                <span className="font-bold font-mono">{fmt(data.Expenses.reduce((s, e) => s + e.Balance, 0))} ج</span>
              </div>
              <div className="divide-y divide-red-100">
                {data.Expenses.map(e => (
                  <div key={e.Code} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-sm text-gray-700">{e.Name}</span>
                    <span className="font-mono text-sm text-red-700 font-semibold">{fmt(e.Balance)} ج</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Net */}
            <div className={`rounded-2xl px-5 py-4 flex items-center justify-between text-lg font-bold ${data.NetIncome >= 0 ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
              <span>{data.NetIncome >= 0 ? "صافي الربح" : "صافي الخسارة"}</span>
              <span className="font-mono text-2xl">{fmt(Math.abs(data.NetIncome))} ج</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">لا توجد بيانات</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════
export default function AdminAccountingCS({ branch = "main" }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-[#217346] text-white px-5 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <Calculator className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm">نظام الحسابات المتقدم</h1>
          <p className="text-white/60 text-[11px]">مدعوم بـ C# ASP.NET Core • قيد مزدوج احترافي</p>
        </div>
        <div className="mr-auto flex items-center gap-2">
          <span className="text-[11px] bg-white/10 px-2 py-1 rounded-full text-white/70">
            {branch === "main" ? "الفرع الرئيسي" : "بني سويف"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-50 px-3 overflow-x-auto flex-shrink-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2 ${
              activeTab === id ? "border-[#217346] text-[#217346] bg-white" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "dashboard"     && <DashboardPanel      branch={branch} />}
        {activeTab === "accounts"      && <AccountsPanel       branch={branch} />}
        {activeTab === "journal"       && <JournalPanel        branch={branch} />}
        {activeTab === "trial-balance" && <TrialBalancePanel   branch={branch} />}
        {activeTab === "income-stmt"   && <IncomeStatementPanel branch={branch} />}
        {activeTab === "balance-sheet" && (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-3">
            <Layers className="w-12 h-12 text-gray-200" />
            <p>الميزانية العمومية</p>
            <p className="text-xs text-gray-300">قريباً</p>
          </div>
        )}
      </div>
    </div>
  );
}

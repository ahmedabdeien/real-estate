import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, PiggyBank, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

function formatArabic(num) {
  return Number(num || 0).toLocaleString("ar-EG") + " ج";
}

function ProgressBar({ label, allocated, actual, color }) {
  const pct = allocated > 0 ? Math.min((actual / allocated) * 100, 150) : 0;
  const over = actual > allocated;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className={over ? "text-red-500 font-bold" : "text-gray-500"}>
          {formatArabic(actual)} / {formatArabic(allocated)}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{pct.toFixed(0)}% مستخدم</span>
        <span className={over ? "text-red-500 font-semibold" : "text-emerald-600"}>
          {over ? `تجاوز بـ ${formatArabic(actual - allocated)}` : `متبقي ${formatArabic(allocated - actual)}`}
        </span>
      </div>
    </div>
  );
}

export default function BudgetPanel({ ledgerId, sheetId, rows, cols, branch }) {
  const toast = useToast();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", period: "monthly", year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [lines, setLines] = useState([{ category: "", allocated: "" }]);
  const [showForm, setShowForm] = useState(false);
  const [activeBudget, setActiveBudget] = useState(null);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/budgets?ledgerId=${ledgerId}&branch=${branch || "main"}`);
      setBudgets(r.data.budgets || []);
      if (r.data.budgets?.length > 0) setActiveBudget(r.data.budgets[0]);
    } catch { toast.error("فشل تحميل الميزانيات"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (ledgerId) loadBudgets(); }, [ledgerId]);

  // Compute actuals from current sheet rows grouped by select/text col category
  const currencyCols = useMemo(() => cols.filter(c => ["currency","number"].includes(c.type)), [cols]);
  const categoryCol = useMemo(() => cols.find(c => c.type === "select") || cols.find(c => c.type === "text"), [cols]);

  const actuals = useMemo(() => {
    const map = {};
    const activeRows = rows.filter(r => !r.isDeleted);
    activeRows.forEach(row => {
      const cat = categoryCol ? (row.cells?.[categoryCol.key] || "أخرى") : "إجمالي";
      if (!map[cat]) map[cat] = 0;
      currencyCols.forEach(c => {
        map[cat] += parseFloat(row.cells?.[c.key] || 0) || 0;
      });
    });
    return map;
  }, [rows, categoryCol, currencyCols]);

  const addLine = () => setLines(l => [...l, { category: "", allocated: "" }]);
  const removeLine = (i) => setLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => setLines(l => l.map((ln, idx) => idx === i ? { ...ln, [field]: val } : ln));

  const saveBudget = async () => {
    if (!form.name.trim()) { toast.error("الاسم مطلوب"); return; }
    const validLines = lines.filter(l => l.category.trim() && l.allocated);
    if (validLines.length === 0) { toast.error("أضف بنداً واحداً على الأقل"); return; }
    setSaving(true);
    try {
      await api.post("/budgets", {
        ledgerId, sheetId,
        ...form,
        lines: validLines.map(l => ({ category: l.category.trim(), allocated: parseFloat(l.allocated) || 0 })),
        branch: branch || "main",
      });
      toast.success("تم حفظ الميزانية");
      setShowForm(false);
      setLines([{ category: "", allocated: "" }]);
      setForm({ name: "", period: "monthly", year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
      loadBudgets();
    } catch { toast.error("فشل حفظ الميزانية"); }
    finally { setSaving(false); }
  };

  const deleteBudget = async (id) => {
    try {
      await api.delete(`/budgets/${id}`);
      toast.success("تم حذف الميزانية");
      setBudgets(b => b.filter(x => x._id !== id));
      if (activeBudget?._id === id) setActiveBudget(null);
    } catch { toast.error("فشل الحذف"); }
  };

  return (
    <div className="p-5 space-y-5 overflow-auto h-full" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-[#2d5d89]" /> متابعة الميزانية
        </h3>
        <div className="flex gap-2">
          <button onClick={loadBudgets} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowForm(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2d5d89] text-white text-xs font-semibold hover:bg-[#245079] transition-colors">
            <Plus className="w-3.5 h-3.5" /> ميزانية جديدة
          </button>
        </div>
      </div>

      {/* New Budget Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
          <p className="text-sm font-bold text-gray-700">إنشاء ميزانية جديدة</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">الاسم</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="مثال: ميزانية يناير 2025"
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5d89]" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">الفترة</label>
              <select value={form.period} onChange={e => setForm(f => ({...f, period: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5d89]">
                <option value="monthly">شهرية</option>
                <option value="quarterly">ربع سنوية</option>
                <option value="annual">سنوية</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">السنة</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({...f, year: parseInt(e.target.value)}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5d89]" />
            </div>
          </div>
          {/* Budget lines */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">بنود الميزانية</p>
            <div className="space-y-2">
              {lines.map((line, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={line.category} onChange={e => updateLine(i,"category",e.target.value)}
                    placeholder="الفئة"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5d89]" />
                  <input type="number" value={line.allocated} onChange={e => updateLine(i,"allocated",e.target.value)}
                    placeholder="المبلغ المخصص"
                    className="w-36 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#2d5d89]" />
                  {lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addLine} className="mt-2 text-xs text-[#2d5d89] hover:underline flex items-center gap-1">
              <Plus className="w-3 h-3" /> إضافة بند
            </button>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={saveBudget} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm font-semibold hover:bg-[#245079] disabled:opacity-50 transition-colors">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PiggyBank className="w-3.5 h-3.5" />}
              حفظ الميزانية
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Budget List + Progress */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#2d5d89] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p className="text-sm">لا توجد ميزانيات. أنشئ ميزانيتك الأولى.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Budget selector */}
          <div className="lg:col-span-1 space-y-2">
            {budgets.map(b => (
              <div key={b._id}
                onClick={() => setActiveBudget(b)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${activeBudget?._id === b._id ? "border-[#2d5d89] bg-[#2d5d89]/5" : "border-gray-200 hover:border-[#2d5d89]/30 bg-white"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.period === "monthly" ? "شهرية" : b.period === "quarterly" ? "ربع سنوية" : "سنوية"} · {b.year}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteBudget(b._id); }}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">{b.lines?.length || 0} بند</p>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
            {activeBudget ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <p className="text-sm font-bold text-gray-800">{activeBudget.name}</p>
                  <span className="text-xs text-gray-400">
                    الإجمالي المخصص: {formatArabic(activeBudget.lines?.reduce((s,l) => s+(l.allocated||0),0))}
                  </span>
                </div>
                <div className="space-y-4">
                  {(activeBudget.lines || []).map((line, i) => (
                    <ProgressBar
                      key={i}
                      label={line.category}
                      allocated={line.allocated}
                      actual={actuals[line.category] || 0}
                    />
                  ))}
                  {activeBudget.lines?.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">لا توجد بنود في هذه الميزانية</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm text-center py-8">اختر ميزانية لرؤية التفاصيل</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

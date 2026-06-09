import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaPen, FaClock, FaCalendar, FaArrowsRotate } from 'react-icons/fa6';

import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

const FREQ_LABELS = {
  daily: "يومي",
  weekly: "أسبوعي",
  monthly: "شهري",
  yearly: "سنوي",
};

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
}

export default function RecurringPanel({ ledgerId, sheet }) {
  const toast = useToast();
  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning]   = useState(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    frequency: "monthly",
    dayOfMonth: 1,
    columns: {},
  });

  const cols = sheet?.columns || [];

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get(`/recurring-transactions?ledgerId=${ledgerId}&sheetId=${sheet._id}`);
      setList(r.data);
    } catch {
      toast.error("فشل تحميل المعاملات المتكررة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [ledgerId, sheet._id]);

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    try {
      const r = await api.post("/recurring-transactions", {
        ledgerId,
        sheetId: sheet._id,
        ...form,
      });
      setList((p) => [r.data, ...p]);
      setShowForm(false);
      setForm({ name: "", frequency: "monthly", dayOfMonth: 1, columns: {} });
      toast.success("تم الإنشاء");
    } catch {
      toast.error("فشل الإنشاء");
    }
  };

  const handleToggle = async (id) => {
    try {
      const r = await api.patch(`/recurring-transactions/${id}/toggle`);
      setList((p) => p.map((x) => (x._id === id ? r.data : x)));
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const handleRunNow = async (id) => {
    setRunning(id);
    try {
      await api.post(`/recurring-transactions/${id}/run`);
      toast.success("تم إنشاء الصف");
      await load();
    } catch {
      toast.error("فشل التشغيل");
    } finally {
      setRunning(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("هل تريد حذف هذه المعاملة؟")) return;
    try {
      await api.delete(`/recurring-transactions/${id}`);
      setList((p) => p.filter((x) => x._id !== id));
      toast.success("تم الحذف");
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const setColVal = (key, val) =>
    setForm((f) => ({ ...f, columns: { ...f.columns, [key]: val } }));

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900">المعاملات المتكررة</h3>
          <p className="text-xs text-gray-400 mt-0.5">جدولة إضافة صفوف تلقائياً</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <FaArrowsRotate className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[#245079]"
          >
            <FaPlus className="w-3.5 h-3.5" /> إضافة
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-[var(--primary)]">معاملة متكررة جديدة</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">الاسم</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="مثال: إيجار شهري"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">التكرار</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              >
                <option value="daily">يومي</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>
            </div>
          </div>

          {["monthly","yearly"].includes(form.frequency) && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">يوم الشهر</label>
              <input
                type="number"
                min={1}
                max={28}
                value={form.dayOfMonth}
                onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: Number(e.target.value) }))}
                className="w-24 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
            </div>
          )}

          {/* Column values */}
          <div>
            <p className="text-xs text-gray-500 mb-2">قيم الأعمدة (اتركها فارغة للتعبئة لاحقاً)</p>
            <div className="grid grid-cols-2 gap-2">
              {cols.filter((c) => c.type !== "formula").map((col) => (
                <div key={col.key}>
                  <label className="block text-xs text-gray-500 mb-1">{col.label}</label>
                  <input
                    type={col.type === "number" || col.type === "currency" ? "number" : col.type === "date" ? "date" : "text"}
                    value={form.columns[col.key] ?? ""}
                    onChange={(e) => setColVal(col.key, e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">إلغاء</button>
            <button onClick={handleCreate} className="flex-1 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[#245079]">حفظ</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد معاملات متكررة بعد</p>
          <p className="text-xs mt-1">أضف معاملة للبدء في الجدولة التلقائية</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((rec) => (
            <div
              key={rec._id}
              className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${rec.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm truncate">{rec.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rec.frequency === "daily" ? "bg-blue-100 text-blue-700" :
                      rec.frequency === "weekly" ? "bg-purple-100 text-purple-700" :
                      rec.frequency === "monthly" ? "bg-green-100 text-green-700" :
                      "bg-orange-100 text-orange-700"
                    }`}>
                      {FREQ_LABELS[rec.frequency]}
                    </span>
                    {!rec.isActive && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">موقوف</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      آخر تشغيل: {fmtDate(rec.lastRunAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendar className="w-3 h-3" />
                      التالي: {fmtDate(rec.nextRunAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleRunNow(rec._id)}
                    disabled={running === rec._id}
                    title="تشغيل الآن"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#217346]/10 text-[#217346] hover:bg-[#217346]/20 transition-colors disabled:opacity-50"
                  >
                    {running === rec._id
                      ? <FaArrowsRotate className="w-3.5 h-3.5 animate-spin" />
                      : <Play className="w-3.5 h-3.5" />
                    }
                  </button>
                  <button
                    onClick={() => handleToggle(rec._id)}
                    title={rec.isActive ? "إيقاف" : "تفعيل"}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {rec.isActive
                      ? <ToggleRight className="w-4 h-4 text-[var(--primary)]" />
                      : <ToggleLeft className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                  <button
                    onClick={() => handleDelete(rec._id)}
                    title="حذف"
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

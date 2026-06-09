import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaTrash, FaPen, FaXmark, FaMagnifyingGlass, FaScaleBalanced, FaFileLines,
  FaMessage, FaChartBar, FaTriangleExclamation, FaEye,
} from "react-icons/fa6";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const TABS = [
  { key: "cases",         label: "القضايا" },
  { key: "contracts",     label: "العقود" },
  { key: "consultations", label: "الاستشارات" },
  { key: "stats",         label: "الإحصائيات" },
];

const CASE_STATUS = {
  open:     { label: "مفتوحة",    color: "text-blue-600 bg-blue-50 border-blue-200" },
  pending:  { label: "معلقة",     color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  closed:   { label: "مغلقة",     color: "text-gray-500 bg-gray-100 border-gray-200" },
  won:      { label: "مكسوبة",    color: "text-green-600 bg-green-50 border-green-200" },
  lost:     { label: "خاسرة",     color: "text-red-600 bg-red-50 border-red-200" },
  settled:  { label: "محسومة",    color: "text-purple-600 bg-purple-50 border-purple-200" },
};

const CONTRACT_STATUS = {
  active:   { label: "نشط",       color: "text-green-600 bg-green-50 border-green-200" },
  expired:  { label: "منتهي",     color: "text-red-600 bg-red-50 border-red-200" },
  draft:    { label: "مسودة",     color: "text-gray-500 bg-gray-100 border-gray-200" },
  cancelled:{ label: "ملغى",      color: "text-red-600 bg-red-50 border-red-200" },
};

const CONSULTATION_STATUS = {
  pending:  { label: "معلقة",     color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  answered: { label: "مجابة",     color: "text-green-600 bg-green-50 border-green-200" },
};

function isExpiringSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const diff = (d - Date.now()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
}

function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-white rounded-2xl shadow-xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <FaXmark className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]" {...props} />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 bg-white" {...props}>{children}</select>
    </div>
  );
}

// ─── Cases Tab ────────────────────────────────────────────────────────────────
function CasesTab() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const toast = useToast();

  const emptyForm = { caseNumber: "", title: "", type: "", status: "open", court: "", nextHearingDate: "", description: "", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/legal/cases");
      setCases(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل القضايا");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => { setEditItem(c); setForm({ caseNumber: c.caseNumber || "", title: c.title || "", type: c.type || "", status: c.status || "open", court: c.court || "", nextHearingDate: c.nextHearingDate?.substring(0, 10) || "", description: c.description || "", notes: c.notes || "" }); setModal(true); };

  const save = async () => {
    if (!form.title) { toast.error("عنوان القضية مطلوب"); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/legal/cases/${editItem._id}`, form);
        toast.success("تم تحديث القضية");
      } else {
        await api.post("/legal/cases", form);
        toast.success("تم إضافة القضية");
      }
      setModal(false);
      fetchCases();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const deleteCase = async (id) => {
    try {
      await api.delete(`/legal/cases/${id}`);
      toast.success("تم حذف القضية");
      setDeleteId(null);
      fetchCases();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const filtered = (Array.isArray(cases) ? cases : []).filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase()) || c.caseNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في القضايا..." className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none">
          <option value="">كل الحالات</option>
          {Object.entries(CASE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <FaPlus className="w-4 h-4" /> إضافة قضية
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">رقم القضية</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">العنوان</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">النوع</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">المحكمة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الجلسة القادمة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">لا توجد قضايا</td></tr>
            ) : filtered.map((c) => {
              const st = CASE_STATUS[c.status] || CASE_STATUS.open;
              return (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.caseNumber || "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600">{c.type || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.court || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString("ar-EG") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewModal(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaEye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaPen className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FaTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل القضية" : "إضافة قضية جديدة"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم القضية" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} placeholder="رقم القضية" />
            <Input label="عنوان القضية *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="نوع القضية" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="مدني، جنائي، تجاري..." />
            <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(CASE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="المحكمة" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} placeholder="اسم المحكمة" />
            <Input label="تاريخ الجلسة القادمة" type="date" value={form.nextHearingDate} onChange={(e) => setForm({ ...form, nextHearingDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[var(--primary)] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`تفاصيل القضية`} wide>
        {viewModal && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-gray-500">رقم القضية: </span><span className="font-medium">{viewModal.caseNumber || "—"}</span></div>
              <div><span className="text-gray-500">العنوان: </span><span className="font-medium">{viewModal.title}</span></div>
              <div><span className="text-gray-500">النوع: </span><span>{viewModal.type || "—"}</span></div>
              <div><span className="text-gray-500">الحالة: </span><span className={`text-xs font-medium px-2 py-1 rounded-lg border ${CASE_STATUS[viewModal.status]?.color}`}>{CASE_STATUS[viewModal.status]?.label}</span></div>
              <div><span className="text-gray-500">المحكمة: </span><span>{viewModal.court || "—"}</span></div>
              <div><span className="text-gray-500">الجلسة القادمة: </span><span>{viewModal.nextHearingDate ? new Date(viewModal.nextHearingDate).toLocaleDateString("ar-EG") : "—"}</span></div>
            </div>
            {viewModal.description && <div><span className="text-gray-500 font-medium">الوصف: </span><p className="mt-1 text-gray-700 bg-gray-50 rounded-xl p-3">{viewModal.description}</p></div>}
            {viewModal.notes && <div><span className="text-gray-500 font-medium">ملاحظات: </span><p className="mt-1 text-gray-600">{viewModal.notes}</p></div>}
            {viewModal.documents?.length > 0 && (
              <div>
                <p className="font-medium text-gray-700 mb-2">المستندات</p>
                <ul className="space-y-1">
                  {viewModal.documents.map((d, i) => (
                    <li key={i} className="text-xs text-[var(--primary)] flex items-center gap-1"><FaFileLines className="w-3 h-3" />{d.name || d}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-gray-900 mb-4">هل أنت متأكد من حذف هذه القضية؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteCase(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600">حذف</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contracts Tab ────────────────────────────────────────────────────────────
const CONTRACT_DOCS = ["وثيقة موقعة", "دفع مُكمّل", "تسجيل عقاري"];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24));
}

function ContractTimeline({ startDate, endDate }) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  const total = end - start;
  if (total <= 0) return null;
  const elapsed = Math.max(0, Math.min(now - start, total));
  const pct = Math.round((elapsed / total) * 100);
  const isOver = now > end;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{start.toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}</span>
        <span>{end.toLocaleDateString("ar-EG", { month: "short", year: "numeric" })}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isOver ? "bg-red-400" : pct > 80 ? "bg-orange-400" : "bg-[var(--primary)]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DocChecklist({ contractId, docs = [] }) {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`contract_docs_${contractId}`) || "{}"); } catch { return {}; }
  });
  const toggle = (doc) => {
    const next = { ...checked, [doc]: !checked[doc] };
    setChecked(next);
    localStorage.setItem(`contract_docs_${contractId}`, JSON.stringify(next));
  };
  return (
    <div className="space-y-1 mt-2">
      {CONTRACT_DOCS.map((doc) => (
        <label key={doc} className="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" checked={!!checked[doc]} onChange={() => toggle(doc)}
            className="w-3.5 h-3.5 rounded accent-[var(--primary)]" />
          <span className={`text-xs transition-colors ${checked[doc] ? "line-through text-gray-400" : "text-gray-600 group-hover:text-gray-900"}`}>{doc}</span>
        </label>
      ))}
    </div>
  );
}

function ContractsTab() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [partyFilter, setPartyFilter] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const toast = useToast();

  const emptyForm = { contractNumber: "", title: "", type: "", partyA: "", partyB: "", startDate: "", endDate: "", value: "", status: "active", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/legal/contracts");
      setContracts(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل العقود");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModal(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      contractNumber: c.contractNumber || "", title: c.title || "", type: c.type || "",
      partyA: c.partyA?.name || c.partyA || "", partyB: c.partyB?.name || c.partyB || "",
      startDate: c.startDate?.substring(0, 10) || "", endDate: c.endDate?.substring(0, 10) || "",
      value: c.value || "", status: c.status || "active", notes: c.notes || "",
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.title) { toast.error("عنوان العقد مطلوب"); return; }
    setSaving(true);
    try {
      const payload = { ...form, partyA: { name: form.partyA }, partyB: { name: form.partyB } };
      if (editItem) {
        await api.put(`/legal/contracts/${editItem._id}`, payload);
        toast.success("تم تحديث العقد");
      } else {
        await api.post("/legal/contracts", payload);
        toast.success("تم إضافة العقد");
      }
      setModal(false);
      fetchContracts();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const deleteContract = async (id) => {
    try {
      await api.delete(`/legal/contracts/${id}`);
      toast.success("تم حذف العقد");
      setDeleteId(null);
      fetchContracts();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const getEffectiveStatus = (c) => {
    if (isExpired(c.endDate)) return "expired";
    return c.status || "active";
  };

  // Derived stats
  const total = contracts.length;
  const active = contracts.filter((c) => getEffectiveStatus(c) === "active").length;
  const expired = contracts.filter((c) => getEffectiveStatus(c) === "expired").length;
  const soonCount = contracts.filter((c) => isExpiringSoon(c.endDate) && getEffectiveStatus(c) !== "expired").length;

  // Unique types and parties for filter chips
  const types = [...new Set(contracts.map((c) => c.type).filter(Boolean))];
  const parties = [...new Set(contracts.map((c) => c.partyA?.name || c.partyA).filter(Boolean))];

  const filtered = contracts.filter((c) => {
    const matchStatus = !statusFilter || getEffectiveStatus(c) === statusFilter;
    const matchType = !typeFilter || c.type === typeFilter;
    const matchParty = !partyFilter || (c.partyA?.name || c.partyA) === partyFilter;
    return matchStatus && matchType && matchParty;
  });

  return (
    <div className="space-y-5">
      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي العقود", value: total, color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "نشطة", value: active, color: "bg-green-50 text-green-700 border-green-100" },
          { label: "منتهية", value: expired, color: "bg-red-50 text-red-700 border-red-100" },
          { label: "وشيكة الانتهاء", value: soonCount, color: "bg-orange-50 text-orange-700 border-orange-100" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          <option value="">كل الحالات</option>
          {Object.entries(CONTRACT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {types.length > 0 && (
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">كل الأنواع</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        {parties.length > 0 && (
          <select value={partyFilter} onChange={(e) => setPartyFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
            <option value="">كل الأطراف</option>
            {parties.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        )}
        <button onClick={openAdd} className="mr-auto flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <FaPlus className="w-4 h-4" /> إضافة عقد
        </button>
      </div>

      {/* Contracts List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-8 text-center text-gray-400">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-gray-400">لا توجد عقود</div>
        ) : filtered.map((c) => {
          const effStatus = getEffectiveStatus(c);
          const st = CONTRACT_STATUS[effStatus] || CONTRACT_STATUS.active;
          const expiring = isExpiringSoon(c.endDate) && effStatus !== "expired";
          const days = daysUntil(c.endDate);
          const isExpanded = expandedId === c._id;
          return (
            <div key={c._id} className={`rounded-2xl border transition-all ${expiring ? "border-orange-200 bg-orange-50/20" : effStatus === "expired" ? "border-red-100 bg-red-50/10" : "border-gray-100 bg-white"}`}>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{c.title}</span>
                      <span className="font-mono text-xs text-gray-400">{c.contractNumber}</span>
                      {expiring && days !== null && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                          يتبقى {days} يوم
                        </span>
                      )}
                      {effStatus === "expired" && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">منتهي</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      {c.type && <span>{c.type}</span>}
                      {(c.partyA?.name || c.partyA) && <span>الطرف الأول: {c.partyA?.name || c.partyA}</span>}
                      {c.value ? <span className="font-medium text-gray-700">{Number(c.value).toLocaleString("ar-EG")} ج</span> : null}
                    </div>
                    <ContractTimeline startDate={c.startDate} endDate={c.endDate} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${st.color}`}>{st.label}</span>
                    <button onClick={() => setExpandedId(isExpanded ? null : c._id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors text-xs">
                      {isExpanded ? "إخفاء" : "تفاصيل"}
                    </button>
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"><FaPen className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><FaTrash className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Expanded: doc checklist */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">قائمة المستندات</p>
                    <DocChecklist contractId={c._id} />
                    {c.notes && <p className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{c.notes}</p>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل العقد" : "إضافة عقد جديد"} wide>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم العقد" value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} placeholder="رقم العقد" />
            <Input label="عنوان العقد *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="نوع العقد" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="إيجار، بيع، توريد..." />
            <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(CONTRACT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="الطرف الأول" value={form.partyA} onChange={(e) => setForm({ ...form, partyA: e.target.value })} placeholder="اسم الطرف الأول" />
            <Input label="الطرف الثاني" value={form.partyB} onChange={(e) => setForm({ ...form, partyB: e.target.value })} placeholder="اسم الطرف الثاني" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ البداية" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="تاريخ النهاية" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <Input label="قيمة العقد (ج)" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="0.00" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[var(--primary)] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </div>
      </Modal>

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <p className="font-semibold text-gray-900 mb-4">هل أنت متأكد من حذف هذا العقد؟</p>
            <div className="flex gap-3">
              <button onClick={() => deleteContract(deleteId)} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600">حذف</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Consultations Tab ────────────────────────────────────────────────────────
function ConsultationsTab() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const emptyForm = { title: "", clientName: "", description: "", fee: "", date: "" };
  const [form, setForm] = useState(emptyForm);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/legal/consultations");
      setConsultations(r.data?.data || []);
    } catch {
      toast.error("فشل تحميل الاستشارات");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchConsultations(); }, [fetchConsultations]);

  const save = async () => {
    if (!form.title || !form.clientName) { toast.error("العنوان واسم العميل مطلوبان"); return; }
    setSaving(true);
    try {
      await api.post("/legal/consultations", form);
      toast.success("تم إضافة الاستشارة");
      setModal(false);
      setForm(emptyForm);
      fetchConsultations();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const submitReply = async () => {
    if (!replyText) { toast.error("أدخل نص الرد"); return; }
    setSaving(true);
    try {
      await api.put(`/legal/consultations/${replyModal._id}/answer`, { answer: replyText });
      toast.success("تم الرد على الاستشارة");
      setReplyModal(null);
      setReplyText("");
      fetchConsultations();
    } catch {
      toast.error("فشل الرد");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setForm(emptyForm); setModal(true); }} className="flex items-center gap-2 bg-[var(--primary)] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245079] transition-colors">
          <FaPlus className="w-4 h-4" /> إضافة استشارة
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">العنوان</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">العميل</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">التاريخ</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الأتعاب</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الحالة</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">جاري التحميل...</td></tr>
            ) : consultations.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا توجد استشارات</td></tr>
            ) : consultations.map((c) => {
              const st = CONSULTATION_STATUS[c.status] || CONSULTATION_STATUS.pending;
              return (
                <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.title}</td>
                  <td className="px-4 py-3 text-gray-600">{c.clientName}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.date ? new Date(c.date).toLocaleDateString("ar-EG") : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.fee ? Number(c.fee).toLocaleString("ar-EG") + " ج" : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {c.status === "pending" && (
                      <button onClick={() => { setReplyModal(c); setReplyText(""); }} className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 px-2.5 py-1.5 rounded-lg transition-colors">
                        <FaMessage className="w-3.5 h-3.5" /> رد
                      </button>
                    )}
                    {c.status === "answered" && c.answer && (
                      <button onClick={() => setReplyModal(c)} className="text-xs text-gray-500 hover:text-gray-700">عرض الرد</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="إضافة استشارة جديدة">
        <div className="space-y-4">
          <Input label="العنوان *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الاستشارة" />
          <Input label="اسم العميل *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} placeholder="اسم العميل" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="التاريخ" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="الأتعاب (ج)" type="number" value={form.fee} onChange={(e) => setForm({ ...form, fee: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وصف الاستشارة</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={saving} className="flex-1 bg-[var(--primary)] text-white py-2.5 rounded-xl font-medium text-sm hover:bg-[#245079] disabled:opacity-60">
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!replyModal} onClose={() => setReplyModal(null)} title={replyModal?.status === "answered" ? "الرد على الاستشارة" : "الرد على الاستشارة"}>
        {replyModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-900 mb-1">{replyModal.title}</p>
              <p className="text-gray-600 text-xs">{replyModal.description}</p>
            </div>
            {replyModal.status === "answered" ? (
              <div className="bg-green-50 rounded-xl p-3 text-sm border border-green-100">
                <p className="font-medium text-green-800 mb-1">الرد:</p>
                <p className="text-green-700">{replyModal.answer}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نص الرد *</label>
                  <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30" placeholder="أكتب ردك هنا..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={submitReply} disabled={saving} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-green-700 disabled:opacity-60">
                    {saving ? "جاري الإرسال..." : "إرسال الرد"}
                  </button>
                  <button onClick={() => setReplyModal(null)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50">إلغاء</button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api.get("/legal/stats")
      .then((r) => setStats(r.data?.data || r.data))
      .catch(() => toast.error("فشل تحميل الإحصائيات"))
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <div className="py-12 text-center text-gray-400">جاري التحميل...</div>;
  if (!stats) return null;

  const cards = [
    { label: "القضايا المفتوحة",       value: stats.openCases ?? 0,          color: "bg-blue-50 text-blue-700",    icon: Scale },
    { label: "العقود النشطة",          value: stats.activeContracts ?? 0,     color: "bg-green-50 text-green-700",  icon: FileText },
    { label: "الاستشارات المعلقة",     value: stats.pendingConsultations ?? 0, color: "bg-yellow-50 text-yellow-700", icon: MessageSquare },
    { label: "عقود تنتهي قريباً",      value: stats.expiringSoon ?? 0,        color: "bg-orange-50 text-orange-700", icon: AlertTriangle },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-2xl p-5 ${card.color} border border-current/10`}>
          <card.icon className="w-8 h-8 mb-3 opacity-70" />
          <p className="text-3xl font-bold mb-1">{card.value.toLocaleString("ar-EG")}</p>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminLegal() {
  const [activeTab, setActiveTab] = useState("cases");

  return (
    <div className="min-h-screen bg-[#f8fafc]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
            <FaScaleBalanced className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الشئون القانونية</h1>
            <p className="text-sm text-gray-500 mt-0.5">إدارة القضايا والعقود والاستشارات القانونية</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 shadow-sm mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-max px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key ? "bg-[var(--primary)] text-white shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
              {activeTab === "cases" && <CasesTab />}
              {activeTab === "contracts" && <ContractsTab />}
              {activeTab === "consultations" && <ConsultationsTab />}
              {activeTab === "stats" && <StatsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

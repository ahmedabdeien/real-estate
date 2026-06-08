import { useEffect, useState, useMemo } from "react";
import { Plus, Search, User, Phone, MessageSquare, Calendar, X, Building2, Pencil, Trash2, Download } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../Components/UI/Badge";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ArabicDatePicker from "../../Components/UI/ArabicDatePicker";

const SOURCE_OPTIONS = [
  { value: "walk_in", label: "زيارة مباشرة" },
  { value: "call", label: "مكالمة هاتفية" },
  { value: "social_media", label: "تواصل اجتماعي" },
  { value: "exhibition", label: "معرض عقاري" },
  { value: "admin_registration", label: "تسجيل داخلي" },
  { value: "website", label: "موقع الإنترنت" },
];

const STATUS_LABELS = {
  new: { label: "جديد", color: "bg-blue-100 text-blue-700" },
  contacted: { label: "تم التواصل", color: "bg-yellow-100 text-yellow-700" },
  interested: { label: "مهتم", color: "bg-green-100 text-green-700" },
  not_interested: { label: "غير مهتم", color: "bg-red-100 text-red-700" },
  converted: { label: "تحوّل لعقد", color: "bg-emerald-100 text-emerald-700" },
  lost: { label: "خسارة", color: "bg-gray-100 text-gray-600" },
};

const emptyForm = {
  name: "", phone: "", email: "", message: "", notes: "",
  registrationSource: "walk_in", status: "new",
  interestedProject: "", followUpDate: "",
};

export default function AdminClientReg() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [leadsRes, projRes] = await Promise.all([
        api.get("/leads", { params: { limit: 100 } }),
        api.get("/projects", { params: { limit: 100 } }),
      ]);
      setLeads(leadsRes.data.leads || []);
      setProjects(projRes.data.projects || []);
    } catch { toast.error("فشل التحميل"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = leads;
    if (statusFilter) list = list.filter((l) => l.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(l =>
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [leads, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return counts;
  }, [leads]);

  const exportCSV = () => {
    const rows = [
      ["الاسم", "الهاتف", "البريد", "المصدر", "الحالة", "المشروع", "التاريخ"],
      ...filtered.map((l) => [
        l.name || "",
        l.phone || "",
        l.email || "",
        SOURCE_OPTIONS.find(s => s.value === (l.registrationSource || l.source))?.label || "",
        STATUS_LABELS[l.status]?.label || l.status || "",
        l.interestedProject?.name?.ar || "",
        new Date(l.createdAt).toLocaleDateString("ar-EG"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clients.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModal(true); };
  const openEdit = (l) => {
    setEditItem(l);
    setForm({
      name: l.name || "", phone: l.phone || "", email: l.email || "",
      message: l.message || "", notes: l.notes || "",
      registrationSource: l.registrationSource || l.source || "walk_in", status: l.status || "new",
      interestedProject: l.interestedProject?._id || "",
      followUpDate: l.followUpDate ? l.followUpDate.substring(0, 10) : "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    if (!form.phone.trim()) return toast.error("الهاتف مطلوب");
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.interestedProject) delete payload.interestedProject;
      if (!payload.followUpDate) delete payload.followUpDate;
      if (editItem) {
        await api.put(`/leads/${editItem._id}`, payload);
        toast.success("تم تحديث العميل");
      } else {
        await api.post("/leads", payload);
        toast.success("تم تسجيل العميل");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteId}`);
      toast.success("تم الحذف");
      setDeleteId(null);
      load();
    } catch { toast.error("فشل الحذف"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تسجيل العملاء</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {filtered.length} عميل{isAdmin && " (كل الموظفين)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />
            تسجيل عميل جديد
          </button>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!statusFilter ? "bg-[#2d5d89] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          الكل ({leads.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
          statusCounts[key] ? (
            <button
              key={key}
              onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                statusFilter === key ? "ring-2 ring-offset-1 ring-[#2d5d89] " + color : color + " opacity-80 hover:opacity-100"
              }`}
            >
              {label} ({statusCounts[key]})
            </button>
          ) : null
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الهاتف..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : filtered.length === 0 ? (
          <EmptyState icon={User} title="لا يوجد عملاء مسجلون" description="ابدأ بتسجيل أول عميل" action={
            <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm">تسجيل عميل</button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">العميل</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الهاتف</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المصدر</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">المشروع</th>
                  {isAdmin && <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">أضافه</th>}
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {filtered.map(l => {
                  const st = STATUS_LABELS[l.status] || STATUS_LABELS.new;
                  return (
                    <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-bold text-sm flex-shrink-0">
                            {l.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{l.name}</p>
                            {l.email && <p className="text-xs text-gray-400">{l.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono">{l.phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {SOURCE_OPTIONS.find(s => s.value === (l.registrationSource || l.source))?.label || l.source}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {l.interestedProject?.name?.ar || "—"}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {l.createdBy?.name?.[0]?.toUpperCase() || "؟"}
                            </div>
                            <span className="text-xs text-gray-500">{l.createdBy?.name || "موقع"}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(l.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
                        <br/>
                        <span className="text-gray-300">{new Date(l.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(l)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(l._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل بيانات العميل" : "تسجيل عميل جديد"} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="اسم العميل"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الهاتف *</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="01xxxxxxxxx" type="tel"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="اختياري"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المصدر</label>
              <select value={form.registrationSource} onChange={e => setForm(f => ({ ...f, registrationSource: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                {Object.entries(STATUS_LABELS).map(([v, {label}]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المشروع المهتم به</label>
            <select value={form.interestedProject} onChange={e => setForm(f => ({ ...f, interestedProject: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
              <option value="">-- اختر مشروع --</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
            </select>
          </div>
          <ArabicDatePicker
            label="تاريخ المتابعة"
            value={form.followUpDate}
            onChange={v => setForm(f => ({ ...f, followUpDate: v }))}
            placeholder="اختر تاريخ المتابعة"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="ملاحظات إضافية..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setModal(false)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : editItem ? "حفظ التعديلات" : "تسجيل العميل"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="حذف العميل"
        message="هل أنت متأكد من حذف هذا العميل؟"
      />
    </div>
  );
}

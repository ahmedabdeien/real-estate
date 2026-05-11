import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../components/UI/Modal";
import ConfirmModal from "../../components/UI/ConfirmModal";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Badge from "../../components/UI/Badge";
import { useToast } from "../../context/ToastContext";
import { Briefcase } from "lucide-react";

const emptyCareer = {
  title: { ar: "", en: "" },
  department: { ar: "", en: "" },
  location: { ar: "", en: "" },
  type: "full_time",
  description: { ar: "", en: "" },
  published: true,
  deadline: "",
};

const typeAr = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };

export default function AdminCareers() {
  const toast = useToast();
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyCareer);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/careers");
      setCareers(res.data.careers);
    } catch {
      toast.error("فشل تحميل الوظائف");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyCareer); setModal(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      ...emptyCareer,
      ...c,
      title: { ar: c.title?.ar ?? "", en: c.title?.en ?? "" },
      department: { ar: c.department?.ar ?? "", en: c.department?.en ?? "" },
      location: { ar: c.location?.ar ?? "", en: c.location?.en ?? "" },
      description: { ar: c.description?.ar ?? "", en: c.description?.en ?? "" },
      deadline: c.deadline ? c.deadline.split("T")[0] : "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/careers/${editItem._id}`, form);
        toast.success("تم تحديث الوظيفة");
      } else {
        await api.post("/careers", form);
        toast.success("تم إضافة الوظيفة");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/careers/${deleteId}`);
      toast.success("تم حذف الوظيفة");
      setDeleteId(null);
      load();
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const f = (path, value) => {
    const keys = path.split(".");
    setForm((prev) => {
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الوظائف</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{careers.length} وظيفة</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          إضافة وظيفة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3"><LoadingSpinner className="h-64" size="lg" /></div> :
          careers.length === 0 ? <div className="col-span-3"><EmptyState icon={Briefcase} title="لا توجد وظائف" /></div> :
          careers.map((c) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-[#2d5d89]" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(c._id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{c.title?.ar}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{c.department?.ar} • {c.location?.ar}</p>
              <div className="flex items-center gap-2">
                <Badge variant="info">{typeAr[c.type]}</Badge>
                <Badge variant={c.published ? "success" : "gray"}>{c.published ? "منشور" : "مخفي"}</Badge>
              </div>
            </motion.div>
          ))
        }
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل وظيفة" : "إضافة وظيفة"} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المسمى الوظيفي (عربي)</label>
            <input value={form.title?.ar} onChange={(e) => f("title.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المسمى الوظيفي (إنجليزي)</label>
            <input value={form.title?.en} onChange={(e) => f("title.en", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">القسم (عربي)</label>
            <input value={form.department?.ar} onChange={(e) => f("department.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الموقع (عربي)</label>
            <input value={form.location?.ar} onChange={(e) => f("location.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الوظيفة</label>
            <select value={form.type} onChange={(e) => f("type", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {Object.entries(typeAr).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">آخر موعد للتقديم</label>
            <input type="date" value={form.deadline ? form.deadline.split("T")[0] : ""}
              onChange={(e) => f("deadline", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (عربي)</label>
            <textarea rows={4} value={form.description?.ar} onChange={(e) => f("description.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => f("published", e.target.checked)}
                className="w-4 h-4 rounded accent-[#2d5d89]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">منشور</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button onClick={() => setModal(false)}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            إلغاء
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-medium transition-colors disabled:opacity-50">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

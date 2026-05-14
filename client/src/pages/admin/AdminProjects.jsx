import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";
import { Building2 } from "lucide-react";

const statusOptions = [
  { value: "", label: "كل الحالات" },
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز" },
  { value: "sold_out", label: "نفذت الوحدات" },
  { value: "coming_soon", label: "قريباً" },
];

const emptyProject = {
  name: { ar: "", en: "" },
  description: { ar: "", en: "" },
  location: { address: { ar: "", en: "" }, city: { ar: "", en: "" } },
  status: "under_construction",
  coverImage: "",
  images: [],
  featured: false,
  published: false,
  startingPrice: "",
  totalUnits: "",
  deliveryDate: "",
};

export default function AdminProjects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyProject);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { page, search, status: statusFilter } });
      setProjects(res.data.projects);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل المشاريع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const openCreate = () => { setEditItem(null); setForm(emptyProject); setModal(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      ...emptyProject,
      ...p,
      name: { ar: p.name?.ar ?? "", en: p.name?.en ?? "" },
      description: { ar: p.description?.ar ?? "", en: p.description?.en ?? "" },
      location: {
        address: { ar: p.location?.address?.ar ?? "", en: p.location?.address?.en ?? "" },
        city: { ar: p.location?.city?.ar ?? "", en: p.location?.city?.en ?? "" },
      },
      startingPrice: p.startingPrice ?? "",
      totalUnits: p.totalUnits ?? "",
      coverImage: p.coverImage ?? "",
      deliveryDate: p.deliveryDate ?? "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/projects/${editItem._id}`, form);
        toast.success("تم تحديث المشروع");
      } else {
        await api.post("/projects", form);
        toast.success("تم إضافة المشروع");
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
      await api.delete(`/projects/${deleteId}`);
      toast.success("تم حذف المشروع");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المشاريع</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} مشروع</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة مشروع
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="بحث..."
            className="pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : projects.length === 0 ? (
          <EmptyState icon={Building2} title="لا توجد مشاريع" description="ابدأ بإضافة مشروع جديد" action={
            <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm font-medium">
              إضافة مشروع
            </button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">المشروع</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">السعر من</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">الوحدات</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">النشر</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {projects.map((p) => {
                  const { label, variant } = statusBadge(p.status);
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {p.coverImage ? (
                            <img src={p.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-[#2d5d89]" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{p.name?.ar}</p>
                            <p className="text-gray-400 text-xs">{p.location?.city?.ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.totalUnits || "—"}</td>
                      <td className="px-6 py-4">
                        <Badge variant={p.published ? "success" : "gray"}>{p.published ? "منشور" : "مسودة"}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(p)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(p._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
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

      <Pagination page={page} pages={pages} onPage={setPage} />

      {/* Form Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل المشروع" : "إضافة مشروع"} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (عربي)</label>
            <input value={form.name?.ar} onChange={(e) => f("name.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم (إنجليزي)</label>
            <input value={form.name?.en} onChange={(e) => f("name.en", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (عربي)</label>
            <textarea rows={3} value={form.description?.ar} onChange={(e) => f("description.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المدينة (عربي)</label>
            <input value={form.location?.city?.ar} onChange={(e) => f("location.city.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (عربي)</label>
            <input value={form.location?.address?.ar} onChange={(e) => f("location.address.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select value={form.status} onChange={(e) => f("status", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {statusOptions.slice(1).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ التسليم</label>
            <input type="date" value={form.deliveryDate ? form.deliveryDate.split("T")[0] : ""}
              onChange={(e) => f("deliveryDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر الابتدائي (جنيه)</label>
            <input type="number" value={form.startingPrice} onChange={(e) => f("startingPrice", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">إجمالي الوحدات</label>
            <input type="number" value={form.totalUnits} onChange={(e) => f("totalUnits", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <ImageUpload
            className="md:col-span-2"
            label="الصورة الرئيسية للمشروع"
            value={form.coverImage}
            onChange={(url) => f("coverImage", url)}
          />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)}
                className="w-4 h-4 rounded accent-[#2d5d89]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">مميز</span>
            </label>
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

      <ConfirmModal
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
        title="حذف المشروع"
        message="هل أنت متأكد من حذف هذا المشروع؟ سيتم حذف جميع بياناته."
      />
    </div>
  );
}

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
import { useToast } from "../../context/ToastContext";
import { Home } from "lucide-react";

const unitTypes = ["apartment", "villa", "studio", "duplex", "penthouse", "office", "shop", "chalet"];
const unitTypeAr = { apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه" };
const unitStatuses = ["available", "sold", "reserved"];

const emptyUnit = {
  project: "",
  unitNumber: "",
  type: "apartment",
  area: "",
  price: "",
  floor: "",
  rooms: 1,
  bathrooms: 1,
  status: "available",
  featured: false,
  published: true,
  description: { ar: "", en: "" },
};

export default function AdminUnits() {
  const toast = useToast();
  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyUnit);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/units", { params: { page, status: statusFilter, project: projectFilter } });
      setUnits(res.data.units);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل الوحدات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter, projectFilter]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100 } }).then((r) => setProjects(r.data.projects));
  }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyUnit); setModal(true); };
  const openEdit = (u) => {
    setEditItem(u);
    setForm({
      ...emptyUnit,
      ...u,
      project: u.project?._id || u.project || "",
      unitNumber: u.unitNumber ?? "",
      area: u.area ?? "",
      price: u.price ?? "",
      floor: u.floor ?? "",
      rooms: u.rooms ?? 1,
      bathrooms: u.bathrooms ?? 1,
      description: { ar: u.description?.ar ?? "", en: u.description?.en ?? "" },
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Convert numeric fields – empty string → 0, string numbers → numbers
    const payload = {
      ...form,
      area:      Number(form.area)      || 0,
      price:     Number(form.price)     || 0,
      floor:     Number(form.floor)     || 0,
      rooms:     Number(form.rooms)     || 1,
      bathrooms: Number(form.bathrooms) || 1,
    };
    try {
      if (editItem) {
        await api.put(`/units/${editItem._id}`, payload);
        toast.success("تم تحديث الوحدة");
      } else {
        await api.post("/units", payload);
        toast.success("تم إضافة الوحدة");
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
      await api.delete(`/units/${deleteId}`);
      toast.success("تم حذف الوحدة");
      setDeleteId(null);
      load();
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الوحدات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} وحدة</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          إضافة وحدة
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل المشاريع</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل الحالات</option>
          <option value="available">متاح</option>
          <option value="sold">مباع</option>
          <option value="reserved">محجوز</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : units.length === 0 ? (
          <EmptyState icon={Home} title="لا توجد وحدات" action={
            <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm font-medium">إضافة وحدة</button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {["الوحدة", "المشروع", "النوع", "المساحة", "السعر", "الطابق", "الحالة", "إجراءات"].map((h) => (
                    <th key={h} className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {units.map((u) => {
                  const { label, variant } = statusBadge(u.status);
                  return (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white text-sm">{u.unitNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.project?.name?.ar || "—"}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{unitTypeAr[u.type] || u.type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.area} م²</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.price?.toLocaleString()} ج</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.floor}</td>
                      <td className="px-6 py-4"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(u)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(u._id)}
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

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل وحدة" : "إضافة وحدة"} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المشروع</label>
            <select value={form.project} onChange={(e) => f("project", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              <option value="">اختر مشروع</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الوحدة</label>
            <input value={form.unitNumber} onChange={(e) => f("unitNumber", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع</label>
            <select value={form.type} onChange={(e) => f("type", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {unitTypes.map((t) => <option key={t} value={t}>{unitTypeAr[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select value={form.status} onChange={(e) => f("status", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {unitStatuses.map((s) => <option key={s} value={s}>{statusBadge(s).label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المساحة (م²)</label>
            <input type="number" value={form.area} onChange={(e) => f("area", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر (جنيه)</label>
            <input type="number" value={form.price} onChange={(e) => f("price", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الطابق</label>
            <input type="number" value={form.floor} onChange={(e) => f("floor", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">غرف النوم</label>
            <input type="number" value={form.rooms} onChange={(e) => f("rooms", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحمامات</label>
            <input type="number" value={form.bathrooms} onChange={(e) => f("bathrooms", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div className="flex items-center gap-4">
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

      <ConfirmModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting} />
    </div>
  );
}

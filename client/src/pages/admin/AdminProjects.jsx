import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, LayoutGrid, List, Heart, X } from "lucide-react";
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
import HelpCard from "../../Components/UI/HelpCard";

const FAVORITES_KEY = "favorites_projects";
const loadFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
};
const saveFavorites = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

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
  gallery: [],
  featured: false,
  published: false,
  startingPrice: "",
  totalUnits: "",
  latitude: "",
  longitude: "",
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
  const [view, setView] = useState("table"); // "table" | "grid"
  const [favorites, setFavorites] = useState(loadFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState("");

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  // Stats from loaded projects
  const stats = useMemo(() => ({
    total,
    active: projects.filter((p) => p.status === "ready" || p.status === "under_construction").length,
    completed: projects.filter((p) => p.status === "ready").length,
    underConstruction: projects.filter((p) => p.status === "under_construction").length,
  }), [projects, total]);

  const visibleProjects = useMemo(
    () => (showFavorites ? projects.filter((p) => favorites.includes(p._id)) : projects),
    [projects, favorites, showFavorites]
  );

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
      gallery: Array.isArray(p.gallery) ? p.gallery : (Array.isArray(p.images) ? p.images : []),
      latitude: p.latitude ?? "",
      longitude: p.longitude ?? "",
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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المشاريع</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} مشروع</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مشروع</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      <HelpCard
        title="دليل إدارة المشاريع"
        tips={[
          "أضف مشروعاً جديداً مع الاسم بالعربية والإنجليزية للظهور في نسختي الموقع",
          "أضف صوراً متعددة لمعرض الصور (Gallery) للمشروع",
          "إحداثيات الخريطة (خط العرض والطول) تُستخدم لعرض الموقع على خريطة Google",
          "حدد تاريخ التسليم المتوقع ليظهر للمشترين المحتملين",
          "علّم المشروع كـ'مميز' لظهوره في أعلى قائمة المشاريع",
          "يمكنك التبديل بين عرض البطاقات وعرض الجدول من الزر أعلى اليمين",
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المشاريع", value: stats.total },
          { label: "النشطة", value: stats.active },
          { label: "المكتملة", value: stats.completed },
          { label: "قيد الإنشاء", value: stats.underConstruction },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
            <p className="text-2xl font-bold text-[#2d5d89] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="بحث..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
        >
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFavorites((v) => !v)}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors flex items-center gap-2 ${
            showFavorites
              ? "bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-600"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavorites ? "fill-pink-500 text-pink-500" : ""}`} />
          المفضلة
        </button>
        <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2.5 text-sm ${view === "table" ? "bg-[#2d5d89] text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            title="عرض جدول"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2.5 text-sm ${view === "grid" ? "bg-[#2d5d89] text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
            title="عرض بطاقات"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table or Grid */}
      <div className={view === "grid" ? "" : "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"}>
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : visibleProjects.length === 0 ? (
          <EmptyState icon={Building2} title={showFavorites ? "لا توجد مفضلات" : "لا توجد مشاريع"} description={showFavorites ? "أضف مشاريع للمفضلة بالضغط على القلب" : "ابدأ بإضافة مشروع جديد"} action={
            !showFavorites && <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm font-medium">
              إضافة مشروع
            </button>
          } />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProjects.map((p) => {
              const { label, variant } = statusBadge(p.status);
              const fav = favorites.includes(p._id);
              return (
                <div key={p._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
                  <div className="relative h-40 bg-gray-100 dark:bg-gray-900">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(p._id)}
                      className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center"
                      title={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}
                    >
                      <Heart className={`w-4 h-4 ${fav ? "fill-pink-500 text-pink-500" : "text-gray-500"}`} />
                    </button>
                    <div className="absolute top-2 right-2"><Badge variant={variant}>{label}</Badge></div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{p.name?.ar}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{p.location?.city?.ar || "—"}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>الوحدات: {p.totalUnits || "—"}</span>
                      <span>{p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : ""}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="flex-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs font-medium hover:bg-blue-100">تعديل</button>
                      <button onClick={() => setDeleteId(p._id)} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 text-xs font-medium hover:bg-red-100">حذف</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-3 w-10"></th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المشروع</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الحالة</th>
                  <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">السعر من</th>
                  <th className="hidden md:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الوحدات</th>
                  <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">النشر</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {visibleProjects.map((p) => {
                  const { label, variant } = statusBadge(p.status);
                  const fav = favorites.includes(p._id);
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-2 py-4">
                        <button onClick={() => toggleFavorite(p._id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-pink-50" title={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
                          <Heart className={`w-4 h-4 ${fav ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
                        </button>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {p.coverImage ? (
                            <img src={p.coverImage} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d5d89]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[120px] sm:max-w-none">{p.name?.ar}</p>
                            <p className="text-gray-400 text-xs">{p.location?.city?.ar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4"><Badge variant={variant}>{label}</Badge></td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : "—"}
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{p.totalUnits || "—"}</td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4">
                        <Badge variant={p.published ? "success" : "gray"}>{p.published ? "منشور" : "مسودة"}</Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
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

          {/* Gallery */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">معرض الصور</label>
            <div className="flex gap-2 mb-2">
              <input
                value={galleryUrl}
                onChange={(e) => setGalleryUrl(e.target.value)}
                placeholder="رابط صورة"
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
              <button
                type="button"
                onClick={() => {
                  const url = galleryUrl.trim();
                  if (!url) return;
                  f("gallery", [...(form.gallery || []), url]);
                  setGalleryUrl("");
                }}
                className="px-4 py-2 rounded-xl bg-[#2d5d89] text-white text-sm font-medium"
              >إضافة</button>
            </div>
            {Array.isArray(form.gallery) && form.gallery.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {form.gallery.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative group">
                    <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => f("gallery", form.gallery.filter((_, idx) => idx !== i))}
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-90"
                    ><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">خط العرض (Latitude)</label>
            <input type="number" step="any" value={form.latitude} onChange={(e) => f("latitude", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">خط الطول (Longitude)</label>
            <input type="number" step="any" value={form.longitude} onChange={(e) => f("longitude", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>

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

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Heart, GitCompare } from "lucide-react";
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

const FAVORITES_KEY = "favorites_units";
const loadFavorites = () => {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; }
};
const saveFavorites = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

const formatPrice = (p) => {
  if (p == null || p === "") return "—";
  try {
    return `${Number(p).toLocaleString("ar-EG")} ج.م`;
  } catch {
    return `${p} ج.م`;
  }
};

const AMENITY_GROUPS = [
  { title: "الأساسيات", items: ["تكييف مركزي", "تكييف سبليت", "تدفئة مركزية"] },
  { title: "الخدمات", items: ["مصعد", "جنرايتور", "مولد كهربائي", "خزان مياه", "سخان شمسي"] },
  { title: "الأمن", items: ["أمن وحراسة 24 ساعة", "كاميرات مراقبة", "إنتركم", "باب أوتوماتيكي"] },
  { title: "السيارات", items: ["جراج خاص", "مواقف مشتركة", "جراج ثنائي"] },
  { title: "الخارج", items: ["حديقة خاصة", "حديقة مشتركة", "حمام سباحة خاص", "حمام سباحة مشتركة", "ملعب أطفال"] },
  { title: "الداخل", items: ["غرفة غسيل", "مخزن", "خادمة", "غرفة سائق"] },
  { title: "التقنية", items: ["إنترنت فايبر", "كابل/IPTV", "نظام ذكي (Smart Home)"] },
  { title: "المرافق", items: ["غاز طبيعي", "خطوط تليفون", "تمديدات كهرباء أمريكي"] },
  { title: "الموقع", items: ["إطلالة على البحر", "إطلالة على الحديقة", "إطلالة بانورامية", "طابق أرضي مع حديقة"] },
];
const AMENITIES = AMENITY_GROUPS.flatMap((g) => g.items);

const FINISHING_OPTIONS = ["تشطيب سوبر لوكس", "تشطيب لوكس", "تشطيب نصف تشطيب", "بدون تشطيب"];
const FACING_OPTIONS = ["شمال", "جنوب", "شرق", "غرب", "شمال شرق", "شمال غرب", "جنوب شرق", "جنوب غرب"];

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
  amenities: [],
  finishing: "",
  facing: "",
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
  const [favorites, setFavorites] = useState(loadFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  };

  const toggleSelected = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const stats = useMemo(() => ({
    total,
    available: units.filter((u) => u.status === "available").length,
    sold: units.filter((u) => u.status === "sold").length,
    reserved: units.filter((u) => u.status === "reserved").length,
  }), [units, total]);

  const visibleUnits = useMemo(
    () => (showFavorites ? units.filter((u) => favorites.includes(u._id)) : units),
    [units, favorites, showFavorites]
  );

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
      amenities: Array.isArray(u.amenities) ? u.amenities : [],
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
      floor:     form.floor || "",
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

  const handleBulkStatus = async () => {
    if (!bulkStatus || selected.length === 0) return;
    try {
      await Promise.all(selected.map((id) => api.put(`/units/${id}`, { status: bulkStatus })));
      toast.success(`تم تحديث ${selected.length} وحدة`);
      setSelected([]);
      setBulkStatus("");
      load();
    } catch {
      toast.error("فشل التحديث الجماعي");
    }
  };

  const compareUnits = useMemo(
    () => units.filter((u) => compareIds.includes(u._id)),
    [units, compareIds]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الوحدات</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} وحدة</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة وحدة</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الوحدات", value: stats.total },
          { label: "متاحة", value: stats.available },
          { label: "مبيعة", value: stats.sold },
          { label: "محجوزة", value: stats.reserved },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-gray-500 dark:text-gray-400 text-xs">{s.label}</p>
            <p className="text-2xl font-bold text-[#2d5d89] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
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
        <button
          onClick={() => setShowFavorites((v) => !v)}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            showFavorites
              ? "bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700 text-pink-600"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavorites ? "fill-pink-500 text-pink-500" : ""}`} />
          المفضلة
        </button>
        <button
          onClick={() => { setCompareMode((v) => !v); setCompareIds([]); }}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-2 ${
            compareMode
              ? "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-700"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          <GitCompare className="w-4 h-4" />
          مقارنة {compareMode && compareIds.length > 0 ? `(${compareIds.length})` : ""}
        </button>
        {compareMode && compareIds.length >= 2 && (
          <button onClick={() => setCompareOpen(true)} className="px-3 py-2.5 rounded-xl bg-[#2d5d89] text-white text-sm font-medium">
            عرض المقارنة
          </button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <span className="text-sm text-blue-700 dark:text-blue-300">{selected.length} وحدة محددة</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
            <option value="">تغيير الحالة للمحدد</option>
            <option value="available">متاح</option>
            <option value="sold">مباع</option>
            <option value="reserved">محجوز</option>
          </select>
          <button onClick={handleBulkStatus} disabled={!bulkStatus}
            className="px-4 py-2 rounded-lg bg-[#2d5d89] text-white text-sm font-medium disabled:opacity-50">
            تطبيق
          </button>
          <button onClick={() => setSelected([])} className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">إلغاء التحديد</button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="h-64" size="lg" />
        ) : visibleUnits.length === 0 ? (
          <EmptyState icon={Home} title={showFavorites ? "لا توجد مفضلات" : "لا توجد وحدات"} action={
            !showFavorites && <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm font-medium">إضافة وحدة</button>
          } />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-2 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={visibleUnits.length > 0 && selected.length === visibleUnits.length}
                      onChange={(e) => setSelected(e.target.checked ? visibleUnits.map((u) => u._id) : [])}
                      className="w-4 h-4 rounded accent-[#2d5d89]"
                    />
                  </th>
                  <th className="px-2 py-3 w-10"></th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الوحدة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المشروع</th>
                  <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">النوع</th>
                  <th className="hidden md:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المساحة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">السعر</th>
                  <th className="hidden lg:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الدور</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {visibleUnits.map((u) => {
                  const { label, variant } = statusBadge(u.status);
                  const fav = favorites.includes(u._id);
                  const inCompare = compareIds.includes(u._id);
                  return (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${inCompare ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                      <td className="px-2 py-4">
                        <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggleSelected(u._id)}
                          className="w-4 h-4 rounded accent-[#2d5d89]" />
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <button onClick={() => toggleFavorite(u._id)} title={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"}>
                            <Heart className={`w-4 h-4 ${fav ? "fill-pink-500 text-pink-500" : "text-gray-400"}`} />
                          </button>
                          {compareMode && (
                            <button onClick={() => toggleCompare(u._id)} title="إضافة للمقارنة">
                              <GitCompare className={`w-4 h-4 ${inCompare ? "text-amber-600" : "text-gray-400"}`} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 dark:text-white text-sm">{u.unitNumber}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[100px] sm:max-w-none truncate">{u.project?.name?.ar || "—"}</td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{unitTypeAr[u.type] || u.type}</td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.area} م²</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{formatPrice(u.price)}</td>
                      <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{u.floor}</td>
                      <td className="px-4 sm:px-6 py-4"><Badge variant={variant}>{label}</Badge></td>
                      <td className="px-4 sm:px-6 py-4">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الدور</label>
            <input type="text" value={form.floor} onChange={(e) => f("floor", e.target.value)}
              placeholder="مثال: الأرضي، الدور الأول، B1"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الإنهاء</label>
            <select value={form.finishing} onChange={(e) => f("finishing", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              <option value="">— اختر —</option>
              {FINISHING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الجهة</label>
            <select value={form.facing} onChange={(e) => f("facing", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              <option value="">— اختر —</option>
              {FACING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
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
          {/* Amenities */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المرافق والمميزات</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => {
                const selected = (form.amenities || []).includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      const cur = form.amenities || [];
                      f("amenities", selected ? cur.filter((x) => x !== a) : [...cur, a]);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      selected
                        ? "bg-[#2d5d89] text-white border-[#2d5d89]"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
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

      {/* Compare modal */}
      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="مقارنة الوحدات" size="lg">
        {compareUnits.length === 0 ? (
          <p className="text-center text-gray-500 py-6">لا توجد وحدات للمقارنة</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-2 px-3 text-gray-500 font-semibold">الخاصية</th>
                  {compareUnits.map((u) => (
                    <th key={u._id} className="text-right py-2 px-3 text-gray-900 dark:text-white">
                      {u.unitNumber}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {[
                  ["المشروع", (u) => u.project?.name?.ar || "—"],
                  ["النوع", (u) => unitTypeAr[u.type] || u.type],
                  ["الحالة", (u) => statusBadge(u.status).label],
                  ["المساحة", (u) => `${u.area} م²`],
                  ["السعر", (u) => formatPrice(u.price)],
                  ["الطابق", (u) => u.floor ?? "—"],
                  ["غرف", (u) => u.rooms ?? "—"],
                  ["حمامات", (u) => u.bathrooms ?? "—"],
                  ["المرافق", (u) => (u.amenities && u.amenities.length ? u.amenities.join("، ") : "—")],
                ].map(([label, fn]) => (
                  <tr key={label}>
                    <td className="py-2 px-3 text-gray-500">{label}</td>
                    {compareUnits.map((u) => (
                      <td key={u._id} className="py-2 px-3 text-gray-800 dark:text-gray-200">{fn(u)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}

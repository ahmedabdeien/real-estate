/**
 * AdminProjects — migrated to TanStack Query + shared UI components
 * Preserves: DnD reorder (sortable), grid/table toggle, favorites, unit counts
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding, FaPlus, FaPen, FaTrash, FaMagnifyingGlass,
  FaTableList, FaTableCellsLarge, FaHeart, FaXmark, FaSpinner,
  FaGrip, FaFloppyDisk, FaArrowsUpDown, FaSquareCheck,
} from "react-icons/fa6";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../../hooks/queries/useProjects";
import { useUnits } from "../../hooks/queries/useUnits";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, SelectField, TextareaField, ToggleField } from "../../Components/UI/FormField";
import StatusBadge from "../../Components/UI/StatusBadge";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/axios";

// ── Constants ──────────────────────────────────────────────────────────────
const FAVORITES_KEY = "favorites_projects";
const loadFavs  = () => { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; } };
const saveFavs  = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

const STATUS_OPTIONS = [
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready",              label: "جاهز" },
  { value: "sold_out",           label: "نفذت الوحدات" },
  { value: "coming_soon",        label: "قريباً" },
];

const STATUS_BADGE_MAP = {
  under_construction: "قيد الإنشاء",
  ready:              "جاهز",
  sold_out:           "مباعة",
  coming_soon:        "قريباً",
};

const PREDEFINED_AMENITIES = [
  "حمام سباحة", "نادي رياضي", "أمن 24 ساعة", "مواقف سيارات",
  "حديقة", "مدرسة", "مسجد", "مركز تجاري", "منطقة ألعاب", "كهرباء احتياطي",
];

const emptyProject = {
  name: { ar: "", en: "" }, description: { ar: "", en: "" },
  location: { address: { ar: "", en: "" }, city: { ar: "", en: "" }, lat: "", lng: "" },
  status: "under_construction", coverImage: "", images: [],
  featured: false, published: false, startingPrice: "", totalUnits: "",
  amenities: [], developer: { ar: "", en: "" }, videoUrl: "", brochureUrl: "", mapEmbedUrl: "",
};

// Deep nested setter helper
function setDeep(obj, path, value) {
  const keys = path.split(".");
  const next = { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...cur[keys[i]] };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// ── Sortable Row ──────────────────────────────────────────────────────────
function SortableRow({ project: p, reorderMode, favorites, onToggleFav, onEdit, onDelete, selected, onToggleSelect, unitCount }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p._id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const fav = favorites.includes(p._id);

  return (
    <tr ref={setNodeRef} style={style}
      className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-2 py-3 w-10">
        {reorderMode ? (
          <div {...attributes} {...listeners}
            className="w-8 h-8 flex items-center justify-center text-gray-400 cursor-grab active:cursor-grabbing">
            <FaGrip className="w-4 h-4" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <input type="checkbox" checked={!!selected} onChange={() => onToggleSelect(p._id)}
              className="w-4 h-4 rounded cursor-pointer accent-[color:var(--primary)]" />
            <button onClick={() => onToggleFav(p._id)}>
              <FaHeart className={`w-3.5 h-3.5 ${fav ? "text-pink-500" : "text-gray-300"}`} />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {p.coverImage ? (
            <img src={p.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--primary)/10" }}>
              <FaBuilding className="w-4 h-4" style={{ color: "var(--primary)" }} />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-[150px]">{p.name?.ar}</p>
            <p className="text-gray-400 text-xs">{p.location?.city?.ar}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={p.status} label={STATUS_BADGE_MAP[p.status]} />
      </td>
      <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : "—"}
      </td>
      <td className="hidden md:table-cell px-4 py-3">
        <div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{p.totalUnits || "—"}</span>
          {unitCount?.total > 0 && (
            <div className="mt-1">
              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.round((unitCount.available / unitCount.total) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">{unitCount.available} متاح</p>
            </div>
          )}
        </div>
      </td>
      <td className="hidden sm:table-cell px-4 py-3">
        <StatusBadge status={p.published ? "published" : "draft"} />
      </td>
      <td className="px-4 py-3">
        {!reorderMode && (
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(p)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
              <FaPen className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(p)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function AdminProjects() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [form,          setForm]          = useState(emptyProject);
  const [editItem,      setEditItem]      = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [activeTab,     setActiveTab]     = useState("ar");
  const [galleryUrl,    setGalleryUrl]    = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [view,          setView]          = useState("table");
  const [favorites,     setFavorites]     = useState(loadFavs);
  const [showFavs,      setShowFavs]      = useState(false);
  const [reorderMode,   setReorderMode]   = useState(false);
  const [localProjects, setLocalProjects] = useState(null); // for reorder only
  const [selectedIds,   setSelectedIds]   = useState([]);
  const [bulkStatus,    setBulkStatus]    = useState("");
  const [unitCounts,    setUnitCounts]    = useState({});
  const [statusFilter,  setStatusFilter]  = useState("");

  const table         = useTableState({ defaultPageSize: 15 });
  const confirmDelete = useDisclosure();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Queries
  const { data, isLoading, isFetching, refetch } = useProjects({
    page:   table.queryParams.page,
    limit:  table.queryParams.pageSize,
    search: table.queryParams.search,
    status: statusFilter || undefined,
  });

  const projects = localProjects ?? (data?.projects ?? []);
  const total    = data?.total ?? 0;

  // Reset localProjects when data refreshes (and not reordering)
  useEffect(() => {
    if (!reorderMode) setLocalProjects(null);
  }, [data, reorderMode]);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  // Stats
  const stats = useMemo(() => ({
    total,
    active:           projects.filter((p) => ["ready","under_construction"].includes(p.status)).length,
    completed:        projects.filter((p) => p.status === "ready").length,
    underConstruction:projects.filter((p) => p.status === "under_construction").length,
  }), [projects, total]);

  const visibleProjects = useMemo(() =>
    showFavs ? projects.filter((p) => favorites.includes(p._id)) : projects,
    [projects, favorites, showFavs]
  );

  // Unit counts
  useEffect(() => {
    if (!projects.length) return;
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(projects.map(async (p) => {
        try {
          const res = await apiClient.get("/units", { params: { project: p._id, limit: 200 } });
          const units = res.data.units ?? [];
          counts[p._id] = { total: res.data.total ?? units.length, available: units.filter((u) => u.status === "متاحة" || u.status === "available").length };
        } catch { counts[p._id] = { total: 0, available: 0 }; }
      }));
      setUnitCounts(counts);
    };
    fetchCounts();
  }, [projects]);

  // Auto-open edit from URL ?edit=id
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !projects.length) return;
    const found = projects.find((p) => p._id === editId);
    if (found) { openEdit(found); setSearchParams({}, { replace: true }); }
  }, [projects, searchParams]);

  // ── Helpers ──
  const f = useCallback((path, value) => setForm((prev) => setDeep(prev, path, value)), []);

  const openCreate = () => { setEditItem(null); setForm(emptyProject); setActiveTab("ar"); setModalOpen(true); };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      ...emptyProject, ...p,
      name:        { ar: p.name?.ar ?? "", en: p.name?.en ?? "" },
      description: { ar: p.description?.ar ?? "", en: p.description?.en ?? "" },
      location:    { address: { ar: p.location?.address?.ar ?? "", en: p.location?.address?.en ?? "" },
                     city:    { ar: p.location?.city?.ar ?? "", en: p.location?.city?.en ?? "" },
                     lat: p.location?.lat ?? "", lng: p.location?.lng ?? "" },
      startingPrice: p.startingPrice ?? "", totalUnits: p.totalUnits ?? "",
      coverImage: p.coverImage ?? "", images: Array.isArray(p.images) ? p.images : [],
      amenities:  Array.isArray(p.amenities) ? p.amenities : [],
      developer:  p.developer || { ar: "", en: "" },
      videoUrl: p.videoUrl || "", brochureUrl: p.brochureUrl || "", mapEmbedUrl: p.mapEmbedUrl || "",
    });
    setActiveTab("ar");
    setModalOpen(true);
  };

  const buildPayload = () => ({
    name: form.name, description: form.description,
    location: { address: form.location?.address || {}, city: form.location?.city || {},
      lat: form.location?.lat ? parseFloat(form.location.lat) : undefined,
      lng: form.location?.lng ? parseFloat(form.location.lng) : undefined,
    },
    status: form.status, coverImage: form.coverImage, images: form.images || [],
    featured: form.featured, published: form.published,
    startingPrice: Number(form.startingPrice) || 0, totalUnits: Number(form.totalUnits) || 0,
    amenities: form.amenities || [], developer: form.developer || {},
    videoUrl: form.videoUrl || "", brochureUrl: form.brochureUrl || "", mapEmbedUrl: form.mapEmbedUrl || "",
  });

  const handleSave = async () => {
    if (!form.name?.ar?.trim()) return toast.error("اسم المشروع بالعربية مطلوب");
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem._id, data: buildPayload() });
        toast.success("تم تحديث المشروع");
      } else {
        await createMutation.mutateAsync(buildPayload());
        toast.success("تم إنشاء المشروع");
      }
      setModalOpen(false);
    } catch {
      toast.error("حدث خطأ، حاول مجدداً");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف المشروع");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next); return next;
    });
  };

  // Reorder DnD
  const handleDragEnd = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return;
    setLocalProjects((prev) => {
      const src = prev ?? projects;
      const oi = src.findIndex((p) => p._id === active.id);
      const ni = src.findIndex((p) => p._id === over.id);
      return arrayMove(src, oi, ni);
    });
  }, [projects]);

  const saveOrder = async () => {
    try {
      const order = (localProjects ?? projects).map((p, i) => ({ _id: p._id, order: i }));
      await apiClient.put("/projects/reorder", { order });
      toast.success("تم حفظ الترتيب");
      setReorderMode(false);
      setLocalProjects(null);
      refetch();
    } catch { toast.error("فشل حفظ الترتيب"); }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => updateMutation.mutateAsync({ id, data: { status: bulkStatus } })));
    toast.success(`تم تحديث ${selectedIds.length} مشروع`);
    setSelectedIds([]); setBulkStatus("");
  };

  const addGalleryUrl = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    f("images", [...(form.images || []), url]);
    setGalleryUrl("");
  };

  const addAmenity = () => {
    const a = customAmenity.trim();
    if (!a || (form.amenities || []).includes(a)) return;
    f("amenities", [...(form.amenities || []), a]);
    setCustomAmenity("");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div dir="rtl">
      {/* Header */}
      <PageHeader
        title="المشاريع"
        subtitle={`${total} مشروع`}
        icon={<FaBuilding />}
        loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي",    value: stats.total },
          { label: "النشطة",      value: stats.active },
          { label: "المكتملة",    value: stats.completed },
          { label: "قيد الإنشاء", value: stats.underConstruction },
        ]}
        actions={
          reorderMode ? (
            <>
              <SecondaryButton icon={<FaXmark />} onClick={() => { setReorderMode(false); setLocalProjects(null); }}>
                إلغاء
              </SecondaryButton>
              <button onClick={saveOrder}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                <FaFloppyDisk className="w-3.5 h-3.5" />
                حفظ الترتيب
              </button>
            </>
          ) : (
            <>
              <SecondaryButton icon={<FaArrowsUpDown className="w-3.5 h-3.5" />}
                onClick={() => { setView("table"); setReorderMode(true); }}>
                ترتيب
              </SecondaryButton>
              <PrimaryButton icon={<FaPlus />} onClick={openCreate}>إضافة مشروع</PrimaryButton>
            </>
          )
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input value={table.queryParams.search} onChange={(e) => table.handleSearch(e.target.value)}
              placeholder="بحث..." className={`${inputCls} pr-9 py-2`} />
          </div>
          <SelectField value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); table.resetPage(); }}
            className="w-auto py-2 text-sm">
            <option value="">كل الحالات</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </SelectField>
          <button onClick={() => setShowFavs((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
              showFavs ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/20" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600"
            }`}>
            <FaHeart className={`w-3.5 h-3.5 ${showFavs ? "text-pink-500" : "text-gray-300"}`} />
            المفضلة
          </button>
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
            {[
              { key: "table", icon: <FaTableList className="w-3.5 h-3.5" /> },
              { key: "grid",  icon: <FaTableCellsLarge className="w-3.5 h-3.5" /> },
            ].map((v) => (
              <button key={v.key} onClick={() => setView(v.key)}
                className={`px-3 py-2 transition-colors ${view === v.key ? "text-white" : "text-gray-500 bg-white dark:bg-gray-800"}`}
                style={view === v.key ? { background: "var(--primary)" } : {}}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Bulk actions */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border bg-[color:var(--primary)]/5 border-[color:var(--primary)]/20">
            <FaSquareCheck className="w-4 h-4 text-[color:var(--primary)]" />
            <span className="text-sm font-bold text-[color:var(--primary)]">{selectedIds.length} مشروع محدد</span>
            <SelectField value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-auto text-sm">
              <option value="">تغيير الحالة</option>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </SelectField>
            <button onClick={handleBulkStatus} disabled={!bulkStatus}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--primary)" }}>تطبيق</button>
            <button onClick={() => setSelectedIds([])} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FaSpinner className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <FaBuilding className="w-10 h-10 opacity-20" />
            <p className="text-sm">{showFavs ? "لا توجد مفضلات" : "لا توجد مشاريع"}</p>
            {!showFavs && <PrimaryButton icon={<FaPlus />} onClick={openCreate}>إضافة مشروع</PrimaryButton>}
          </div>
        ) : view === "grid" ? (
          // Grid view
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleProjects.map((p) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-100 dark:bg-gray-800">
                  {p.coverImage ? <img src={p.coverImage} alt="" className="w-full h-full object-cover" /> : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaBuilding className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                  <button onClick={() => toggleFav(p._id)}
                    className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center">
                    <FaHeart className={`w-4 h-4 ${favorites.includes(p._id) ? "text-pink-500" : "text-gray-400"}`} />
                  </button>
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={p.status} label={STATUS_BADGE_MAP[p.status]} size="xs" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{p.name?.ar}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{p.location?.city?.ar || "—"}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>الوحدات: {p.totalUnits || "—"}</span>
                    <span>{p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : ""}</span>
                  </div>
                  {unitCounts[p._id]?.total > 0 && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.round((unitCounts[p._id].available / unitCounts[p._id].total) * 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-0.5">{unitCounts[p._id].available} وحدة متاحة</p>
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold">تعديل</button>
                    <button onClick={() => confirmDelete.open(p)} className="py-1.5 px-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-semibold">حذف</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Table view with sortable DnD
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            {reorderMode && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 text-amber-700 text-xs font-semibold">
                <FaGrip className="w-3.5 h-3.5" />
                وضع الترتيب — اسحب المشاريع لتغيير ترتيبها، ثم اضغط "حفظ الترتيب"
              </div>
            )}
            <div className="overflow-x-auto">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {["", "المشروع", "الحالة", "السعر من", "الوحدات", "النشر", ""].map((h, i) => (
                        <th key={i} className="text-right px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <SortableContext items={visibleProjects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
                    <tbody>
                      {visibleProjects.map((p) => (
                        <SortableRow key={p._id} project={p} reorderMode={reorderMode}
                          favorites={favorites} onToggleFav={toggleFav}
                          onEdit={openEdit} onDelete={confirmDelete.open}
                          selected={selectedIds.includes(p._id)}
                          onToggleSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
                          unitCount={unitCounts[p._id]} />
                      ))}
                    </tbody>
                  </SortableContext>
                </table>
              </DndContext>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > table.queryParams.pageSize && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>عرض {visibleProjects.length} من {total}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => table.handlePageChange(table.queryParams.page - 1)} disabled={table.queryParams.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">السابق</button>
              <span className="px-3 font-semibold">{table.queryParams.page}</span>
              <button onClick={() => table.handlePageChange(table.queryParams.page + 1)} disabled={visibleProjects.length < table.queryParams.pageSize}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "تعديل المشروع" : "إضافة مشروع جديد"}
        icon={<FaBuilding className="w-4 h-4" />} size="3xl"
        footer={
          <>
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
              إلغاء
            </button>
            <button onClick={handleSave} disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary)" }}>
              {isPending && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
              {editItem ? "حفظ التغييرات" : "إضافة المشروع"}
            </button>
          </>
        }>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-800 pb-3">
          {[{ key: "ar", label: "عربي" }, { key: "en", label: "English" }, { key: "details", label: "تفاصيل" }, { key: "media", label: "وسائط" }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === t.key ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              style={activeTab === t.key ? { background: "var(--primary)" } : {}}>{t.label}</button>
          ))}
        </div>

        {/* Arabic tab */}
        {activeTab === "ar" && (
          <div className="space-y-4">
            <FormField label="اسم المشروع (عربي)" required>
              <input value={form.name?.ar} onChange={(e) => f("name.ar", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="الوصف (عربي)">
              <TextareaField value={form.description?.ar} onChange={(e) => f("description.ar", e.target.value)} rows={4} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="المدينة (عربي)">
                <input value={form.location?.city?.ar} onChange={(e) => f("location.city.ar", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="العنوان (عربي)">
                <input value={form.location?.address?.ar} onChange={(e) => f("location.address.ar", e.target.value)} className={inputCls} />
              </FormField>
            </div>
          </div>
        )}

        {/* English tab */}
        {activeTab === "en" && (
          <div className="space-y-4">
            <FormField label="Project Name (English)">
              <input value={form.name?.en} onChange={(e) => f("name.en", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Description (English)">
              <TextareaField value={form.description?.en} onChange={(e) => f("description.en", e.target.value)} rows={4} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="City (English)">
                <input value={form.location?.city?.en} onChange={(e) => f("location.city.en", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="Address (English)">
                <input value={form.location?.address?.en} onChange={(e) => f("location.address.en", e.target.value)} className={inputCls} />
              </FormField>
            </div>
          </div>
        )}

        {/* Details tab */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="الحالة">
                <SelectField value={form.status} onChange={(e) => f("status", e.target.value)}>
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </SelectField>
              </FormField>
              <FormField label="السعر الابتدائي (ج)">
                <input type="number" value={form.startingPrice} onChange={(e) => f("startingPrice", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="إجمالي الوحدات">
                <input type="number" value={form.totalUnits} onChange={(e) => f("totalUnits", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="المطوّر العقاري">
                <input value={form.developer?.ar} onChange={(e) => f("developer.ar", e.target.value)} placeholder="اسم الشركة المطورة" className={inputCls} />
              </FormField>
            </div>
            <FormField label="المميزات والمرافق">
              <div className="flex flex-wrap gap-2 mb-3">
                {PREDEFINED_AMENITIES.map((a) => (
                  <button key={a} type="button" onClick={() => {
                    const cur = form.amenities || [];
                    f("amenities", cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]);
                  }}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      (form.amenities || []).includes(a) ? "text-white border-transparent" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-[color:var(--primary)]"
                    }`}
                    style={(form.amenities || []).includes(a) ? { background: "var(--primary)" } : {}}>
                    {a}
                  </button>
                ))}
                {(form.amenities || []).filter((a) => !PREDEFINED_AMENITIES.includes(a)).map((a) => (
                  <button key={a} type="button" onClick={() => f("amenities", (form.amenities || []).filter((x) => x !== a))}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full text-white border-transparent"
                    style={{ background: "var(--primary)" }}>
                    {a} <FaXmark className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); }}}
                  placeholder="إضافة ميزة مخصصة..." className={`${inputCls} flex-1`} />
                <button type="button" onClick={addAmenity}
                  className="px-3 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--primary)" }}>+</button>
              </div>
            </FormField>
            <div className="flex items-center gap-6">
              <ToggleField checked={form.featured} onChange={(v) => f("featured", v)} label="مشروع مميز" description="يظهر في أعلى القائمة" />
              <ToggleField checked={form.published} onChange={(v) => f("published", v)} label="منشور" description="يظهر للزوار" />
            </div>
          </div>
        )}

        {/* Media tab */}
        {activeTab === "media" && (
          <div className="space-y-4">
            <ImageUpload label="الصورة الرئيسية" value={form.coverImage} onChange={(url) => f("coverImage", url)} />
            <FormField label="معرض الصور">
              <div className="flex gap-2 mb-2">
                <input value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGalleryUrl(); }}}
                  placeholder="رابط صورة" className={`${inputCls} flex-1`} />
                <button type="button" onClick={addGalleryUrl}
                  className="px-4 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--primary)" }}>إضافة</button>
              </div>
              {(form.images || []).length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {form.images.map((url, i) => (
                    <div key={`${url}-${i}`} className="relative group">
                      <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => f("images", form.images.filter((_, idx) => idx !== i))}
                        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                        <FaXmark className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormField>
            <FormField label="رابط الفيديو (YouTube)">
              <input value={form.videoUrl} onChange={(e) => f("videoUrl", e.target.value)}
                placeholder="https://youtube.com/watch?v=..." className={inputCls} />
            </FormField>
            <FormField label="رابط تضمين الخريطة" hint="Google Maps → مشاركة → تضمين → src من iframe">
              <input value={form.mapEmbedUrl} onChange={(e) => f("mapEmbedUrl", e.target.value)}
                placeholder="https://maps.google.com/maps?q=..." className={inputCls} />
            </FormField>
          </div>
        )}
      </AdminModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close}
        onConfirm={handleDelete}
        title="حذف المشروع"
        message={`هل تريد حذف مشروع "${confirmDelete.data?.name?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

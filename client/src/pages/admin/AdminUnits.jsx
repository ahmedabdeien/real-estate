/**
 * AdminUnits — migrated to TanStack Query + shared UI components
 * Preserves: favorites, compare mode, floor plan view, bulk actions, visibility toggle, CSV export
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHouseChimney, FaPlus, FaPen, FaTrash, FaHeart, FaCodeCompare,
  FaEye, FaEyeSlash, FaDownload, FaTableList, FaLayerGroup,
  FaMagnifyingGlass, FaXmark, FaSpinner, FaArrowsRotate,
} from "react-icons/fa6";

import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from "../../hooks/queries/useUnits";
import { useProjects } from "../../hooks/queries/useProjects";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, filterInputCls, SelectField, TextareaField, ToggleField } from "../../Components/UI/FormField";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/axios";

// ── Constants ──────────────────────────────────────────────────────────────
const FAVORITES_KEY = "favorites_units";
const loadFavs  = () => { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; } };
const saveFavs  = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

const formatPrice = (p) => {
  if (p == null || p === "") return "—";
  try { return `${Number(p).toLocaleString("ar-EG")} ج.م`; } catch { return `${p} ج.م`; }
};

const UNIT_TYPES      = ["apartment", "villa", "studio", "duplex", "penthouse", "office", "shop", "chalet"];
const UNIT_TYPE_AR    = { apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه" };
const UNIT_STATUSES   = ["available", "sold", "reserved"];
const UNIT_STATUS_AR  = { available: "متاح", sold: "مباع", reserved: "محجوز" };

const FINISHING_OPTIONS = ["تشطيب سوبر لوكس", "تشطيب لوكس", "تشطيب نصف تشطيب", "بدون تشطيب"];
const FACING_OPTIONS    = ["شمال", "جنوب", "شرق", "غرب", "شمال شرق", "شمال غرب", "جنوب شرق", "جنوب غرب"];

const AMENITY_GROUPS = [
  { label: "التكييف والتدفئة",    items: ["تكييف مركزي","تكييف سبليت","تدفئة مركزية","تهوية صناعية"] },
  { label: "الخدمات الأساسية",   items: ["مصعد","جنرايتور","مولد كهربائي","خزان مياه","سخان شمسي","غاز طبيعي","خطوط تليفون","تمديدات كهرباء أمريكي"] },
  { label: "الأمن والحماية",     items: ["أمن وحراسة 24 ساعة","كاميرات مراقبة","إنتركم","باب أوتوماتيكي","بواب"] },
  { label: "السيارات",            items: ["جراج خاص","جراج مشترك","جراج ثنائي","مواقف خارجية"] },
  { label: "المساحات الخارجية",  items: ["حديقة خاصة","حديقة مشتركة","تراس/شرفة","روف خاص","ملعب أطفال"] },
  { label: "المرافق الترفيهية",  items: ["حمام سباحة خاص","حمام سباحة مشترك","جيم وصالة رياضة","نادي اجتماعي","ملعب تنس/رياضة"] },
  { label: "الغرف الإضافية",     items: ["غرفة غسيل","مخزن","غرفة سائق","غرفة خادمة","مكتب منزلي"] },
  { label: "التقنية",             items: ["إنترنت فايبر","كابل/IPTV","نظام ذكي (Smart Home)","طاقة شمسية"] },
  { label: "الإطلالة والموقع",   items: ["إطلالة على البحر","إطلالة على الحديقة","إطلالة بانورامية","طابق أرضي مع حديقة","زاوية/كورنر"] },
];

const STATUS_COLOR = {
  available: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 text-emerald-700 dark:text-emerald-300",
  sold:      "bg-red-100 dark:bg-red-900/40 border-red-300 text-red-700 dark:text-red-300",
  reserved:  "bg-amber-100 dark:bg-amber-900/40 border-amber-300 text-amber-700 dark:text-amber-300",
};

const emptyUnit = {
  project: "", unitNumber: "", type: "apartment",
  area: "", price: "", floor: "", rooms: 1, bathrooms: 1,
  status: "available", featured: false, published: true,
  description: { ar: "", en: "" }, amenities: [],
  finishing: "", facing: "",
};

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminUnits() {
  const toast = useToast();

  const [form,            setForm]           = useState(emptyUnit);
  const [editItem,        setEditItem]       = useState(null);
  const [modalOpen,       setModalOpen]      = useState(false);
  const [activeModalTab,  setActiveModalTab] = useState("ar");
  const [activeView,      setActiveView]     = useState("list"); // "list" | "floor"
  const [favorites,       setFavorites]      = useState(loadFavs);
  const [showFavs,        setShowFavs]       = useState(false);
  const [selected,        setSelected]       = useState([]);
  const [bulkStatus,      setBulkStatus]     = useState("");
  const [compareMode,     setCompareMode]    = useState(false);
  const [compareIds,      setCompareIds]     = useState([]);
  const [compareOpen,     setCompareOpen]    = useState(false);
  const [customAmenity,   setCustomAmenity]  = useState("");
  const [priceMin,        setPriceMin]       = useState("");
  const [priceMax,        setPriceMax]       = useState("");
  const [typeFilter,      setTypeFilter]     = useState("");
  const [unitSearch,      setUnitSearch]     = useState("");
  const [statusFilter,    setStatusFilter]   = useState("");
  const [projectFilter,   setProjectFilter]  = useState("");

  const table         = useTableState({ defaultPageSize: 20 });
  const confirmDelete = useDisclosure();

  // ── Queries ──
  const { data, isLoading, isFetching, refetch } = useUnits({
    page:    table.queryParams.page,
    limit:   table.queryParams.pageSize,
    status:  statusFilter || undefined,
    project: projectFilter || undefined,
  });

  const units  = data?.units ?? [];
  const total  = data?.total ?? 0;

  const { data: projData } = useProjects({ limit: 100 });
  const projects = projData?.projects ?? [];

  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();
  const deleteMutation = useDeleteUnit();

  // ── Derived state ──
  const stats = useMemo(() => ({
    total,
    available: units.filter((u) => u.status === "available").length,
    sold:      units.filter((u) => u.status === "sold").length,
    reserved:  units.filter((u) => u.status === "reserved").length,
  }), [units, total]);

  const baseUnits = showFavs ? units.filter((u) => favorites.includes(u._id)) : units;

  const filteredUnits = useMemo(() => {
    let r = baseUnits;
    if (priceMin !== "") r = r.filter((u) => u.price >= Number(priceMin));
    if (priceMax !== "") r = r.filter((u) => u.price <= Number(priceMax));
    if (typeFilter) r = r.filter((u) => u.type === typeFilter);
    if (unitSearch.trim()) {
      const q = unitSearch.toLowerCase();
      r = r.filter((u) => u.unitNumber?.toString().toLowerCase().includes(q) || u.description?.ar?.toLowerCase().includes(q));
    }
    return r;
  }, [baseUnits, priceMin, priceMax, typeFilter, unitSearch]);

  const floorGroups = useMemo(() => {
    const g = {};
    filteredUnits.forEach((u) => {
      const k = u.floor?.trim() || "غير محدد";
      if (!g[k]) g[k] = [];
      g[k].push(u);
    });
    return g;
  }, [filteredUnits]);

  const compareUnits = useMemo(() => units.filter((u) => compareIds.includes(u._id)), [units, compareIds]);

  // ── Helpers ──
  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const fNested = (key, subKey, val) => setForm((p) => ({ ...p, [key]: { ...p[key], [subKey]: val } }));

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next); return next;
    });
  };

  const toggleSelected = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const openCreate = () => { setEditItem(null); setForm(emptyUnit); setActiveModalTab("ar"); setModalOpen(true); };

  const openEdit = (u) => {
    setEditItem(u);
    setForm({
      ...emptyUnit, ...u,
      project:     u.project?._id || u.project || "",
      unitNumber:  u.unitNumber ?? "",
      area:        u.area ?? "",
      price:       u.price ?? "",
      floor:       u.floor ?? "",
      rooms:       u.rooms ?? 1,
      bathrooms:   u.bathrooms ?? 1,
      description: { ar: u.description?.ar ?? "", en: u.description?.en ?? "" },
      amenities:   Array.isArray(u.amenities) ? u.amenities : [],
    });
    setActiveModalTab("ar");
    setModalOpen(true);
  };

  const buildPayload = () => ({
    ...form,
    area:      Number(form.area)      || 0,
    price:     Number(form.price)     || 0,
    floor:     form.floor || "",
    rooms:     Number(form.rooms)     || 1,
    bathrooms: Number(form.bathrooms) || 1,
  });

  const handleSave = async () => {
    if (!form.project) return toast.error("اختر المشروع أولاً");
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem._id, data: buildPayload() });
        toast.success("تم تحديث الوحدة");
      } else {
        await createMutation.mutateAsync(buildPayload());
        toast.success("تم إضافة الوحدة");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف الوحدة");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selected.length) return;
    await Promise.all(selected.map((id) => updateMutation.mutateAsync({ id, data: { status: bulkStatus } })));
    toast.success(`تم تحديث ${selected.length} وحدة`);
    setSelected([]); setBulkStatus("");
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await apiClient.patch(`/units/${id}/toggle-visibility`);
      toast.success(res.data.message || "تم تحديث الرؤية");
      refetch();
    } catch { toast.error("فشل تحديث الرؤية"); }
  };

  const handleProjectVisibility = async (isVisible) => {
    if (!projectFilter) return;
    try {
      const res = await apiClient.patch(`/units/project/${projectFilter}/visibility`, { isVisible });
      toast.success(res.data.message || (isVisible ? "تم إظهار جميع الوحدات" : "تم إخفاء جميع الوحدات"));
      refetch();
    } catch { toast.error("فشل التحديث"); }
  };

  const exportCSV = () => {
    const headers = ["رقم الوحدة","المشروع","النوع","الحالة","المساحة","السعر","الدور","غرف","حمامات"];
    const rows = filteredUnits.map((u) => [
      u.unitNumber, u.project?.name?.ar || "", UNIT_TYPE_AR[u.type] || u.type,
      UNIT_STATUS_AR[u.status] || u.status, u.area, u.price, u.floor || "", u.rooms, u.bathrooms,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "units.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div dir="rtl">
      {/* Header */}
      <PageHeader
        title="الوحدات"
        subtitle={`${total} وحدة`}
        icon={<FaHouseChimney />}
        loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي",  value: stats.total,     color: "text-[color:var(--primary)]" },
          { label: "متاحة",     value: stats.available, color: "text-emerald-600" },
          { label: "محجوزة",    value: stats.reserved,  color: "text-amber-600" },
          { label: "مبيعة",     value: stats.sold,       color: "text-red-600" },
        ]}
        actions={<PrimaryButton icon={<FaPlus />} onClick={openCreate}>إضافة وحدة</PrimaryButton>}
      />

      {/* Filters bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)}
              placeholder="رقم الوحدة..." className={`${filterInputCls} pr-9 w-36`} />
            {unitSearch && (
              <button onClick={() => setUnitSearch("")} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
                <FaXmark className="w-3 h-3" />
              </button>
            )}
          </div>
          {/* Project filter */}
          <SelectField value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); table.resetPage(); }} className="w-auto py-2 text-sm">
            <option value="">كل المشاريع</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
          </SelectField>
          {/* Status filter */}
          <SelectField value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); table.resetPage(); }} className="w-auto py-2 text-sm">
            <option value="">كل الحالات</option>
            <option value="available">متاح</option>
            <option value="sold">مباع</option>
            <option value="reserved">محجوز</option>
          </SelectField>
          {/* Type filter */}
          <SelectField value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-auto py-2 text-sm">
            <option value="">كل الأنواع</option>
            {UNIT_TYPES.map((t) => <option key={t} value={t}>{UNIT_TYPE_AR[t]}</option>)}
          </SelectField>
          {/* Price range */}
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)}
            placeholder="سعر من" className={`${filterInputCls} w-28`} />
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)}
            placeholder="سعر إلى" className={`${filterInputCls} w-28`} />
          {/* Favorites toggle */}
          <button onClick={() => setShowFavs((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${showFavs ? "bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-900/20" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600"}`}>
            <FaHeart className={`w-3.5 h-3.5 ${showFavs ? "text-pink-500" : "text-gray-300"}`} />
            مفضلة
          </button>
          {/* Compare toggle */}
          <button onClick={() => { setCompareMode((v) => !v); setCompareIds([]); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${compareMode ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600"}`}>
            <FaCodeCompare className="w-3.5 h-3.5" />
            مقارنة {compareMode && compareIds.length ? `(${compareIds.length})` : ""}
          </button>
          {compareMode && compareIds.length >= 2 && (
            <button onClick={() => setCompareOpen(true)}
              className="px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--primary)" }}>
              عرض المقارنة
            </button>
          )}
          {/* Visibility bulk */}
          <button onClick={() => handleProjectVisibility(false)} disabled={!projectFilter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 disabled:opacity-40">
            <FaEyeSlash className="w-3.5 h-3.5" /> إخفاء الكل
          </button>
          <button onClick={() => handleProjectVisibility(true)} disabled={!projectFilter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600 disabled:opacity-40">
            <FaEye className="w-3.5 h-3.5" /> إظهار الكل
          </button>
          {/* View toggle */}
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden mr-auto">
            {[{ key: "list", icon: <FaTableList className="w-3.5 h-3.5" /> }, { key: "floor", icon: <FaLayerGroup className="w-3.5 h-3.5" /> }].map((v) => (
              <button key={v.key} onClick={() => setActiveView(v.key)}
                className={`px-3 py-2 transition-colors ${activeView === v.key ? "text-white" : "text-gray-500 bg-white dark:bg-gray-800"}`}
                style={activeView === v.key ? { background: "var(--primary)" } : {}}>
                {v.icon}
              </button>
            ))}
          </div>
          {/* Export */}
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-600">
            <FaDownload className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border bg-[color:var(--primary)]/5 border-[color:var(--primary)]/20">
            <span className="text-sm font-bold text-[color:var(--primary)]">{selected.length} وحدة محددة</span>
            <SelectField value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="w-auto text-sm">
              <option value="">تغيير الحالة</option>
              <option value="available">متاح</option>
              <option value="sold">مباع</option>
              <option value="reserved">محجوز</option>
            </SelectField>
            <button onClick={handleBulkStatus} disabled={!bulkStatus}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
              style={{ background: "var(--primary)" }}>تطبيق</button>
            <button onClick={() => setSelected([])} className="px-3 py-2 text-sm text-gray-500">إلغاء</button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FaSpinner className="w-6 h-6 animate-spin text-gray-300" />
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <FaHouseChimney className="w-10 h-10 opacity-20" />
            <p className="text-sm">{showFavs ? "لا توجد مفضلات" : "لا توجد وحدات"}</p>
            {!showFavs && <PrimaryButton icon={<FaPlus />} onClick={openCreate}>إضافة وحدة</PrimaryButton>}
          </div>
        ) : activeView === "floor" ? (
          // Floor plan view
          <div className="space-y-4">
            {Object.entries(floorGroups).sort(([a], [b]) => a.localeCompare(b, "ar")).map(([floor, floorUnits]) => (
              <div key={floor} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  <FaLayerGroup className="w-4 h-4" style={{ color: "var(--primary)" }} />
                  الدور: {floor}
                  <span className="text-xs text-gray-400">({floorUnits.length} وحدة)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {floorUnits.map((u) => (
                    <button key={u._id} onClick={() => openEdit(u)}
                      title={`${u.unitNumber} — ${formatPrice(u.price)}`}
                      className={`w-16 h-12 rounded-lg border-2 text-xs font-medium transition-all hover:scale-105 ${STATUS_COLOR[u.status] || "bg-gray-100 border-gray-300 text-gray-600"}`}>
                      {u.unitNumber}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400 inline-block" />متاح: {floorUnits.filter((u) => u.status === "available").length}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />محجوز: {floorUnits.filter((u) => u.status === "reserved").length}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />مباع: {floorUnits.filter((u) => u.status === "sold").length}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List / table view
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-xs text-gray-500">
                  <tr>
                    <th className="px-2 py-3 w-10">
                      <input type="checkbox" className="w-4 h-4 rounded accent-[color:var(--primary)]"
                        checked={filteredUnits.length > 0 && selected.length === filteredUnits.length}
                        onChange={(e) => setSelected(e.target.checked ? filteredUnits.map((u) => u._id) : [])} />
                    </th>
                    <th className="w-8" />
                    {["الوحدة","المشروع","النوع","المساحة","السعر","الدور","الحالة","الرؤية",""].map((h, i) => (
                      <th key={i} className="text-right px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredUnits.map((u) => {
                    const fav       = favorites.includes(u._id);
                    const inCompare = compareIds.includes(u._id);
                    return (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${inCompare ? "bg-amber-50/50 dark:bg-amber-900/10" : ""}`}>
                        <td className="px-2 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <input type="checkbox" checked={selected.includes(u._id)} onChange={() => toggleSelected(u._id)}
                              className="w-4 h-4 rounded accent-[color:var(--primary)]" />
                            <button onClick={() => toggleFav(u._id)}>
                              <FaHeart className={`w-3 h-3 ${fav ? "text-pink-500" : "text-gray-300"}`} />
                            </button>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          {compareMode && (
                            <button onClick={() => toggleCompare(u._id)}
                              className={`w-6 h-6 rounded text-xs font-bold border transition-colors ${inCompare ? "text-white border-transparent" : "border-gray-300 text-gray-400"}`}
                              style={inCompare ? { background: "var(--primary)" } : {}}>
                              {inCompare ? compareIds.indexOf(u._id) + 1 : ""}
                              {!inCompare && <FaCodeCompare className="w-3 h-3 mx-auto" />}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900 dark:text-white">{u.unitNumber}</p>
                          <p className="text-xs text-gray-400">{UNIT_TYPE_AR[u.type] || u.type}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-sm">
                          {u.project?.name?.ar || "—"}
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3 text-sm text-gray-500">
                          {UNIT_TYPE_AR[u.type] || u.type}
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                          {u.area ? `${u.area} م²` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(u.price)}
                        </td>
                        <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                          {u.floor || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={u.status} label={UNIT_STATUS_AR[u.status]} />
                        </td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          <button onClick={() => handleToggleVisibility(u._id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${u.isVisible !== false ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100"}`}>
                            {u.isVisible !== false ? <FaEye className="w-3.5 h-3.5" /> : <FaEyeSlash className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(u)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors">
                              <FaPen className="w-3 h-3" />
                            </button>
                            <button onClick={() => confirmDelete.open(u)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                              <FaTrash className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {total > table.queryParams.pageSize && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>عرض {filteredUnits.length} من {total}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => table.handlePageChange(table.queryParams.page - 1)} disabled={table.queryParams.page <= 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">السابق</button>
              <span className="px-3 font-semibold">{table.queryParams.page}</span>
              <button onClick={() => table.handlePageChange(table.queryParams.page + 1)} disabled={filteredUnits.length < table.queryParams.pageSize}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">التالي</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Compare Modal ── */}
      <AdminModal isOpen={compareOpen} onClose={() => setCompareOpen(false)}
        title="مقارنة الوحدات" size="3xl">
        <div className={`grid gap-4 ${compareUnits.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {compareUnits.map((u) => (
            <div key={u._id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-2">
              <p className="font-bold text-center text-gray-900 dark:text-white text-lg">{u.unitNumber}</p>
              <p className="text-center text-xs text-gray-400">{u.project?.name?.ar || "—"}</p>
              <hr className="border-gray-100 dark:border-gray-700" />
              {[
                ["النوع",    UNIT_TYPE_AR[u.type] || u.type],
                ["الحالة",   UNIT_STATUS_AR[u.status]],
                ["المساحة",  u.area ? `${u.area} م²` : "—"],
                ["السعر",    formatPrice(u.price)],
                ["الدور",    u.floor || "—"],
                ["الغرف",    u.rooms],
                ["الحمامات", u.bathrooms],
                ["التشطيب",  u.finishing || "—"],
                ["الاتجاه",  u.facing || "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{val}</span>
                </div>
              ))}
              {(u.amenities || []).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">المرافق</p>
                  <div className="flex flex-wrap gap-1">
                    {u.amenities.map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminModal>

      {/* ── Create/Edit Modal ── */}
      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "تعديل الوحدة" : "إضافة وحدة جديدة"}
        icon={<FaHouseChimney className="w-4 h-4" />} size="2xl"
        footer={
          <>
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 dark:bg-gray-800">إلغاء</button>
            <button onClick={handleSave} disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary)" }}>
              {isPending && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
              {editItem ? "حفظ التغييرات" : "إضافة الوحدة"}
            </button>
          </>
        }>
        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-800 pb-3">
          {[{ k: "ar", l: "عربي" }, { k: "en", l: "English" }, { k: "specs", l: "مواصفات" }, { k: "amenities", l: "مرافق" }].map((t) => (
            <button key={t.k} onClick={() => setActiveModalTab(t.k)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeModalTab === t.k ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              style={activeModalTab === t.k ? { background: "var(--primary)" } : {}}>{t.l}</button>
          ))}
        </div>

        {/* Arabic tab */}
        {activeModalTab === "ar" && (
          <div className="space-y-4">
            <FormField label="المشروع" required>
              <SelectField value={form.project} onChange={(e) => f("project", e.target.value)}>
                <option value="">اختر المشروع</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
              </SelectField>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="رقم الوحدة" required>
                <input value={form.unitNumber} onChange={(e) => f("unitNumber", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="الدور">
                <input value={form.floor} onChange={(e) => f("floor", e.target.value)} placeholder="مثال: أرضي، الدور الأول" className={inputCls} />
              </FormField>
            </div>
            <FormField label="الوصف (عربي)">
              <TextareaField value={form.description?.ar} onChange={(e) => fNested("description", "ar", e.target.value)} rows={3} />
            </FormField>
          </div>
        )}

        {/* English tab */}
        {activeModalTab === "en" && (
          <div className="space-y-4">
            <FormField label="Description (English)">
              <TextareaField value={form.description?.en} onChange={(e) => fNested("description", "en", e.target.value)} rows={3} />
            </FormField>
          </div>
        )}

        {/* Specs tab */}
        {activeModalTab === "specs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="النوع">
                <SelectField value={form.type} onChange={(e) => f("type", e.target.value)}>
                  {UNIT_TYPES.map((t) => <option key={t} value={t}>{UNIT_TYPE_AR[t]}</option>)}
                </SelectField>
              </FormField>
              <FormField label="الحالة">
                <SelectField value={form.status} onChange={(e) => f("status", e.target.value)}>
                  {UNIT_STATUSES.map((s) => <option key={s} value={s}>{UNIT_STATUS_AR[s]}</option>)}
                </SelectField>
              </FormField>
              <FormField label="المساحة (م²)">
                <input type="number" value={form.area} onChange={(e) => f("area", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="السعر (ج.م)">
                <input type="number" value={form.price} onChange={(e) => f("price", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="غرف النوم">
                <input type="number" min={0} value={form.rooms} onChange={(e) => f("rooms", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="الحمامات">
                <input type="number" min={0} value={form.bathrooms} onChange={(e) => f("bathrooms", e.target.value)} className={inputCls} />
              </FormField>
              <FormField label="التشطيب">
                <SelectField value={form.finishing} onChange={(e) => f("finishing", e.target.value)}>
                  <option value="">اختر التشطيب</option>
                  {FINISHING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </SelectField>
              </FormField>
              <FormField label="الاتجاه">
                <SelectField value={form.facing} onChange={(e) => f("facing", e.target.value)}>
                  <option value="">اختر الاتجاه</option>
                  {FACING_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </SelectField>
              </FormField>
            </div>
            <div className="flex items-center gap-6">
              <ToggleField checked={form.featured} onChange={(v) => f("featured", v)} label="وحدة مميزة" />
              <ToggleField checked={form.published} onChange={(v) => f("published", v)} label="منشورة" />
            </div>
          </div>
        )}

        {/* Amenities tab */}
        {activeModalTab === "amenities" && (
          <div className="space-y-4">
            {AMENITY_GROUPS.map((g) => (
              <div key={g.label}>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((a) => {
                    const active = (form.amenities || []).includes(a);
                    return (
                      <button key={a} type="button"
                        onClick={() => f("amenities", active ? form.amenities.filter((x) => x !== a) : [...(form.amenities || []), a])}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${active ? "text-white border-transparent" : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400"}`}
                        style={active ? { background: "var(--primary)" } : {}}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Custom amenity */}
            <div className="flex gap-2 pt-2">
              <input value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (customAmenity.trim() && !(form.amenities || []).includes(customAmenity.trim())) { f("amenities", [...(form.amenities || []), customAmenity.trim()]); setCustomAmenity(""); } }}}
                placeholder="إضافة ميزة مخصصة..." className={`${inputCls} flex-1`} />
              <button type="button" onClick={() => { if (customAmenity.trim()) { f("amenities", [...(form.amenities || []), customAmenity.trim()]); setCustomAmenity(""); }}}
                className="px-4 rounded-xl text-white font-semibold" style={{ background: "var(--primary)" }}>+</button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close}
        onConfirm={handleDelete}
        title="حذف الوحدة"
        message={`هل تريد حذف الوحدة "${confirmDelete.data?.unitNumber ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

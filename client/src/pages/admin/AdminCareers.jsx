import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Briefcase, MapPin, Calendar, Clock,
  Eye, EyeOff, Users, CheckCircle, XCircle, Filter, Search,
  TrendingUp, Link2, ToggleLeft, ToggleRight, ChevronDown,
  ExternalLink, ChevronUp, Mail, Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

const TYPE_LABELS = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };
const TYPE_COLORS = { full_time: "bg-blue-100 text-blue-700", part_time: "bg-purple-100 text-purple-700", contract: "bg-amber-100 text-amber-700", internship: "bg-green-100 text-green-700" };

const emptyCareer = {
  title: { ar: "", en: "" },
  department: { ar: "", en: "" },
  location: { ar: "", en: "" },
  type: "full_time",
  description: { ar: "", en: "" },
  requirements: [],
  salary: { min: "", max: "", currency: "ج.م", hidden: false },
  cv_link: "",
  published: true,
  deadline: "",
};

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
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reqInput, setReqInput] = useState("");
  const [applications, setApplications] = useState({});
  const [expandedApps, setExpandedApps] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/careers");
      setCareers(res.data.careers || []);
    } catch { toast.error("فشل تحميل الوظائف"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

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

  const openCreate = () => { setEditItem(null); setForm(emptyCareer); setReqInput(""); setModal(true); };
  const openEdit   = (c) => {
    setEditItem(c);
    setForm({
      ...emptyCareer, ...c,
      title:       { ar: c.title?.ar ?? "",       en: c.title?.en ?? "" },
      department:  { ar: c.department?.ar ?? "",   en: c.department?.en ?? "" },
      location:    { ar: c.location?.ar ?? "",     en: c.location?.en ?? "" },
      description: { ar: c.description?.ar ?? "",  en: c.description?.en ?? "" },
      salary:      { min: c.salary?.min ?? "", max: c.salary?.max ?? "", currency: c.salary?.currency ?? "ج.م", hidden: c.salary?.hidden ?? false },
      requirements: c.requirements || [],
    });
    setReqInput("");
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title?.ar?.trim()) return toast.error("المسمى الوظيفي مطلوب");
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/careers/${editItem._id}`, form);
        toast.success("تم التحديث");
      } else {
        await api.post("/careers", form);
        toast.success("تم إضافة الوظيفة");
      }
      setModal(false);
      load();
    } catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/careers/${deleteId}`);
      toast.success("تم الحذف");
      setDeleteId(null);
      load();
    } catch { toast.error("فشل الحذف"); }
    finally { setDeleting(false); }
  };

  const togglePublish = async (c) => {
    try {
      await api.put(`/careers/${c._id}`, { ...c, published: !c.published });
      setCareers(prev => prev.map(x => x._id === c._id ? { ...x, published: !x.published } : x));
      toast.success(c.published ? "تم إخفاء الوظيفة" : "تم نشر الوظيفة");
    } catch { toast.error("فشل التحديث"); }
  };

  const loadApplications = async (careerId) => {
    if (expandedApps === careerId) { setExpandedApps(null); return; }
    setExpandedApps(careerId);
    if (applications[careerId]) return;
    try {
      const res = await api.get(`/job-applications/career/${careerId}`);
      setApplications(prev => ({ ...prev, [careerId]: res.data.applications || [] }));
    } catch { toast.error("فشل تحميل التقديمات"); }
  };

  const STATUS_LABELS = { new: "جديد", reviewed: "تمت المراجعة", rejected: "مرفوض" };
  const STATUS_COLORS = { new: "bg-blue-100 text-blue-700", reviewed: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };

  const updateAppStatus = async (appId, careerId, status) => {
    try {
      await api.patch(`/job-applications/${appId}/status`, { status });
      setApplications(prev => ({
        ...prev,
        [careerId]: prev[careerId].map(a => a._id === appId ? { ...a, status } : a),
      }));
    } catch { toast.error("فشل التحديث"); }
  };

  const deleteApp = async (appId, careerId) => {
    try {
      await api.delete(`/job-applications/${appId}`);
      setApplications(prev => ({
        ...prev,
        [careerId]: prev[careerId].filter(a => a._id !== appId),
      }));
    } catch { toast.error("فشل الحذف"); }
  };

  const addRequirement = () => {
    if (!reqInput.trim()) return;
    f("requirements", [...(form.requirements || []), reqInput.trim()]);
    setReqInput("");
  };
  const removeReq = (i) => f("requirements", form.requirements.filter((_, idx) => idx !== i));

  // Stats
  const total     = careers.length;
  const published = careers.filter(c => c.published).length;
  const expired   = careers.filter(c => c.deadline && new Date(c.deadline) < new Date()).length;

  // Filtered
  const filtered = careers.filter(c => {
    const matchSearch = !search || c.title?.ar?.includes(search) || c.department?.ar?.includes(search);
    const matchType   = filterType   === "all" || c.type === filterType;
    const matchStatus = filterStatus === "all" || (filterStatus === "published" ? c.published : !c.published);
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الوظائف</h1>
          <p className="text-gray-500 text-sm">{total} وظيفة إجمالاً</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> إضافة وظيفة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الوظائف", value: total,     icon: Briefcase,   color: "bg-blue-500" },
          { label: "منشورة",         value: published,  icon: CheckCircle, color: "bg-green-500" },
          { label: "منتهية المدة",   value: expired,    icon: XCircle,     color: "bg-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الوظائف..."
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="all">كل الأنواع</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="all">كل الحالات</option>
          <option value="published">منشورة</option>
          <option value="hidden">مخفية</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? <LoadingSpinner className="h-64" size="lg" /> :
       filtered.length === 0 ? <EmptyState icon={Briefcase} title="لا توجد وظائف" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const isExpired = c.deadline && new Date(c.deadline) < new Date();
            return (
              <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
                  !c.published ? "border-gray-200 opacity-70" : isExpired ? "border-red-100" : "border-gray-100 dark:border-gray-700"
                }`}>
                {/* Top color bar */}
                <div className={`h-1.5 ${c.published && !isExpired ? "bg-gradient-to-r from-[#2d5d89] to-[#4a8ab5]" : "bg-gray-200"}`} />
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.published ? "bg-[#2d5d89]/10" : "bg-gray-100"}`}>
                      <Briefcase className={`w-5 h-5 ${c.published ? "text-[#2d5d89]" : "text-gray-400"}`} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => togglePublish(c)} title={c.published ? "إخفاء" : "نشر"}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        {c.published ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button onClick={() => openEdit(c)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(c._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 leading-snug">{c.title?.ar}</h3>
                  {c.title?.en && <p className="text-gray-400 text-xs mb-2">{c.title.en}</p>}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {c.department?.ar && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Briefcase className="w-3 h-3" />{c.department.ar}
                      </span>
                    )}
                    {c.location?.ar && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <MapPin className="w-3 h-3" />{c.location.ar}
                      </span>
                    )}
                  </div>

                  {c.description?.ar && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2 flex-1">{c.description.ar}</p>
                  )}

                  {/* Requirements count */}
                  {c.requirements?.length > 0 && (
                    <p className="text-xs text-[#2d5d89] mb-3 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {c.requirements.length} متطلب
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[c.type] || "bg-gray-100 text-gray-600"}`}>
                      {TYPE_LABELS[c.type]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.published ? "منشور" : "مخفي"}
                    </span>
                    {isExpired && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">منتهية</span>}
                    {c.deadline && !isExpired && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 mr-auto">
                        <Calendar className="w-3 h-3" />
                        حتى {new Date(c.deadline).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                  </div>

                  {/* Applications toggle */}
                  <button onClick={() => loadApplications(c._id)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#2d5d89]/10 hover:bg-[#2d5d89]/20 text-[#2d5d89] text-xs font-semibold transition-colors border border-[#2d5d89]/20">
                    <Users className="w-3.5 h-3.5" />
                    التقديمات
                    {expandedApps === c._id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  <AnimatePresence>
                    {expandedApps === c._id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-2">
                        {!applications[c._id] ? (
                          <p className="text-xs text-gray-400 text-center py-3">جاري التحميل...</p>
                        ) : applications[c._id].length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-3">لا توجد تقديمات بعد</p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {applications[c._id].map(app => (
                              <div key={app._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <span className="font-semibold text-gray-800 dark:text-white">{app.name}</span>
                                  <button onClick={() => deleteApp(app._id, c._id)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 mb-1">
                                  <Phone className="w-3 h-3" /> {app.phone}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 mb-2">
                                  <Mail className="w-3 h-3" /> {app.email}
                                </div>
                                {app.cv_link && (
                                  <a href={app.cv_link} target="_blank" rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[#2d5d89] hover:underline mb-2">
                                    <ExternalLink className="w-3 h-3" /> السيرة الذاتية
                                  </a>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <select value={app.status}
                                    onChange={e => updateAppStatus(app._id, c._id, e.target.value)}
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium border-0 outline-none cursor-pointer ${STATUS_COLORS[app.status]}`}>
                                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                  </select>
                                  <span className="text-gray-400 mr-auto">{new Date(app.createdAt).toLocaleDateString("ar-EG")}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل وظيفة" : "إضافة وظيفة جديدة"} size="xl">
        <div className="space-y-5">
          {/* Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المسمى الوظيفي (عربي) *</label>
              <input value={form.title?.ar} onChange={e => f("title.ar", e.target.value)} placeholder="مثال: مهندس مبيعات"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المسمى الوظيفي (English)</label>
              <input value={form.title?.en} onChange={e => f("title.en", e.target.value)} placeholder="Sales Engineer"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          </div>

          {/* Dept / Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">القسم</label>
              <input value={form.department?.ar} onChange={e => f("department.ar", e.target.value)} placeholder="المبيعات"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">الموقع</label>
              <input value={form.location?.ar} onChange={e => f("location.ar", e.target.value)} placeholder="القاهرة"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          </div>

          {/* Type / Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">نوع الوظيفة</label>
              <select value={form.type} onChange={e => f("type", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">آخر موعد للتقديم</label>
              <input type="date" value={form.deadline ? form.deadline.split("T")[0] : ""} onChange={e => f("deadline", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">الراتب (اختياري)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={form.salary?.min} onChange={e => f("salary.min", e.target.value)} placeholder="من"
                className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              <span className="text-gray-400 text-sm">—</span>
              <input type="number" value={form.salary?.max} onChange={e => f("salary.max", e.target.value)} placeholder="إلى"
                className="w-24 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              <select value={form.salary?.currency} onChange={e => f("salary.currency", e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                <option>ج.م</option><option>USD</option><option>EUR</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={form.salary?.hidden} onChange={e => f("salary.hidden", e.target.checked)} className="accent-[#2d5d89]" />
                إخفاء الراتب
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">وصف الوظيفة (عربي)</label>
            <textarea rows={4} value={form.description?.ar} onChange={e => f("description.ar", e.target.value)}
              placeholder="صف الوظيفة والمهام المطلوبة..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المتطلبات</label>
            <div className="flex gap-2 mb-2">
              <input value={reqInput} onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                placeholder="أضف متطلباً واضغط Enter..."
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              <button onClick={addRequirement} className="px-3 py-2 rounded-xl bg-[#2d5d89] text-white text-sm hover:bg-[#245079]">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.requirements?.length > 0 && (
              <div className="space-y-1.5">
                {form.requirements.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{r}</span>
                    <button onClick={() => removeReq(i)} className="text-red-400 hover:text-red-600">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV Link */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">رابط التقديم (اختياري)</label>
            <input type="url" value={form.cv_link} onChange={e => f("cv_link", e.target.value)}
              placeholder="https://forms.google.com/..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            <p className="text-xs text-gray-400 mt-1">اتركه فارغاً لاستخدام نموذج التقديم المدمج</p>
          </div>

          {/* Published */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => f("published", e.target.checked)} className="w-4 h-4 rounded accent-[#2d5d89]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">نشر الوظيفة فوراً</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button onClick={() => setModal(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              إلغاء
            </button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#2d5d89] hover:bg-[#245079] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {saving ? "جاري الحفظ..." : editItem ? "حفظ التعديلات" : "إضافة الوظيفة"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting}
        title="حذف الوظيفة" message="هل أنت متأكد من حذف هذه الوظيفة؟" />
    </div>
  );
}

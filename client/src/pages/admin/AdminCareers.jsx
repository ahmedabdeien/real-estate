import { useEffect, useState, useMemo } from "react";
import {
  Plus, Pencil, Trash2, Briefcase, MapPin, Calendar,
  Users, CheckCircle, XCircle, Search, ExternalLink,
  Mail, Phone, ToggleLeft, ToggleRight, Eye, EyeOff,
  ChevronDown, FileText, TrendingUp, Clock, Filter,
  MoreHorizontal, Download, RefreshCw, UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import { useToast } from "../../context/ToastContext";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/Components/UI/card";
import { Button } from "@/Components/UI/button";
import { Input } from "@/Components/UI/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/UI/tabs";
import { Avatar, AvatarFallback } from "@/Components/UI/avatar";
import { Separator } from "@/Components/UI/separator";
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle,
  DrawerDescription, DrawerFooter, DrawerClose,
} from "@/Components/UI/drawer";

// ─── Constants ────────────────────────────────────────────────
const TYPE_LABELS = {
  full_time: "دوام كامل",
  part_time: "دوام جزئي",
  contract: "عقد",
  internship: "تدريب",
};
const TYPE_COLORS = {
  full_time: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  part_time: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  contract: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  internship: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};
const STATUS_LABELS = {
  new: "جديد",
  contacted: "تم التواصل",
  interested: "مهتم",
  not_interested: "غير مهتم",
  converted: "تم التعيين",
  lost: "مرفوض",
};
const STATUS_COLORS = {
  new: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  interested: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  not_interested: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  converted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  lost: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

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

// ─── Application Drawer ───────────────────────────────────────
function ApplicationDrawer({ app, careerId, onClose, onStatusChange, onDelete }) {
  const [status, setStatus] = useState(app?.status || "new");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { if (app) setStatus(app.status || "new"); }, [app]);

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await api.put(`/leads/${app._id}`, { status: newStatus });
      setStatus(newStatus);
      onStatusChange(app._id, careerId, newStatus);
    } catch { toast.error("فشل التحديث"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/${app._id}`);
      onDelete(app._id, careerId);
      onClose();
    } catch { toast.error("فشل الحذف"); }
  };

  if (!app) return null;

  return (
    <Drawer open={!!app} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="max-w-md w-full h-full overflow-y-auto" dir="rtl">
        <DrawerHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-[#2d5d89]/10 text-[#2d5d89] font-bold text-lg">
                {app.name?.charAt(0) || "؟"}
              </AvatarFallback>
            </Avatar>
            <div>
              <DrawerTitle className="text-base font-bold text-gray-900 dark:text-white">
                {app.name}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-gray-500">
                {new Date(app.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-5 space-y-5">
          {/* Contact Info */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">معلومات التواصل</p>
            <div className="space-y-2">
              {app.phone && (
                <a href={`tel:${app.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2d5d89] transition-colors">
                    {app.phone}
                  </span>
                </a>
              )}
              {app.email && (
                <a href={`mailto:${app.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#2d5d89] transition-colors truncate">
                    {app.email}
                  </span>
                </a>
              )}
              {app.cv_link && (
                <a href={app.cv_link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#2d5d89]/5 dark:bg-[#2d5d89]/20 hover:bg-[#2d5d89]/10 dark:hover:bg-[#2d5d89]/30 transition-colors group border border-[#2d5d89]/20">
                  <div className="w-8 h-8 rounded-lg bg-[#2d5d89]/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#2d5d89]" />
                  </div>
                  <span className="text-sm font-semibold text-[#2d5d89] flex-1">عرض السيرة الذاتية</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#2d5d89]" />
                </a>
              )}
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">حالة الطلب</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button key={k} onClick={() => handleStatusChange(k)} disabled={saving}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border-2 ${
                    status === k
                      ? `${STATUS_COLORS[k]} border-current`
                      : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent hover:border-gray-200"
                  }`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {app.message && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ملاحظات</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed">
                  {app.message}
                </p>
              </div>
            </>
          )}
        </div>

        <DrawerFooter className="border-t">
          <button onClick={handleDelete}
            className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> حذف هذا الطلب
          </button>
          <DrawerClose asChild>
            <button className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              إغلاق
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ─── Applications Table ───────────────────────────────────────
function ApplicationsTable({ applications, careerId, onStatusChange, onDelete, onViewApp }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
        لا توجد تقديمات بعد
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {applications.map((app) => (
        <div key={app._id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
          onClick={() => onViewApp(app)}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="text-xs bg-[#2d5d89]/10 text-[#2d5d89]">
              {app.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{app.name}</p>
            <p className="text-xs text-gray-500 truncate">{app.phone}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {app.cv_link && (
              <span className="text-[#2d5d89]" title="لديه سيرة ذاتية">
                <FileText className="w-3.5 h-3.5" />
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || STATUS_COLORS.new}`}>
              {STATUS_LABELS[app.status] || "جديد"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Career Card ──────────────────────────────────────────────
function CareerCard({ career, onEdit, onDelete, onToggle, onViewApp, applications, loadingApps, onLoadApps }) {
  const [expanded, setExpanded] = useState(false);
  const isExpired = career.deadline && new Date(career.deadline) < new Date();
  const appsCount = applications?.length ?? 0;

  const handleExpand = () => {
    if (!expanded && !applications) onLoadApps(career._id);
    setExpanded(p => !p);
  };

  return (
    <Card className={`transition-all hover:shadow-md ${!career.published ? "opacity-60" : ""} ${isExpired ? "ring-red-200 dark:ring-red-900/30" : ""}`}>
      <CardContent className="p-0">
        {/* Top bar */}
        <div className={`h-1 w-full rounded-t-xl ${career.published && !isExpired ? "bg-gradient-to-r from-[#2d5d89] to-[#4a8ab5]" : "bg-gray-200 dark:bg-gray-700"}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${career.published ? "bg-[#2d5d89]/10" : "bg-gray-100 dark:bg-gray-800"}`}>
                <Briefcase className={`w-5 h-5 ${career.published ? "text-[#2d5d89]" : "text-gray-400"}`} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{career.title?.ar}</h3>
                {career.title?.en && <p className="text-gray-400 text-xs">{career.title.en}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" onClick={() => onToggle(career)} title={career.published ? "إخفاء" : "نشر"}>
                {career.published ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onEdit(career)} className="text-blue-600 hover:text-blue-700">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onDelete(career._id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[career.type]}`}>
              {TYPE_LABELS[career.type]}
            </span>
            {career.location?.ar && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3 h-3" />{career.location.ar}
              </span>
            )}
            {career.department?.ar && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Briefcase className="w-3 h-3" />{career.department.ar}
              </span>
            )}
          </div>

          {career.description?.ar && (
            <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 line-clamp-2 leading-relaxed">
              {career.description.ar}
            </p>
          )}

          {/* Footer badges */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${career.published ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500"}`}>
              {career.published ? "منشور" : "مخفي"}
            </span>
            {isExpired && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                منتهية
              </span>
            )}
            {career.deadline && !isExpired && (
              <span className="flex items-center gap-1 text-xs text-gray-400 mr-auto">
                <Calendar className="w-3 h-3" />
                حتى {new Date(career.deadline).toLocaleDateString("ar-EG")}
              </span>
            )}
          </div>

          {/* Applications toggle */}
          <button onClick={handleExpand}
            className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#2d5d89]/5 dark:bg-[#2d5d89]/10 hover:bg-[#2d5d89]/10 dark:hover:bg-[#2d5d89]/20 text-[#2d5d89] text-xs font-semibold transition-colors border border-[#2d5d89]/10">
            <span className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              التقديمات
              {appsCount > 0 && (
                <span className="bg-[#2d5d89] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {appsCount}
                </span>
              )}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2">
                {loadingApps ? (
                  <p className="text-xs text-gray-400 text-center py-4">جاري التحميل...</p>
                ) : (
                  <ApplicationsTable
                    applications={applications}
                    careerId={career._id}
                    onViewApp={onViewApp}
                    onStatusChange={() => {}}
                    onDelete={() => {}}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────
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
  const [loadingApps, setLoadingApps] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  const [activeTab, setActiveTab] = useState("careers");
  const [allApps, setAllApps] = useState([]);
  const [loadingAllApps, setLoadingAllApps] = useState(false);
  const [appSearch, setAppSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/careers");
      setCareers(res.data.careers || []);
    } catch { toast.error("فشل تحميل الوظائف"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadAllApplications = async () => {
    setLoadingAllApps(true);
    try {
      const res = await api.get("/leads", { params: { career: "all" } });
      // Fetch all career apps by loading from each career
      const cRes = await api.get("/careers");
      const cs = cRes.data.careers || [];
      const all = [];
      await Promise.all(cs.map(async (c) => {
        try {
          const r = await api.get(`/leads/career/${c._id}`);
          const apps = (r.data.applications || []).map(a => ({ ...a, careerTitle: c.title?.ar }));
          all.push(...apps);
        } catch {}
      }));
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllApps(all);
    } catch { toast.error("فشل تحميل التقديمات"); }
    finally { setLoadingAllApps(false); }
  };

  useEffect(() => {
    if (activeTab === "applications") loadAllApplications();
  }, [activeTab]);

  const loadApplications = async (careerId) => {
    if (applications[careerId]) return;
    setLoadingApps(p => ({ ...p, [careerId]: true }));
    try {
      const res = await api.get(`/leads/career/${careerId}`);
      setApplications(prev => ({ ...prev, [careerId]: res.data.applications || [] }));
    } catch { toast.error("فشل تحميل التقديمات"); }
    finally { setLoadingApps(p => ({ ...p, [careerId]: false })); }
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

  const openCreate = () => { setEditItem(null); setForm(emptyCareer); setReqInput(""); setModal(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      ...emptyCareer, ...c,
      title: { ar: c.title?.ar ?? "", en: c.title?.en ?? "" },
      department: { ar: c.department?.ar ?? "", en: c.department?.en ?? "" },
      location: { ar: c.location?.ar ?? "", en: c.location?.en ?? "" },
      description: { ar: c.description?.ar ?? "", en: c.description?.en ?? "" },
      salary: { min: c.salary?.min ?? "", max: c.salary?.max ?? "", currency: c.salary?.currency ?? "ج.م", hidden: c.salary?.hidden ?? false },
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

  const handleStatusChange = (appId, careerId, status) => {
    setApplications(prev => ({
      ...prev,
      [careerId]: (prev[careerId] || []).map(a => a._id === appId ? { ...a, status } : a),
    }));
    setAllApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    if (selectedApp?._id === appId) setSelectedApp(p => ({ ...p, status }));
  };

  const handleDeleteApp = (appId, careerId) => {
    setApplications(prev => ({
      ...prev,
      [careerId]: (prev[careerId] || []).filter(a => a._id !== appId),
    }));
    setAllApps(prev => prev.filter(a => a._id !== appId));
  };

  const addRequirement = () => {
    if (!reqInput.trim()) return;
    f("requirements", [...(form.requirements || []), reqInput.trim()]);
    setReqInput("");
  };
  const removeReq = (i) => f("requirements", form.requirements.filter((_, idx) => idx !== i));

  // Stats
  const total = careers.length;
  const published = careers.filter(c => c.published).length;
  const expired = careers.filter(c => c.deadline && new Date(c.deadline) < new Date()).length;
  const totalApps = Object.values(applications).reduce((sum, apps) => sum + apps.length, 0);

  const filtered = useMemo(() => careers.filter(c => {
    const matchSearch = !search || c.title?.ar?.includes(search) || c.department?.ar?.includes(search);
    const matchType = filterType === "all" || c.type === filterType;
    const matchStatus = filterStatus === "all" || (filterStatus === "published" ? c.published : !c.published);
    return matchSearch && matchType && matchStatus;
  }), [careers, search, filterType, filterStatus]);

  const filteredAllApps = useMemo(() => allApps.filter(a =>
    !appSearch || a.name?.includes(appSearch) || a.phone?.includes(appSearch) || a.email?.includes(appSearch)
  ), [allApps, appSearch]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الوظائف</h1>
          <p className="text-gray-500 text-sm">{total} وظيفة • {published} منشورة</p>
        </div>
        <Button onClick={openCreate} className="bg-[#2d5d89] hover:bg-[#245079] text-white gap-2">
          <Plus className="w-4 h-4" /> إضافة وظيفة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الوظائف", value: total, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
          { label: "منشورة", value: published, icon: Eye, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
          { label: "منتهية", value: expired, icon: XCircle, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },
          { label: "تقديمات محملة", value: totalApps, icon: Users, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="careers" className="gap-2">
            <Briefcase className="w-4 h-4" /> الوظائف
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="w-4 h-4" /> جميع التقديمات
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Careers ── */}
        <TabsContent value="careers" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-xs">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في الوظائف..."
                className="pr-9" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
              <option value="all">كل الأنواع</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
              <option value="all">كل الحالات</option>
              <option value="published">منشورة</option>
              <option value="hidden">مخفية</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner className="h-64" size="lg" />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Briefcase} title="لا توجد وظائف" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <CareerCard
                    career={c}
                    onEdit={openEdit}
                    onDelete={setDeleteId}
                    onToggle={togglePublish}
                    onViewApp={setSelectedApp}
                    applications={applications[c._id]}
                    loadingApps={loadingApps[c._id]}
                    onLoadApps={loadApplications}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Tab: All Applications ── */}
        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={appSearch} onChange={e => setAppSearch(e.target.value)}
                placeholder="بحث بالاسم أو الهاتف..." className="pr-9" />
            </div>
            <Button variant="outline" size="sm" onClick={loadAllApplications} disabled={loadingAllApps} className="gap-2">
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAllApps ? "animate-spin" : ""}`} />
              تحديث
            </Button>
          </div>

          {loadingAllApps ? (
            <LoadingSpinner className="h-48" />
          ) : filteredAllApps.length === 0 ? (
            <EmptyState icon={Users} title="لا توجد تقديمات" description="لم يتم تحميل أي تقديمات بعد" />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredAllApps.map((app) => (
                  <div key={app._id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedApp(app)}>
                    <Avatar className="w-9 h-9 flex-shrink-0">
                      <AvatarFallback className="text-sm bg-[#2d5d89]/10 text-[#2d5d89] font-bold">
                        {app.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{app.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{app.phone}</span>
                        {app.careerTitle && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{app.careerTitle}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {app.cv_link && (
                        <span className="text-[#2d5d89]" title="لديه سيرة ذاتية">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || STATUS_COLORS.new}`}>
                        {STATUS_LABELS[app.status] || "جديد"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Drawer */}
      {selectedApp && (
        <ApplicationDrawer
          app={selectedApp}
          careerId={selectedApp.career}
          onClose={() => setSelectedApp(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteApp}
        />
      )}

      {/* Career Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل وظيفة" : "إضافة وظيفة جديدة"} size="xl">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المسمى الوظيفي (عربي) *</label>
              <Input value={form.title?.ar} onChange={e => f("title.ar", e.target.value)} placeholder="مثال: مهندس مبيعات" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المسمى الوظيفي (English)</label>
              <Input value={form.title?.en} onChange={e => f("title.en", e.target.value)} placeholder="Sales Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">القسم</label>
              <Input value={form.department?.ar} onChange={e => f("department.ar", e.target.value)} placeholder="المبيعات" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">الموقع</label>
              <Input value={form.location?.ar} onChange={e => f("location.ar", e.target.value)} placeholder="القاهرة" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">نوع الوظيفة</label>
              <select value={form.type} onChange={e => f("type", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">آخر موعد للتقديم</label>
              <Input type="date" value={form.deadline ? form.deadline.split("T")[0] : ""} onChange={e => f("deadline", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">الراتب (اختياري)</label>
            <div className="flex items-center gap-2">
              <Input type="number" value={form.salary?.min} onChange={e => f("salary.min", e.target.value)} placeholder="من" className="w-24" />
              <span className="text-gray-400 text-sm">—</span>
              <Input type="number" value={form.salary?.max} onChange={e => f("salary.max", e.target.value)} placeholder="إلى" className="w-24" />
              <select value={form.salary?.currency} onChange={e => f("salary.currency", e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
                <option>ج.م</option><option>USD</option><option>EUR</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={form.salary?.hidden} onChange={e => f("salary.hidden", e.target.checked)} className="accent-[#2d5d89]" />
                إخفاء الراتب
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">وصف الوظيفة (عربي)</label>
            <textarea rows={4} value={form.description?.ar} onChange={e => f("description.ar", e.target.value)}
              placeholder="صف الوظيفة والمهام المطلوبة..."
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">المتطلبات</label>
            <div className="flex gap-2 mb-2">
              <Input value={reqInput} onChange={e => setReqInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addRequirement(); } }}
                placeholder="أضف متطلباً واضغط Enter..." className="flex-1" />
              <Button onClick={addRequirement} className="bg-[#2d5d89] text-white hover:bg-[#245079]" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
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
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">رابط التقديم الخارجي (اختياري)</label>
            <Input type="url" value={form.cv_link} onChange={e => f("cv_link", e.target.value)} placeholder="https://forms.google.com/..." />
            <p className="text-xs text-gray-400 mt-1">اتركه فارغاً لاستخدام نموذج التقديم المدمج</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => f("published", e.target.checked)} className="w-4 h-4 rounded accent-[#2d5d89]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">نشر الوظيفة فوراً</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Button variant="outline" onClick={() => setModal(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#2d5d89] hover:bg-[#245079] text-white">
              {saving ? "جاري الحفظ..." : editItem ? "حفظ التعديلات" : "إضافة الوظيفة"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={deleting}
        title="حذف الوظيفة" message="هل أنت متأكد من حذف هذه الوظيفة؟" />
    </div>
  );
}

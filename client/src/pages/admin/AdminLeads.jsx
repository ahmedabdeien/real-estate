import { useEffect, useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, Search, Phone, Mail, MessageCircle, Bell,
  LayoutList, Columns, Download, CheckSquare, Globe, MessageSquare,
  PhoneCall, Users, Share2, Megaphone, AlertCircle, Eye, Calendar,
  FileText, MapPin, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import HelpCard from "../../Components/UI/HelpCard";
import InlineAiChat from "../../Components/UI/InlineAiChat";
import { useToast } from "../../context/ToastContext";
import { TrendingUp } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/Components/UI/drawer";

const leadStatuses = ["new", "contacted", "interested", "not_interested", "converted", "lost"];
const sources = ["website", "whatsapp", "phone", "referral", "campaign", "other"];

const emptyLead = { name: "", phone: "", email: "", interestedProject: "", message: "", source: "website", status: "new", notes: "" };

const sourceAr = { website: "الموقع", whatsapp: "واتساب", phone: "هاتف", referral: "إحالة", campaign: "حملة", other: "أخرى" };
const statusAr = { new: "جديد", contacted: "تم التواصل", interested: "مهتم", not_interested: "غير مهتم", converted: "محوّل", lost: "خسرناه" };

const SOURCE_ICONS = {
  website: Globe, whatsapp: MessageSquare, phone: PhoneCall,
  referral: Share2, campaign: Megaphone, other: Users,
};

const STATUS_CHIPS = [
  { key: "",             label: "إجمالي",    color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  { key: "new",          label: "جديد",       color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { key: "contacted",    label: "تواصل",      color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { key: "interested",   label: "مهتم",       color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  { key: "converted",    label: "محوّل",      color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { key: "lost",         label: "خسارة",      color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
];

const KANBAN_COLS = [
  { key: "new",       label: "جديد",       color: "border-blue-400",    bg: "bg-blue-50 dark:bg-blue-900/10" },
  { key: "contacted", label: "تم التواصل", color: "border-amber-400",   bg: "bg-amber-50 dark:bg-amber-900/10" },
  { key: "interested",label: "مهتم",       color: "border-purple-400",  bg: "bg-purple-50 dark:bg-purple-900/10" },
  { key: "converted", label: "تحويل",      color: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
];

// Draggable Kanban Card
function KanbanCard({ lead, onEdit, onDelete, onWhatsApp, activeId }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead._id });
  const isOverdue = lead.followUpDate && new Date(lead.followUpDate) < new Date();
  const SrcIcon = SOURCE_ICONS[lead.source] || Users;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate(${transform.x}px,${transform.y}px)` } : undefined}
      className={`bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing transition-all ${isDragging ? "opacity-40" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{lead.name}</p>
          <p className="text-gray-400 text-xs font-mono mt-0.5">{lead.phone}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0
          ${lead.source === "website" ? "bg-blue-100 text-blue-600" :
            lead.source === "whatsapp" ? "bg-green-100 text-green-600" :
            lead.source === "referral" ? "bg-purple-100 text-purple-600" :
            "bg-gray-100 text-gray-500"}`}>
          <SrcIcon className="w-3 h-3" />
          {sourceAr[lead.source] || lead.source}
        </span>
      </div>
      {lead.interestedProject?.name?.ar && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
          🏢 {lead.interestedProject.name.ar}
        </p>
      )}
      {isOverdue && (
        <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1 mb-2">
          <AlertCircle className="w-3 h-3" />
          يستحق المتابعة
        </div>
      )}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString("ar-EG")}</span>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => onWhatsApp(lead)} title="واتساب"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-green-50 dark:bg-green-900/30 text-green-600 hover:bg-green-100">
            <MessageCircle className="w-3 h-3" />
          </button>
          <button onClick={() => onEdit(lead)} title="تعديل"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100">
            <Pencil className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(lead._id)} title="حذف"
            className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Droppable Kanban Column
function KanbanColumn({ col, leads, onEdit, onDelete, onWhatsApp, activeId }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.key });
  return (
    <div ref={setNodeRef}
      className={`flex-1 min-w-[220px] max-w-xs flex flex-col rounded-2xl border-t-4 ${col.color} ${col.bg} transition-all ${isOver ? "ring-2 ring-[#2d5d89] ring-offset-1" : ""}`}>
      <div className="px-3 py-3 flex items-center justify-between">
        <span className="font-bold text-sm text-gray-900 dark:text-white">{col.label}</span>
        <span className="text-xs font-semibold bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 text-gray-600 dark:text-gray-300 shadow-sm">
          {leads.length}
        </span>
      </div>
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[60vh]">
        <AnimatePresence>
          {leads.map((lead) => (
            <motion.div key={lead._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <KanbanCard lead={lead} onEdit={onEdit} onDelete={onDelete} onWhatsApp={onWhatsApp} activeId={activeId} />
            </motion.div>
          ))}
        </AnimatePresence>
        {leads.length === 0 && (
          <p className="text-center text-gray-400 text-xs py-6">لا توجد بطاقات</p>
        )}
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
  const [allLeads, setAllLeads] = useState([]); // for kanban (all, no pagination)
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyLead);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // "table" | "kanban"
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [statusCounts, setStatusCounts] = useState({});
  const [sourceFilter, setSourceFilter] = useState("");
  const [drawerLead, setDrawerLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = (lead) => { setDrawerLead(lead); setDrawerOpen(true); };
  const closeDrawer = () => setDrawerOpen(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads", { params: { page, search, status: statusFilter, source: sourceFilter || undefined } });
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    try {
      const res = await api.get("/leads", { params: { limit: 500, search, status: statusFilter } });
      setAllLeads(res.data.leads || []);
    } catch {}
  };

  const loadCounts = async () => {
    try {
      const res = await api.get("/leads", { params: { limit: 1000 } });
      const counts = {};
      (res.data.leads || []).forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
      counts[""] = res.data.total || 0;
      setStatusCounts(counts);
    } catch {}
  };

  useEffect(() => { load(); loadCounts(); }, [page, statusFilter, sourceFilter]);
  useEffect(() => { if (viewMode === "kanban") loadAll(); }, [viewMode, search, statusFilter]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100 } }).then((r) => setProjects(r.data.projects));
  }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyLead); setModal(true); };
  const openEdit = (l) => {
    setEditItem(l);
    setForm({
      ...emptyLead, ...l,
      name: l.name ?? "", phone: l.phone ?? "", email: l.email ?? "",
      message: l.message ?? "", notes: l.notes ?? "",
      interestedProject: l.interestedProject?._id || l.interestedProject || "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/leads/${editItem._id}`, form);
        toast.success("تم تحديث العميل");
      } else {
        await api.post("/leads", form);
        toast.success("تم إضافة العميل");
      }
      setModal(false);
      load();
      loadAll();
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/leads/${deleteId}`);
      toast.success("تم حذف العميل");
      setDeleteId(null);
      load();
      loadAll();
      loadCounts();
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const quickStatus = async (id, newStatus) => {
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status: newStatus } : l));
      setAllLeads((prev) => prev.map((l) => l._id === id ? { ...l, status: newStatus } : l));
      toast.success("تم تحديث الحالة");
      loadCounts();
    } catch {
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selected.size === 0) return;
    try {
      await Promise.all([...selected].map((id) => api.put(`/leads/${id}`, { status: bulkStatus })));
      toast.success(`تم تحديث ${selected.size} عميل`);
      setSelected(new Set());
      setBulkStatus("");
      load();
      loadAll();
      loadCounts();
    } catch {
      toast.error("فشل التحديث الجماعي");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!window.confirm(`هل تريد حذف ${selected.size} عميل؟`)) return;
    try {
      await Promise.all([...selected].map((id) => api.delete(`/leads/${id}`)));
      toast.success(`تم حذف ${selected.size} عميل`);
      setSelected(new Set());
      load();
      loadAll();
      loadCounts();
    } catch {
      toast.error("فشل الحذف الجماعي");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map((l) => l._id)));
  };

  // Kanban drag handlers
  const handleDragStart = ({ active }) => setActiveId(active.id);
  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const newStatus = over.id;
    if (!leadStatuses.includes(newStatus)) return;
    quickStatus(active.id, newStatus);
  };

  // Export CSV
  const exportCSV = () => {
    const rows = leads.map((l) => [
      l.name, l.phone, l.email,
      l.interestedProject?.name?.ar || "",
      sourceAr[l.source] || l.source,
      statusAr[l.status] || l.status,
      new Date(l.createdAt).toLocaleDateString("ar-EG"),
      l.message || "",
    ]);
    const header = ["الاسم","الهاتف","البريد","المشروع","المصدر","الحالة","التاريخ","الرسالة"];
    const csv = [header, ...rows].map((r) => r.map((c) => `"${(c||"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  function sendWhatsApp(lead) {
    let phone = (lead.phone || "").replace(/[\s\-\(\)]/g, "");
    if (phone.startsWith("0")) phone = "20" + phone.slice(1);
    if (!phone.startsWith("+") && !phone.startsWith("20")) phone = "20" + phone;
    phone = phone.replace(/^\+/, "");
    const statusArMsg = { new: "جديد", contacted: "تم التواصل", interested: "مهتم", not_interested: "غير مهتم", converted: "تحوّل لعميل", lost: "خسرنا" };
    const sourceArMsg = { website: "الموقع", whatsapp: "واتساب", phone: "هاتف", referral: "إحالة", campaign: "حملة", other: "أخرى" };
    const date = new Date(lead.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
    const text = `🏢 *الصرح للتطوير العقاري*\n━━━━━━━━━━━━━━━━━━━\n👤 *الاسم:* ${lead.name || "—"}\n📱 *الهاتف:* ${lead.phone || "—"}\n📧 *البريد:* ${lead.email || "—"}\n🏠 *المشروع:* ${lead.interestedProject?.name?.ar || lead.interestedProject?.name || "—"}\n📥 *المصدر:* ${sourceArMsg[lead.source] || lead.source || "—"}\n📊 *الحالة:* ${statusArMsg[lead.status] || lead.status || "—"}\n💬 *الرسالة:* ${lead.message || "لا توجد رسالة"}\n━━━━━━━━━━━━━━━━━━━\n📅 ${date}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const notifyAdmins = async (lead) => {
    try {
      const res = await api.get("/settings/group/notifications");
      const settings = {};
      (res.data.settings || []).forEach(s => { settings[s.key] = s.value; });
      const numbers = [settings.lead_notify_whatsapp1, settings.lead_notify_whatsapp2, settings.lead_notify_whatsapp3]
        .filter(Boolean).map(n => n.replace(/\D/g, ""));
      const message = (settings.lead_notify_message || "عميل جديد: {name} - {phone} - {message}")
        .replace("{name}", lead.name || "").replace("{phone}", lead.phone || "").replace("{message}", lead.message || "");
      if (numbers.length === 0) { toast.error("أضف أرقام واتساب للإشعارات في الإعدادات"); return; }
      numbers.forEach((num, i) => { setTimeout(() => { window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank"); }, i * 500); });
    } catch {
      toast.error("فشل جلب إعدادات الإشعارات");
    }
  };

  const kanbanLeads = KANBAN_COLS.map((col) => ({
    ...col,
    leads: allLeads.filter((l) => l.status === col.key),
  }));

  const draggedLead = activeId ? allLeads.find((l) => l._id === activeId) : null;

  return (
    <div className="space-y-5">
      <HelpCard
        title="دليل إدارة العملاء"
        tips={[
          "اضغط أيقونة واتساب لإرسال رسالة تلقائية للعميل بتفاصيله كاملة",
          "غيّر حالة العميل مباشرة من القائمة المنسدلة في الجدول",
          "استخدم عرض كانبان لسحب وإفلات العملاء بين الحالات",
          "حدد عدة عملاء لتغيير حالتهم أو حذفهم دفعة واحدة",
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">العملاء المحتملون</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} عميل</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "table" ? "bg-white dark:bg-gray-600 shadow-sm text-[#2d5d89]" : "text-gray-500"}`}>
              <LayoutList className="w-4 h-4" /> جدول
            </button>
            <button onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === "kanban" ? "bg-white dark:bg-gray-600 shadow-sm text-[#2d5d89]" : "text-gray-500"}`}>
              <Columns className="w-4 h-4" /> كانبان
            </button>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> تصدير CSV
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة عميل</span>
            <span className="sm:hidden">إضافة</span>
          </button>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        {STATUS_CHIPS.map((chip) => (
          <button key={chip.key} onClick={() => { setStatusFilter(chip.key); setPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
              statusFilter === chip.key ? "border-[#2d5d89] shadow-sm" : "border-transparent"
            } ${chip.color}`}>
            {chip.label}
            <span className="font-bold">{statusCounts[chip.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { load(); if (viewMode === "kanban") loadAll(); } }}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل الحالات</option>
          {leadStatuses.map((s) => <option key={s} value={s}>{statusBadge(s).label}</option>)}
        </select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل المصادر</option>
          {sources.map((s) => <option key={s} value={s}>{sourceAr[s]}</option>)}
        </select>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 flex-wrap bg-[#2d5d89]/10 border border-[#2d5d89]/30 rounded-xl px-4 py-3">
          <span className="text-sm font-medium text-[#2d5d89]">تم تحديد {selected.size} عميل</span>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">
            <option value="">تغيير الحالة...</option>
            {leadStatuses.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
          </select>
          <button onClick={handleBulkStatus} disabled={!bulkStatus}
            className="px-3 py-1.5 bg-[#2d5d89] text-white rounded-lg text-sm disabled:opacity-40">تطبيق</button>
          <button onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> حذف المحدد
          </button>
          <button onClick={() => setSelected(new Set())} className="text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
        </motion.div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <LoadingSpinner className="h-64" size="lg" />
          ) : leads.length === 0 ? (
            <EmptyState icon={TrendingUp} title="لا توجد عملاء" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={selected.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-[#2d5d89] focus:ring-[#2d5d89]" />
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">العميل</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الهاتف</th>
                    <th className="hidden md:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المشروع</th>
                    <th className="hidden lg:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">المصدر</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">الحالة</th>
                    <th className="hidden sm:table-cell text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">التاريخ</th>
                    <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 sm:px-6 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {leads.map((l) => {
                    const { label, variant } = statusBadge(l.status);
                    const SrcIcon = SOURCE_ICONS[l.source] || Users;
                    const isOverdue = l.followUpDate && new Date(l.followUpDate) < new Date();
                    return (
                      <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => openDrawer(l)}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${selected.has(l._id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(l._id)} onChange={() => toggleSelect(l._id)}
                            className="rounded border-gray-300 text-[#2d5d89] focus:ring-[#2d5d89]" />
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{l.name}</p>
                            {l.email && <p className="text-gray-400 text-xs hidden sm:block">{l.email}</p>}
                            {isOverdue && (
                              <span className="inline-flex items-center gap-0.5 text-xs text-red-600 mt-0.5">
                                <AlertCircle className="w-3 h-3" /> يستحق المتابعة
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-gray-600 dark:text-gray-400 font-mono text-xs sm:text-sm">{l.phone}</span>
                            {l.phone && (
                              <>
                                <a href={`tel:${l.phone}`} title="اتصال"
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-100 transition-colors">
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a href={`https://wa.me/${l.phone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" title="واتساب"
                                  className="w-6 h-6 flex items-center justify-center rounded-md bg-green-50 dark:bg-green-900/30 text-green-500 hover:bg-green-100 transition-colors">
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                                {l.email && (
                                  <a href={`mailto:${l.email}`} title="بريد"
                                    className="w-6 h-6 flex items-center justify-center rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-500 hover:bg-purple-100 transition-colors">
                                    <Mail className="w-3 h-3" />
                                  </a>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {l.interestedProject?.name?.ar || "—"}
                        </td>
                        <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <SrcIcon className="w-3.5 h-3.5" />
                            {sourceAr[l.source] || l.source}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <select value={l.status} onChange={(e) => quickStatus(l._id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2d5d89] cursor-pointer">
                            {leadStatuses.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
                          </select>
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-xs text-gray-400">
                          {new Date(l.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="px-4 sm:px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button onClick={() => openDrawer(l)} title="عرض التفاصيل"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2d5d89]/10 text-[#2d5d89] transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => sendWhatsApp(l)} title="إرسال واتساب"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 transition-colors">
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => notifyAdmins(l)} title="إشعار المسؤولين"
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 transition-colors">
                              <Bell className="w-4 h-4" />
                            </button>
                            <button onClick={() => openEdit(l)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(l._id)}
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
      )}

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <DndContext sensors={sensors} collisionDetection={closestCenter}
          onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4">
            {kanbanLeads.map((col) => (
              <KanbanColumn key={col.key} col={col} leads={col.leads}
                onEdit={openEdit} onDelete={(id) => setDeleteId(id)}
                onWhatsApp={sendWhatsApp} activeId={activeId} />
            ))}
          </div>
          <DragOverlay>
            {draggedLead && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-xl border border-[#2d5d89] opacity-90 w-56">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{draggedLead.name}</p>
                <p className="text-gray-400 text-xs">{draggedLead.phone}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}

      {viewMode === "table" && <Pagination page={page} pages={pages} onPage={setPage} />}

      {/* Lead Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل عميل" : "إضافة عميل"}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "name", label: "الاسم", required: true },
            { key: "phone", label: "الهاتف", required: true },
            { key: "email", label: "البريد الإلكتروني", type: "email" },
          ].map(({ key, label, type = "text", required }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input type={type} required={required} value={form[key]} onChange={(e) => f(key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المشروع المهتم به</label>
            <select value={form.interestedProject} onChange={(e) => f("interestedProject", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              <option value="">غير محدد</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name?.ar}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المصدر</label>
            <select value={form.source} onChange={(e) => f("source", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {sources.map((s) => <option key={s} value={s}>{sourceAr[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
            <select value={form.status} onChange={(e) => f("status", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
              {leadStatuses.map((s) => <option key={s} value={s}>{statusBadge(s).label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ المتابعة</label>
            <input type="date" value={form.followUpDate || ""} onChange={(e) => f("followUpDate", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الرسالة</label>
            <textarea rows={2} value={form.message} onChange={(e) => f("message", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ملاحظات</label>
            <textarea rows={2} value={form.notes} onChange={(e) => f("notes", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
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

      <InlineAiChat context="sales" pageData={{ totalLeads: leads.length }} />

      {/* Lead Details Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent className="h-full max-w-md w-full mr-0 ml-auto rounded-r-none rounded-l-2xl flex flex-col">
          {drawerLead && (
            <>
              <DrawerHeader className="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <DrawerTitle className="text-xl font-bold text-gray-900 dark:text-white">{drawerLead.name}</DrawerTitle>
                    <p className="text-sm text-gray-500 mt-0.5">{sourceAr[drawerLead.source] || drawerLead.source}</p>
                  </div>
                  <DrawerClose className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                    ✕
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Status badge */}
                <div className="flex items-center gap-3 flex-wrap">
                  <select
                    value={drawerLead.status}
                    onChange={async (e) => {
                      await quickStatus(drawerLead._id, e.target.value);
                      setDrawerLead((prev) => ({ ...prev, status: e.target.value }));
                    }}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5d89]"
                  >
                    {leadStatuses.map((s) => <option key={s} value={s}>{statusAr[s]}</option>)}
                  </select>
                  <span className="text-xs text-gray-400">
                    {new Date(drawerLead.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>

                {/* Contact info */}
                <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">بيانات التواصل</h3>
                  {drawerLead.phone && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{drawerLead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <a href={`tel:${drawerLead.phone}`} title="اتصال"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/${drawerLead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" title="واتساب"
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 hover:bg-green-100 transition-colors">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                  {drawerLead.email && (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{drawerLead.email}</span>
                      </div>
                      <a href={`mailto:${drawerLead.email}`} title="إرسال بريد"
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-100 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Project & follow-up */}
                <div className="space-y-3">
                  {drawerLead.interestedProject?.name?.ar && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#2d5d89] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">المشروع المهتم به</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{drawerLead.interestedProject.name.ar}</p>
                      </div>
                    </div>
                  )}
                  {drawerLead.followUpDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">موعد المتابعة</p>
                        <p className={`text-sm font-medium ${new Date(drawerLead.followUpDate) < new Date() ? "text-red-600" : "text-gray-800 dark:text-gray-200"}`}>
                          {new Date(drawerLead.followUpDate).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                          {new Date(drawerLead.followUpDate) < new Date() && " · متأخر"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message */}
                {drawerLead.message && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">الرسالة</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-4 py-3 leading-relaxed">
                      {drawerLead.message}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {drawerLead.notes && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">ملاحظات</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 rounded-xl px-4 py-3 leading-relaxed">
                      {drawerLead.notes}
                    </p>
                  </div>
                )}
              </div>

              <DrawerFooter className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex gap-2">
                <button
                  onClick={() => { closeDrawer(); sendWhatsApp(drawerLead); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> واتساب
                </button>
                <button
                  onClick={() => { closeDrawer(); openEdit(drawerLead); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" /> تعديل
                </button>
                <button
                  onClick={() => { closeDrawer(); setDeleteId(drawerLead._id); }}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

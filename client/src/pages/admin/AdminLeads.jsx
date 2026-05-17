import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Phone, Mail, MessageCircle, Bell } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import HelpCard from "../../Components/UI/HelpCard";
import { useToast } from "../../context/ToastContext";
import { TrendingUp } from "lucide-react";

const leadStatuses = ["new", "contacted", "interested", "not_interested", "converted", "lost"];
const sources = ["website", "whatsapp", "phone", "referral", "campaign", "other"];

const emptyLead = { name: "", phone: "", email: "", interestedProject: "", message: "", source: "website", status: "new", notes: "" };

export default function AdminLeads() {
  const toast = useToast();
  const [leads, setLeads] = useState([]);
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/leads", { params: { page, search, status: statusFilter } });
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100 } }).then((r) => setProjects(r.data.projects));
  }, []);

  const openCreate = () => { setEditItem(null); setForm(emptyLead); setModal(true); };
  const openEdit = (l) => {
    setEditItem(l);
    setForm({
      ...emptyLead,
      ...l,
      name: l.name ?? "",
      phone: l.phone ?? "",
      email: l.email ?? "",
      message: l.message ?? "",
      notes: l.notes ?? "",
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
    } catch {
      toast.error("فشل الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Quick status change directly from table row
  const quickStatus = async (id, newStatus) => {
    try {
      await api.put(`/leads/${id}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status: newStatus } : l));
      toast.success("تم تحديث الحالة");
    } catch {
      toast.error("فشل تحديث الحالة");
    }
  };

  const sourceAr = { website: "الموقع", whatsapp: "واتساب", phone: "هاتف", referral: "إحالة", campaign: "حملة", other: "أخرى" };
  const statusAr = { new: "جديد", contacted: "تم التواصل", interested: "مهتم", not_interested: "غير مهتم", converted: "محوّل", lost: "خسرناه" };

  function sendWhatsApp(lead) {
    let phone = (lead.phone || "").replace(/[\s\-\(\)]/g, "");
    if (phone.startsWith("0")) phone = "20" + phone.slice(1);
    if (!phone.startsWith("+") && !phone.startsWith("20")) phone = "20" + phone;
    phone = phone.replace(/^\+/, "");

    const statusArMsg = {
      new: "جديد", contacted: "تم التواصل", interested: "مهتم",
      not_interested: "غير مهتم", converted: "تحوّل لعميل", lost: "خسرنا"
    };
    const sourceArMsg = {
      website: "الموقع", whatsapp: "واتساب", phone: "هاتف",
      referral: "إحالة", campaign: "حملة", other: "أخرى"
    };

    const date = new Date(lead.createdAt).toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric"
    });

    const text = `🏢 *الصرح للتطوير العقاري*
━━━━━━━━━━━━━━━━━━━
👤 *الاسم:* ${lead.name || "—"}
📱 *الهاتف:* ${lead.phone || "—"}
📧 *البريد:* ${lead.email || "—"}
🏠 *المشروع:* ${lead.interestedProject?.name?.ar || lead.interestedProject?.name || "—"}
📥 *المصدر:* ${sourceArMsg[lead.source] || lead.source || "—"}
📊 *الحالة:* ${statusArMsg[lead.status] || lead.status || "—"}
💬 *الرسالة:* ${lead.message || "لا توجد رسالة"}
━━━━━━━━━━━━━━━━━━━
📅 ${date}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const notifyAdmins = async (lead) => {
    try {
      const res = await api.get("/settings/group/notifications");
      const settings = {};
      (res.data.settings || []).forEach(s => { settings[s.key] = s.value; });

      const numbers = [settings.lead_notify_whatsapp1, settings.lead_notify_whatsapp2, settings.lead_notify_whatsapp3]
        .filter(Boolean)
        .map(n => n.replace(/\D/g, ""));

      const message = (settings.lead_notify_message || "عميل جديد: {name} - {phone} - {message}")
        .replace("{name}", lead.name || "")
        .replace("{phone}", lead.phone || "")
        .replace("{message}", lead.message || "");

      if (numbers.length === 0) {
        toast.error("أضف أرقام واتساب للإشعارات في الإعدادات");
        return;
      }

      numbers.forEach((num, i) => {
        setTimeout(() => {
          window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, "_blank");
        }, i * 500);
      });
    } catch {
      toast.error("فشل جلب إعدادات الإشعارات");
    }
  };

  return (
    <div className="space-y-5">
      <HelpCard
        title="دليل إدارة العملاء"
        tips={[
          "اضغط أيقونة واتساب لإرسال رسالة تلقائية للعميل بتفاصيله كاملة",
          "غيّر حالة العميل مباشرة من القائمة المنسدلة في الجدول",
          "يمكن تعيين العميل لموظف مبيعات لمتابعته",
          "استخدم الفلتر للبحث حسب الحالة أو الاسم أو الهاتف",
        ]}
      />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">العملاء المحتملون</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} عميل</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة عميل</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل الحالات</option>
          {leadStatuses.map((s) => <option key={s} value={s}>{statusBadge(s).label}</option>)}
        </select>
      </div>

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
                  return (
                    <motion.tr key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{l.name}</p>
                          {l.email && <p className="text-gray-400 text-xs hidden sm:block">{l.email}</p>}
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
                                <Mail className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {l.interestedProject?.name?.ar || "—"}
                      </td>
                      <td className="hidden lg:table-cell px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sourceAr[l.source] || l.source}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <select
                          value={l.status}
                          onChange={(e) => quickStatus(l._id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2d5d89] cursor-pointer"
                        >
                          {leadStatuses.map((s) => (
                            <option key={s} value={s}>{statusAr[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString("ar-EG")}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-1">
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

      <Pagination page={page} pages={pages} onPage={setPage} />

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
    </div>
  );
}

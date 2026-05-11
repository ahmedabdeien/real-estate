import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Eye } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../components/UI/Modal";
import ConfirmModal from "../../components/UI/ConfirmModal";
import Pagination from "../../components/UI/Pagination";
import EmptyState from "../../components/UI/EmptyState";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../components/UI/Badge";
import { useToast } from "../../context/ToastContext";
import { FileText } from "lucide-react";

const emptyBlog = {
  title: { ar: "", en: "" },
  content: { ar: "", en: "" },
  excerpt: { ar: "", en: "" },
  coverImage: "",
  category: "general",
  status: "draft",
  featured: false,
};

export default function AdminBlogs() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs", { params: { page, search, status: statusFilter } });
      setBlogs(res.data.blogs);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("فشل تحميل المقالات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  const openCreate = () => { setEditItem(null); setForm(emptyBlog); setModal(true); };
  const openEdit = (b) => {
    setEditItem(b);
    setForm({
      ...emptyBlog,
      ...b,
      title: { ar: b.title?.ar ?? "", en: b.title?.en ?? "" },
      content: { ar: b.content?.ar ?? "", en: b.content?.en ?? "" },
      excerpt: { ar: b.excerpt?.ar ?? "", en: b.excerpt?.en ?? "" },
      coverImage: b.coverImage ?? "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/blogs/${editItem._id}`, form);
        toast.success("تم تحديث المقال");
      } else {
        await api.post("/blogs", form);
        toast.success("تم إضافة المقال");
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
      await api.delete(`/blogs/${deleteId}`);
      toast.success("تم حذف المقال");
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المقالات والأخبار</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} مقال</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          إضافة مقال
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="بحث..."
            className="pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89] w-56" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="hidden">مخفي</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? <LoadingSpinner className="h-64" size="lg" /> : blogs.length === 0 ? (
          <EmptyState icon={FileText} title="لا توجد مقالات" action={
            <button onClick={openCreate} className="bg-[#2d5d89] text-white px-4 py-2 rounded-xl text-sm font-medium">إضافة مقال</button>
          } />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {blogs.map((b) => {
              const { label, variant } = statusBadge(b.status);
              return (
                <motion.div key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.title?.ar}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate">{b.excerpt?.ar}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={variant}>{label}</Badge>
                      {b.featured && <Badge variant="warning">مميز</Badge>}
                      <span className="text-xs text-gray-400">{b.views} مشاهدة</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(b)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(b._id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} />

      <Modal open={modal} onClose={() => setModal(false)} title={editItem ? "تعديل مقال" : "إضافة مقال"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (عربي)</label>
              <input value={form.title?.ar} onChange={(e) => f("title.ar", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (إنجليزي)</label>
              <input value={form.title?.en} onChange={(e) => f("title.en", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مقتطف (عربي)</label>
            <textarea rows={2} value={form.excerpt?.ar} onChange={(e) => f("excerpt.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المحتوى (عربي)</label>
            <textarea rows={5} value={form.content?.ar} onChange={(e) => f("content.ar", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحالة</label>
              <select value={form.status} onChange={(e) => f("status", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
                <option value="hidden">مخفي</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط الصورة الغلاف</label>
              <input value={form.coverImage} onChange={(e) => f("coverImage", e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)}
              className="w-4 h-4 rounded accent-[#2d5d89]" />
            <span className="text-sm text-gray-700 dark:text-gray-300">مقال مميز</span>
          </label>
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

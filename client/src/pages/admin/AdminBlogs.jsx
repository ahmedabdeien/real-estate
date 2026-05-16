import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Eye, Tag, Clock, Globe, SortAsc, Hash, FileText, X } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import Modal from "../../Components/UI/Modal";
import ConfirmModal from "../../Components/UI/ConfirmModal";
import Pagination from "../../Components/UI/Pagination";
import EmptyState from "../../Components/UI/EmptyState";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import ImageUpload from "../../Components/UI/ImageUpload";
import HelpCard from "../../Components/UI/HelpCard";
import { useToast } from "../../context/ToastContext";

const CATEGORIES = ["أخبار", "مقالات", "نصائح", "تقارير", "مشاريع", "عروض"];

const emptyBlog = {
  title: { ar: "", en: "" },
  content: { ar: "", en: "" },
  excerpt: { ar: "", en: "" },
  coverImage: "",
  coverImageAlt: "",
  category: "",
  tags: [],
  status: "draft",
  featured: false,
  metaTitle: "",
  metaDescription: "",
  publishAt: "",
};

const calcReadingTime = (text = "") =>
  Math.max(1, Math.ceil((text || "").split(/\s+/).filter(Boolean).length / 200));

const countWords = (text = "") =>
  (text || "").split(/\s+/).filter(Boolean).length;

export default function AdminBlogs() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyBlog);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("content");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs", {
        params: { page, search, status: statusFilter, category: categoryFilter, sort: sortBy },
      });
      setBlogs(res.data.blogs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      toast.error("فشل تحميل المقالات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, statusFilter, categoryFilter, sortBy]);

  const openCreate = () => { setEditItem(null); setForm(emptyBlog); setActiveTab("content"); setModal(true); };
  const openEdit = (b) => {
    setEditItem(b);
    setForm({
      ...emptyBlog,
      ...b,
      title: { ar: b.title?.ar ?? "", en: b.title?.en ?? "" },
      content: { ar: b.content?.ar ?? "", en: b.content?.en ?? "" },
      excerpt: { ar: b.excerpt?.ar ?? "", en: b.excerpt?.en ?? "" },
      coverImage: b.coverImage ?? "",
      coverImageAlt: b.coverImageAlt ?? "",
      category: b.category ?? "",
      tags: Array.isArray(b.tags) ? b.tags : [],
      metaTitle: b.metaTitle ?? "",
      metaDescription: b.metaDescription ?? "",
      publishAt: b.publishAt ? String(b.publishAt).slice(0, 16) : "",
    });
    setActiveTab("content");
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

  const addTag = () => {
    const v = tagInput.trim().replace(/,$/, "");
    if (!v) return;
    if (!form.tags.includes(v)) f("tags", [...form.tags, v]);
    setTagInput("");
  };
  const removeTag = (t) => f("tags", form.tags.filter((x) => x !== t));

  const onTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput && form.tags.length) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  const readingTime = useMemo(() => calcReadingTime(form.content?.ar), [form.content?.ar]);
  const wordCount = useMemo(() => countWords(form.content?.ar), [form.content?.ar]);

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المقالات والأخبار</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{total} مقال</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">إضافة مقال</span>
          <span className="sm:hidden">إضافة</span>
        </button>
      </div>

      <HelpCard
        title="دليل إدارة المقالات"
        tips={[
          "أضف المقال بالعربية والإنجليزية لتحسين ظهوره في محركات البحث",
          "حالة 'مسودة' تعني أن المقال لن يظهر للزوار حتى تنشره",
          "فعّل 'مميز' لإظهار المقال في الصفحة الرئيسية",
          "أضف وسوماً (Tags) لتصنيف المحتوى وتسهيل البحث",
          "اكتب وصف SEO (150 حرف) لتحسين ظهور المقال في جوجل",
          "وقت القراءة يحسب تلقائياً من عدد كلمات المحتوى العربي",
        ]}
      />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="بحث..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="published">منشور</option>
          <option value="hidden">مخفي</option>
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2d5d89]">
          <option value="">كل التصنيفات</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <SortAsc className="w-4 h-4 text-gray-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-gray-700 dark:text-gray-300 text-sm focus:outline-none">
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="views">الأكثر مشاهدة</option>
          </select>
        </div>
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
              const rt = calcReadingTime(b.content?.ar);
              return (
                <motion.div key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {b.coverImage ? (
                    <img src={b.coverImage} alt={b.coverImageAlt || ""} className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{b.title?.ar}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 truncate hidden sm:block">{b.excerpt?.ar}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={variant}>{label}</Badge>
                      {b.featured && <Badge variant="warning">مميز</Badge>}
                      {b.category && (
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{b.category}</span>
                      )}
                      {Array.isArray(b.tags) && b.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Hash className="w-2.5 h-2.5" />{t}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <Eye className="w-3 h-3" />{b.views || 0}
                      </span>
                      <span className="text-xs text-gray-400 hidden sm:flex items-center gap-1">
                        <Clock className="w-3 h-3" />{rt} د قراءة
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
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
        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 mb-4 -mt-2">
          {[
            { k: "content", label: "المحتوى" },
            { k: "settings", label: "الإعدادات" },
            { k: "seo", label: "SEO" },
          ].map((t) => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} type="button"
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === t.k
                  ? "text-[#2d5d89] border-b-2 border-[#2d5d89]"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "content" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (عربي)</label>
                <input value={form.title?.ar} onChange={(e) => f("title.ar", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان (إنجليزي)</label>
                <input value={form.title?.en} onChange={(e) => f("title.en", e.target.value)} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مقتطف (عربي)</label>
                <textarea rows={2} value={form.excerpt?.ar} onChange={(e) => f("excerpt.ar", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مقتطف (إنجليزي)</label>
                <textarea rows={2} value={form.excerpt?.en} onChange={(e) => f("excerpt.en", e.target.value)} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المحتوى (عربي)</label>
              <textarea rows={6} value={form.content?.ar} onChange={(e) => f("content.ar", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> عدد الكلمات: {wordCount}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> وقت القراءة: {readingTime} دقيقة</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المحتوى (إنجليزي)</label>
              <textarea rows={5} value={form.content?.en} onChange={(e) => f("content.en", e.target.value)} dir="ltr"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التصنيف</label>
                <select value={form.category} onChange={(e) => f("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm">
                  <option value="">— اختر تصنيفاً —</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {form.status === "published" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جدولة النشر (اختياري)</label>
                <input type="datetime-local" value={form.publishAt} onChange={(e) => f("publishAt", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
                <p className="text-xs text-gray-500 mt-1">اتركه فارغاً للنشر فوراً</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> الوسوم
              </label>
              <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 min-h-[44px]">
                {form.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                    <Hash className="w-3 h-3" />{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={onTagKeyDown} onBlur={addTag}
                  placeholder="اكتب وسماً واضغط Enter أو فاصلة..."
                  className="flex-1 min-w-[140px] bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white" />
              </div>
            </div>

            <ImageUpload
              label="صورة الغلاف"
              value={form.coverImage}
              onChange={(url) => f("coverImage", url)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النص البديل للصورة (Alt)</label>
              <input value={form.coverImageAlt} onChange={(e) => f("coverImageAlt", e.target.value)}
                placeholder="وصف الصورة لمحركات البحث وقارئات الشاشة"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => f("featured", e.target.checked)}
                className="w-4 h-4 rounded accent-[#2d5d89]" />
              <span className="text-sm text-gray-700 dark:text-gray-300">مقال مميز</span>
            </label>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>تساعد هذه الحقول على تحسين ظهور المقال في نتائج البحث (Google).</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان SEO (Meta Title)</label>
              <input value={form.metaTitle} maxLength={70} onChange={(e) => f("metaTitle", e.target.value)}
                placeholder="عنوان يظهر في نتائج البحث"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm" />
              <p className={`text-xs mt-1 ${form.metaTitle.length > 60 ? "text-red-500" : "text-gray-500"}`}>
                {form.metaTitle.length} / 60 حرف
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وصف SEO (Meta Description)</label>
              <textarea rows={3} value={form.metaDescription} maxLength={180} onChange={(e) => f("metaDescription", e.target.value)}
                placeholder="وصف مختصر يظهر تحت العنوان في نتائج البحث"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm resize-none" />
              <p className={`text-xs mt-1 ${form.metaDescription.length > 160 ? "text-red-500" : "text-gray-500"}`}>
                {form.metaDescription.length} / 160 حرف
              </p>
            </div>
          </div>
        )}

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

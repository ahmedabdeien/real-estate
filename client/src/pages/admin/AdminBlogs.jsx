/**
 * AdminBlogs — Migrated to TanStack Query + shared UI components
 * Uses: useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog
 *       useForm, useTableState, useDisclosure
 *       AdminModal, ConfirmDialog, PageHeader, FormField, StatusBadge
 */
import { useState } from "react";
import { z } from "zod";
import {
  FaNewspaper, FaPlus, FaPen, FaTrash,
  FaMagnifyingGlass, FaTag, FaXmark, FaSpinner,
  FaFileLines, FaStar,
} from "react-icons/fa6";

import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "../../hooks/queries/useBlogs";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useForm } from "../../hooks/useForm";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, SelectField, TextareaField, ToggleField } from "../../Components/UI/FormField";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useToast } from "../../context/ToastContext";

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ["أخبار", "مقالات", "نصائح", "تقارير", "مشاريع", "عروض"];

const blogSchema = z.object({
  titleAr:         z.string().min(3, "العنوان بالعربية مطلوب (3 أحرف على الأقل)"),
  titleEn:         z.string().optional(),
  contentAr:       z.string().min(10, "المحتوى بالعربية مطلوب"),
  contentEn:       z.string().optional(),
  excerptAr:       z.string().optional(),
  category:        z.string().min(1, "الفئة مطلوبة"),
  status:          z.enum(["draft", "published"]),
  featured:        z.boolean().optional(),
  coverImage:      z.string().optional(),
  metaTitle:       z.string().optional(),
  metaDescription: z.string().optional(),
});

const emptyValues = {
  titleAr: "", titleEn: "",
  contentAr: "", contentEn: "",
  excerptAr: "", category: "",
  status: "draft", featured: false,
  coverImage: "", metaTitle: "", metaDescription: "",
};

const calcReadingTime = (text = "") =>
  Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminBlogs() {
  const toast = useToast();
  const [activeTab, setActiveTab]     = useState("ar");
  const [tagInput, setTagInput]       = useState("");
  const [tags, setTags]               = useState([]);
  const [statusFilter, setStatusFilter]     = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Table state
  const table = useTableState({ defaultPageSize: 10 });

  // Modals
  const modal         = useDisclosure();
  const confirmDelete = useDisclosure();

  // Form
  const form = useForm(blogSchema, emptyValues);

  // Queries
  const { data, isLoading, isFetching } = useBlogs({
    page:     table.queryParams.page,
    limit:    table.queryParams.pageSize,
    search:   table.queryParams.search,
    status:   statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const blogs = data?.blogs ?? [];
  const total = data?.total ?? 0;

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  // ── Helpers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    form.reset(emptyValues);
    setTags([]);
    setActiveTab("ar");
    modal.open(null);
  };

  const openEdit = (blog) => {
    form.reset({
      titleAr:         blog.title?.ar ?? "",
      titleEn:         blog.title?.en ?? "",
      contentAr:       blog.content?.ar ?? "",
      contentEn:       blog.content?.en ?? "",
      excerptAr:       blog.excerpt?.ar ?? "",
      category:        blog.category ?? "",
      status:          blog.status ?? "draft",
      featured:        blog.featured ?? false,
      coverImage:      blog.coverImage ?? "",
      metaTitle:       blog.metaTitle ?? "",
      metaDescription: blog.metaDescription ?? "",
    });
    setTags(blog.tags ?? []);
    setActiveTab("ar");
    modal.open(blog);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title:           { ar: values.titleAr, en: values.titleEn },
      content:         { ar: values.contentAr, en: values.contentEn },
      excerpt:         { ar: values.excerptAr },
      category:        values.category,
      status:          values.status,
      featured:        values.featured,
      coverImage:      values.coverImage,
      tags,
      metaTitle:       values.metaTitle,
      metaDescription: values.metaDescription,
    };

    try {
      if (modal.data) {
        await updateMutation.mutateAsync({ id: modal.data._id, data: payload });
        toast.success("تم تحديث المقال بنجاح");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("تم إنشاء المقال بنجاح");
      }
      modal.close();
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف المقال");
      confirmDelete.close();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <PageHeader
        title="إدارة المدونة"
        subtitle="إنشاء وتعديل مقالات الموقع"
        icon={<FaNewspaper />}
        loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: total },
          { label: "منشور",    value: blogs.filter((b) => b.status === "published").length },
          { label: "مسودة",    value: blogs.filter((b) => b.status === "draft").length },
        ]}
        actions={
          <PrimaryButton icon={<FaPlus />} onClick={openCreate}>
            مقال جديد
          </PrimaryButton>
        }
      />

      {/* Filters bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              value={table.queryParams.search}
              onChange={(e) => table.handleSearch(e.target.value)}
              placeholder="بحث في المقالات..."
              className={`${inputCls} pr-9 py-2`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); table.resetPage(); }}
            className={`${inputCls} w-auto py-2 text-sm`}
          >
            <option value="">كل الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); table.resetPage(); }}
            className={`${inputCls} w-auto py-2 text-sm`}
          >
            <option value="">كل الفئات</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FaSpinner className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <FaNewspaper className="w-10 h-10 opacity-30" />
            <p className="text-sm">لا يوجد مقالات بعد</p>
            <PrimaryButton icon={<FaPlus />} onClick={openCreate}>أضف أول مقال</PrimaryButton>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["المقال", "الفئة", "الكاتب", "مدة القراءة", "الحالة", ""].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                              <FaFileLines className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                              {blog.title?.ar ?? "—"}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              {blog.featured && <FaStar className="w-2.5 h-2.5 text-amber-400" />}
                              {blog.tags?.slice(0, 2).map((t) => (
                                <span key={t} className="bg-gray-100 dark:bg-gray-700 px-1.5 rounded text-[10px]">{t}</span>
                              ))}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-[color:var(--primary)]/10 text-[color:var(--primary)] px-2 py-1 rounded-lg font-semibold">
                          {blog.category ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {blog.author?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {calcReadingTime(blog.content?.ar ?? "")} دقيقة
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={blog.status} dot />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(blog)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <FaPen className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => confirmDelete.open(blog)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > table.queryParams.pageSize && (
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <span>عرض {blogs.length} من {total} مقال</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.handlePageChange(table.queryParams.page - 1)}
                    disabled={table.queryParams.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >السابق</button>
                  <span className="px-3 py-1.5 font-semibold">{table.queryParams.page}</span>
                  <button
                    onClick={() => table.handlePageChange(table.queryParams.page + 1)}
                    disabled={blogs.length < table.queryParams.pageSize}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <AdminModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? "تعديل المقال" : "إضافة مقال جديد"}
        icon={<FaNewspaper className="w-4 h-4" />}
        size="3xl"
        footer={
          <>
            <button
              onClick={modal.close}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ background: "var(--primary)" }}
            >
              {isPending && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
              {modal.data ? "حفظ التغييرات" : "نشر المقال"}
            </button>
          </>
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-800 pb-3">
          {[
            { key: "ar",   label: "العربية" },
            { key: "en",   label: "English" },
            { key: "meta", label: "SEO & إعدادات" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === t.key ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              style={activeTab === t.key ? { background: "var(--primary)" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Arabic */}
        {activeTab === "ar" && (
          <div className="space-y-4">
            <FormField label="العنوان بالعربية" error={form.errors.titleAr} required>
              <input {...form.register("titleAr")} placeholder="عنوان المقال..." className={inputCls} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="الفئة" error={form.errors.category} required>
                <SelectField {...form.register("category")} error={form.errors.category}>
                  <option value="">اختر الفئة</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </SelectField>
              </FormField>
              <FormField label="الحالة">
                <SelectField {...form.register("status")}>
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                </SelectField>
              </FormField>
            </div>
            <FormField label="المقتطف">
              <TextareaField {...form.register("excerptAr")} rows={2} placeholder="ملخص قصير..." />
            </FormField>
            <FormField label="المحتوى" error={form.errors.contentAr} required>
              <TextareaField {...form.register("contentAr")} rows={8} placeholder="اكتب محتوى المقال..." />
            </FormField>
          </div>
        )}

        {/* English */}
        {activeTab === "en" && (
          <div className="space-y-4">
            <FormField label="Title (English)">
              <input {...form.register("titleEn")} placeholder="Blog title..." className={inputCls} />
            </FormField>
            <FormField label="Content (English)">
              <TextareaField {...form.register("contentEn")} rows={10} placeholder="Blog content..." />
            </FormField>
          </div>
        )}

        {/* Meta */}
        {activeTab === "meta" && (
          <div className="space-y-4">
            <FormField label="صورة الغلاف (رابط)">
              <input {...form.register("coverImage")} placeholder="https://..." className={inputCls} />
            </FormField>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الوسوم</label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}}
                  placeholder="أضف وسمًا..."
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={addTag}
                  className="px-3 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: "var(--primary)" }}>
                  إضافة
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                      <FaTag className="w-2.5 h-2.5 opacity-60" />{t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}><FaXmark className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <FormField label="عنوان SEO">
              <input {...form.register("metaTitle")} placeholder="عنوان محركات البحث..." className={inputCls} />
            </FormField>
            <FormField label="وصف SEO">
              <TextareaField {...form.register("metaDescription")} rows={3} placeholder="وصف محركات البحث..." />
            </FormField>
            <ToggleField
              checked={form.values.featured}
              onChange={(v) => form.setValue("featured", v)}
              label="مقال مميز"
              description="يظهر في الصفحة الرئيسية"
            />
          </div>
        )}
      </AdminModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        onConfirm={handleDelete}
        title="حذف المقال"
        message={`هل تريد حذف مقال "${confirmDelete.data?.title?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

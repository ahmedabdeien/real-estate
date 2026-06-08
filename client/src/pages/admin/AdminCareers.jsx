/**
 * AdminCareers — Migrated to TanStack Query + shared UI components
 */
import { useState } from "react";
import { z } from "zod";
import {
  FaBriefcase, FaPlus, FaPen, FaTrash, FaMagnifyingGlass,
  FaLocationDot, FaUsers, FaSpinner, FaCircleCheck, FaCircleXmark,
  FaClock, FaBuilding,
} from "react-icons/fa6";

import { useCareers, useCreateCareer, useUpdateCareer, useDeleteCareer } from "../../hooks/queries/useCareers";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useForm } from "../../hooks/useForm";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, SelectField, TextareaField, ToggleField } from "../../Components/UI/FormField";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useToast } from "../../context/ToastContext";

// ─── Schema ───────────────────────────────────────────────────────────────────
const careerSchema = z.object({
  titleAr:        z.string().min(3, "العنوان بالعربية مطلوب"),
  titleEn:        z.string().optional(),
  departmentAr:   z.string().min(2, "القسم مطلوب"),
  location:       z.string().min(2, "الموقع مطلوب"),
  type:           z.enum(["full_time", "part_time", "contract", "internship"]),
  descriptionAr:  z.string().min(10, "الوصف مطلوب"),
  descriptionEn:  z.string().optional(),
  requirementsAr: z.string().optional(),
  salaryMin:      z.coerce.number().optional(),
  salaryMax:      z.coerce.number().optional(),
  isActive:       z.boolean(),
  deadline:       z.string().optional(),
});

const emptyValues = {
  titleAr: "", titleEn: "",
  departmentAr: "", location: "",
  type: "full_time",
  descriptionAr: "", descriptionEn: "",
  requirementsAr: "",
  salaryMin: "", salaryMax: "",
  isActive: true, deadline: "",
};

const JOB_TYPES = {
  full_time:   "دوام كامل",
  part_time:   "دوام جزئي",
  contract:    "عقد",
  internship:  "تدريب",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminCareers() {
  const toast = useToast();
  const [activeTab,   setActiveTab]   = useState("ar");
  const [typeFilter,  setTypeFilter]  = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const table         = useTableState({ defaultPageSize: 10 });
  const modal         = useDisclosure();
  const confirmDelete = useDisclosure();
  const form          = useForm(careerSchema, emptyValues);

  const { data, isLoading, isFetching } = useCareers({
    page:     table.queryParams.page,
    limit:    table.queryParams.pageSize,
    search:   table.queryParams.search,
    type:     typeFilter || undefined,
    isActive: activeFilter !== "" ? activeFilter === "true" : undefined,
  });

  const careers = data?.careers ?? [];
  const total   = data?.total ?? 0;

  const createMutation = useCreateCareer();
  const updateMutation = useUpdateCareer();
  const deleteMutation = useDeleteCareer();

  // ── Helpers ──
  const openCreate = () => {
    form.reset(emptyValues);
    setActiveTab("ar");
    modal.open(null);
  };

  const openEdit = (career) => {
    form.reset({
      titleAr:        career.title?.ar ?? career.titleAr ?? "",
      titleEn:        career.title?.en ?? career.titleEn ?? "",
      departmentAr:   career.department?.ar ?? career.departmentAr ?? "",
      location:       career.location ?? "",
      type:           career.type ?? "full_time",
      descriptionAr:  career.description?.ar ?? career.descriptionAr ?? "",
      descriptionEn:  career.description?.en ?? career.descriptionEn ?? "",
      requirementsAr: career.requirements?.ar ?? career.requirementsAr ?? "",
      salaryMin:      career.salary?.min ?? "",
      salaryMax:      career.salary?.max ?? "",
      isActive:       career.isActive ?? true,
      deadline:       career.deadline ? career.deadline.slice(0, 10) : "",
    });
    setActiveTab("ar");
    modal.open(career);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title:        { ar: values.titleAr, en: values.titleEn },
      department:   { ar: values.departmentAr },
      location:     values.location,
      type:         values.type,
      description:  { ar: values.descriptionAr, en: values.descriptionEn },
      requirements: { ar: values.requirementsAr },
      salary:       { min: values.salaryMin || null, max: values.salaryMax || null },
      isActive:     values.isActive,
      deadline:     values.deadline || null,
    };

    try {
      if (modal.data) {
        await updateMutation.mutateAsync({ id: modal.data._id, data: payload });
        toast.success("تم تحديث الوظيفة بنجاح");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("تم إضافة الوظيفة بنجاح");
      }
      modal.close();
    } catch {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف الوظيفة");
      confirmDelete.close();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ──
  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Header */}
      <PageHeader
        title="إدارة الوظائف"
        subtitle="إضافة وإدارة الوظائف الشاغرة"
        icon={<FaBriefcase />}
        loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: total },
          { label: "نشطة",    value: careers.filter((c) => c.isActive).length },
          { label: "مغلقة",   value: careers.filter((c) => !c.isActive).length },
        ]}
        actions={
          <PrimaryButton icon={<FaPlus />} onClick={openCreate}>
            وظيفة جديدة
          </PrimaryButton>
        }
      />

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              value={table.queryParams.search}
              onChange={(e) => table.handleSearch(e.target.value)}
              placeholder="بحث في الوظائف..."
              className={`${inputCls} pr-9 py-2`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); table.resetPage(); }}
            className={`${inputCls} w-auto py-2 text-sm`}
          >
            <option value="">كل الأنواع</option>
            {Object.entries(JOB_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); table.resetPage(); }}
            className={`${inputCls} w-auto py-2 text-sm`}
          >
            <option value="">الكل</option>
            <option value="true">نشطة</option>
            <option value="false">مغلقة</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <FaSpinner className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : careers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
            <FaBriefcase className="w-10 h-10 opacity-30" />
            <p className="text-sm">لا يوجد وظائف بعد</p>
            <PrimaryButton icon={<FaPlus />} onClick={openCreate}>أضف أول وظيفة</PrimaryButton>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["الوظيفة", "القسم", "الموقع", "النوع", "آخر موعد", "الحالة", ""].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {careers.map((career) => (
                    <tr key={career._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {career.title?.ar ?? career.title ?? "—"}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <FaUsers className="w-2.5 h-2.5" />
                          {career.applicantsCount ?? 0} متقدم
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-1">
                          <FaBuilding className="w-3 h-3 opacity-50" />
                          {career.department?.ar ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                        <div className="flex items-center gap-1">
                          <FaLocationDot className="w-3 h-3 opacity-50" />
                          {career.location ?? "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-lg font-semibold">
                          {JOB_TYPES[career.type] ?? career.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {career.deadline ? (
                          <div className="flex items-center gap-1">
                            <FaClock className="w-3 h-3 opacity-50" />
                            {new Date(career.deadline).toLocaleDateString("ar-SA")}
                          </div>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {career.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                            <FaCircleCheck className="w-3.5 h-3.5" /> نشطة
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-gray-400 text-xs font-semibold">
                            <FaCircleXmark className="w-3.5 h-3.5" /> مغلقة
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(career)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <FaPen className="w-3 h-3" />
                          </button>
                          <button onClick={() => confirmDelete.open(career)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
                <span>عرض {careers.length} من {total}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => table.handlePageChange(table.queryParams.page - 1)}
                    disabled={table.queryParams.page <= 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    السابق
                  </button>
                  <span className="px-3 py-1.5 font-semibold">{table.queryParams.page}</span>
                  <button onClick={() => table.handlePageChange(table.queryParams.page + 1)}
                    disabled={careers.length < table.queryParams.pageSize}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <AdminModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"}
        icon={<FaBriefcase className="w-4 h-4" />}
        size="2xl"
        footer={
          <>
            <button onClick={modal.close}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors">
              إلغاء
            </button>
            <button onClick={handleSubmit} disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary)" }}>
              {isPending && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
              {modal.data ? "حفظ التغييرات" : "إضافة الوظيفة"}
            </button>
          </>
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-gray-100 dark:border-gray-800 pb-3">
          {[{ key: "ar", label: "العربية" }, { key: "en", label: "English" }, { key: "settings", label: "الإعدادات" }].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === t.key ? "text-white" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              style={activeTab === t.key ? { background: "var(--primary)" } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "ar" && (
          <div className="space-y-4">
            <FormField label="مسمى الوظيفة (عربي)" error={form.errors.titleAr} required>
              <input {...form.register("titleAr")} placeholder="مثال: مهندس مبيعات..." className={inputCls} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="القسم" error={form.errors.departmentAr} required>
                <input {...form.register("departmentAr")} placeholder="مثال: المبيعات..." className={inputCls} />
              </FormField>
              <FormField label="الموقع" error={form.errors.location} required>
                <input {...form.register("location")} placeholder="مثال: القاهرة..." className={inputCls} />
              </FormField>
            </div>
            <FormField label="الوصف الوظيفي" error={form.errors.descriptionAr} required>
              <TextareaField {...form.register("descriptionAr")} rows={5} placeholder="وصف الوظيفة والمهام..." />
            </FormField>
            <FormField label="المتطلبات والمؤهلات">
              <TextareaField {...form.register("requirementsAr")} rows={4} placeholder="المتطلبات والمؤهلات المطلوبة..." />
            </FormField>
          </div>
        )}

        {activeTab === "en" && (
          <div className="space-y-4">
            <FormField label="Job Title (English)">
              <input {...form.register("titleEn")} placeholder="e.g. Sales Engineer..." className={inputCls} />
            </FormField>
            <FormField label="Description (English)">
              <TextareaField {...form.register("descriptionEn")} rows={8} placeholder="Job description..." />
            </FormField>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <FormField label="نوع الوظيفة">
              <SelectField {...form.register("type")}>
                {Object.entries(JOB_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </SelectField>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="الراتب الأدنى (اختياري)">
                <input type="number" {...form.register("salaryMin")} placeholder="0" className={inputCls} />
              </FormField>
              <FormField label="الراتب الأقصى (اختياري)">
                <input type="number" {...form.register("salaryMax")} placeholder="0" className={inputCls} />
              </FormField>
            </div>
            <FormField label="آخر موعد للتقديم">
              <input type="date" {...form.register("deadline")} className={inputCls} />
            </FormField>
            <ToggleField
              checked={form.values.isActive}
              onChange={(v) => form.setValue("isActive", v)}
              label="الوظيفة نشطة"
              description="عند التفعيل تظهر في صفحة الوظائف"
            />
          </div>
        )}
      </AdminModal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={confirmDelete.close}
        onConfirm={handleDelete}
        title="حذف الوظيفة"
        message={`هل تريد حذف وظيفة "${confirmDelete.data?.title?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

/**
 * AdminCareers — TanStack Query + Mantine
 */
import { useState } from "react";
import { z } from "zod";
import {
  Box, Group, Stack, Text, TextInput, Textarea, Select, Switch, Button,
  ActionIcon, Card, Table, Badge, Loader, Pagination, Tabs,
} from "@mantine/core";
import {
  FaBriefcase, FaPlus, FaPen, FaTrash, FaMagnifyingGlass,
  FaLocationDot, FaUsers, FaCircleCheck, FaCircleXmark, FaClock, FaBuilding,
} from "react-icons/fa6";

import { useCareers, useCreateCareer, useUpdateCareer, useDeleteCareer } from "../../hooks/queries/useCareers";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useForm } from "../../hooks/useForm";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import { useToast } from "../../context/ToastContext";

const careerSchema = z.object({
  titleAr: z.string().min(3, "العنوان بالعربية مطلوب"),
  titleEn: z.string().optional(),
  departmentAr: z.string().min(2, "القسم مطلوب"),
  locationAr: z.string().min(2, "الموقع مطلوب"),
  type: z.enum(["full_time", "part_time", "contract", "internship"]),
  descriptionAr: z.string().min(10, "الوصف مطلوب"),
  descriptionEn: z.string().optional(),
  requirementsAr: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  isActive: z.boolean(),
  deadline: z.string().optional(),
});

const emptyValues = {
  titleAr: "", titleEn: "", departmentAr: "", locationAr: "", type: "full_time",
  descriptionAr: "", descriptionEn: "", requirementsAr: "", salaryMin: "", salaryMax: "",
  isActive: true, deadline: "",
};

const JOB_TYPES = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };

export default function AdminCareers() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("ar");
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const table = useTableState({ defaultPageSize: 10 });
  const modal = useDisclosure();
  const confirmDelete = useDisclosure();
  const form = useForm(careerSchema, emptyValues);

  const { data, isLoading, isFetching } = useCareers({
    page: table.queryParams.page, limit: table.queryParams.pageSize, search: table.queryParams.search,
    type: typeFilter || undefined, isActive: activeFilter !== "" ? activeFilter === "true" : undefined,
  });

  const careers = data?.careers ?? [];
  const total = data?.total ?? 0;

  const createMutation = useCreateCareer();
  const updateMutation = useUpdateCareer();
  const deleteMutation = useDeleteCareer();

  const openCreate = () => { form.reset(emptyValues); setActiveTab("ar"); modal.open(null); };

  const openEdit = (career) => {
    form.reset({
      titleAr: career.title?.ar ?? career.titleAr ?? "",
      titleEn: career.title?.en ?? career.titleEn ?? "",
      departmentAr: career.department?.ar ?? career.departmentAr ?? "",
      locationAr: career.location?.ar ?? career.location ?? career.locationAr ?? "",
      type: career.type ?? "full_time",
      descriptionAr: career.description?.ar ?? career.descriptionAr ?? "",
      descriptionEn: career.description?.en ?? career.descriptionEn ?? "",
      requirementsAr: Array.isArray(career.requirements) ? career.requirements.join("\n") : career.requirements?.ar ?? career.requirementsAr ?? "",
      salaryMin: career.salary?.min ?? "", salaryMax: career.salary?.max ?? "",
      isActive: career.isActive ?? true,
      deadline: career.deadline ? career.deadline.slice(0, 10) : "",
    });
    setActiveTab("ar");
    modal.open(career);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: { ar: values.titleAr, en: values.titleEn },
      department: { ar: values.departmentAr },
      location: { ar: values.locationAr },
      type: values.type,
      description: { ar: values.descriptionAr, en: values.descriptionEn },
      requirements: values.requirementsAr.split("\n").map((line) => line.trim()).filter(Boolean),
      salary: { min: values.salaryMin || null, max: values.salaryMax || null },
      isActive: values.isActive,
      deadline: values.deadline || null,
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
    } catch { toast.error("حدث خطأ، يرجى المحاولة مرة أخرى"); }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف الوظيفة");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box dir="rtl">
      <PageHeader
        title="إدارة الوظائف" subtitle="إضافة وإدارة الوظائف الشاغرة" icon={<FaBriefcase size={16} />} loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: total },
          { label: "نشطة", value: careers.filter((c) => c.isActive).length },
          { label: "مغلقة", value: careers.filter((c) => !c.isActive).length },
        ]}
        actions={<PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>وظيفة جديدة</PrimaryButton>}
      />

      <Box bg="white" px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="sm" wrap="wrap">
          <TextInput
            style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
            leftSection={<FaMagnifyingGlass size={13} />} placeholder="بحث في الوظائف..."
            value={table.queryParams.search} onChange={(e) => table.handleSearch(e.target.value)}
          />
          <Select w={160} placeholder="كل الأنواع" clearable
            data={Object.entries(JOB_TYPES).map(([value, label]) => ({ value, label }))}
            value={typeFilter} onChange={(v) => { setTypeFilter(v || ""); table.resetPage(); }} />
          <Select w={130} placeholder="الكل" clearable
            data={[{ value: "true", label: "نشطة" }, { value: "false", label: "مغلقة" }]}
            value={activeFilter} onChange={(v) => { setActiveFilter(v || ""); table.resetPage(); }} />
        </Group>
      </Box>

      <Box p="lg">
        {isLoading ? (
          <Group justify="center" py={64}><Loader color="gray" /></Group>
        ) : careers.length === 0 ? (
          <Stack align="center" py={64} gap="sm">
            <FaBriefcase size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed" size="sm">لا يوجد وظائف بعد</Text>
            <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>أضف أول وظيفة</PrimaryButton>
          </Stack>
        ) : (
          <Stack gap="md">
            <Card withBorder padding={0} style={{ overflow: "auto" }}>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>الوظيفة</Table.Th>
                    <Table.Th>القسم</Table.Th>
                    <Table.Th>الموقع</Table.Th>
                    <Table.Th>النوع</Table.Th>
                    <Table.Th>آخر موعد</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {careers.map((career) => (
                    <Table.Tr key={career._id}>
                      <Table.Td>
                        <Text fw={600} size="sm">{career.title?.ar ?? career.title ?? "—"}</Text>
                        <Group gap={4} c="dimmed"><FaUsers size={9} /><Text size="xs">{career.applicantsCount ?? 0} متقدم</Text></Group>
                      </Table.Td>
                      <Table.Td><Group gap={4} c="dimmed"><FaBuilding size={11} /><Text size="xs">{career.department?.ar ?? "—"}</Text></Group></Table.Td>
                      <Table.Td><Group gap={4} c="dimmed"><FaLocationDot size={11} /><Text size="xs">{career.location?.ar ?? career.location ?? "—"}</Text></Group></Table.Td>
                      <Table.Td><Badge variant="light" color="blue">{JOB_TYPES[career.type] ?? career.type}</Badge></Table.Td>
                      <Table.Td>
                        {career.deadline ? (
                          <Group gap={4} c="dimmed"><FaClock size={11} /><Text size="xs">{new Date(career.deadline).toLocaleDateString("ar-SA")}</Text></Group>
                        ) : <Text size="xs" c="dimmed">—</Text>}
                      </Table.Td>
                      <Table.Td>
                        {career.isActive ? (
                          <Badge variant="light" color="green" leftSection={<FaCircleCheck size={9} />}>نشطة</Badge>
                        ) : (
                          <Badge variant="light" color="gray" leftSection={<FaCircleXmark size={9} />}>مغلقة</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={2}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(career)}><FaPen size={12} /></ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete.open(career)}><FaTrash size={12} /></ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>

            {total > table.queryParams.pageSize && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">عرض {careers.length} من {total}</Text>
                <Pagination size="sm" total={Math.max(1, Math.ceil(total / table.queryParams.pageSize))} value={table.queryParams.page} onChange={table.handlePageChange} />
              </Group>
            )}
          </Stack>
        )}
      </Box>

      <AdminModal
        isOpen={modal.isOpen} onClose={modal.close}
        title={modal.data ? "تعديل الوظيفة" : "إضافة وظيفة جديدة"} icon={<FaBriefcase size={14} />} size="2xl"
        footer={
          <>
            <Button variant="default" onClick={modal.close}>إلغاء</Button>
            <Button color="brand" loading={isPending} onClick={handleSubmit}>{modal.data ? "حفظ التغييرات" : "إضافة الوظيفة"}</Button>
          </>
        }
      >
        <Tabs value={activeTab} onChange={setActiveTab} color="brand">
          <Tabs.List mb="md">
            <Tabs.Tab value="ar">العربية</Tabs.Tab>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="settings">الإعدادات</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ar">
            <Stack gap="md">
              <TextInput label="مسمى الوظيفة (عربي)" required error={form.errors.titleAr} placeholder="مثال: مهندس مبيعات..." {...form.register("titleAr")} />
              <Group grow>
                <TextInput label="القسم" required error={form.errors.departmentAr} placeholder="مثال: المبيعات..." {...form.register("departmentAr")} />
                <TextInput label="الموقع" required error={form.errors.locationAr} placeholder="مثال: القاهرة..." {...form.register("locationAr")} />
              </Group>
              <Textarea label="الوصف الوظيفي" required error={form.errors.descriptionAr} rows={5} placeholder="وصف الوظيفة والمهام..." {...form.register("descriptionAr")} />
              <Textarea label="المتطلبات والمؤهلات" rows={4} placeholder="اكتب كل متطلب في سطر منفصل..." {...form.register("requirementsAr")} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="en">
            <Stack gap="md">
              <TextInput label="Job Title (English)" placeholder="e.g. Sales Engineer..." {...form.register("titleEn")} />
              <Textarea label="Description (English)" rows={8} placeholder="Job description..." {...form.register("descriptionEn")} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <Stack gap="md">
              <Select label="نوع الوظيفة" data={Object.entries(JOB_TYPES).map(([value, label]) => ({ value, label }))} value={form.values.type} onChange={(v) => form.setValue("type", v || "full_time")} />
              <Group grow>
                <TextInput type="number" label="الراتب الأدنى (اختياري)" placeholder="0" {...form.register("salaryMin")} />
                <TextInput type="number" label="الراتب الأقصى (اختياري)" placeholder="0" {...form.register("salaryMax")} />
              </Group>
              <TextInput type="date" label="آخر موعد للتقديم" {...form.register("deadline")} />
              <Switch checked={form.values.isActive} onChange={(e) => form.setValue("isActive", e.currentTarget.checked)} label="الوظيفة نشطة" description="عند التفعيل تظهر في صفحة الوظائف" color="brand" />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </AdminModal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close} onConfirm={handleDelete}
        title="حذف الوظيفة" message={`هل تريد حذف وظيفة "${confirmDelete.data?.title?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

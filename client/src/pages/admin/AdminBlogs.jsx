/**
 * AdminBlogs — TanStack Query + Mantine
 */
import { useState } from "react";
import { z } from "zod";
import {
  MantineProvider, Box, Group, Stack, Text, TextInput, Textarea, Select, Switch,
  Button, ActionIcon, Card, Table, Badge, Image, Loader, Tabs, Pill, PillsInput,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaNewspaper, FaPlus, FaPen, FaTrash, FaMagnifyingGlass, FaTag, FaFileLines, FaStar,
} from "react-icons/fa6";

import { useBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog } from "../../hooks/queries/useBlogs";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useForm } from "../../hooks/useForm";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { mantineTheme } from "../../mantineTheme";

const CATEGORIES = ["أخبار", "مقالات", "نصائح", "تقارير", "مشاريع", "عروض"];

const blogSchema = z.object({
  titleAr: z.string().min(3, "العنوان بالعربية مطلوب (3 أحرف على الأقل)"),
  titleEn: z.string().optional(),
  contentAr: z.string().min(10, "المحتوى بالعربية مطلوب"),
  contentEn: z.string().optional(),
  excerptAr: z.string().optional(),
  category: z.string().min(1, "الفئة مطلوبة"),
  status: z.enum(["draft", "published"]),
  featured: z.boolean().optional(),
  coverImage: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

const emptyValues = {
  titleAr: "", titleEn: "", contentAr: "", contentEn: "", excerptAr: "", category: "",
  status: "draft", featured: false, coverImage: "", metaTitle: "", metaDescription: "",
};

const calcReadingTime = (text = "") => Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));

function AdminBlogsInner() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("ar");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const table = useTableState({ defaultPageSize: 10 });
  const modal = useDisclosure();
  const confirmDelete = useDisclosure();
  const form = useForm(blogSchema, emptyValues);

  const { data, isLoading, isFetching } = useBlogs({
    page: table.queryParams.page, limit: table.queryParams.pageSize, search: table.queryParams.search,
    status: statusFilter || undefined, category: categoryFilter || undefined,
  });

  const blogs = data?.blogs ?? [];
  const total = data?.total ?? 0;

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();

  const openCreate = () => { form.reset(emptyValues); setTags([]); setActiveTab("ar"); modal.open(null); };

  const openEdit = (blog) => {
    form.reset({
      titleAr: blog.title?.ar ?? "", titleEn: blog.title?.en ?? "",
      contentAr: blog.content?.ar ?? "", contentEn: blog.content?.en ?? "",
      excerptAr: blog.excerpt?.ar ?? "", category: blog.category ?? "",
      status: blog.status ?? "draft", featured: blog.featured ?? false,
      coverImage: blog.coverImage ?? "", metaTitle: blog.metaTitle ?? "", metaDescription: blog.metaDescription ?? "",
    });
    setTags(blog.tags ?? []);
    setActiveTab("ar");
    modal.open(blog);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      title: { ar: values.titleAr, en: values.titleEn },
      content: { ar: values.contentAr, en: values.contentEn },
      excerpt: { ar: values.excerptAr },
      category: values.category, status: values.status, featured: values.featured,
      coverImage: values.coverImage, tags, metaTitle: values.metaTitle, metaDescription: values.metaDescription,
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
    } catch { toast.error("حدث خطأ، يرجى المحاولة مرة أخرى"); }
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف المقال");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Box dir="rtl">
      <PageHeader
        title="إدارة المدونة" subtitle="إنشاء وتعديل مقالات الموقع" icon={<FaNewspaper size={16} />} loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: total },
          { label: "منشور", value: blogs.filter((b) => b.status === "published").length },
          { label: "مسودة", value: blogs.filter((b) => b.status === "draft").length },
        ]}
        actions={<PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>مقال جديد</PrimaryButton>}
      />

      <Box bg="white" px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="sm" wrap="wrap">
          <TextInput
            style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
            leftSection={<FaMagnifyingGlass size={13} />} placeholder="بحث في المقالات..."
            value={table.queryParams.search} onChange={(e) => table.handleSearch(e.target.value)}
          />
          <Select w={140} placeholder="كل الحالات" clearable
            data={[{ value: "published", label: "منشور" }, { value: "draft", label: "مسودة" }]}
            value={statusFilter} onChange={(v) => { setStatusFilter(v || ""); table.resetPage(); }} />
          <Select w={140} placeholder="كل الفئات" clearable data={CATEGORIES}
            value={categoryFilter} onChange={(v) => { setCategoryFilter(v || ""); table.resetPage(); }} />
        </Group>
      </Box>

      <Box p="lg">
        {isLoading ? (
          <Group justify="center" py={64}><Loader color="gray" /></Group>
        ) : blogs.length === 0 ? (
          <Stack align="center" py={64} gap="sm">
            <FaNewspaper size={40} color="var(--mantine-color-gray-3)" />
            <Text c="dimmed" size="sm">لا يوجد مقالات بعد</Text>
            <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>أضف أول مقال</PrimaryButton>
          </Stack>
        ) : (
          <Stack gap="md">
            <Card withBorder padding={0} style={{ overflow: "auto" }}>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>المقال</Table.Th>
                    <Table.Th>الفئة</Table.Th>
                    <Table.Th>الكاتب</Table.Th>
                    <Table.Th>مدة القراءة</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {blogs.map((blog) => (
                    <Table.Tr key={blog._id}>
                      <Table.Td>
                        <Group gap={10} wrap="nowrap">
                          {blog.coverImage ? (
                            <Image src={blog.coverImage} alt="" w={40} h={40} fit="cover" />
                          ) : (
                            <Box w={40} h={40} bg="gray.1" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <FaFileLines size={15} color="var(--mantine-color-gray-4)" />
                            </Box>
                          )}
                          <Box>
                            <Text fw={600} size="sm" lineClamp={1}>{blog.title?.ar ?? "—"}</Text>
                            <Group gap={4} mt={2}>
                              {blog.featured && <FaStar size={10} color="var(--mantine-color-yellow-5)" />}
                              {blog.tags?.slice(0, 2).map((t) => <Badge key={t} variant="light" color="gray" size="xs">{t}</Badge>)}
                            </Group>
                          </Box>
                        </Group>
                      </Table.Td>
                      <Table.Td><Badge variant="light" color="brand">{blog.category ?? "—"}</Badge></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{blog.author?.name ?? "—"}</Text></Table.Td>
                      <Table.Td><Text size="xs" c="dimmed">{calcReadingTime(blog.content?.ar ?? "")} دقيقة</Text></Table.Td>
                      <Table.Td><StatusBadge status={blog.status} dot /></Table.Td>
                      <Table.Td>
                        <Group gap={2}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(blog)}><FaPen size={12} /></ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete.open(blog)}><FaTrash size={12} /></ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>

            {total > table.queryParams.pageSize && (
              <Group justify="space-between">
                <Text size="sm" c="dimmed">عرض {blogs.length} من {total} مقال</Text>
                <Group gap={4}>
                  <Button size="xs" variant="default" disabled={table.queryParams.page <= 1} onClick={() => table.handlePageChange(table.queryParams.page - 1)}>السابق</Button>
                  <Text size="sm" fw={600} px={8}>{table.queryParams.page}</Text>
                  <Button size="xs" variant="default" disabled={blogs.length < table.queryParams.pageSize} onClick={() => table.handlePageChange(table.queryParams.page + 1)}>التالي</Button>
                </Group>
              </Group>
            )}
          </Stack>
        )}
      </Box>

      <AdminModal
        isOpen={modal.isOpen} onClose={modal.close}
        title={modal.data ? "تعديل المقال" : "إضافة مقال جديد"} icon={<FaNewspaper size={14} />} size="3xl"
        footer={
          <>
            <Button variant="default" onClick={modal.close}>إلغاء</Button>
            <Button color="brand" loading={isPending} onClick={handleSubmit}>{modal.data ? "حفظ التغييرات" : "نشر المقال"}</Button>
          </>
        }
      >
        <Tabs value={activeTab} onChange={setActiveTab} color="brand">
          <Tabs.List mb="md">
            <Tabs.Tab value="ar">العربية</Tabs.Tab>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="meta">SEO &amp; إعدادات</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ar">
            <Stack gap="md">
              <TextInput label="العنوان بالعربية" required error={form.errors.titleAr} placeholder="عنوان المقال..." {...form.register("titleAr")} />
              <Group grow>
                <Select label="الفئة" required error={form.errors.category} placeholder="اختر الفئة" data={CATEGORIES} value={form.values.category} onChange={(v) => form.setValue("category", v || "")} />
                <Select label="الحالة" data={[{ value: "draft", label: "مسودة" }, { value: "published", label: "منشور" }]} value={form.values.status} onChange={(v) => form.setValue("status", v || "draft")} />
              </Group>
              <Textarea label="المقتطف" rows={2} placeholder="ملخص قصير..." {...form.register("excerptAr")} />
              <Textarea label="المحتوى" required error={form.errors.contentAr} rows={8} placeholder="اكتب محتوى المقال..." {...form.register("contentAr")} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="en">
            <Stack gap="md">
              <TextInput label="Title (English)" placeholder="Blog title..." {...form.register("titleEn")} />
              <Textarea label="Content (English)" rows={10} placeholder="Blog content..." {...form.register("contentEn")} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="meta">
            <Stack gap="md">
              <TextInput label="صورة الغلاف (رابط)" placeholder="https://..." {...form.register("coverImage")} />
              <Box>
                <Text size="sm" fw={500} mb={6}>الوسوم</Text>
                <PillsInput>
                  <Pill.Group>
                    {tags.map((t) => (
                      <Pill key={t} withRemoveButton onRemove={() => setTags(tags.filter((x) => x !== t))}>
                        <FaTag size={9} style={{ marginLeft: 4, display: "inline" }} />{t}
                      </Pill>
                    ))}
                    <PillsInput.Field
                      value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="أضف وسمًا..."
                    />
                  </Pill.Group>
                </PillsInput>
              </Box>
              <TextInput label="عنوان SEO" placeholder="عنوان محركات البحث..." {...form.register("metaTitle")} />
              <Textarea label="وصف SEO" rows={3} placeholder="وصف محركات البحث..." {...form.register("metaDescription")} />
              <Switch checked={form.values.featured} onChange={(e) => form.setValue("featured", e.currentTarget.checked)} label="مقال مميز" description="يظهر في الصفحة الرئيسية" color="brand" />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </AdminModal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close} onConfirm={handleDelete}
        title="حذف المقال" message={`هل تريد حذف مقال "${confirmDelete.data?.title?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

export default function AdminBlogs() {
  return (
    <MantineProvider theme={mantineTheme}>
      <AdminBlogsInner />
    </MantineProvider>
  );
}

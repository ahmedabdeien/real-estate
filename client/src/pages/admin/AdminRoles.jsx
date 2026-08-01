import { useState, useEffect, useCallback } from "react";
import {
  Box, Group, Stack, Text, Card, Table, Code, Badge, TextInput,
  Checkbox, SimpleGrid, ScrollArea, Button, ActionIcon, Loader, Anchor,
} from "@mantine/core";
import {
  FaPlus, FaTrash, FaPen, FaShieldHalved, FaLock,
  FaGauge, FaBell, FaBuilding, FaHouseChimney, FaChartLine,
  FaUserPlus, FaFileLines, FaSquareCheck, FaScaleBalanced,
  FaWandMagicSparkles, FaImage, FaBriefcase, FaUsers,
  FaGear, FaCircleUser, FaClockRotateLeft,
} from "react-icons/fa6";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import EmptyState from "../../Components/UI/EmptyState";

const ALL_PAGES = [
  { key: "dashboard", label: "لوحة التحكم", Icon: FaGauge },
  { key: "notifications", label: "الإشعارات", Icon: FaBell },
  { key: "projects", label: "المشاريع", Icon: FaBuilding },
  { key: "units", label: "الوحدات", Icon: FaHouseChimney },
  { key: "leads", label: "العملاء", Icon: FaChartLine },
  { key: "client-reg", label: "تسجيل العملاء", Icon: FaUserPlus },
  { key: "blogs", label: "المقالات", Icon: FaFileLines },
  { key: "tasks", label: "المهام", Icon: FaSquareCheck },
  { key: "legal", label: "الشئون القانونية", Icon: FaScaleBalanced },
  { key: "content", label: "المحتوى", Icon: FaWandMagicSparkles },
  { key: "media", label: "المكتبة", Icon: FaImage },
  { key: "careers", label: "الوظائف", Icon: FaBriefcase },
  { key: "users", label: "المستخدمين", Icon: FaUsers },
  { key: "roles", label: "إدارة الأدوار", Icon: FaShieldHalved },
  { key: "activity", label: "سجل النشاط", Icon: FaChartLine },
  { key: "settings", label: "الإعدادات", Icon: FaGear },
  { key: "profile", label: "الملف الشخصي", Icon: FaCircleUser },
  { key: "changelog", label: "التحديثات", Icon: FaClockRotateLeft },
];

const emptyForm = { roleKey: "", label: "", branch: "", allowedPages: [] };

export default function AdminRoles() {
  const toast = useToast();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/roles");
      setRoles(res.data.roles || []);
    } catch { toast.error("فشل تحميل الأدوار"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModal(true); };
  const openEdit = (r) => {
    setEditItem(r);
    setForm({ roleKey: r.roleKey, label: r.label, branch: r.branch || "", allowedPages: r.allowedPages || [] });
    setModal(true);
  };

  const togglePage = (key) => setForm((prev) => ({
    ...prev, allowedPages: prev.allowedPages.includes(key) ? prev.allowedPages.filter((p) => p !== key) : [...prev.allowedPages, key],
  }));
  const selectAll = () => setForm((p) => ({ ...p, allowedPages: ALL_PAGES.map((pg) => pg.key) }));
  const clearAll = () => setForm((p) => ({ ...p, allowedPages: [] }));

  const handleSave = async () => {
    if (!form.label?.trim()) return toast.error("اسم الدور مطلوب");
    if (!editItem && !form.roleKey?.trim()) return toast.error("مفتاح الدور مطلوب");
    setSaving(true);
    try {
      if (editItem) {
        const payload = { label: form.label, branch: form.branch, allowedPages: form.allowedPages };
        if (!editItem.isSystem) payload.roleKey = form.roleKey;
        await api.put(`/roles/${editItem._id}`, payload);
        toast.success("تم تحديث الدور");
      } else {
        await api.post("/roles", form);
        toast.success("تم إضافة الدور");
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteId}`);
      toast.success("تم حذف الدور");
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل الحذف");
    } finally { setDeleting(false); }
  };

  return (
    <Box dir="rtl">
      <PageHeader
        title="إدارة الأدوار والصلاحيات" subtitle={`${roles.length} دور`} icon={<FaShieldHalved size={16} />} loading={loading}
        actions={<PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة دور</PrimaryButton>}
      />

      <Box p="lg">
        <Card withBorder padding={0}>
          {loading ? (
            <Group justify="center" py={64}><Loader color="gray" /></Group>
          ) : roles.length === 0 ? (
            <EmptyState icon={FaShieldHalved} title="لا توجد أدوار" description="أضف أول دور للنظام"
              action={<PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة دور</PrimaryButton>} />
          ) : (
            <ScrollArea>
              <Table verticalSpacing="sm" horizontalSpacing="lg">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>الاسم</Table.Th>
                    <Table.Th>المفتاح</Table.Th>
                    <Table.Th visibleFrom="sm">الفرع</Table.Th>
                    <Table.Th>الصفحات</Table.Th>
                    <Table.Th>النوع</Table.Th>
                    <Table.Th>إجراءات</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {roles.map((r) => (
                    <Table.Tr key={r._id}>
                      <Table.Td>
                        <Group gap={8} wrap="nowrap">
                          <FaShieldHalved size={14} color="var(--mantine-color-brand-6)" />
                          <Text fw={600} size="sm">{r.label}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td><Code>{r.roleKey}</Code></Table.Td>
                      <Table.Td visibleFrom="sm"><Text size="sm" c="dimmed">{r.branch || "—"}</Text></Table.Td>
                      <Table.Td>
                        {r.allowedPages?.includes("*") ? (
                          <Badge variant="light" color="brand">كل الصفحات</Badge>
                        ) : (
                          <Text size="xs" c="dimmed">{r.allowedPages?.length || 0} صفحة</Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {r.isSystem ? (
                          <Badge variant="light" color="yellow" leftSection={<FaLock size={9} />}>أساسي</Badge>
                        ) : (
                          <Badge variant="light" color="green">مخصص</Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={2}>
                          <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(r)}><FaPen size={13} /></ActionIcon>
                          {!r.isSystem && <ActionIcon variant="subtle" color="red" onClick={() => setDeleteId(r._id)}><FaTrash size={13} /></ActionIcon>}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Box>

      <AdminModal
        isOpen={modal} onClose={() => setModal(false)}
        title={editItem ? `تعديل: ${editItem.label}` : "إضافة دور جديد"} size="2xl"
        footer={
          <>
            <Button variant="default" onClick={() => setModal(false)}>إلغاء</Button>
            <PrimaryButton onClick={handleSave} loading={saving}>حفظ</PrimaryButton>
          </>
        }
      >
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Box>
              <TextInput
                label="مفتاح الدور" required value={form.roleKey}
                onChange={(e) => setForm((p) => ({ ...p, roleKey: e.target.value }))}
                disabled={editItem?.isSystem} placeholder="مثال: branch_accounts_cairo"
              />
              {editItem?.isSystem && (
                <Text size="xs" c="yellow.7" mt={4}><FaLock size={10} style={{ display: "inline", marginLeft: 4 }} />لا يمكن تغيير مفتاح الأدوار الأساسية</Text>
              )}
            </Box>
            <TextInput label="الاسم (عربي)" required value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} placeholder="مثال: محاسب فرع بني سويف" />
            <TextInput label="الفرع (اختياري)" value={form.branch} onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))} placeholder="مثال: بني سويف" />
          </SimpleGrid>

          <Box>
            <Group justify="space-between" mb={8}>
              <Text size="sm" fw={600}>الصفحات المسموح بها</Text>
              <Group gap={8}>
                <Anchor size="xs" c="brand.6" onClick={selectAll} style={{ cursor: "pointer" }}>تحديد الكل</Anchor>
                <Text c="gray.4">|</Text>
                <Anchor size="xs" c="red.6" onClick={clearAll} style={{ cursor: "pointer" }}>إلغاء الكل</Anchor>
              </Group>
            </Group>
            <ScrollArea.Autosize mah={260}>
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={8}>
                {ALL_PAGES.map((pg) => {
                  const checked = form.allowedPages.includes(pg.key);
                  return (
                    <Checkbox
                      key={pg.key} checked={checked} onChange={() => togglePage(pg.key)} color="brand"
                      label={
                        <Group gap={6} wrap="nowrap">
                          <pg.Icon size={13} />
                          <Text size="xs" truncate>{pg.label}</Text>
                        </Group>
                      }
                    />
                  );
                })}
              </SimpleGrid>
            </ScrollArea.Autosize>
            <Text size="xs" c="dimmed" mt={8}>{form.allowedPages.length} صفحة محددة</Text>
          </Box>
        </Stack>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting}
        title="حذف الدور" message="هل أنت متأكد من حذف هذا الدور؟ لا يمكن التراجع عن هذا الإجراء."
      />
    </Box>
  );
}

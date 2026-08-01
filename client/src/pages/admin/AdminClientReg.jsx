import { useEffect, useState, useMemo } from "react";
import {
  MantineProvider, Box, Group, Stack, Text, TextInput, Textarea, Select, Button,
  ActionIcon, Card, Table, Badge, Avatar, Chip, Loader,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaPlus, FaMagnifyingGlass, FaUser, FaDownload, FaPen, FaTrash, FaXmark,
} from "react-icons/fa6";
import api from "../../api/axios";
import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import EmptyState from "../../Components/UI/EmptyState";
import ArabicDatePicker from "../../Components/UI/ArabicDatePicker";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import { mantineTheme } from "../../mantineTheme";

const SOURCE_OPTIONS = [
  { value: "walk_in", label: "زيارة مباشرة" },
  { value: "call", label: "مكالمة هاتفية" },
  { value: "social_media", label: "تواصل اجتماعي" },
  { value: "exhibition", label: "معرض عقاري" },
  { value: "admin_registration", label: "تسجيل داخلي" },
  { value: "website", label: "موقع الإنترنت" },
];

const STATUS_LABELS = {
  new: { label: "جديد", color: "blue" },
  contacted: { label: "تم التواصل", color: "yellow" },
  interested: { label: "مهتم", color: "green" },
  not_interested: { label: "غير مهتم", color: "red" },
  converted: { label: "تحوّل لعقد", color: "teal" },
  lost: { label: "خسارة", color: "gray" },
};

const emptyForm = {
  name: "", phone: "", email: "", message: "", notes: "",
  registrationSource: "walk_in", status: "new", interestedProject: "", followUpDate: "",
};

function AdminClientRegInner() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin" || user?.role === "supervisor";

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [leadsRes, projRes] = await Promise.all([
        api.get("/leads", { params: { limit: 100 } }),
        api.get("/projects", { params: { limit: 100 } }),
      ]);
      setLeads(leadsRes.data.leads || []);
      setProjects(projRes.data.projects || []);
    } catch { toast.error("فشل التحميل"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = leads;
    if (statusFilter) list = list.filter((l) => l.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.email?.toLowerCase().includes(q));
    }
    return list;
  }, [leads, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return counts;
  }, [leads]);

  const exportCSV = () => {
    const rows = [
      ["الاسم", "الهاتف", "البريد", "المصدر", "الحالة", "المشروع", "التاريخ"],
      ...filtered.map((l) => [
        l.name || "", l.phone || "", l.email || "",
        SOURCE_OPTIONS.find((s) => s.value === (l.registrationSource || l.source))?.label || "",
        STATUS_LABELS[l.status]?.label || l.status || "",
        l.interestedProject?.name?.ar || "",
        new Date(l.createdAt).toLocaleDateString("ar-EG"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "clients.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setModal(true); };
  const openEdit = (l) => {
    setEditItem(l);
    setForm({
      name: l.name || "", phone: l.phone || "", email: l.email || "",
      message: l.message || "", notes: l.notes || "",
      registrationSource: l.registrationSource || l.source || "walk_in", status: l.status || "new",
      interestedProject: l.interestedProject?._id || "",
      followUpDate: l.followUpDate ? l.followUpDate.substring(0, 10) : "",
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("الاسم مطلوب");
    if (!form.phone.trim()) return toast.error("الهاتف مطلوب");
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.interestedProject) delete payload.interestedProject;
      if (!payload.followUpDate) delete payload.followUpDate;
      if (editItem) {
        await api.put(`/leads/${editItem._id}`, payload);
        toast.success("تم تحديث العميل");
      } else {
        await api.post("/leads", payload);
        toast.success("تم تسجيل العميل");
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
      await api.delete(`/leads/${deleteId}`);
      toast.success("تم الحذف");
      setDeleteId(null);
      load();
    } catch { toast.error("فشل الحذف"); }
    finally { setDeleting(false); }
  };

  return (
    <Box dir="rtl">
      <PageHeader
        title="تسجيل العملاء" subtitle={`${filtered.length} عميل${isAdmin ? " (كل الموظفين)" : ""}`} icon={<FaUser size={16} />} loading={loading}
        actions={
          <>
            <SecondaryButton icon={<FaDownload size={13} />} onClick={exportCSV}>تصدير CSV</SecondaryButton>
            <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>تسجيل عميل جديد</PrimaryButton>
          </>
        }
      />

      <Box p="lg">
        <Stack gap="md">
          <Group gap={8} wrap="wrap">
            <Chip checked={!statusFilter} onChange={() => setStatusFilter("")} variant="filled" color="brand">الكل ({leads.length})</Chip>
            {Object.entries(STATUS_LABELS).map(([key, { label, color }]) =>
              statusCounts[key] ? (
                <Chip key={key} checked={statusFilter === key} onChange={() => setStatusFilter(statusFilter === key ? "" : key)} variant="filled" color={color}>
                  {label} ({statusCounts[key]})
                </Chip>
              ) : null
            )}
          </Group>

          <TextInput
            maw={360}
            leftSection={<FaMagnifyingGlass size={13} />}
            placeholder="بحث بالاسم أو الهاتف..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            rightSection={search ? <ActionIcon variant="transparent" size="xs" onClick={() => setSearch("")}><FaXmark size={11} /></ActionIcon> : null}
          />

          <Card withBorder padding={0} style={{ overflow: "auto" }}>
            {loading ? (
              <Group justify="center" py={64}><Loader color="gray" /></Group>
            ) : filtered.length === 0 ? (
              <EmptyState icon={FaUser} title="لا يوجد عملاء مسجلون" description="ابدأ بتسجيل أول عميل"
                action={<Button color="brand" onClick={openCreate}>تسجيل عميل</Button>} />
            ) : (
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>العميل</Table.Th>
                    <Table.Th>الهاتف</Table.Th>
                    <Table.Th>المصدر</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th>المشروع</Table.Th>
                    {isAdmin && <Table.Th>أضافه</Table.Th>}
                    <Table.Th>التاريخ</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((l) => {
                    const st = STATUS_LABELS[l.status] || STATUS_LABELS.new;
                    return (
                      <Table.Tr key={l._id}>
                        <Table.Td>
                          <Group gap={8} wrap="nowrap">
                            <Avatar size={32} color="brand">{l.name?.[0]?.toUpperCase()}</Avatar>
                            <Box>
                              <Text fw={600} size="sm">{l.name}</Text>
                              {l.email && <Text size="xs" c="dimmed">{l.email}</Text>}
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm" ff="monospace">{l.phone}</Text></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed">{SOURCE_OPTIONS.find((s) => s.value === (l.registrationSource || l.source))?.label || l.source}</Text></Table.Td>
                        <Table.Td><Badge variant="light" color={st.color}>{st.label}</Badge></Table.Td>
                        <Table.Td><Text size="xs" c="dimmed">{l.interestedProject?.name?.ar || "—"}</Text></Table.Td>
                        {isAdmin && (
                          <Table.Td>
                            <Group gap={6} wrap="nowrap">
                              <Avatar size={20} color="gray">{l.createdBy?.name?.[0]?.toUpperCase() || "؟"}</Avatar>
                              <Text size="xs" c="dimmed">{l.createdBy?.name || "موقع"}</Text>
                            </Group>
                          </Table.Td>
                        )}
                        <Table.Td>
                          <Text size="xs" c="dimmed">{new Date(l.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}</Text>
                          <Text size="xs" c="gray.4">{new Date(l.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={2}>
                            <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(l)}><FaPen size={12} /></ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={() => setDeleteId(l._id)}><FaTrash size={12} /></ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Card>
        </Stack>
      </Box>

      <AdminModal
        isOpen={modal} onClose={() => setModal(false)}
        title={editItem ? "تعديل بيانات العميل" : "تسجيل عميل جديد"} size="md"
        footer={
          <>
            <Button variant="default" onClick={() => setModal(false)}>إلغاء</Button>
            <Button color="brand" loading={saving} onClick={handleSave}>{editItem ? "حفظ التعديلات" : "تسجيل العميل"}</Button>
          </>
        }
      >
        <Stack gap="md">
          <Group grow>
            <TextInput label="الاسم الكامل" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="اسم العميل" />
            <TextInput label="رقم الهاتف" required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" />
          </Group>
          <TextInput label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="اختياري" />
          <Group grow>
            <Select label="المصدر" data={SOURCE_OPTIONS} value={form.registrationSource} onChange={(v) => setForm((f) => ({ ...f, registrationSource: v || "walk_in" }))} />
            <Select label="الحالة" data={Object.entries(STATUS_LABELS).map(([value, { label }]) => ({ value, label }))} value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v || "new" }))} />
          </Group>
          <Select
            label="المشروع المهتم به" placeholder="-- اختر مشروع --" clearable
            data={projects.map((p) => ({ value: p._id, label: p.name?.ar }))}
            value={form.interestedProject} onChange={(v) => setForm((f) => ({ ...f, interestedProject: v || "" }))}
          />
          <ArabicDatePicker label="تاريخ المتابعة" value={form.followUpDate} onChange={(v) => setForm((f) => ({ ...f, followUpDate: v }))} placeholder="اختر تاريخ المتابعة" />
          <Textarea label="ملاحظات" rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات إضافية..." />
        </Stack>
      </AdminModal>

      <ConfirmDialog
        isOpen={!!deleteId} onConfirm={handleDelete} onClose={() => setDeleteId(null)} loading={deleting}
        title="حذف العميل" message="هل أنت متأكد من حذف هذا العميل؟"
      />
    </Box>
  );
}

export default function AdminClientReg() {
  return (
    <MantineProvider theme={mantineTheme}>
      <AdminClientRegInner />
    </MantineProvider>
  );
}

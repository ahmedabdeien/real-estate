/**
 * AdminLeads.jsx — إدارة العملاء المحتملين (Leads)
 * TanStack Query + TanStack Table v8 + Zod validation (Mantine)
 */
import { useState, useMemo } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  MantineProvider, Box, Group, Stack, Text, Title, Card, SimpleGrid, ThemeIcon,
  Button, TextInput, Select, Textarea, ActionIcon, Menu, Badge, Modal,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaPlus, FaMagnifyingGlass, FaTrash, FaPen, FaUserTie, FaPhone, FaEnvelope,
  FaMoneyBill, FaTag, FaUsers, FaCircleCheck, FaCircleXmark, FaHandshake,
  FaArrowsRotate, FaStar, FaEllipsisVertical,
} from "react-icons/fa6";

import DataTable, { checkboxColumn } from "../../Components/UI/DataTable";
import { useLeads, useCreateLead, useUpdateLead, usePatchLead, useDeleteLead } from "../../hooks/queries/useLeads";
import { leadSchema, parseSchema } from "../../schemas/index";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { mantineTheme } from "../../mantineTheme";

const STATUSES = ["جديد", "تم التواصل", "مهتم", "غير مهتم", "تم البيع", "متابعة"];
const STATUS_COLOR = {
  "جديد": "yellow", "تم التواصل": "blue", "مهتم": "green", "غير مهتم": "red", "تم البيع": "grape", "متابعة": "orange",
};
const STATUS_ICONS = {
  "جديد": FaStar, "تم التواصل": FaPhone, "مهتم": FaCircleCheck, "غير مهتم": FaCircleXmark, "تم البيع": FaHandshake, "متابعة": FaArrowsRotate,
};

const EMPTY_FORM = { name: "", phone: "", email: "", status: "جديد", source: "", budget: "", notes: "" };

function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || FaStar;
  return <Badge variant="light" color={STATUS_COLOR[status] || "gray"} leftSection={<Icon size={10} />}>{status}</Badge>;
}

function InlineStatusCell({ lead }) {
  const patch = usePatchLead();
  return (
    <Menu shadow="md" width={150} position="bottom-start">
      <Menu.Target>
        <Box style={{ cursor: "pointer", display: "inline-block" }}><StatusBadge status={lead.status} /></Box>
      </Menu.Target>
      <Menu.Dropdown dir="rtl">
        {STATUSES.map((s) => (
          <Menu.Item key={s} fw={lead.status === s ? 700 : 400} onClick={() => patch.mutate({ id: lead._id, data: { status: s } })}>
            <StatusBadge status={s} />
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

function LeadModal({ lead, onClose }) {
  const isEdit = !!lead;
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [form, setForm] = useState(
    isEdit
      ? { name: lead.name || "", phone: lead.phone || "", email: lead.email || "", status: lead.status || "جديد", source: lead.source || "", budget: lead.budget || "", notes: lead.notes || "" }
      : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    const result = parseSchema(leadSchema, form);
    if (!result.ok) { setErrors(result.errors); return; }
    setErrors({});
    if (isEdit) updateLead.mutate({ id: lead._id, data: result.data }, { onSuccess: onClose });
    else createLead.mutate(result.data, { onSuccess: onClose });
  };

  const isPending = createLead.isPending || updateLead.isPending;

  return (
    <Modal opened onClose={onClose} title={isEdit ? "تعديل العميل المحتمل" : "إضافة عميل محتمل"} size="lg" dir="rtl">
      <Stack gap="md">
        <SimpleGrid cols={2}>
          <TextInput label="الاسم" required leftSection={<FaUserTie size={12} />} value={form.name} onChange={set("name")} placeholder="اسم العميل" error={errors.name} />
          <TextInput label="الهاتف" required leftSection={<FaPhone size={12} />} value={form.phone} onChange={set("phone")} placeholder="05xxxxxxxx" dir="ltr" error={errors.phone} />
        </SimpleGrid>
        <SimpleGrid cols={2}>
          <TextInput label="البريد الإلكتروني" leftSection={<FaEnvelope size={12} />} value={form.email} onChange={set("email")} placeholder="example@email.com" dir="ltr" error={errors.email} />
          <TextInput label="المصدر" leftSection={<FaTag size={12} />} value={form.source} onChange={set("source")} placeholder="إعلان، توصية، موقع..." />
        </SimpleGrid>
        <SimpleGrid cols={2}>
          <Select label="الحالة" data={STATUSES} value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v || "جديد" }))} />
          <TextInput label="الميزانية" leftSection={<FaMoneyBill size={12} />} value={form.budget} onChange={set("budget")} placeholder="مثال: 500,000 ريال" />
        </SimpleGrid>
        <Textarea label="ملاحظات" rows={3} value={form.notes} onChange={set("notes")} placeholder="أي ملاحظات إضافية..." />
        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose}>إلغاء</Button>
          <Button color="brand" loading={isPending} onClick={handleSave}>{isEdit ? "حفظ التعديلات" : "إضافة العميل"}</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

function StatsBar({ leads = [] }) {
  const counts = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => (map[s] = 0));
    leads.forEach((l) => { if (map[l.status] !== undefined) map[l.status]++; });
    return map;
  }, [leads]);

  const items = [
    { label: "إجمالي", value: leads.length, color: "brand", icon: FaUsers },
    { label: "جديد", value: counts["جديد"], color: "yellow", icon: FaStar },
    { label: "مهتم", value: counts["مهتم"], color: "green", icon: FaCircleCheck },
    { label: "تم البيع", value: counts["تم البيع"], color: "grape", icon: FaHandshake },
    { label: "غير مهتم", value: counts["غير مهتم"], color: "red", icon: FaCircleXmark },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }} spacing="sm" mb="lg">
      {items.map(({ label, value, color, icon: Icon }) => (
        <Card key={label} withBorder padding="sm">
          <Group gap={10} wrap="nowrap">
            <ThemeIcon variant="light" color={color} size={38}><Icon size={16} /></ThemeIcon>
            <Box>
              <Text fz={20} fw={700} lh={1}>{value}</Text>
              <Text fz={11} c="dimmed" mt={2}>{label}</Text>
            </Box>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}

function ActionsCell({ lead, onEdit, onDelete }) {
  return (
    <Menu shadow="md" width={130} position="bottom-end">
      <Menu.Target><ActionIcon variant="subtle" color="gray"><FaEllipsisVertical size={13} /></ActionIcon></Menu.Target>
      <Menu.Dropdown dir="rtl">
        <Menu.Item leftSection={<FaPen size={12} />} onClick={() => onEdit(lead)}>تعديل</Menu.Item>
        <Menu.Item color="red" leftSection={<FaTrash size={12} />} onClick={() => onDelete(lead)}>حذف</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const col = createColumnHelper();

function AdminLeadsInner() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selected, setSelected] = useState([]);

  const deleteLead = useDeleteLead();

  const { data, isLoading } = useLeads({
    page: page + 1, limit: pageSize, search: search || undefined, status: statusFilter || undefined,
  });

  const leads = data?.leads ?? [];
  const total = data?.total ?? 0;

  const applySearch = () => { setSearch(searchInput); setPage(0); };
  const openAdd = () => { setEditLead(null); setModalOpen(true); };
  const openEdit = (lead) => { setEditLead(lead); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditLead(null); };
  const handleDeleteSingle = (lead) => setConfirmDelete([lead]);
  const handleDeleteBulk = () => setConfirmDelete(selected);

  const executeDelete = async () => {
    if (!confirmDelete?.length) return;
    for (const lead of confirmDelete) await deleteLead.mutateAsync(lead._id);
    setSelected([]);
    setConfirmDelete(null);
  };

  const columns = useMemo(
    () => [
      checkboxColumn(),
      col.accessor("name", { header: "اسم العميل", cell: ({ row }) => <Text fw={600} size="sm">{row.original.name}</Text> }),
      col.accessor("phone", { header: "الهاتف", cell: ({ getValue }) => <Text dir="ltr" size="sm" c="dimmed">{getValue()}</Text> }),
      col.accessor("status", { header: "الحالة", cell: ({ row }) => <InlineStatusCell lead={row.original} /> }),
      col.accessor("source", { header: "المصدر", cell: ({ getValue }) => <Text size="sm" c="dimmed">{getValue() || "—"}</Text> }),
      col.accessor("budget", { header: "الميزانية", cell: ({ getValue }) => <Text size="sm" fw={500}>{getValue() || "—"}</Text> }),
      col.accessor("createdAt", { header: "التاريخ", cell: ({ getValue }) => { const v = getValue(); return v ? new Date(v).toLocaleDateString("ar-EG") : "—"; } }),
      col.display({ id: "actions", header: "إجراءات", cell: ({ row }) => <ActionsCell lead={row.original} onEdit={openEdit} onDelete={handleDeleteSingle} /> }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box dir="rtl">
      <Group justify="space-between" mb="lg" wrap="wrap">
        <Box>
          <Title order={2} size="h3">إدارة العملاء المحتملين</Title>
          <Text size="sm" c="dimmed" mt={2}>إجمالي {total} عميل محتمل</Text>
        </Box>
        <Button color="brand" leftSection={<FaPlus size={13} />} onClick={openAdd}>إضافة عميل محتمل</Button>
      </Group>

      <StatsBar leads={leads} />

      <Group justify="space-between" mb="md" wrap="wrap">
        <Group gap={8} wrap="wrap" style={{ flex: 1 }}>
          <TextInput
            style={{ minWidth: 220, maxWidth: 320, flex: 1 }}
            leftSection={<FaMagnifyingGlass size={13} />}
            placeholder="بحث بالاسم أو الهاتف..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            onBlur={applySearch}
          />
          <Select
            w={160} placeholder="جميع الحالات" clearable data={STATUSES}
            value={statusFilter} onChange={(v) => { setStatusFilter(v || ""); setPage(0); }}
          />
        </Group>
        {selected.length > 0 && (
          <Button color="red" leftSection={<FaTrash size={12} />} onClick={handleDeleteBulk}>حذف المحدد ({selected.length})</Button>
        )}
      </Group>

      <Card withBorder padding={0}>
        <DataTable
          data={leads} columns={columns} loading={isLoading} totalCount={total}
          pageIndex={page} pageSize={pageSize}
          onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(0); }}
          enableRowSelection onSelectionChange={setSelected}
          emptyMessage="لا يوجد عملاء محتملون" searchPlaceholder="بحث..."
        />
      </Card>

      {modalOpen && <LeadModal lead={editLead} onClose={closeModal} />}

      <ConfirmDialog
        isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={executeDelete}
        title="تأكيد الحذف" message={`هل تريد حذف ${confirmDelete?.length ?? 0} عميل محتمل؟ لا يمكن التراجع عن هذا الإجراء.`}
        loading={deleteLead.isPending}
      />
    </Box>
  );
}

export default function AdminLeads() {
  return (
    <MantineProvider theme={mantineTheme}>
      <AdminLeadsInner />
    </MantineProvider>
  );
}

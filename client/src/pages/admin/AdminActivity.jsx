/**
 * AdminActivity — TanStack Query + Mantine
 */
import { useMemo, useState } from "react";
import {
  Box, Group, Stack, Text, ThemeIcon, Chip, TextInput, ActionIcon,
  Card, Avatar, Loader, Pagination, Alert,
} from "@mantine/core";
import {
  FaClockRotateLeft, FaPlus, FaPen, FaTrash, FaArrowRightToBracket,
  FaArrowsRotate, FaDownload, FaPrint, FaMagnifyingGlass, FaXmark,
} from "react-icons/fa6";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import PageHeader, { SecondaryButton, DangerButton } from "../../Components/UI/PageHeader";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useTableState } from "../../hooks/useTableState";
import { useToast } from "../../context/ToastContext";
import apiClient from "../../api/axios";
import { t } from "../../lib/t";

const ACTION_META = {
  create: { label: "أضاف", icon: FaPlus, color: "teal" },
  update: { label: "عدّل", icon: FaPen, color: "blue" },
  delete: { label: "حذف", icon: FaTrash, color: "red" },
  login: { label: "دخل", icon: FaArrowRightToBracket, color: "grape" },
  logout: { label: "خرج", icon: FaArrowRightToBracket, color: "gray" },
};

const ENTITY_AR = {
  project: "مشروع", unit: "وحدة", lead: "عميل", blog: "مقال",
  career: "وظيفة", media: "صورة", user: "مستخدم", auth: "نظام",
  accounting: "حسابات", task: "مهمة", content: "محتوى", setting: "إعداد",
  notification: "إشعار", accounting_record: "سجل محاسبي",
};

const ACTION_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "create", label: "أضاف" },
  { key: "update", label: "عدّل" },
  { key: "delete", label: "حذف" },
  { key: "login", label: "دخل" },
];

const ACT_KEY = "activity";

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return new Date(date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

export default function AdminActivity() {
  const toast = useToast();
  const qc = useQueryClient();

  const [actionFilter, setActionFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const table = useTableState({ defaultPageSize: 30 });
  const confirmClear = useDisclosure();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [ACT_KEY, table.queryParams],
    queryFn: () => apiClient.get("/activity", { params: { page: table.queryParams.page, limit: 30 } }).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const activities = data?.activities ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  const deleteOneMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/activity/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [ACT_KEY] });
      const prev = qc.getQueriesData({ queryKey: [ACT_KEY] });
      qc.setQueriesData({ queryKey: [ACT_KEY] }, (old) => {
        if (!old?.activities) return old;
        return { ...old, activities: old.activities.filter((a) => a._id !== id), total: (old.total || 0) - 1 };
      });
      return { prev };
    },
    onError: (_, __, ctx) => ctx?.prev?.forEach(([k, v]) => qc.setQueryData(k, v)),
    onSettled: () => qc.invalidateQueries({ queryKey: [ACT_KEY] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => apiClient.delete("/activity/all"),
    onSuccess: () => {
      qc.setQueriesData({ queryKey: [ACT_KEY] }, (old) => ({ ...old, activities: [], total: 0 }));
      toast.success("تم مسح سجل النشاط");
      confirmClear.close();
    },
    onError: () => toast.error("فشل مسح السجل"),
  });

  const filtered = useMemo(() => {
    let list = activities;
    if (actionFilter !== "all") list = list.filter((a) => a.action === actionFilter);
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter((a) => (a.user?.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [activities, actionFilter, userSearch]);

  const exportCSV = () => {
    const rows = [
      ["المستخدم", "الإجراء", "الكيان", "التفاصيل", "التاريخ"],
      ...activities.map((a) => [a.user?.name || "—", a.action, a.entity || "—", a.details || "—", new Date(a.createdAt).toLocaleString("ar-EG")]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "activity_log.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <Box dir="rtl">
      <PageHeader
        title="سجل النشاط" subtitle={`${total} حدث مسجّل`} icon={<FaClockRotateLeft size={16} />} loading={isFetching && !isLoading}
        actions={
          <>
            <SecondaryButton icon={<FaDownload size={13} />} onClick={exportCSV}>تصدير CSV</SecondaryButton>
            <SecondaryButton icon={<FaPrint size={13} />} onClick={() => window.print()}>طباعة</SecondaryButton>
            <SecondaryButton icon={<FaArrowsRotate size={13} />} onClick={refetch}>تحديث</SecondaryButton>
            <DangerButton icon={<FaTrash size={13} />} onClick={confirmClear.open} disabled={total === 0}>مسح الكل</DangerButton>
          </>
        }
      />

      <Box bg="white" px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="sm" wrap="wrap">
          <Chip.Group value={actionFilter} onChange={(v) => { setActionFilter(v); table.resetPage(); }}>
            <Group gap={6}>
              {ACTION_FILTERS.map(({ key, label }) => {
                const count = key !== "all" ? activities.filter((a) => a.action === key).length : null;
                return (
                  <Chip key={key} value={key} size="xs" variant="filled" color="brand">
                    {label}{count > 0 ? ` (${count})` : ""}
                  </Chip>
                );
              })}
            </Group>
          </Chip.Group>
          <TextInput
            style={{ flex: 1, minWidth: 180, maxWidth: 320 }}
            leftSection={<FaMagnifyingGlass size={12} />}
            placeholder="بحث باسم المستخدم..."
            value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
            rightSection={userSearch ? <ActionIcon variant="transparent" size="xs" onClick={() => setUserSearch("")}><FaXmark size={11} /></ActionIcon> : null}
          />
        </Group>
      </Box>

      <Box p="lg">
        <Stack gap="md">
          <Alert icon={<FaClockRotateLeft size={13} />} color="yellow" variant="light">
            السجل يُحذف تلقائياً بعد ٧ أيام من تاريخ الحدث
          </Alert>

          <Card withBorder padding={0}>
            {isLoading ? (
              <Group justify="center" py={64}><Loader color="gray" /></Group>
            ) : filtered.length === 0 ? (
              <Stack align="center" py={64} gap="sm">
                <FaClockRotateLeft size={40} color="var(--mantine-color-gray-3)" />
                <Text c="dimmed" size="sm">لا يوجد نشاط</Text>
              </Stack>
            ) : (
              <Stack gap={0}>
                {filtered.map((act, i) => {
                  const meta = ACTION_META[act.action] || ACTION_META.update;
                  const entityName = typeof act.entityName === "object" ? t(act.entityName) : act.entityName;
                  return (
                    <Group key={act._id} wrap="nowrap" align="flex-start" px="lg" py="md" style={{ borderTop: i ? "1px solid var(--mantine-color-gray-0)" : undefined }}>
                      <ThemeIcon size={36} variant="light" color={meta.color} style={{ flexShrink: 0 }}>
                        <meta.icon size={15} />
                      </ThemeIcon>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="sm">
                          <Text component="span" fw={700}>{act.user?.name || "مجهول"}</Text>{" "}
                          <Text component="span" c="dimmed">{meta.label}</Text>{" "}
                          {entityName && <Text component="span" fw={600} c="brand.6">«{entityName}»</Text>}
                          {act.entity && ENTITY_AR[act.entity] && <Text component="span" c="dimmed"> ({ENTITY_AR[act.entity]})</Text>}
                        </Text>
                        {act.details && <Text size="xs" c="dimmed" mt={2} truncate>{t(act.details, "ar", "")}</Text>}
                      </Box>
                      <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
                        <Avatar size={28} color="brand">{(act.user?.name || "?")[0].toUpperCase()}</Avatar>
                        <Text size="xs" c="dimmed">{timeAgo(act.createdAt)}</Text>
                        <ActionIcon variant="subtle" color="gray" size="sm" disabled={deleteOneMutation.isPending} onClick={() => deleteOneMutation.mutate(act._id)}>
                          <FaXmark size={11} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            )}
          </Card>

          {total > 30 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">صفحة {table.queryParams.page} من {pages}</Text>
              <Pagination size="sm" total={pages} value={table.queryParams.page} onChange={table.handlePageChange} />
            </Group>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        isOpen={confirmClear.isOpen} onClose={confirmClear.close} onConfirm={() => clearAllMutation.mutate()}
        title="مسح سجل النشاط" message="هل تريد مسح جميع سجلات النشاط؟ لا يمكن التراجع."
        confirmLabel="مسح الكل" variant="danger" loading={clearAllMutation.isPending}
      />
    </Box>
  );
}

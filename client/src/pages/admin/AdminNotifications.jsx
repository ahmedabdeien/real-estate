/**
 * AdminNotifications — TanStack Query + Mantine
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Group, Stack, Text, ThemeIcon, Chip, ActionIcon, Card, Loader, Pagination, Indicator,
} from "@mantine/core";
import {
  FaBell, FaBriefcase, FaCheck, FaCheckDouble, FaListCheck,
  FaClipboardList, FaArrowsRotate, FaTrash, FaUsers, FaXmark,
} from "react-icons/fa6";

import { useNotifications, useMarkAllRead, useMarkOneRead } from "../../hooks/queries/useNotifications";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { NOTIF_KEY } from "../../hooks/queries/useNotifications";
import { notificationsApi } from "../../lib/api";
import PageHeader, { PrimaryButton, SecondaryButton, DangerButton } from "../../Components/UI/PageHeader";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import { useDisclosure } from "../../hooks/useDisclosure";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 20;

const FILTERS = [
  { value: "all", label: "الكل" },
  { value: "unread", label: "غير المقروءة" },
  { value: "new_lead", label: "عملاء جدد" },
  { value: "new_job_application", label: "وظائف" },
  { value: "task_assigned", label: "مهام مسندة" },
  { value: "task_updated", label: "مهام محدثة" },
];

const TYPE_META = {
  new_lead: { icon: FaUsers, color: "blue" },
  new_job_application: { icon: FaBriefcase, color: "yellow" },
  task_assigned: { icon: FaClipboardList, color: "grape" },
  task_updated: { icon: FaListCheck, color: "green" },
  default: { icon: FaBell, color: "gray" },
};

const formatDate = (d) => {
  try { return new Date(d).toLocaleString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
};

export default function AdminNotifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const confirmClear = useDisclosure();

  const { data, isLoading, refetch, isFetching } = useNotifications();
  const items = data?.notifications ?? [];

  const markAllMutation = useMarkAllRead();
  const markOneMutation = useMarkOneRead();

  const deleteOneMutation = useMutation({
    mutationFn: (id) => notificationsApi.markOne(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [NOTIF_KEY] });
      const prev = qc.getQueryData([NOTIF_KEY, {}]);
      qc.setQueriesData({ queryKey: [NOTIF_KEY] }, (old) => {
        if (!old?.notifications) return old;
        return { ...old, notifications: old.notifications.filter((n) => n._id !== id) };
      });
      return { prev };
    },
    onError: (_, __, ctx) => ctx?.prev && qc.setQueryData([NOTIF_KEY, {}], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.setQueriesData({ queryKey: [NOTIF_KEY] }, (old) => {
        if (!old?.notifications) return old;
        return { ...old, notifications: old.notifications.map((n) => ({ ...n, read: true })) };
      });
      toast.success("تم تحديد الكل كمقروء");
      confirmClear.close();
    },
    onError: () => toast.error("فشل مسح الإشعارات"),
  });

  const unreadCount = items.filter((n) => !n.read).length;

  const typeCounts = useMemo(() => {
    const c = {};
    items.forEach((n) => { c[n.type] = (c[n.type] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((n) => !n.read);
    return items.filter((n) => n.type === filter);
  }, [items, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (v) => { setFilter(v); setPage(1); };
  const handleClick = async (n) => {
    if (!n.read) markOneMutation.mutate(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <Box dir="rtl">
      <PageHeader
        title="الإشعارات" subtitle={`${items.length} إشعار · ${unreadCount} غير مقروء`} icon={<FaBell size={16} />} loading={isFetching && !isLoading}
        actions={
          <>
            <SecondaryButton icon={<FaArrowsRotate size={13} />} onClick={() => refetch()}>تحديث</SecondaryButton>
            <PrimaryButton icon={<FaCheckDouble size={13} />} onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending} disabled={unreadCount === 0}>
              تحديد الكل كمقروء
            </PrimaryButton>
            <DangerButton icon={<FaTrash size={13} />} onClick={confirmClear.open} disabled={items.length === 0}>مسح الكل</DangerButton>
          </>
        }
      />

      <Box p="lg">
        <Stack gap="lg">
          <Chip.Group value={filter} onChange={handleFilterChange}>
            <Group gap={8}>
              {FILTERS.map((ft) => {
                const count = ft.value === "all" ? items.length : ft.value === "unread" ? unreadCount : (typeCounts[ft.value] || 0);
                return <Chip key={ft.value} value={ft.value} variant="filled" color="brand">{ft.label}{count > 0 ? ` (${count})` : ""}</Chip>;
              })}
            </Group>
          </Chip.Group>

          <Card withBorder padding={0}>
            {isLoading ? (
              <Group justify="center" py={64}><Loader color="gray" /></Group>
            ) : pageItems.length === 0 ? (
              <Stack align="center" py={64} gap="sm">
                <FaBell size={40} color="var(--mantine-color-gray-3)" />
                <Text c="dimmed" size="sm">لا توجد إشعارات في هذا القسم</Text>
              </Stack>
            ) : (
              <Stack gap={0}>
                {pageItems.map((n, i) => {
                  const meta = TYPE_META[n.type] || TYPE_META.default;
                  return (
                    <Group
                      key={n._id} wrap="nowrap" align="flex-start" px="lg" py="md"
                      bg={!n.read ? "brand.0" : undefined}
                      style={{ borderTop: i ? "1px solid var(--mantine-color-gray-0)" : undefined, cursor: n.link ? "pointer" : "default" }}
                      onClick={() => handleClick(n)}
                    >
                      <Indicator disabled={n.read} color="brand" size={8} offset={4}>
                        <ThemeIcon size={38} variant={n.read ? "light" : "filled"} color={n.read ? meta.color : "brand"} radius="xl">
                          <meta.icon size={15} />
                        </ThemeIcon>
                      </Indicator>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group justify="space-between" wrap="nowrap" gap={8}>
                          <Text fw={600} size="sm">{typeof n.title === "object" ? (n.title?.ar ?? n.title?.en ?? "—") : (n.title ?? "—")}</Text>
                          <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{formatDate(n.createdAt)}</Text>
                        </Group>
                        {n.body && <Text size="sm" c="dimmed" mt={2}>{typeof n.body === "object" ? (n.body?.ar ?? n.body?.en ?? "") : n.body}</Text>}
                        {n.link && <Text size="xs" fw={600} c="brand.6" mt={4}>اضغط للفتح ←</Text>}
                      </Box>
                      <Group gap={2} wrap="nowrap" style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                        {!n.read && (
                          <ActionIcon variant="subtle" color="green" onClick={() => markOneMutation.mutate(n._id)} title="تحديد كمقروء">
                            <FaCheck size={13} />
                          </ActionIcon>
                        )}
                        <ActionIcon variant="subtle" color="red" onClick={() => deleteOneMutation.mutate(n._id)} title="حذف الإشعار">
                          <FaXmark size={13} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  );
                })}
              </Stack>
            )}
          </Card>

          {filtered.length > PAGE_SIZE && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">عرض {pageItems.length} من {filtered.length}</Text>
              <Pagination size="sm" total={pages} value={page} onChange={setPage} />
            </Group>
          )}
        </Stack>
      </Box>

      <ConfirmDialog
        isOpen={confirmClear.isOpen} onClose={confirmClear.close} onConfirm={() => clearAllMutation.mutate()}
        title="مسح جميع الإشعارات" message="هل تريد تحديد جميع الإشعارات كمقروءة؟" confirmLabel="تأكيد" variant="warning"
        loading={clearAllMutation.isPending}
      />
    </Box>
  );
}

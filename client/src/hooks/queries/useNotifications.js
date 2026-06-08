import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../lib/api";

export const NOTIF_KEY = "notifications";

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: [NOTIF_KEY, params],
    queryFn:  () => notificationsApi.list(params),
    select: (d) => ({ notifications: d?.notifications ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [NOTIF_KEY, "unread-count"],
    queryFn:  notificationsApi.unreadCount,
    refetchInterval: 60_000,
    select: (d) => d?.count ?? 0,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.setQueriesData({ queryKey: [NOTIF_KEY] }, (old) => {
        if (!old?.notifications) return old;
        return { ...old, notifications: old.notifications.map((n) => ({ ...n, read: true })) };
      });
      qc.setQueryData([NOTIF_KEY, "unread-count"], { count: 0 });
    },
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markOne,
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  });
}

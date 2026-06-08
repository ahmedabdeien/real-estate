import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { tasksApi } from "../../lib/api";

export const TASKS_KEY = "tasks";

export function useTasks(params = {}) {
  return useQuery({
    queryKey: [TASKS_KEY, params],
    queryFn:  () => tasksApi.list(params),
    placeholderData: keepPreviousData,
    select: (d) => ({ tasks: d?.tasks ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useTask(id) {
  return useQuery({
    queryKey: [TASKS_KEY, id],
    queryFn:  () => tasksApi.one(id),
    enabled:  !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: [TASKS_KEY] });
      const prev = qc.getQueriesData({ queryKey: [TASKS_KEY] });
      qc.setQueriesData({ queryKey: [TASKS_KEY] }, (old) => {
        if (!old?.tasks) return old;
        return { ...old, tasks: old.tasks.map((t) => t._id === id ? { ...t, ...data } : t) };
      });
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [TASKS_KEY] }),
  });
}

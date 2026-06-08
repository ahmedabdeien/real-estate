import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { unitsApi } from "../../lib/api";

export const UNITS_KEY = "units";

export function useUnits(params = {}) {
  return useQuery({
    queryKey: [UNITS_KEY, params],
    queryFn:  () => unitsApi.list(params),
    placeholderData: keepPreviousData,
    select: (d) => ({ units: d?.units ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useUnit(id) {
  return useQuery({
    queryKey: [UNITS_KEY, id],
    queryFn:  () => unitsApi.one(id),
    enabled:  !!id,
  });
}

export function useCreateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unitsApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [UNITS_KEY] }),
  });
}

export function useUpdateUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => unitsApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [UNITS_KEY] }),
  });
}

export function usePatchUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => unitsApi.patch(id, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: [UNITS_KEY] });
      const snapshots = qc.getQueriesData({ queryKey: [UNITS_KEY] });
      qc.setQueriesData({ queryKey: [UNITS_KEY] }, (old) => {
        if (!old?.units) return old;
        return { ...old, units: old.units.map((u) => u._id === id ? { ...u, ...data } : u) };
      });
      return { snapshots };
    },
    onError: (_, __, ctx) => {
      ctx?.snapshots?.forEach(([key, val]) => qc.setQueryData(key, val));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [UNITS_KEY] }),
  });
}

export function useDeleteUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unitsApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [UNITS_KEY] }),
  });
}

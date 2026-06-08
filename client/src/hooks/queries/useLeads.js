import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { leadsApi } from "../../lib/api";

export const LEADS_KEY = "leads";

// ── List ──────────────────────────────────────────────────────────
export function useLeads(params = {}) {
  return useQuery({
    queryKey: [LEADS_KEY, params],
    queryFn: () => leadsApi.list(params),
    placeholderData: keepPreviousData,
    select: (data) => ({
      leads: data?.leads ?? data ?? [],
      total: data?.total ?? 0,
      pages: data?.pages ?? 1,
    }),
  });
}

// ── Single ────────────────────────────────────────────────────────
export function useLead(id) {
  return useQuery({
    queryKey: [LEADS_KEY, id],
    queryFn: () => leadsApi.one(id),
    enabled: !!id,
  });
}

// ── Create ────────────────────────────────────────────────────────
export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  });
}

// ── Update ────────────────────────────────────────────────────────
export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      qc.invalidateQueries({ queryKey: [LEADS_KEY, id] });
    },
  });
}

// ── Patch (status update etc.) ────────────────────────────────────
export function usePatchLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => leadsApi.patch(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await qc.cancelQueries({ queryKey: [LEADS_KEY] });
      const prev = qc.getQueriesData({ queryKey: [LEADS_KEY] });
      qc.setQueriesData({ queryKey: [LEADS_KEY] }, (old) => {
        if (!old?.leads) return old;
        return {
          ...old,
          leads: old.leads.map((l) => l._id === id ? { ...l, ...data } : l),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueriesData({ queryKey: [LEADS_KEY] }, ctx.prev[0]?.[1]);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  });
}

// ── Delete ────────────────────────────────────────────────────────
export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEADS_KEY] }),
  });
}

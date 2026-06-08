import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { careersApi } from "../../lib/api";

export const CAREERS_KEY = "careers";

export function useCareers(params = {}) {
  return useQuery({
    queryKey: [CAREERS_KEY, params],
    queryFn:  () => careersApi.list(params),
    placeholderData: keepPreviousData,
    select: (d) => ({ careers: d?.careers ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useCareer(id) {
  return useQuery({
    queryKey: [CAREERS_KEY, id],
    queryFn:  () => careersApi.one(id),
    enabled:  !!id,
  });
}

export function useCreateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: careersApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CAREERS_KEY] }),
  });
}

export function useUpdateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => careersApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CAREERS_KEY] }),
  });
}

export function useDeleteCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: careersApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [CAREERS_KEY] }),
  });
}

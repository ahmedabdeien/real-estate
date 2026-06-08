import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { projectsApi } from "../../lib/api";

export const PROJECTS_KEY = "projects";

export function useProjects(params = {}) {
  return useQuery({
    queryKey: [PROJECTS_KEY, params],
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
    select: (d) => ({ projects: d?.projects ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: [PROJECTS_KEY, id],
    queryFn: () => projectsApi.one(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROJECTS_KEY] }),
  });
}

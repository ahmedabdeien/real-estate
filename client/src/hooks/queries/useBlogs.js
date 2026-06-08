import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { blogsApi } from "../../lib/api";

export const BLOGS_KEY = "blogs";

export function useBlogs(params = {}) {
  return useQuery({
    queryKey: [BLOGS_KEY, params],
    queryFn:  () => blogsApi.list(params),
    placeholderData: keepPreviousData,
    select: (d) => ({ blogs: d?.blogs ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useBlog(id) {
  return useQuery({
    queryKey: [BLOGS_KEY, id],
    queryFn:  () => blogsApi.one(id),
    enabled:  !!id,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blogsApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

export function useUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => blogsApi.update(id, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: blogsApi.remove,
    onSuccess:  () => qc.invalidateQueries({ queryKey: [BLOGS_KEY] }),
  });
}

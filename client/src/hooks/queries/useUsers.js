import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../lib/api";

export const USERS_KEY = "users";

export function useUsers(params = {}) {
  return useQuery({
    queryKey: [USERS_KEY, params],
    queryFn: () => usersApi.list(params),
    select: (d) => ({ users: d?.users ?? d ?? [], total: d?.total ?? 0 }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.changePassword(id, data),
  });
}

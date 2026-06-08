import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../../lib/api";

export const SETTINGS_KEY = "settings";

export function useSettingsQuery() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn:  settingsApi.get,
    staleTime: 1000 * 60 * 5,
    select: (d) => d?.settings ?? d ?? {},
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates) => settingsApi.save(updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  });
}

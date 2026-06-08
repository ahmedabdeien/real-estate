import { useQuery } from "@tanstack/react-query";
import { dashboardApi, leadsApi, tasksApi } from "../../lib/api";

export const DASHBOARD_KEY = "dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "stats"],
    queryFn: dashboardApi.stats,
    staleTime: 1000 * 60 * 2,  // 2 min
  });
}

export function useRecentLeads() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "recent-leads"],
    queryFn: () => leadsApi.list({ limit: 6, sort: "-createdAt" }),
    select: (d) => d?.leads ?? [],
  });
}

export function usePendingTasks() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "pending-tasks"],
    queryFn: () => tasksApi.list({ status: "pending", limit: 5 }),
    select: (d) => d?.tasks ?? [],
  });
}

export function useLeadsChartData() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "leads-chart"],
    queryFn: () => leadsApi.list({ limit: 300, sort: "-createdAt" }),
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const leads = data?.leads ?? [];
      // Group by month (last 7 months)
      const monthMap = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("ar-EG", { month: "short" });
        monthMap[key] = { label, count: 0 };
      }
      leads.forEach((lead) => {
        const d = new Date(lead.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (monthMap[key]) monthMap[key].count++;
      });
      return Object.values(monthMap);
    },
  });
}

export function useLeadsStatusData() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, "leads-status"],
    queryFn: () => leadsApi.list({ limit: 300 }),
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const leads = data?.leads ?? [];
      const statusMap = {};
      leads.forEach((l) => {
        const s = l.status || "جديد";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const colors = {
        "جديد": "#8A6924", "تم التواصل": "#2d5d89", "مهتم": "#16a34a",
        "غير مهتم": "#dc2626", "تم البيع": "#7c3aed", "متابعة": "#f59e0b",
      };
      return Object.entries(statusMap).map(([name, value]) => ({
        name, value, color: colors[name] || "#6b7280",
      }));
    },
  });
}

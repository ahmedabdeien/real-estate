/**
 * lib/api.js — centralised API helpers used by TanStack Query hooks
 */
import apiClient from "../api/axios";

const get   = (url, params) => apiClient.get(url, { params }).then((r) => r.data);
const post  = (url, data)   => apiClient.post(url, data).then((r) => r.data);
const put   = (url, data)   => apiClient.put(url, data).then((r) => r.data);
const patch = (url, data)   => apiClient.patch(url, data).then((r) => r.data);
const del   = (url)         => apiClient.delete(url).then((r) => r.data);

// ── Projects ──────────────────────────────────────────────────────
export const projectsApi = {
  list:   (p) => get("/projects", p),
  one:    (id) => get(`/projects/${id}`),
  create: (d)  => post("/projects", d),
  update: (id, d) => put(`/projects/${id}`, d),
  remove: (id) => del(`/projects/${id}`),
};

// ── Units ─────────────────────────────────────────────────────────
export const unitsApi = {
  list:   (p) => get("/units", p),
  one:    (id) => get(`/units/${id}`),
  create: (d)  => post("/units", d),
  update: (id, d) => put(`/units/${id}`, d),
  remove: (id) => del(`/units/${id}`),
};

// ── Leads ─────────────────────────────────────────────────────────
export const leadsApi = {
  list:   (p) => get("/leads", p),
  one:    (id) => get(`/leads/${id}`),
  create: (d)  => post("/leads", d),
  update: (id, d) => put(`/leads/${id}`, d),
  patch:  (id, d)  => patch(`/leads/${id}`, d),
  remove: (id) => del(`/leads/${id}`),
};

// ── Blogs ─────────────────────────────────────────────────────────
export const blogsApi = {
  list:   (p) => get("/blogs", p),
  one:    (id) => get(`/blogs/${id}`),
  create: (d)  => post("/blogs", d),
  update: (id, d) => put(`/blogs/${id}`, d),
  remove: (id) => del(`/blogs/${id}`),
};

// ── Careers ───────────────────────────────────────────────────────
export const careersApi = {
  list:   (p) => get("/careers", p),
  one:    (id) => get(`/careers/${id}`),
  create: (d)  => post("/careers", d),
  update: (id, d) => put(`/careers/${id}`, d),
  remove: (id) => del(`/careers/${id}`),
};

// ── Users ─────────────────────────────────────────────────────────
export const usersApi = {
  list:   (p) => get("/users", p),
  one:    (id) => get(`/users/${id}`),
  create: (d)  => post("/users", d),
  update: (id, d) => put(`/users/${id}`, d),
  remove: (id) => del(`/users/${id}`),
  changePassword: (id, d) => post(`/users/${id}/change-password`, d),
};

// ── Dashboard Stats ───────────────────────────────────────────────
export const dashboardApi = {
  stats: () => Promise.allSettled([
    apiClient.get("/projects?limit=1"),
    apiClient.get("/units?limit=1"),
    apiClient.get("/leads?limit=1"),
    apiClient.get("/tasks?limit=1"),
  ]).then(([proj, units, leads, tasks]) => ({
    projectsCount: proj.value?.data?.total ?? proj.value?.data?.projects?.length ?? 0,
    unitsCount:    units.value?.data?.total ?? units.value?.data?.units?.length ?? 0,
    leadsCount:    leads.value?.data?.total ?? leads.value?.data?.leads?.length ?? 0,
    tasksCount:    tasks.value?.data?.total ?? tasks.value?.data?.tasks?.length ?? 0,
  })),
};

// ── Settings ──────────────────────────────────────────────────────
export const settingsApi = {
  get:  () => get("/settings"),
  save: (updates) => post("/settings", { updates }),
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationsApi = {
  list:        (p) => get("/notifications", p),
  unreadCount: () => get("/notifications/unread-count"),
  markAllRead: () => apiClient.patch("/notifications/mark-all-read").then((r) => r.data),
  markOne:     (id) => apiClient.put(`/notifications/${id}/read`).then((r) => r.data),
};

// ── Tasks ─────────────────────────────────────────────────────────
export const tasksApi = {
  list:   (p) => get("/tasks", p),
  one:    (id) => get(`/tasks/${id}`),
  create: (d)  => post("/tasks", d),
  update: (id, d) => put(`/tasks/${id}`, d),
  remove: (id) => del(`/tasks/${id}`),
};

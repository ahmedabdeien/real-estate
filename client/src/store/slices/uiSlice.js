import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarCollapsed: false,
    darkMode: false,
    notificationsPanelOpen: false,
    activePage: "dashboard",
    pageTitle: "لوحة التحكم",
    breadcrumbs: [],
    globalLoading: false,
    toasts: [],
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, { payload }) {
      state.sidebarCollapsed = payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      if (state.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setDarkMode(state, { payload }) {
      state.darkMode = payload;
      if (payload) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    toggleNotificationsPanel(state) {
      state.notificationsPanelOpen = !state.notificationsPanelOpen;
    },
    setNotificationsPanelOpen(state, { payload }) {
      state.notificationsPanelOpen = payload;
    },
    setActivePage(state, { payload }) {
      state.activePage = payload.page;
      state.pageTitle = payload.title || "لوحة التحكم";
      state.breadcrumbs = payload.breadcrumbs || [];
    },
    setGlobalLoading(state, { payload }) {
      state.globalLoading = payload;
    },
    addToast(state, { payload }) {
      state.toasts.push({ id: Date.now(), ...payload });
    },
    removeToast(state, { payload }) {
      state.toasts = state.toasts.filter((t) => t.id !== payload);
    },
  },
});

export const {
  toggleSidebar, setSidebarCollapsed, toggleDarkMode, setDarkMode,
  toggleNotificationsPanel, setNotificationsPanelOpen,
  setActivePage, setGlobalLoading, addToast, removeToast,
} = uiSlice.actions;

// Selectors
export const selectSidebarCollapsed = (s) => s.ui.sidebarCollapsed;
export const selectDarkMode = (s) => s.ui.darkMode;

export default uiSlice.reducer;

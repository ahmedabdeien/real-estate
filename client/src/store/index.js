import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";

import uiReducer       from "./slices/uiSlice";
import authReducer     from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import notificationsReducer from "./slices/notificationsSlice";
import dashboardReducer from "./slices/dashboardSlice";

// Only persist ui (dark mode, sidebar) and auth token
const uiPersistConfig = {
  key: "ui",
  storage,
  whitelist: ["sidebarCollapsed", "darkMode"],
};

const rootReducer = combineReducers({
  ui:            persistReducer(uiPersistConfig, uiReducer),
  auth:          authReducer,
  settings:      settingsReducer,
  notifications: notificationsReducer,
  dashboard:     dashboardReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// Selectors
// Re-export slice selectors for convenience
export { selectSidebarCollapsed, selectDarkMode } from "./slices/uiSlice";

export const selectUser             = (s) => s.auth.user;
export const selectAuthLoading      = (s) => s.auth.loading;
export const selectUnreadCount      = (s) => s.notifications.unreadCount;
export const selectNotifications    = (s) => s.notifications.list;
export const selectSettings         = (s) => s.settings.data;
export const selectSettingsLoading  = (s) => s.settings.loading;
export const selectDashboardStats   = (s) => s.dashboard.stats;
export const selectDashboardLoading = (s) => s.dashboard.loading;
export const selectNotifPanelOpen   = (s) => s.ui.notificationsPanelOpen;

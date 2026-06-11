import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { sidebarCollapsed: false, sidebarMobileOpen: false },
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarMobile: (state, { payload }) => { state.sidebarMobileOpen = payload; },
  },
});

export const { toggleSidebar, setSidebarMobile } = uiSlice.actions;
export default uiSlice.reducer;

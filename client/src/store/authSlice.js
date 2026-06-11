import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const company = user?.companyId || null;

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, user, company, isAuthenticated: !!token },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user = payload.user;
      state.company = payload.user?.companyId || null;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
      state.company = state.user?.companyId || null;
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    updateCompany: (state, { payload }) => {
      if (state.company) state.company = { ...state.company, ...payload };
      if (state.user?.companyId) state.user = { ...state.user, companyId: { ...state.user.companyId, ...payload } };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.company = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, updateUser, updateCompany, logout } = authSlice.actions;
export default authSlice.reducer;

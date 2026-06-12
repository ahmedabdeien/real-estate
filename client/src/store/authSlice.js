import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');
const company = user?.companyId || null;
const superAdminToken = localStorage.getItem('superAdminToken');
const superAdminUser  = JSON.parse(localStorage.getItem('superAdminUser') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token, user, company, isAuthenticated: !!token,
    superAdminToken, superAdminUser,
    isImpersonating: !!superAdminToken,
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user = payload.user;
      state.company = payload.user?.companyId || null;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    impersonateCompany: (state, { payload }) => {
      // Save current superadmin credentials before switching
      state.superAdminToken = state.token;
      state.superAdminUser  = state.user;
      state.isImpersonating = true;
      localStorage.setItem('superAdminToken', state.token);
      localStorage.setItem('superAdminUser',  JSON.stringify(state.user));
      // Switch to company credentials
      state.token   = payload.token;
      state.user    = payload.user;
      state.company = payload.user?.companyId || null;
      state.isAuthenticated = true;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    exitImpersonation: (state) => {
      state.token   = state.superAdminToken;
      state.user    = state.superAdminUser;
      state.company = null;
      state.superAdminToken = null;
      state.superAdminUser  = null;
      state.isImpersonating = false;
      localStorage.setItem('token', state.token);
      localStorage.setItem('user', JSON.stringify(state.user));
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
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
      state.superAdminToken = null;
      state.superAdminUser  = null;
      state.isImpersonating = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
    },
  },
});

export const { setCredentials, impersonateCompany, exitImpersonation, updateUser, updateCompany, logout } = authSlice.actions;
export default authSlice.reducer;

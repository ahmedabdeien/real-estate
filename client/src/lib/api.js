import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// ─── Listings ───────────────────────────────────────────────────────────────
export const getListings = (params = {}) =>
  api.get('/listing/getListings', { params });

export const getListing = (id) => api.get(`/listing/get/${id}`);

export const createListing = (data) => api.post('/listing/create', data);

export const updateListing = (id, data) =>
  api.put(`/listing/update/${id}`, data);

export const deleteListing = (id) => api.delete(`/listing/delete/${id}`);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const signIn = (credentials) => api.post('/auth/signin', credentials);

export const signUp = (data) => api.post('/auth/signUp', data);

export const logout = () => api.get('/auth/logout');

// ─── Config ──────────────────────────────────────────────────────────────────
export const getConfig = () => api.get('/config');

export const saveConfig = (data) => api.put('/config', data);

// ─── Contact ─────────────────────────────────────────────────────────────────
export const sendContact = (data) => api.post('/contact', data);

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUsers = () => api.get('/user/getusers');

export default api;

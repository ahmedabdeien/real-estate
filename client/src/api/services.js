import api from './axios';

const crud = (path) => ({
  getAll: (params) => api.get(path, { params }),
  getOne: (id) => api.get(`${path}/${id}`),
  create: (data) => api.post(path, data),
  update: (id, data) => api.put(`${path}/${id}`, data),
  remove: (id) => api.delete(`${path}/${id}`),
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const companiesAPI = {
  ...crud('/companies'),
  impersonate: (id) => api.post(`/companies/${id}/impersonate`),
};

export const usersAPI = {
  ...crud('/users'),
  updateProfile: (data) => api.put('/users/profile', data),
};

export const rolesAPI = {
  ...crud('/roles'),
  getPermissions: (params) => api.get('/roles/permissions', { params }),
  duplicate: (id) => api.post(`/roles/${id}/duplicate`),
};

export const propertiesAPI = crud('/properties');
export const unitsAPI = crud('/units');
export const customersAPI = crud('/customers');
export const contractsAPI = crud('/contracts');
export const invoicesAPI = crud('/invoices');
export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  remove: (id) => api.delete(`/payments/${id}`),
};
export const expensesAPI = crud('/expenses');

export const reportsAPI = {
  getDashboard: (params) => api.get('/reports/dashboard', { params }),
  getFinancial: (params) => api.get('/reports/financial', { params }),
  getSuperStats: () => api.get('/reports/super-stats'),
};

export const themeAPI = {
  get: (params) => api.get('/theme', { params }),
  update: (data) => api.put('/theme', data),
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/mark-read'),
  remove: (id) => api.delete(`/notifications/${id}`),
};

export const auditAPI = {
  getAll:   (params) => api.get('/audit',        { params }),
  getLogs:  (params) => api.get('/audit',        { params }),
  getStats: ()       => api.get('/audit/stats'),
};

export const documentsAPI = {
  ...crud('/documents'),
  getByRelated: (relatedTo, relatedId, params) =>
    api.get('/documents', { params: { relatedTo, relatedId, ...params } }),
};

export const blogsAPI = {
  ...crud('/blogs'),
  getPublic: (params) => api.get('/blogs/public', { params }),
  getBySlug: (slug) => api.get(`/blogs/public/${slug}`),
};

export const cmsAPI = {
  getPage:       (pageKey) => api.get(`/cms/${pageKey}`),
  updatePage:    (pageKey, data) => api.put(`/cms/${pageKey}`, data),
  updateSection: (pageKey, sectionKey, data) => api.put(`/cms/${pageKey}/${sectionKey}`, data),
  getPublic:     (params) => api.get('/cms/public', { params }),
};

export const plansAPI = crud('/plans');

export const mediaAPI = {
  getAll:  (params) => api.get('/media', { params }),
  upload:  (formData) => api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.put(`/media/${id}`, data),
  remove:  (id) => api.delete(`/media/${id}`),
};

export const pagesAPI = {
  getAll:    (params) => api.get('/pages', { params }),
  getOne:    (id)     => api.get(`/pages/${id}`),
  getBySlug: (slug)   => api.get(`/pages/public/${slug}`),
  create:    (data)   => api.post('/pages', data),
  update:    (id, data) => api.put(`/pages/${id}`, data),
  delete:    (id)     => api.delete(`/pages/${id}`),
};

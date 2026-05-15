import axios from "axios";

// In production set VITE_API_URL to your Railway backend
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  // Extra security header — backend verifies this
  headers: {
    "X-Accounting-Client": "elsarh-accounts-v1",
  },
});

// Attach JWT from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("acc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("acc_user");
      localStorage.removeItem("acc_token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;

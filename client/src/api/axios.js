import axios from "axios";

// In production (Vercel), VITE_API_URL = "https://your-app.up.railway.app/api"
// In development, falls back to "/api" which Vite proxies to localhost:3000
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach JWT as Authorization header — works cross-origin without cookie sameSite issues
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("elsarh_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track whether a refresh is already in-flight (avoid duplicate refresh calls)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Attempt silent token refresh on 401 — but NOT for auth endpoints themselves
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/google")
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.token;
        localStorage.setItem("elsarh_token", newToken);
        if (data.user) localStorage.setItem("elsarh_user", JSON.stringify(data.user));
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Refresh failed — clear session and redirect to login
        localStorage.removeItem("elsarh_user");
        localStorage.removeItem("elsarh_token");
        const path = window.location.pathname;
        if (path.startsWith("/admin") && path !== "/admin/login") {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-401 errors or non-retryable 401s
    return Promise.reject(err);
  }
);

export default api;

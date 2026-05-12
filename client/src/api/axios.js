import axios from "axios";

// In production (Vercel), VITE_API_URL = "https://your-app.up.railway.app/api"
// In development, falls back to "/api" which Vite proxies to localhost:3000
const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("elsarh_user");
      const path = window.location.pathname;
      if (path.startsWith("/admin") && path !== "/admin/login") {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

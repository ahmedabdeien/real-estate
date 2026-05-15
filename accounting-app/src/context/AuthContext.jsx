import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("acc_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem("acc_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me")
      .then((r) => {
        const u = r.data.user;
        // Only allow admin and accounts dept
        if (u.role === "admin" || u.department === "accounts") {
          setUser(u);
          localStorage.setItem("acc_user", JSON.stringify(u));
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    const { user: u, token } = r.data;
    // Only allow admin and accounts dept
    if (u.role !== "admin" && u.department !== "accounts") {
      throw new Error("ACCESS_DENIED");
    }
    localStorage.setItem("acc_token", token);
    localStorage.setItem("acc_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("acc_token");
    localStorage.removeItem("acc_user");
    setUser(null);
    api.post("/auth/logout").catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

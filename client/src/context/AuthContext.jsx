import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth, googleProvider, facebookProvider, appleProvider } from "../firebase";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("elsarh_user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("elsarh_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("elsarh_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const saveUser = (u, token) => {
    setUser(u);
    localStorage.setItem("elsarh_user", JSON.stringify(u));
    if (token) localStorage.setItem("elsarh_token", token);
  };

  // Email/password login
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    saveUser(res.data.user, res.data.token);
    return res.data.user;
  };

  // Google Sign-In — Firebase popup → send idToken to backend → get JWT
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    const res = await api.post("/auth/google", { idToken });
    saveUser(res.data.user, res.data.token);
    return res.data.user;
  };

  // Facebook Sign-In — same flow, Firebase handles OAuth
  const loginWithFacebook = async () => {
    const result = await signInWithPopup(auth, facebookProvider);
    const idToken = await result.user.getIdToken();
    const res = await api.post("/auth/google", { idToken }); // backend validates Firebase token regardless of provider
    saveUser(res.data.user, res.data.token);
    return res.data.user;
  };

  // Apple Sign-In — same flow
  const loginWithApple = async () => {
    const result = await signInWithPopup(auth, appleProvider);
    const idToken = await result.user.getIdToken();
    const res = await api.post("/auth/google", { idToken });
    saveUser(res.data.user, res.data.token);
    return res.data.user;
  };

  const logout = async () => {
    // Always clear local state — even if backend/firebase calls fail
    try { await firebaseSignOut(auth); } catch {}
    try { await api.post("/auth/logout"); } catch {}
    setUser(null);
    localStorage.removeItem("elsarh_user");
    localStorage.removeItem("elsarh_token");
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    saveUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, loginWithFacebook, loginWithApple, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

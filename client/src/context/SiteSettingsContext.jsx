import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const SiteSettingsContext = createContext({ settings: {}, contact: {}, theme: {}, loading: true });

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [contact,  setContact]  = useState({});
  const [theme,    setTheme]    = useState({});
  const [loading,  setLoading]  = useState(true);
  const styleRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/settings").then((r) => r.data.settings || {}).catch(() => ({})),
      api.get("/content/contact").then((r) => r.data.data || {}).catch(() => ({})),
      api.get("/content/theme").then((r) => r.data.data || {}).catch(() => ({})),
    ]).then(([s, c, t]) => {
      setSettings(s);
      setContact(c);
      setTheme(t);
      // content/theme overrides settings for colors
      injectTheme({ ...s, ...t });
    }).finally(() => setLoading(false));
  }, []);

  function injectTheme(s) {
    const primary   = s.primary_color   || "#2d5d89";
    const secondary = s.secondary_color || "#1a3d5c";
    const accent    = s.accent_color    || "#f59e0b";

    const darken = (hex) => {
      if (!hex || !hex.startsWith("#") || hex.length < 7) return hex || "#000";
      try {
        const n = parseInt(hex.replace("#", ""), 16);
        const r = Math.max(0, (n >> 16) - 20);
        const g = Math.max(0, ((n >> 8) & 0xff) - 20);
        const b = Math.max(0, (n & 0xff) - 20);
        return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
      } catch { return hex; }
    };

    const hexToRgb = (hex) => {
      if (!hex || !hex.startsWith("#") || hex.length < 7) return "0,0,0";
      try {
        return `${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}`;
      } catch { return "0,0,0"; }
    };

    const css = `
      :root {
        --primary:        ${primary};
        --primary-dark:   ${darken(primary)};
        --primary-rgb:    ${hexToRgb(primary)};
        --secondary:      ${secondary};
        --secondary-dark: ${darken(secondary)};
        --accent:         ${accent};
        --accent-dark:    ${darken(accent)};
        --accent-rgb:     ${hexToRgb(accent)};
      }
    `;
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "site-theme";
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = css;
  }

  /** Call after saving theme in admin to instantly reflect changes */
  const refreshTheme = async () => {
    try {
      const [s, t] = await Promise.all([
        api.get("/settings").then((r) => r.data.settings || {}),
        api.get("/content/theme").then((r) => r.data.data || {}),
      ]);
      setSettings(s); setTheme(t);
      injectTheme({ ...s, ...t });
    } catch {}
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, contact, theme, loading, refreshTheme }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);

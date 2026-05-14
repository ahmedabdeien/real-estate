import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

const SiteSettingsContext = createContext({ settings: {}, contact: {}, loading: true });

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [contact, setContact] = useState({});
  const [loading, setLoading] = useState(true);
  const styleRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get("/settings").then((r) => r.data.settings || {}).catch(() => ({})),
      api.get("/content/contact").then((r) => r.data.data || {}).catch(() => ({})),
    ]).then(([s, c]) => {
      setSettings(s);
      setContact(c);
      injectTheme(s);
    }).finally(() => setLoading(false));
  }, []);

  function injectTheme(s) {
    const primary = s.primary_color || "#2d5d89";
    const accent  = s.accent_color  || "#f59e0b";

    // Darken by ~10% for hover states (simple approach)
    const darken = (hex) => {
      const n = parseInt(hex.replace("#", ""), 16);
      const r = Math.max(0, (n >> 16) - 20);
      const g = Math.max(0, ((n >> 8) & 0xff) - 20);
      const b = Math.max(0, (n & 0xff) - 20);
      return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
    };

    const css = `
      :root {
        --primary: ${primary};
        --primary-dark: ${darken(primary)};
        --primary-rgb: ${parseInt(primary.slice(1,3),16)}, ${parseInt(primary.slice(3,5),16)}, ${parseInt(primary.slice(5,7),16)};
        --accent: ${accent};
        --accent-dark: ${darken(accent)};
      }
    `;
    if (!styleRef.current) {
      styleRef.current = document.createElement("style");
      styleRef.current.id = "site-theme";
      document.head.appendChild(styleRef.current);
    }
    styleRef.current.textContent = css;
  }

  return (
    <SiteSettingsContext.Provider value={{ settings, contact, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export const useSiteSettings = () => useContext(SiteSettingsContext);

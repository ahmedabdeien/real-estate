import { useState, useEffect } from "react";
import api from "../api/axios";

const cache = {};
const LS_PREFIX = "cms_v2_";
const LS_TTL = 5 * 60 * 1000; // 5 min

function getLS(section) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + section);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    return Date.now() - ts < LS_TTL ? data : null;
  } catch { return null; }
}

function setLS(section, data) {
  try { localStorage.setItem(LS_PREFIX + section, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

export function useCms(section, defaults = {}) {
  // Instant load from memory cache → localStorage → defaults
  const initial = cache[section] ?? getLS(section) ?? null;
  const [data, setData] = useState(() => ({ ...defaults, ...(initial || {}) }));
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    const ctrl = new AbortController();
    api.get(`/content/${section}`, { signal: ctrl.signal })
      .then(res => {
        const fresh = { ...defaults, ...(res.data?.data || {}) };
        cache[section] = fresh;
        setLS(section, fresh);
        setData(fresh);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [section]);

  return { data, loading };
}

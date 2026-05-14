import { useEffect, useState } from "react";
import api from "../api/axios";

const cache = {};

/**
 * Fetch a CMS section. Returns { data, loading }.
 * Caches per section key for the lifetime of the page.
 */
export function useCms(section, defaults = {}) {
  const [data, setData] = useState(cache[section] ?? defaults);
  const [loading, setLoading] = useState(!cache[section]);

  useEffect(() => {
    if (cache[section]) { setData(cache[section]); setLoading(false); return; }
    const controller = new AbortController();
    api.get(`/content/${section}`, { signal: controller.signal })
      .then((res) => {
        const d = { ...defaults, ...(res.data?.data || {}) };
        cache[section] = d;
        setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [section]);

  return { data, loading };
}

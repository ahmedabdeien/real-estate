/**
 * t(value, lang?) — Safely extract a displayable string from multilingual fields
 *
 * Backend fields can be either:
 *   - A plain string: "hello"
 *   - A multilingual object: { ar: "مرحبا", en: "hello" }
 *
 * Usage:
 *   t(project.name)        → project.name.ar ?? project.name.en ?? "—"
 *   t(project.name, "en")  → project.name.en ?? project.name.ar ?? "—"
 *   t("plain string")      → "plain string"
 *   t(undefined)           → "—"
 */
export function t(value, lang = "ar", fallback = "—") {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "object") {
    if (lang === "ar") return value.ar || value.en || fallback;
    return value.en || value.ar || fallback;
  }
  return String(value) || fallback;
}

export default t;

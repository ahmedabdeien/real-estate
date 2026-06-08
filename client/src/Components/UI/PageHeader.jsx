/**
 * PageHeader — Shared admin page header
 * Eliminates the repeated "title + description + actions" pattern
 *
 * Usage:
 *   <PageHeader
 *     title="إدارة العملاء"
 *     subtitle="عرض وإدارة جميع العملاء المحتملين"
 *     icon={<FaUsers />}
 *     actions={<button onClick={modal.open}>+ إضافة عميل</button>}
 *     stats={[{ label: "الإجمالي", value: 234 }]}
 *   />
 */
import { FaSpinner } from "react-icons/fa6";

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  stats,
  loading = false,
  breadcrumbs,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-5">
      <div className="max-w-full">
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-gray-600 dark:text-gray-300 font-medium" : "hover:text-gray-600 cursor-pointer"}>
                  {b}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            {icon && (
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
                style={{ background: "var(--primary)" }}>
                {icon}
              </span>
            )}
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                {title}
                {loading && <FaSpinner className="w-4 h-4 animate-spin text-gray-400" />}
              </h1>
              {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* Actions */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Stats pills */}
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-4">
            {stats.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${s.color || "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"}`}>
                {s.icon && <span>{s.icon}</span>}
                <span className="text-gray-400">{s.label}:</span>
                <span className="font-bold text-gray-700 dark:text-gray-200">{s.value ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Shared action button used in page headers */
export function PrimaryButton({ children, onClick, loading, icon, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || props.disabled}
      className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-sm hover:shadow-md active:scale-[0.98]"
      style={{ background: "var(--primary)" }}
      {...props}
    >
      {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

/** Secondary / outline button */
export function SecondaryButton({ children, onClick, icon, ...props }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/** Danger button */
export function DangerButton({ children, onClick, loading, icon, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || props.disabled}
      className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 transition-all disabled:opacity-60"
      {...props}
    >
      {loading ? <FaSpinner className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

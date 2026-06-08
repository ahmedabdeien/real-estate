/**
 * FormField — Shared form field wrapper with label + error + hint
 * Eliminates repeated label/error JSX across all admin forms
 *
 * Usage:
 *   <FormField label="الاسم" error={form.errors.name} required>
 *     <input {...form.register("name")} className={inputCls} />
 *   </FormField>
 *
 *   <FormField label="اللون" type="color">
 *     <ColorPicker ... />
 *   </FormField>
 */
import { FaTriangleExclamation, FaCircleInfo } from "react-icons/fa6";

export default function FormField({
  label,
  error,
  hint,
  required,
  children,
  className = "",
  labelClass = "",
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClass}`}>
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
          {hint && (
            <span className="text-xs text-gray-400 font-normal mr-2 opacity-75 inline-flex items-center gap-1">
              <FaCircleInfo className="w-2.5 h-2.5" />
              {hint}
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1.5">
          <FaTriangleExclamation className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Pre-built input className — use anywhere */
export const inputCls = [
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600",
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm",
  "outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20",
  "transition-all placeholder:text-gray-400",
].join(" ");

/** Error className variant */
export const inputErrorCls = inputCls.replace("border-gray-200 dark:border-gray-600", "border-red-400 dark:border-red-500");

/** Filter bar input — same as inputCls but WITHOUT w-full, for inline compact filters */
export const filterInputCls = [
  "px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600",
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm",
  "outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20",
  "transition-all placeholder:text-gray-400",
].join(" ");

/** Select field */
export function SelectField({ children, error, ...props }) {
  return (
    <select
      className={`${error ? inputErrorCls : inputCls} cursor-pointer`}
      {...props}
    >
      {children}
    </select>
  );
}

/** Textarea field */
export function TextareaField({ error, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${error ? inputErrorCls : inputCls} resize-none`}
      {...props}
    />
  );
}

/** Toggle field */
export function ToggleField({ checked, onChange, label, description }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-[color:var(--primary)]" : "bg-gray-200 dark:bg-gray-700"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-5" : "left-0.5"}`} />
      </button>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>}
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      )}
    </label>
  );
}

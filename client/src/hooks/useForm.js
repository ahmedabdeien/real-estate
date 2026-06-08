/**
 * useForm — Generic form hook with Zod validation
 * Eliminates all repeated form state + validation patterns across admin pages
 *
 * Usage:
 *   const form = useForm(leadSchema, { name: "", phone: "" });
 *   <input {...form.register("name")} />
 *   {form.errors.name && <p>{form.errors.name}</p>}
 *   form.handleSubmit(async (data) => { await createLead(data); })
 */
import { useState, useCallback } from "react";
import { parseSchema } from "../schemas/index";

export function useForm(schema, initialValues = {}) {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [dirty,  setDirty]    = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reset to initial (or a new set of) values */
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setDirty({});
    setIsSubmitting(false);
  }, [initialValues]); // eslint-disable-line

  /** Set a single field value */
  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setDirty((prev) => ({ ...prev, [name]: true }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
  }, [errors]);

  /** Set many values at once */
  const setMany = useCallback((obj) => {
    setValues((prev) => ({ ...prev, ...obj }));
  }, []);

  /** Binds an input: onChange + value */
  const register = useCallback((name) => ({
    value:    values[name] ?? "",
    onChange: (e) => setValue(name, e.target.type === "checkbox" ? e.target.checked : e.target.value),
    name,
  }), [values, setValue]);

  /** Validate and call onValid with clean data */
  const handleSubmit = useCallback((onValid) => async (e) => {
    e?.preventDefault?.();
    if (!schema) {
      setIsSubmitting(true);
      try { await onValid(values); } finally { setIsSubmitting(false); }
      return;
    }
    const result = parseSchema(schema, values);
    if (!result.ok) { setErrors(result.errors); return; }
    setErrors({});
    setIsSubmitting(true);
    try {
      await onValid(result.data);
    } catch (err) {
      // Surface API errors into form if they match a field
      const msg = err?.response?.data?.message || err?.message;
      if (msg) setErrors((prev) => ({ ...prev, _form: msg }));
    } finally {
      setIsSubmitting(false);
    }
  }, [schema, values]);

  /** Manually set errors (e.g. from server) */
  const setFormError = useCallback((name, msg) => {
    setErrors((prev) => ({ ...prev, [name]: msg }));
  }, []);

  /** Check if field has been touched and has error */
  const fieldError = useCallback((name) => dirty[name] ? errors[name] : undefined, [dirty, errors]);

  return {
    values,
    errors,
    dirty,
    isSubmitting,
    setValue,
    setMany,
    register,
    reset,
    handleSubmit,
    setFormError,
    fieldError,
    /** Direct access to setValues for complex updates */
    setValues,
  };
}

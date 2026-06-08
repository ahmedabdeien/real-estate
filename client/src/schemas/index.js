/**
 * schemas/index.js — Zod validation schemas for all entities
 */
import { z } from "zod";

// ── Helpers ───────────────────────────────────────────────────────
const phone = z.string()
  .min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام")
  .regex(/^[\d\s\+\-\(\)]+$/, "رقم الهاتف غير صحيح");

const arabicText = (min = 2, max = 200) =>
  z.string().min(min, `يجب أن يكون على الأقل ${min} أحرف`).max(max);

const url = z.string().url("رابط غير صحيح").or(z.literal("")).optional();

// ── Lead ──────────────────────────────────────────────────────────
export const leadSchema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  phone:    phone,
  email:    z.string().email("البريد الإلكتروني غير صحيح").or(z.literal("")).optional(),
  status:   z.enum(["جديد", "تم التواصل", "مهتم", "غير مهتم", "تم البيع", "متابعة"]).default("جديد"),
  source:   z.string().optional(),
  budget:   z.string().optional(),
  notes:    z.string().max(1000).optional(),
  assignedTo: z.string().optional(),
  project:  z.string().optional(),
});

export const leadUpdateSchema = leadSchema.partial();

// ── User ──────────────────────────────────────────────────────────
export const userSchema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email:    z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف").optional(),
  role:     z.enum(["admin", "supervisor", "manager", "employee", "sales", "viewer"]).default("employee"),
  phone:    phone.optional(),
  allowedPages: z.array(z.string()).optional(),
});

export const userUpdateSchema = userSchema.omit({ password: true }).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "أدخل كلمة المرور الحالية"),
  newPassword:     z.string().min(6, "كلمة المرور الجديدة على الأقل 6 أحرف"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "كلمتا المرور غير متطابقتان",
  path: ["confirmPassword"],
});

// ── Project ───────────────────────────────────────────────────────
export const projectSchema = z.object({
  name:        arabicText(2, 100),
  description: z.string().max(2000).optional(),
  location:    z.string().min(2, "أدخل الموقع").optional(),
  status:      z.enum(["قيد الإنشاء", "جاهز", "مكتمل", "متوقف"]).default("قيد الإنشاء"),
  type:        z.string().optional(),
  minPrice:    z.number().nonnegative().optional(),
  maxPrice:    z.number().nonnegative().optional(),
  image:       url,
  images:      z.array(z.string()).optional(),
});

// ── Unit ──────────────────────────────────────────────────────────
export const unitSchema = z.object({
  title:     z.string().min(2, "أدخل اسم الوحدة"),
  project:   z.string().min(1, "اختر المشروع"),
  type:      z.string().optional(),
  area:      z.number().positive("المساحة يجب أن تكون أكبر من صفر").optional(),
  price:     z.number().nonnegative("السعر يجب أن يكون صفر أو أكثر").optional(),
  floor:     z.number().int().optional(),
  status:    z.enum(["متاحة", "محجوزة", "مباعة"]).default("متاحة"),
  rooms:     z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  image:     url,
});

// ── Blog ──────────────────────────────────────────────────────────
export const blogSchema = z.object({
  title:    z.string().min(5, "العنوان يجب أن يكون على الأقل 5 أحرف"),
  content:  z.string().min(20, "المحتوى يجب أن يكون على الأقل 20 حرف"),
  excerpt:  z.string().max(500).optional(),
  image:    url,
  category: z.string().optional(),
  tags:     z.array(z.string()).optional(),
  published: z.boolean().default(false),
});

// ── Career ────────────────────────────────────────────────────────
export const careerSchema = z.object({
  title:       z.string().min(3, "أدخل المسمى الوظيفي"),
  department:  z.string().optional(),
  location:    z.string().optional(),
  type:        z.enum(["دوام كامل", "دوام جزئي", "عن بُعد", "عقد"]).default("دوام كامل"),
  description: z.string().min(20, "أدخل وصف الوظيفة"),
  requirements: z.string().optional(),
  salary:      z.string().optional(),
  active:      z.boolean().default(true),
});

// ── Task ─────────────────────────────────────────────────────────
export const taskSchema = z.object({
  title:       z.string().min(2, "أدخل عنوان المهمة"),
  description: z.string().optional(),
  status:      z.enum(["pending", "in_progress", "done", "cancelled"]).default("pending"),
  priority:    z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate:     z.string().optional(),
  assignedTo:  z.string().optional(),
});

// ── Login ─────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email:    z.string().email("البريد الإلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

// ── Settings ─────────────────────────────────────────────────────
export const settingsSchema = z.object({
  site_name:       z.string().optional(),
  company_name_ar: z.string().optional(),
  company_name_en: z.string().optional(),
  company_email:   z.string().email().or(z.literal("")).optional(),
  company_phone:   z.string().optional(),
  company_whatsapp: z.string().optional(),
  primary_color:   z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح").optional(),
  accent_color:    z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح").optional(),
});

// ── Utility: parse with Arabic error messages ─────────────────────
export function parseSchema(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data, errors: {} };
  const errors = {};
  result.error.errors.forEach((e) => {
    const path = e.path.join(".");
    if (!errors[path]) errors[path] = e.message;
  });
  return { ok: false, data: null, errors };
}

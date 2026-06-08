/**
 * AdminUsers.jsx — إدارة المستخدمين
 * TanStack Query + TanStack Table + Zod + bcryptjs | Arabic RTL
 */
import { useState, useMemo } from "react";
import bcrypt from "bcryptjs";
import { createColumnHelper } from "@tanstack/react-table";
import {
  FaPlus, FaPenToSquare, FaTrash, FaKey, FaUsers,
  FaShieldHalved, FaCircleCheck, FaXmark, FaEye, FaEyeSlash,
  FaSpinner,
} from "react-icons/fa6";

import DataTable, { checkboxColumn } from "../../Components/UI/DataTable";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useChangePassword,
} from "../../hooks/queries/useUsers";
import {
  userSchema,
  userUpdateSchema,
  changePasswordSchema,
  parseSchema,
} from "../../schemas/index";

// ── Role config ────────────────────────────────────────────────────
const ROLES = [
  { value: "admin",      label: "مدير عام",   color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { value: "supervisor", label: "مشرف عام",   color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "manager",    label: "مدير قسم",   color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "employee",   label: "موظف",       color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300" },
  { value: "sales",      label: "مبيعات",     color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { value: "viewer",     label: "مشاهد فقط",  color: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
];

const roleMap = Object.fromEntries(ROLES.map((r) => [r.value, r]));

function RoleBadge({ role }) {
  const r = roleMap[role];
  if (!r) return <span className="text-xs text-gray-400">{role}</span>;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.color}`}>
      {r.label}
    </span>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
const emptyUser = { name: "", email: "", password: "", role: "employee", phone: "" };
const emptyPw   = { currentPassword: "", newPassword: "", confirmPassword: "" };

function isOnline(lastSeen) {
  return lastSeen && Date.now() - new Date(lastSeen) < 5 * 60 * 1000;
}

function UserAvatar({ name, lastSeen }) {
  return (
    <div className="relative flex-shrink-0">
      <div className="w-8 h-8 rounded-full bg-[color:var(--primary)]/10 flex items-center justify-center text-[color:var(--primary)] font-bold text-sm">
        {name?.[0]?.toUpperCase() || "؟"}
      </div>
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${
          isOnline(lastSeen) ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
        }`}
        title={isOnline(lastSeen) ? "متصل الآن" : "غير متصل"}
      />
    </div>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="mt-1 text-xs text-red-500">{error}</p>;
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      {children}
      <FieldError error={error} />
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-all";

// ── Password field with toggle ──────────────────────────────────────
function PasswordInput({ value, onChange, placeholder = "••••••", name }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputCls} pl-10`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        tabIndex={-1}
      >
        {show ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ── Inline Modal wrapper ────────────────────────────────────────────
function Modal({ title, onClose, children, size = "md" }) {
  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${widths[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? "—"}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function AdminUsers() {
  const [page, setPage]         = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch]     = useState("");

  // Modals
  const [userModal, setUserModal]     = useState(null); // null | { mode: "create"|"edit", user? }
  const [pwModal, setPwModal]         = useState(null); // null | { userId, userName }
  const [deleteModal, setDeleteModal] = useState(null); // null | user object

  // Form state
  const [formData, setFormData] = useState(emptyUser);
  const [formErrors, setFormErrors] = useState({});
  const [pwData, setPwData]     = useState(emptyPw);
  const [pwErrors, setPwErrors] = useState({});

  // Queries / mutations
  const { data, isLoading } = useUsers({ page: page + 1, limit: pageSize, search });
  const users          = data?.users ?? [];
  const total          = data?.total ?? 0;
  const createUser     = useCreateUser();
  const updateUser     = useUpdateUser();
  const deleteUser     = useDeleteUser();
  const changePassword = useChangePassword();

  // Stats
  const adminCount  = users.filter((u) => u.role === "admin").length;
  const activeCount = users.filter((u) => u.isActive !== false).length;

  // ── Handlers ──────────────────────────────────────────────────────
  function openCreate() {
    setFormData(emptyUser);
    setFormErrors({});
    setUserModal({ mode: "create" });
  }

  function openEdit(user) {
    setFormData({ name: user.name || "", email: user.email || "", role: user.role || "employee", phone: user.phone || "" });
    setFormErrors({});
    setUserModal({ mode: "edit", user });
  }

  function openPwModal(user) {
    setPwData(emptyPw);
    setPwErrors({});
    setPwModal({ userId: user._id, userName: user.name });
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handlePwChange(e) {
    const { name, value } = e.target;
    setPwData((prev) => ({ ...prev, [name]: value }));
    if (pwErrors[name]) setPwErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSave() {
    if (userModal?.mode === "create") {
      const result = parseSchema(userSchema, formData);
      if (!result.ok) { setFormErrors(result.errors); return; }
      const hashedPassword = await bcrypt.hash(formData.password, 10);
      const payload = { ...formData, password: hashedPassword };
      createUser.mutate(payload, {
        onSuccess: () => setUserModal(null),
        onError: (err) => setFormErrors({ _server: err?.response?.data?.message || "حدث خطأ" }),
      });
    } else {
      const { password: _pw, ...editData } = formData;
      const result = parseSchema(userUpdateSchema, editData);
      if (!result.ok) { setFormErrors(result.errors); return; }
      updateUser.mutate({ id: userModal.user._id, data: editData }, {
        onSuccess: () => setUserModal(null),
        onError: (err) => setFormErrors({ _server: err?.response?.data?.message || "حدث خطأ" }),
      });
    }
  }

  async function handleChangePassword() {
    const result = parseSchema(changePasswordSchema, pwData);
    if (!result.ok) { setPwErrors(result.errors); return; }
    const hashedNew = await bcrypt.hash(pwData.newPassword, 10);
    changePassword.mutate(
      { id: pwModal.userId, data: { newPassword: hashedNew } },
      {
        onSuccess: () => setPwModal(null),
        onError: (err) => setPwErrors({ _server: err?.response?.data?.message || "حدث خطأ" }),
      }
    );
  }

  function handleDelete() {
    if (!deleteModal) return;
    deleteUser.mutate(deleteModal._id, { onSuccess: () => setDeleteModal(null) });
  }

  // ── Table columns ──────────────────────────────────────────────────
  const col = useMemo(() => createColumnHelper(), []);

  const columns = useMemo(
    () => [
      checkboxColumn(),
      col.accessor("name", {
        header: "الاسم",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={row.original.name} lastSeen={row.original.lastSeen} />
            <span className="font-medium text-gray-900 dark:text-white text-sm">{row.original.name}</span>
          </div>
        ),
      }),
      col.accessor("email", {
        header: "البريد الإلكتروني",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono" dir="ltr">{getValue()}</span>
        ),
      }),
      col.accessor("role", {
        header: "الدور",
        cell: ({ getValue }) => <RoleBadge role={getValue()} />,
      }),
      col.accessor("phone", {
        header: "الهاتف",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{getValue() || "—"}</span>
        ),
      }),
      col.accessor("createdAt", {
        header: "تاريخ الإنشاء",
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue()).toLocaleDateString("ar-EG") : "—",
      }),
      col.accessor("isActive", {
        header: "الحالة",
        cell: ({ getValue }) =>
          getValue() !== false ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              <FaCircleCheck className="w-3 h-3" />
              نشط
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              معطّل
            </span>
          ),
      }),
      col.display({
        id: "actions",
        header: "إجراءات",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => openEdit(user)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="تعديل"
              >
                <FaPenToSquare className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => openPwModal(user)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                title="تغيير كلمة المرور"
              >
                <FaKey className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeleteModal(user)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="حذف"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [col]
  );

  const isSaving     = createUser.isPending || updateUser.isPending;
  const isChangingPw = changePassword.isPending;
  const isDeleting   = deleteUser.isPending;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">إدارة المستخدمين</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">إضافة وتعديل وإدارة حسابات المستخدمين</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--primary)" }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          إضافة مستخدم
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={total}
          icon={FaUsers}
          color="bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
        />
        <StatCard
          label="المدراء"
          value={adminCount}
          icon={FaShieldHalved}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
        <StatCard
          label="المستخدمون النشطون"
          value={activeCount}
          icon={FaCircleCheck}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
      </div>

      {/* Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={isLoading}
        totalCount={total}
        pageIndex={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
        globalFilter={search}
        onFilterChange={(v) => { setSearch(v); setPage(0); }}
        searchPlaceholder="بحث بالاسم أو البريد..."
        enableRowSelection
        emptyMessage="لا يوجد مستخدمون"
        emptyIcon="👥"
      />

      {/* ── Add / Edit User Modal ─────────────────────────────────── */}
      {userModal && (
        <Modal
          title={userModal.mode === "create" ? "إضافة مستخدم جديد" : "تعديل بيانات المستخدم"}
          onClose={() => setUserModal(null)}
        >
          <div className="space-y-4">
            {formErrors._server && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {formErrors._server}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="الاسم الكامل" error={formErrors.name}>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="أحمد محمد"
                  className={inputCls}
                />
              </FormField>

              <FormField label="البريد الإلكتروني" error={formErrors.email}>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="user@company.com"
                  className={inputCls}
                  dir="ltr"
                />
              </FormField>
            </div>

            {userModal.mode === "create" && (
              <FormField label="كلمة المرور" error={formErrors.password}>
                <PasswordInput
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="6 أحرف على الأقل"
                />
              </FormField>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="الدور الوظيفي" error={formErrors.role}>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  className={inputCls}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="رقم الهاتف" error={formErrors.phone}>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="01xxxxxxxxx"
                  className={inputCls}
                  dir="ltr"
                />
              </FormField>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => setUserModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--primary)" }}
              >
                {isSaving && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                {userModal.mode === "create" ? "إضافة" : "حفظ التعديلات"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Change Password Modal ─────────────────────────────────── */}
      {pwModal && (
        <Modal title={`تغيير كلمة مرور: ${pwModal.userName}`} onClose={() => setPwModal(null)} size="sm">
          <div className="space-y-4">
            {pwErrors._server && (
              <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                {pwErrors._server}
              </div>
            )}

            <FormField label="كلمة المرور الحالية" error={pwErrors.currentPassword}>
              <PasswordInput
                name="currentPassword"
                value={pwData.currentPassword}
                onChange={handlePwChange}
              />
            </FormField>

            <FormField label="كلمة المرور الجديدة" error={pwErrors.newPassword}>
              <PasswordInput
                name="newPassword"
                value={pwData.newPassword}
                onChange={handlePwChange}
                placeholder="6 أحرف على الأقل"
              />
            </FormField>

            <FormField label="تأكيد كلمة المرور الجديدة" error={pwErrors.confirmPassword}>
              <PasswordInput
                name="confirmPassword"
                value={pwData.confirmPassword}
                onChange={handlePwChange}
              />
            </FormField>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={() => setPwModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={isChangingPw}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "var(--primary)" }}
              >
                {isChangingPw && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                تغيير كلمة المرور
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteModal && (
        <Modal title="تأكيد الحذف" onClose={() => setDeleteModal(null)} size="sm">
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  هل أنت متأكد من حذف المستخدم{" "}
                  <strong className="text-gray-900 dark:text-white">{deleteModal.name}</strong>؟
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {isDeleting && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                حذف
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

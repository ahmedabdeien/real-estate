/**
 * AdminProfile — صفحة الملف الشخصي للمستخدم الحالي
 * Uses: Zod validation, bcryptjs for password hashing, TanStack Query
 */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import bcrypt from "bcryptjs";
import {
  FaCircleUser, FaFloppyDisk, FaKey, FaEnvelope, FaPhone,
  FaShieldHalved, FaEye, FaEyeSlash, FaCircleCheck,
  FaCamera, FaIdBadge, FaSpinner, FaTriangleExclamation,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "../../lib/api";
import { parseSchema, userUpdateSchema, changePasswordSchema } from "../../schemas/index";
import ImageUpload from "../../Components/UI/ImageUpload";

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-all placeholder:text-gray-400";

const roleLabels = {
  admin: "مدير عام", supervisor: "مشرف عام", manager: "مدير قسم",
  employee: "موظف", sales: "مبيعات", viewer: "مشاهد فقط",
};

const roleColors = {
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  supervisor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  manager: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  employee: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  sales: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  viewer: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  // Profile form
  const [profile, setProfile] = useState({
    name:   user?.name  || "",
    email:  user?.email || "",
    phone:  user?.phone || "",
    avatar: user?.avatar || "",
    bio:    user?.bio   || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState({});

  // Mutations
  const updateProfile = useMutation({
    mutationFn: (data) => usersApi.update(user._id, data),
    onSuccess: (res) => {
      if (setUser) setUser(res.user || res);
      toast.success("✅ تم تحديث الملف الشخصي بنجاح");
    },
    onError: () => toast.error("❌ فشل التحديث"),
  });

  const changePassword = useMutation({
    mutationFn: (data) => usersApi.changePassword(user._id, data),
    onSuccess: () => {
      toast.success("✅ تم تغيير كلمة المرور بنجاح");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => toast.error(err?.response?.data?.message || "❌ فشل تغيير كلمة المرور"),
  });

  const handleProfileSave = () => {
    const result = parseSchema(userUpdateSchema, profile);
    if (!result.ok) { setProfileErrors(result.errors); return; }
    setProfileErrors({});
    updateProfile.mutate(result.data);
  };

  const handlePasswordChange = async () => {
    const result = parseSchema(changePasswordSchema, pwForm);
    if (!result.ok) { setPwErrors(result.errors); return; }
    setPwErrors({});
    try {
      const hashedNew = await bcrypt.hash(pwForm.newPassword, 10);
      changePassword.mutate({
        currentPassword: pwForm.currentPassword,
        newPassword: hashedNew,
      });
    } catch {
      toast.error("خطأ في تشفير كلمة المرور");
    }
  };

  const tabs = [
    { key: "profile", label: "البيانات الشخصية", icon: FaCircleUser },
    { key: "password", label: "كلمة المرور",      icon: FaKey },
    { key: "security", label: "الأمان والجلسات",  icon: FaShieldHalved },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-10" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: "var(--primary)" }}>
              <FaCircleUser />
            </span>
            الملف الشخصي
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 mr-12">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* ── Profile Card ── */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[color:var(--primary)]/30 mx-auto bg-gray-100 dark:bg-gray-800">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                      style={{ background: "var(--primary)" }}>
                      {profile.name?.[0]?.toUpperCase() || "A"}
                    </div>
                  )}
                </div>
              </div>
              <h2 className="font-black text-gray-900 dark:text-white text-base">{user?.name}</h2>
              <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
              <span className={`inline-block mt-2 px-2.5 py-1 text-[10px] font-bold rounded-lg ${roleColors[user?.role] || roleColors.employee}`}>
                {roleLabels[user?.role] || "موظف"}
              </span>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2 justify-center">
                  <FaCircleCheck className="w-3 h-3 text-green-500" />
                  <span>حساب نشط</span>
                </div>
                {user?.createdAt && (
                  <p>عضو منذ {new Date(user.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabs Content ── */}
          <div className="md:col-span-3">
            {/* Tab headers */}
            <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-1.5 mb-4">
              {tabs.map((t) => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-1 justify-center
                    ${activeTab === t.key
                      ? "text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  style={activeTab === t.key ? { background: "var(--primary)" } : {}}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 p-6"
            >
              {/* ── Profile Tab ── */}
              {activeTab === "profile" && (
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">
                      الصورة الشخصية
                    </label>
                    <ImageUpload
                      value={profile.avatar}
                      onChange={(url) => setProfile((p) => ({ ...p, avatar: url }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FieldWrap label="الاسم الكامل" icon={FaIdBadge} error={profileErrors.name}>
                      <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        placeholder="أحمد محمد" className={inputCls} />
                    </FieldWrap>
                    <FieldWrap label="البريد الإلكتروني" icon={FaEnvelope} error={profileErrors.email}>
                      <input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        type="email" placeholder="you@example.com" className={inputCls} dir="ltr" />
                    </FieldWrap>
                    <FieldWrap label="رقم الهاتف" icon={FaPhone} error={profileErrors.phone}>
                      <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="01xxxxxxxxx" className={inputCls} />
                    </FieldWrap>
                    <FieldWrap label="الدور الوظيفي" icon={FaShieldHalved}>
                      <div className={`${inputCls} cursor-not-allowed opacity-60`}>
                        {roleLabels[user?.role] || "موظف"}
                      </div>
                    </FieldWrap>
                  </div>

                  <FieldWrap label="نبذة شخصية" error={profileErrors.bio}>
                    <textarea value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      rows={3} placeholder="اكتب نبذة مختصرة عن نفسك..." className={inputCls + " resize-none"} />
                  </FieldWrap>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button onClick={handleProfileSave} disabled={updateProfile.isPending}
                      className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all"
                      style={{ background: "var(--primary)" }}>
                      {updateProfile.isPending
                        ? <><FaSpinner className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                        : <><FaFloppyDisk className="w-4 h-4" /> حفظ التغييرات</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Password Tab ── */}
              {activeTab === "password" && (
                <div className="space-y-5">
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700 flex gap-3">
                    <FaTriangleExclamation className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      كلمة مرورك محمية بتشفير bcrypt. اختر كلمة مرور قوية لا تشاركها مع أحد.
                    </p>
                  </div>

                  {[
                    { key: "currentPassword", label: "كلمة المرور الحالية" },
                    { key: "newPassword",     label: "كلمة المرور الجديدة" },
                    { key: "confirmPassword", label: "تأكيد كلمة المرور الجديدة" },
                  ].map(({ key, label }) => (
                    <FieldWrap key={key} label={label} error={pwErrors[key]}>
                      <div className="relative">
                        <input
                          type={showPw[key] ? "text" : "password"}
                          value={pwForm[key]}
                          onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder="••••••••"
                          className={inputCls + " pl-10"}
                          dir="ltr"
                        />
                        <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPw[key] ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FieldWrap>
                  ))}

                  {/* Password strength */}
                  {pwForm.newPassword && (
                    <PasswordStrength password={pwForm.newPassword} />
                  )}

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button onClick={handlePasswordChange} disabled={changePassword.isPending}
                      className="flex items-center gap-2 text-white text-sm font-semibold px-6 py-2.5 rounded-xl disabled:opacity-60 transition-all"
                      style={{ background: "var(--primary)" }}>
                      {changePassword.isPending
                        ? <><FaSpinner className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                        : <><FaKey className="w-4 h-4" /> تغيير كلمة المرور</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Security Tab ── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">معلومات الحساب</p>
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {[
                        { label: "معرّف الحساب", value: user?._id },
                        { label: "البريد الإلكتروني", value: user?.email },
                        { label: "الدور", value: roleLabels[user?.role] },
                        { label: "تاريخ الإنشاء", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG", { dateStyle: "long" }) : "—" },
                        { label: "آخر تسجيل دخول", value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ar-EG", { dateStyle: "long" }) : "—" },
                      ].map((item, i, arr) => (
                        <div key={item.label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                          <span className="text-sm font-mono text-gray-800 dark:text-gray-200 text-left" dir="ltr">
                            {item.value || "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">أمان الحساب</p>
                    <div className="space-y-3">
                      {[
                        { label: "تشفير كلمة المرور", value: "bcrypt (strength: 10)", ok: true },
                        { label: "JWT Authentication", value: "مفعّل", ok: true },
                        { label: "المصادقة الثنائية", value: "غير مفعّل", ok: false },
                        { label: "تسجيل النشاط", value: "مفعّل", ok: true },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-gray-700">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${item.ok ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field Wrapper ──────────────────────────────────────────────────
function FieldWrap({ label, icon: Icon, error, children }) {
  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><FaTriangleExclamation className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

// ── Password Strength ──────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "8 أحرف على الأقل",      ok: password.length >= 8 },
    { label: "حرف كبير",              ok: /[A-Z]/.test(password) },
    { label: "حرف صغير",              ok: /[a-z]/.test(password) },
    { label: "رقم",                    ok: /[0-9]/.test(password) },
    { label: "رمز خاص (!@#$...)",      ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const strengthLabel = ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "قوي"][score - 1] || "ضعيف جداً";
  const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  return (
    <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">قوة كلمة المرور</span>
        <span className={`text-xs font-bold ${score >= 4 ? "text-green-600" : score >= 3 ? "text-blue-600" : score >= 2 ? "text-yellow-600" : "text-red-600"}`}>
          {strengthLabel}
        </span>
      </div>
      <div className="flex gap-1 mb-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-gray-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-[11px] ${c.ok ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
            <div className={`w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0 ${c.ok ? "bg-green-100 dark:bg-green-900/40" : "bg-gray-100 dark:bg-gray-700"}`}>
              {c.ok && <FaCircleCheck className="w-2 h-2" />}
            </div>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

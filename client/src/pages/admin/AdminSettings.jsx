import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBuilding, FaPalette, FaGlobe, FaMapPin, FaShareNodes,
  FaEnvelope, FaShieldHalved, FaDatabase, FaCircleInfo,
  FaDownload, FaCloud, FaArrowUpRightFromSquare, FaPlus,
  FaTrash, FaFloppyDisk, FaRotateLeft,
  FaServer, FaCode,
  FaBell, FaToggleOn, FaToggleOff,
  FaEye, FaEyeSlash,
  FaGear, FaCircleCheck, FaCircleXmark, FaHourglassHalf,
  FaTriangleExclamation,
} from "react-icons/fa6";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";
import { fetchSettings, saveSettings } from "../../store/slices/settingsSlice";
import { selectSettings, selectSettingsLoading } from "../../store";

// ─────────────────────────────────────────────
// Settings Groups Config
// ─────────────────────────────────────────────
const groups = [
  {
    key: "company", label: "معلومات الشركة", icon: FaBuilding, color: "blue",
    desc: "بيانات الشركة الأساسية والتواصل",
    fields: [
      { key: "site_name",         label: "اسم التبويب في المتصفح",    type: "text",     placeholder: "الصرح للعقارات" },
      { key: "favicon_url",       label: "أيقونة المتصفح (Favicon)",  type: "image" },
      { key: "company_name_ar",   label: "اسم الشركة (عربي)",         type: "text",     placeholder: "الصرح للتطوير العقاري" },
      { key: "company_name_en",   label: "اسم الشركة (إنجليزي)",      type: "text",     placeholder: "Al-Sarh Real Estate" },
      { key: "company_logo",      label: "شعار الشركة",               type: "image" },
      { key: "company_logo_dark", label: "شعار (نسخة فاتحة)",         type: "image" },
      { key: "company_phone",     label: "الهاتف الرئيسي",            type: "text",     placeholder: "02xxxxxxxx" },
      { key: "company_whatsapp",  label: "واتساب",                    type: "text",     placeholder: "201xxxxxxxxx" },
      { key: "company_email",     label: "البريد الإلكتروني",         type: "email",    placeholder: "info@company.com" },
      { key: "company_address",   label: "العنوان الرئيسي",           type: "text",     placeholder: "القاهرة، مصر الجديدة" },
      { key: "company_founded",   label: "سنة التأسيس",               type: "text",     placeholder: "2010" },
      { key: "company_about",     label: "نبذة عن الشركة",            type: "textarea", placeholder: "اكتب وصفاً مختصراً..." },
    ],
  },
  {
    key: "theme", label: "الألوان والثيم", icon: FaPalette, color: "purple",
    desc: "تخصيص ألوان الموقع والهوية البصرية",
    extra: "theme_presets",
    fields: [
      { key: "primary_color",   label: "اللون الرئيسي",    type: "color", defaultVal: "#8A6924", hint: "الأزرار والروابط" },
      { key: "secondary_color", label: "اللون الثانوي",    type: "color", defaultVal: "#12283C", hint: "الهيدر والخلفيات" },
      { key: "accent_color",    label: "لون التمييز",      type: "color", defaultVal: "#f59e0b", hint: "التنبيهات والإشارات" },
      { key: "secondary_mid",   label: "لون ثانوي متوسط", type: "color", defaultVal: "#1a3d5c" },
      { key: "secondary_light", label: "لون ثانوي فاتح",  type: "color", defaultVal: "#2d5d89" },
    ],
  },
  {
    key: "seo", label: "محركات البحث SEO", icon: FaGlobe, color: "green",
    desc: "إعدادات الظهور في نتائج البحث",
    fields: [
      { key: "meta_title_ar",       label: "عنوان الموقع (عربي)",      type: "text",     placeholder: "الصرح للتطوير العقاري" },
      { key: "meta_description_ar", label: "وصف الموقع (عربي)",        type: "textarea", placeholder: "وصف الشركة والخدمات..." },
      { key: "meta_title_en",       label: "عنوان الموقع (إنجليزي)",   type: "text",     placeholder: "Al-Sarh Real Estate" },
      { key: "og_image",            label: "صورة المشاركة (OG Image)",  type: "image" },
      { key: "google_analytics_id", label: "Google Analytics ID",       type: "text",     placeholder: "G-XXXXXXXXXX" },
      { key: "google_tag_manager",  label: "Google Tag Manager ID",     type: "text",     placeholder: "GTM-XXXXXXX" },
      { key: "facebook_pixel_id",   label: "Facebook Pixel ID",         type: "text",     placeholder: "XXXXXXXXXXXXXXXX" },
      { key: "google_maps_key",     label: "Google Maps API Key",       type: "password", placeholder: "AIza..." },
    ],
  },
  {
    key: "branches", label: "فروع الشركة", icon: FaMapPin, color: "orange",
    desc: "إدارة فروع ومواقع الشركة",
    extra: "branches",
  },
  {
    key: "social", label: "التواصل الاجتماعي", icon: FaShareNodes, color: "pink",
    desc: "روابط حسابات التواصل الاجتماعي",
    fields: [
      { key: "facebook_url",  label: "فيسبوك",    type: "text", placeholder: "https://facebook.com/..." },
      { key: "instagram_url", label: "إنستجرام",  type: "text", placeholder: "https://instagram.com/..." },
      { key: "youtube_url",   label: "يوتيوب",    type: "text", placeholder: "https://youtube.com/..." },
      { key: "tiktok_url",    label: "تيك توك",   type: "text", placeholder: "https://tiktok.com/..." },
      { key: "linkedin_url",  label: "لينكدإن",   type: "text", placeholder: "https://linkedin.com/..." },
      { key: "twitter_url",   label: "تويتر / X", type: "text", placeholder: "https://x.com/..." },
      { key: "snapchat_url",  label: "سناب شات",  type: "text", placeholder: "https://snapchat.com/..." },
      { key: "telegram_url",  label: "تيليجرام",  type: "text", placeholder: "https://t.me/..." },
    ],
  },
  {
    key: "notifications", label: "إشعارات البريد", icon: FaBell, color: "yellow",
    desc: "إعدادات الإشعارات التلقائية بالبريد",
    fields: [
      { key: "notify_new_lead",        label: "إشعار عند عميل جديد",        type: "toggle" },
      { key: "notify_new_task",        label: "إشعار عند مهمة جديدة",       type: "toggle" },
      { key: "notify_new_application", label: "إشعار عند طلب وظيفة جديد",   type: "toggle" },
      { key: "notify_daily_summary",   label: "ملخص يومي بالبريد",          type: "toggle" },
      { key: "notify_email",           label: "البريد للإشعارات",            type: "email", placeholder: "admin@company.com" },
      { key: "notify_whatsapp",        label: "رقم واتساب للإشعارات",       type: "text",  placeholder: "201xxxxxxxxx" },
      { key: "smtp_host",     label: "SMTP Host",     type: "text",     placeholder: "smtp.gmail.com" },
      { key: "smtp_port",     label: "SMTP Port",     type: "text",     placeholder: "587" },
      { key: "smtp_user",     label: "SMTP Username", type: "email",    placeholder: "your@gmail.com" },
      { key: "smtp_pass",     label: "SMTP Password", type: "password", placeholder: "App Password" },
      { key: "smtp_from",     label: "From Name",     type: "text",     placeholder: "الصرح للعقارات" },
    ],
  },
  {
    key: "security", label: "الأمان والتحكم", icon: FaShieldHalved, color: "red",
    desc: "إعدادات الأمان والوصول للنظام",
    fields: [
      { key: "maintenance_mode",     label: "وضع الصيانة (يوقف الموقع العام)",   type: "toggle" },
      { key: "allow_registration",   label: "السماح بالتسجيل الجديد",            type: "toggle" },
      { key: "require_email_verify", label: "التحقق من البريد عند التسجيل",      type: "toggle" },
      { key: "two_factor_auth",      label: "المصادقة الثنائية (2FA)",           type: "toggle" },
      { key: "login_attempts_max",   label: "أقصى محاولات تسجيل دخول فاشلة",    type: "text",  placeholder: "5" },
      { key: "session_timeout_mins", label: "مدة الجلسة بالدقائق",              type: "text",  placeholder: "1440" },
      { key: "allowed_ips",          label: "IPs مسموح بها للأدمن (فصل بسطر)",  type: "textarea", placeholder: "اتركها فارغة للسماح للجميع" },
    ],
  },
  {
    key: "integrations", label: "التكاملات والـ APIs", icon: FaCode, color: "teal",
    desc: "ربط الخدمات الخارجية والـ APIs",
    extra: "integrations_info",
    fields: [
      { key: "cloudinary_cloud",   label: "Cloudinary Cloud Name",         type: "text",     placeholder: "your-cloud" },
      { key: "cloudinary_preset",  label: "Cloudinary Upload Preset",      type: "text",     placeholder: "unsigned_preset" },
      { key: "cloudinary_api_key", label: "Cloudinary API Key",            type: "password", placeholder: "xxxxxxxxx" },
      { key: "firebase_project",   label: "Firebase Project ID",           type: "text",     placeholder: "my-project" },
      { key: "recaptcha_site_key", label: "reCAPTCHA Site Key",            type: "text",     placeholder: "6Le..." },
      { key: "openai_api_key",     label: "OpenAI API Key (للمساعد الذكي)", type: "password", placeholder: "sk-..." },
    ],
  },
  {
    key: "backup", label: "النسخ الاحتياطي", icon: FaDatabase, color: "indigo",
    desc: "تصدير واستيراد البيانات",
    extra: "backup",
  },
  {
    key: "system", label: "معلومات النظام", icon: FaServer, color: "gray",
    desc: "حالة الخادم وبيئة التشغيل",
    extra: "system_info",
  },
];

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",    text: "text-blue-600",    iconBg: "bg-blue-100 dark:bg-blue-900/40" },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600",  iconBg: "bg-purple-100 dark:bg-purple-900/40" },
  green:  { bg: "bg-green-50 dark:bg-green-900/20",   text: "text-green-600",   iconBg: "bg-green-100 dark:bg-green-900/40" },
  orange: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600",  iconBg: "bg-orange-100 dark:bg-orange-900/40" },
  pink:   { bg: "bg-pink-50 dark:bg-pink-900/20",     text: "text-pink-600",    iconBg: "bg-pink-100 dark:bg-pink-900/40" },
  yellow: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600",  iconBg: "bg-yellow-100 dark:bg-yellow-900/40" },
  red:    { bg: "bg-red-50 dark:bg-red-900/20",       text: "text-red-600",     iconBg: "bg-red-100 dark:bg-red-900/40" },
  teal:   { bg: "bg-teal-50 dark:bg-teal-900/20",     text: "text-teal-600",    iconBg: "bg-teal-100 dark:bg-teal-900/40" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600",  iconBg: "bg-indigo-100 dark:bg-indigo-900/40" },
  gray:   { bg: "bg-gray-50 dark:bg-gray-800",         text: "text-gray-600",    iconBg: "bg-gray-100 dark:bg-gray-700" },
};

const themePresets = [
  { name: "ذهبي وبحري",   primary: "#8A6924", secondary: "#12283C", accent: "#DFBA6B", secMid: "#1a3d5c", secLight: "#2d5d89" },
  { name: "أزرق احترافي", primary: "#1d4ed8", secondary: "#0f172a", accent: "#60a5fa", secMid: "#1e3a5f", secLight: "#2563eb" },
  { name: "أخضر طبيعي",   primary: "#16a34a", secondary: "#052e16", accent: "#4ade80", secMid: "#064e3b", secLight: "#15803d" },
  { name: "أحمر عصري",    primary: "#dc2626", secondary: "#1c1917", accent: "#f87171", secMid: "#292524", secLight: "#b91c1c" },
  { name: "بنفسجي فاخر",  primary: "#7c3aed", secondary: "#1e1b4b", accent: "#a78bfa", secMid: "#2e1065", secLight: "#6d28d9" },
  { name: "برتقالي حيوي", primary: "#ea580c", secondary: "#1c0a00", accent: "#fb923c", secMid: "#431407", secLight: "#c2410c" },
];

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-all placeholder:text-gray-400";

export default function AdminSettings() {
  const dispatch = useDispatch();
  const toast = useToast();
  const storeSettings = useSelector(selectSettings);
  const storeLoading = useSelector(selectSettingsLoading);

  const [activeGroup, setActiveGroup] = useState("company");
  const [values, setValues] = useState({});
  const [branches, setBranches] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState({});
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    if (Object.keys(storeSettings).length > 0) {
      setValues(storeSettings);
      try { setBranches(JSON.parse(storeSettings.branches || "[]")); } catch { setBranches([]); }
    }
  }, [storeSettings]);

  useEffect(() => {
    dispatch(fetchSettings());
    loadSystemInfo();
  }, [dispatch]);

  const loadSystemInfo = async () => {
    try {
      const r = await api.get("/health");
      setSystemInfo(r.data);
    } catch {
      setSystemInfo({ status: "unknown" });
    }
  };

  const set = (key, val) => setValues((p) => ({ ...p, [key]: val }));

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const group = groups.find((g) => g.key === activeGroup);
      const updates = {};
      (group?.fields || []).forEach((f) => {
        if (values[f.key] !== undefined) updates[f.key] = values[f.key];
      });
      if (activeGroup === "branches") updates.branches = JSON.stringify(branches);
      await dispatch(saveSettings(updates)).unwrap();
      toast.success("✅ تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("❌ فشل الحفظ — حاول مرة أخرى");
    } finally {
      setSaving(false);
    }
  }, [activeGroup, values, branches, dispatch, toast]);

  const exportData = async (endpoint, name, csv = false) => {
    try {
      const r = await api.get(endpoint);
      const data = Object.values(r.data)?.[0] || r.data;
      let content, mime, ext;
      if (csv && Array.isArray(data)) {
        const keys = Object.keys(data[0] || {});
        content = [keys.join(","), ...data.map((row) => keys.map((k) => `"${row[k] ?? ""}"`).join(","))].join("\n");
        mime = "text/csv"; ext = "csv";
      } else {
        content = JSON.stringify(data, null, 2);
        mime = "application/json"; ext = "json";
      }
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${name}_${Date.now()}.${ext}`; a.click();
      URL.revokeObjectURL(url);
      toast.success(`تم تصدير ${name} بنجاح`);
    } catch { toast.error("فشل التصدير"); }
  };

  const currentGroup = groups.find((g) => g.key === activeGroup);

  if (storeLoading && Object.keys(values).length === 0) {
    return <div className="flex items-center justify-center h-96"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 px-6 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm" style={{ background: "var(--primary)" }}>
                <FaGear />
              </span>
              إعدادات النظام
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 mr-12">تحكم كامل في إعدادات الموقع والنظام</p>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg border border-green-200 dark:border-green-800">
            <FaCircleCheck className="w-3 h-3" /> النظام يعمل بشكل طبيعي
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6" dir="rtl">

          {/* ─── Sidebar ─── */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden md:sticky md:top-20">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">الأقسام</p>
              </div>
              <nav className="p-2">
                {groups.map((g) => {
                  const colors = colorMap[g.color];
                  const isActive = activeGroup === g.key;
                  return (
                    <button key={g.key} onClick={() => setActiveGroup(g.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all text-right
                        ${isActive ? `${colors.bg} ${colors.text} font-semibold` : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? colors.iconBg : "bg-gray-100 dark:bg-gray-800"}`}>
                        <g.icon className={`w-3.5 h-3.5 ${isActive ? colors.text : "text-gray-400"}`} />
                      </span>
                      <span className="truncate text-[13px]">{g.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* ─── Content ─── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeGroup}
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700/60 overflow-hidden"
              >
                {/* Section header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorMap[currentGroup?.color]?.iconBg}`}>
                      {currentGroup && <currentGroup.icon className={`w-4 h-4 ${colorMap[currentGroup?.color]?.text}`} />}
                    </span>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white text-sm">{currentGroup?.label}</h2>
                      <p className="text-xs text-gray-400">{currentGroup?.desc}</p>
                    </div>
                  </div>
                  {currentGroup?.fields && (
                    <SaveButton onClick={handleSave} saving={saving} />
                  )}
                </div>

                <div className="p-6">
                  {/* Theme Presets */}
                  {activeGroup === "theme" && (
                    <ThemePresetsSection values={values} set={set} />
                  )}

                  {/* Regular Fields */}
                  {currentGroup?.fields && (
                    <div className="space-y-5">
                      {currentGroup.fields.map((f) => (
                        <FieldRenderer key={f.key} field={f} value={values[f.key]}
                          onChange={(v) => set(f.key, v)} showPass={showPass}
                          onTogglePass={(k) => setShowPass((p) => ({ ...p, [k]: !p[k] }))} />
                      ))}
                    </div>
                  )}

                  {/* Branches */}
                  {activeGroup === "branches" && (
                    <BranchesEditor branches={branches} onChange={setBranches} onSave={handleSave} saving={saving} />
                  )}

                  {/* Integrations info */}
                  {currentGroup?.extra === "integrations_info" && (
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <div className="flex gap-2">
                        <FaCircleInfo className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">تنبيه أمان</p>
                          <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                            مفاتيح الـ API الحساسة يُفضَّل حفظها في ملف .env على الخادم لحماية أفضل.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Backup */}
                  {activeGroup === "backup" && <BackupPanel exportData={exportData} />}

                  {/* System info */}
                  {activeGroup === "system" && <SystemInfoPanel systemInfo={systemInfo} onRefresh={loadSystemInfo} />}

                  {/* Bottom save */}
                  {currentGroup?.fields && (
                    <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                      <SaveButton onClick={handleSave} saving={saving} large />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function SaveButton({ onClick, saving, large }) {
  return (
    <button onClick={onClick} disabled={saving}
      className={`flex items-center gap-2 text-white font-semibold rounded-xl transition-opacity disabled:opacity-60 ${large ? "px-6 py-2.5 text-sm" : "px-4 py-2 text-xs"}`}
      style={{ background: "var(--primary)" }}>
      {saving ? (
        <><div className={`border-2 border-white/40 border-t-white rounded-full animate-spin ${large ? "w-4 h-4" : "w-3 h-3"}`} /> جاري الحفظ...</>
      ) : (
        <><FaFloppyDisk className={large ? "w-4 h-4" : "w-3 h-3"} /> حفظ التغييرات</>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
function ThemePresetsSection({ values, set }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">قوالب ألوان جاهزة</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {themePresets.map((preset) => (
          <button key={preset.name} onClick={() => {
            set("primary_color", preset.primary);
            set("secondary_color", preset.secondary);
            set("accent_color", preset.accent);
            set("secondary_mid", preset.secMid);
            set("secondary_light", preset.secLight);
          }}
            className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-800 transition-all"
          >
            <div className="flex gap-1">
              {[preset.primary, preset.secondary, preset.accent].map((c) => (
                <span key={c} className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ background: c }} />
              ))}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 truncate">{preset.name}</span>
          </button>
        ))}
      </div>
      {/* Live Preview */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          معاينة مباشرة
        </div>
        <div className="p-4" style={{ background: values.secondary_color || "#12283C" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
              style={{ background: values.primary_color || "#8A6924" }}>ص</div>
            <div>
              <div className="h-2.5 w-24 rounded mb-1.5" style={{ background: values.primary_color || "#8A6924" }} />
              <div className="h-1.5 w-16 rounded opacity-60" style={{ background: values.accent_color || "#f59e0b" }} />
            </div>
            <button className="mr-auto px-3 py-1.5 rounded-lg text-xs text-white font-semibold"
              style={{ background: values.primary_color || "#8A6924" }}>زر تجريبي</button>
          </div>
          <div className="h-0.5 rounded opacity-40" style={{ background: values.accent_color || "#f59e0b" }} />
        </div>
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">ألوان مخصصة</p>
    </div>
  );
}

// ─────────────────────────────────────────────
function FieldRenderer({ field: f, value, onChange, showPass, onTogglePass }) {
  const cls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[color:var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20 transition-all placeholder:text-gray-400";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {f.label}
        {f.hint && <span className="text-xs text-gray-400 font-normal mr-2 opacity-75">— {f.hint}</span>}
      </label>

      {f.type === "toggle" ? (
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <button type="button" onClick={() => onChange(!(value === true || value === "true"))}>
            {(value === true || value === "true")
              ? <FaToggleOn className="w-9 h-9 text-[color:var(--primary)]" />
              : <FaToggleOff className="w-9 h-9 text-gray-300 dark:text-gray-600" />}
          </button>
          <span className={`text-sm ${(value === true || value === "true") ? "text-green-600 dark:text-green-400 font-medium" : "text-gray-400"}`}>
            {(value === true || value === "true") ? "مفعّل" : "غير مفعّل"}
          </span>
        </label>
      ) : f.type === "image" ? (
        <ImageUpload value={value || ""} onChange={onChange} />
      ) : f.type === "color" ? (
        <div className="flex items-center gap-3">
          <input type="color" value={value || f.defaultVal || "#000000"} onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-xl cursor-pointer border border-gray-200 dark:border-gray-600 p-0.5 bg-white dark:bg-gray-800" />
          <input type="text" value={value || f.defaultVal || ""} onChange={(e) => onChange(e.target.value)}
            placeholder={f.defaultVal} className={cls + " flex-1 font-mono uppercase"} maxLength={7} />
          {f.defaultVal && (
            <button type="button" onClick={() => onChange(f.defaultVal)} title="إعادة الافتراضي"
              className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <FaRotateLeft className="w-3 h-3" />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-600 shadow-inner flex-shrink-0"
            style={{ background: value || f.defaultVal || "#000" }} />
        </div>
      ) : f.type === "textarea" ? (
        <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder} className={cls + " resize-none"} />
      ) : f.type === "password" ? (
        <div className="relative">
          <input type={showPass[f.key] ? "text" : "password"} value={value || ""}
            onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder}
            className={cls + " pl-10"} dir="ltr" />
          <button type="button" onClick={() => onTogglePass(f.key)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPass[f.key] ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <input type={f.type || "text"} value={value || ""} onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder} className={cls} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
function BranchesEditor({ branches, onChange, onSave, saving }) {
  const cls = "w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-[color:var(--primary)] transition-all placeholder:text-gray-400";
  const addBranch = () => onChange([...branches, { name: "", phone: "", address: "", hours: "", map_link: "" }]);
  const removeBranch = (i) => onChange(branches.filter((_, idx) => idx !== i));
  const update = (i, key, val) => onChange(branches.map((b, idx) => idx === i ? { ...b, [key]: val } : b));

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">أضف عناوين فروع الشركة — تظهر في صفحة التواصل معنا مع رابط الخريطة.</p>
      {branches.map((br, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 bg-gray-50/30 dark:bg-gray-800/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FaMapPin className="w-3 h-3" /> فرع {i + 1}
            </span>
            <button onClick={() => removeBranch(i)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors">
              <FaTrash className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">اسم الفرع</label>
              <input value={br.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="فرع المعادي" className={cls} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">الهاتف</label>
              <input value={br.phone} onChange={(e) => update(i, "phone", e.target.value)} placeholder="01xxxxxxxxx" className={cls} /></div>
            <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">العنوان</label>
              <input value={br.address} onChange={(e) => update(i, "address", e.target.value)} placeholder="القاهرة، شارع..." className={cls} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">أوقات العمل</label>
              <input value={br.hours} onChange={(e) => update(i, "hours", e.target.value)} placeholder="السبت–الخميس: 9ص – 6م" className={cls} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">رابط الخريطة</label>
              <input value={br.map_link || ""} onChange={(e) => update(i, "map_link", e.target.value)} placeholder="https://maps.google.com/..." className={cls} dir="ltr" /></div>
          </div>
        </div>
      ))}
      <button onClick={addBranch}
        className="flex items-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-500 hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] px-4 py-3 rounded-2xl text-sm font-medium transition-colors w-full justify-center">
        <FaPlus className="w-4 h-4" /> إضافة فرع جديد
      </button>
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
        <SaveButton onClick={onSave} saving={saving} large />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function BackupPanel({ exportData }) {
  const items = [
    { endpoint: "/projects",         name: "projects", label: "المشاريع",     icon: "🏗️", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" },
    { endpoint: "/units",            name: "units",    label: "الوحدات",      icon: "🏠", color: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" },
    { endpoint: "/leads",            name: "leads",    label: "العملاء",      icon: "👥", color: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200", csv: true },
    { endpoint: "/blogs",            name: "blogs",    label: "المقالات",     icon: "📝", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" },
    { endpoint: "/careers",          name: "careers",  label: "الوظائف",      icon: "💼", color: "bg-pink-50 hover:bg-pink-100 text-pink-700 border-pink-200" },
    { endpoint: "/users?limit=1000", name: "users",    label: "المستخدمون",   icon: "👤", color: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200" },
  ];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">تصدير البيانات</p>
        <p className="text-xs text-gray-500 mb-4">احفظ نسخة احتياطية من بيانات الموقع بصيغة JSON أو CSV.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((item) => (
            <button key={item.name} onClick={() => exportData(item.endpoint, item.name, item.csv)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${item.color}`}>
              <span className="text-xl">{item.icon}</span>
              <div className="text-right">
                <div>{item.label}</div>
                <div className="text-[10px] opacity-70">{item.csv ? "تصدير CSV" : "تصدير JSON"}</div>
              </div>
              <FaDownload className="w-3.5 h-3.5 mr-auto" />
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
        <div className="flex gap-2">
          <FaTriangleExclamation className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
            احرص على عمل نسخة احتياطية أسبوعية على الأقل. البيانات المصدّرة يمكن استخدامها لاستعادة المحتوى عند الحاجة.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
function SystemInfoPanel({ systemInfo, onRefresh }) {
  const envInfo = [
    { label: "بيئة التشغيل", value: import.meta.env.MODE === "production" ? "إنتاج (Production)" : "تطوير (Development)" },
    { label: "Cloudinary Cloud", value: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "غير محدد" },
    { label: "API Base URL", value: import.meta.env.VITE_API_URL || "/api" },
    { label: "نسخة التطبيق", value: "1.5.0" },
    { label: "React", value: "18.3.1" },
    { label: "Vite", value: "5.x" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">حالة الخدمات</p>
          <button onClick={onRefresh} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <FaRotateLeft className="w-3 h-3" /> تحديث
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "الموقع العام", icon: FaGlobe, ok: true, desc: "يعمل بشكل طبيعي" },
            { label: "قاعدة البيانات", icon: FaDatabase, ok: systemInfo?.status !== "unknown", desc: systemInfo?.status === "ok" ? "MongoDB متصلة" : "جاري الفحص..." },
            { label: "الخادم (Railway)", icon: FaServer, ok: true, desc: "نشط ومستجيب" },
          ].map((item) => (
            <div key={item.label} className={`flex items-center gap-3 p-3.5 rounded-xl border
              ${item.ok ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
              <item.icon className={`w-4 h-4 ${item.ok ? "text-green-600" : "text-gray-400"}`} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
                <p className={`text-[10px] ${item.ok ? "text-green-600" : "text-gray-400"}`}>{item.desc}</p>
              </div>
              {item.ok
                ? <FaCircleCheck className="w-3.5 h-3.5 text-green-500" />
                : <FaHourglassHalf className="w-3.5 h-3.5 text-gray-400 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">معلومات البيئة</p>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {envInfo.map((item, i) => (
            <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < envInfo.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}>
              <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
              <span className="text-sm font-mono text-gray-900 dark:text-white" dir="ltr">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
        <div className="flex items-center gap-2 mb-2">
          <FaCloud className="w-4 h-4 text-sky-600" />
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">إعداد Cloudinary لرفع الصور</p>
        </div>
        <p className="text-xs text-sky-600/80 dark:text-sky-400/80 mb-2">
          احصل على حساب مجاني من Cloudinary ثم أضف VITE_CLOUDINARY_CLOUD_NAME في ملف .env
        </p>
        <a href="https://cloudinary.com/console" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline">
          <FaArrowUpRightFromSquare className="w-3 h-3" /> فتح لوحة تحكم Cloudinary
        </a>
      </div>
    </div>
  );
}

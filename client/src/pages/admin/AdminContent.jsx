import { useEffect, useState } from "react";
import {
  FaEye, FaFloppyDisk, FaArrowsRotate, FaArrowUpRightFromSquare,
  FaBell, FaPalette, FaCopy, FaCheck,
} from "react-icons/fa6";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ImageUpload from "../../Components/UI/ImageUpload";
import HelpCard from "../../Components/UI/HelpCard";
import { useToast } from "../../context/ToastContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import FormField, { inputCls, TextareaField, ToggleField } from "../../Components/UI/FormField";

// ── Section groups ─────────────────────────────────────────────────────────────
const GROUPS = [
  {
    label: "الصفحة الرئيسية",
    sections: [
      {
        key: "hero",
        label: "الرئيسية — Hero",
        fields: [
          { key: "title_ar",         label: "العنوان الرئيسي (عربي)",         type: "text" },
          { key: "title_en",         label: "العنوان الرئيسي (إنجليزي)",       type: "text" },
          { key: "subtitle_ar",      label: "العنوان الفرعي (عربي)",           type: "textarea" },
          { key: "subtitle_en",      label: "العنوان الفرعي (إنجليزي)",         type: "textarea" },
          { key: "cta_text_ar",      label: "نص زر الدعوة للإجراء",            type: "text" },
          { key: "background_image", label: "صورة خلفية Hero",                  type: "image" },
        ],
      },
      {
        key: "stats",
        label: "الإحصائيات",
        fields: [
          { key: "projects_count",   label: "عدد المشاريع (مثال: +50)",      type: "text" },
          { key: "projects_label",   label: "تسمية المشاريع (مثال: مشروع)",   type: "text" },
          { key: "units_count",      label: "عدد الوحدات (مثال: +2000)",     type: "text" },
          { key: "units_label",      label: "تسمية الوحدات (مثال: وحدة)",     type: "text" },
          { key: "clients_count",    label: "عدد العملاء (مثال: +5000)",     type: "text" },
          { key: "clients_label",    label: "تسمية العملاء (مثال: عميل)",     type: "text" },
          { key: "years_experience", label: "سنوات الخبرة (مثال: +15)",      type: "text" },
          { key: "years_label",      label: "تسمية الخبرة (مثال: سنة خبرة)", type: "text" },
        ],
      },
      {
        key: "home_services",
        label: "خدماتنا",
        fields: [
          { key: "services_title",    label: "عنوان القسم",              type: "text" },
          { key: "services_subtitle", label: "وصف القسم",               type: "textarea" },
          { key: "service1_title",    label: "خدمة 1 — العنوان",        type: "text" },
          { key: "service1_desc",     label: "خدمة 1 — الوصف",         type: "textarea" },
          { key: "service1_icon",     label: "خدمة 1 — الأيقونة (رمز)", type: "text" },
          { key: "service2_title",    label: "خدمة 2 — العنوان",        type: "text" },
          { key: "service2_desc",     label: "خدمة 2 — الوصف",         type: "textarea" },
          { key: "service2_icon",     label: "خدمة 2 — الأيقونة (رمز)", type: "text" },
          { key: "service3_title",    label: "خدمة 3 — العنوان",        type: "text" },
          { key: "service3_desc",     label: "خدمة 3 — الوصف",         type: "textarea" },
          { key: "service3_icon",     label: "خدمة 3 — الأيقونة (رمز)", type: "text" },
          { key: "service4_title",    label: "خدمة 4 — العنوان",        type: "text" },
          { key: "service4_desc",     label: "خدمة 4 — الوصف",         type: "textarea" },
          { key: "service4_icon",     label: "خدمة 4 — الأيقونة (رمز)", type: "text" },
        ],
      },
      {
        key: "home_cta",
        label: "قسم الدعوة للتواصل",
        fields: [
          { key: "cta_title",       label: "عنوان القسم",          type: "text" },
          { key: "cta_subtitle",    label: "وصف القسم",            type: "textarea" },
          { key: "cta_button_text", label: "نص الزر الرئيسي",      type: "text" },
          { key: "cta_button_link", label: "رابط الزر الرئيسي",    type: "text" },
          { key: "cta_phone",       label: "رقم هاتف (للعرض)",     type: "text" },
          { key: "cta_image",       label: "صورة القسم",           type: "image" },
        ],
      },
    ],
  },
  {
    label: "صفحات المحتوى",
    sections: [
      {
        key: "about",
        label: "عن الشركة",
        fields: [
          { key: "title_ar",     label: "العنوان (عربي)",          type: "text" },
          { key: "body_ar",      label: "النص الرئيسي (عربي)",     type: "textarea" },
          { key: "vision_ar",    label: "الرؤية (عربي)",           type: "textarea" },
          { key: "mission_ar",   label: "الرسالة (عربي)",          type: "textarea" },
          { key: "image",        label: "صورة الشركة",              type: "image" },
          { key: "founded_year", label: "سنة التأسيس",             type: "text" },
        ],
      },
      {
        key: "about_hero",
        label: "عن الشركة — الهيدر",
        fields: [
          { key: "title_ar",    label: "عنوان الهيدر",    type: "text" },
          { key: "subtitle_ar", label: "الوصف",           type: "textarea" },
          { key: "hero_image",  label: "صورة الهيدر",     type: "image" },
        ],
      },
      {
        key: "projects_page",
        label: "صفحة المشاريع",
        fields: [
          { key: "title_ar",    label: "عنوان الصفحة",    type: "text" },
          { key: "subtitle_ar", label: "وصف الصفحة",      type: "textarea" },
          { key: "hero_image",  label: "صورة الهيدر",     type: "image" },
        ],
      },
      {
        key: "units_page",
        label: "صفحة الوحدات",
        fields: [
          { key: "title_ar",    label: "عنوان الصفحة",    type: "text" },
          { key: "subtitle_ar", label: "وصف الصفحة",      type: "textarea" },
          { key: "hero_image",  label: "صورة الهيدر",     type: "image" },
        ],
      },
      {
        key: "blog_page",
        label: "صفحة الأخبار والمقالات",
        fields: [
          { key: "title_ar",    label: "عنوان الصفحة",    type: "text" },
          { key: "subtitle_ar", label: "وصف الصفحة",      type: "textarea" },
          { key: "hero_image",  label: "صورة الهيدر",     type: "image" },
        ],
      },
      {
        key: "careers_page",
        label: "صفحة الوظائف",
        fields: [
          { key: "title_ar",    label: "عنوان الصفحة",    type: "text" },
          { key: "subtitle_ar", label: "وصف الصفحة",      type: "textarea" },
          { key: "image",       label: "صورة الصفحة",     type: "image" },
        ],
      },
    ],
  },
  {
    label: "التواصل والتذييل",
    sections: [
      {
        key: "contact",
        label: "معلومات التواصل",
        fields: [
          { key: "phone",             label: "رقم الهاتف",                type: "text", hint: "رقم الواتساب بصيغة دولية مثال: 201234567890" },
          { key: "phone2",            label: "رقم هاتف إضافي",            type: "text" },
          { key: "whatsapp",          label: "واتساب",                    type: "text", hint: "رقم الواتساب بصيغة دولية مثال: 201234567890" },
          { key: "whatsapp2",         label: "واتساب إضافي",              type: "text" },
          { key: "email",             label: "البريد الإلكتروني",         type: "text" },
          { key: "address_ar",        label: "العنوان (عربي)",            type: "text" },
          { key: "working_hours",     label: "أوقات العمل",               type: "text" },
          { key: "facebook",          label: "فيسبوك",                    type: "text" },
          { key: "instagram",         label: "إنستجرام",                  type: "text" },
          { key: "youtube",           label: "يوتيوب",                    type: "text" },
          { key: "tiktok",            label: "TikTok",                    type: "text" },
          { key: "linkedin",          label: "LinkedIn",                  type: "text" },
          { key: "twitter",           label: "Twitter / X",               type: "text" },
          { key: "google_maps_link",  label: "رابط Google Maps",          type: "text" },
          { key: "map_embed",         label: "رابط Google Maps embed",    type: "text" },
        ],
      },
      {
        key: "footer",
        label: "الفوتر",
        fields: [
          { key: "companyName",        label: "اسم الشركة",          type: "text" },
          { key: "companyDesc",        label: "وصف الشركة",          type: "textarea" },
          { key: "footer_description", label: "وصف التذييل",         type: "textarea" },
          { key: "copyright_text",     label: "نص حقوق الملكية",     type: "text" },
          { key: "footer_links_title", label: "عنوان روابط التذييل", type: "text" },
          { key: "phone",              label: "رقم الهاتف",           type: "text" },
          { key: "email",              label: "البريد الإلكتروني",   type: "text" },
          { key: "address",            label: "العنوان",              type: "text" },
        ],
      },
    ],
  },
  {
    label: "الإعدادات",
    sections: [
      {
        key: "login_page",
        label: "صفحة تسجيل الدخول",
        fields: [
          { key: "heroTitle",    label: "العنوان الرئيسي",    type: "text" },
          { key: "heroSubtitle", label: "العنوان الفرعي",     type: "text" },
          { key: "heroTagline",  label: "الشعار / الوصف",    type: "text" },
          { key: "heroImage",    label: "صورة الخلفية",       type: "image" },
          { key: "logo_url",     label: "شعار الشركة (Logo)", type: "image", hint: "رابط صورة شعار الشركة يظهر في صفحة تسجيل الدخول" },
        ],
      },
      {
        key: "theme",
        label: "الألوان والثيم",
        fields: [
          { key: "primary_color",     label: "اللون الرئيسي",    type: "color", hint: "اللون الرئيسي للموقع — يؤثر على الهيدر والأزرار والروابط" },
          { key: "secondary_color",   label: "اللون الثانوي",    type: "color", hint: "اللون الثانوي — يُستخدم في خلفيات الـ gradient" },
          { key: "accent_color",      label: "لون التمييز",      type: "color", hint: "لون الأزرار البارزة والتمييز — عادةً لون ذهبي أو برتقالي" },
          { key: "font_family",       label: "نوع الخط",         type: "text", hint: "مثال: Tajawal أو Cairo" },
          { key: "show_whatsapp_btn", label: "إظهار زر واتساب العائم", type: "toggle" },
          { key: "nav_logo_text",     label: "اسم الشركة في الهيدر", type: "text" },
          { key: "whatsapp_number",   label: "رقم واتساب (للزر العائم)", type: "text", hint: "مثال: 201234567890 — بدون + وبصيغة دولية" },
        ],
      },
      {
        key: "popup_announcement",
        label: "إعلان منبثق",
        fields: [
          { key: "popup_enabled",     label: "تفعيل الإعلان المنبثق", type: "toggle", hint: "عند التفعيل سيظهر للزوار الجدد تلقائياً بعد 1.2 ثانية" },
          { key: "popup_title",       label: "عنوان الإعلان",  type: "text" },
          { key: "popup_message",     label: "نص الإعلان",     type: "textarea" },
          { key: "popup_button_text", label: "نص الزر",        type: "text", hint: "اتركه فارغاً لإخفاء الزر" },
          { key: "popup_button_link", label: "رابط الزر",      type: "text", hint: "رابط داخلي مثال: /projects أو رابط خارجي مثال: https://..." },
        ],
      },
    ],
  },
];

// Flat list for lookup
const sections = GROUPS.flatMap((g) => g.sections);

// Section → public URL mapping for preview
const SECTION_URLS = {
  hero: "/",
  stats: "/",
  home_services: "/",
  home_cta: "/",
  about: "/about",
  about_hero: "/about",
  projects_page: "/projects",
  units_page: "/projects",
  blog_page: "/blog",
  careers_page: "/careers",
  contact: "/contact",
  footer: "/",
  login_page: "/admin/login",
  theme: "/",
  popup_announcement: "/",
};

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyBtn({ value }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(String(value))
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success("تم النسخ"); })
      .catch(() => toast.error("فشل النسخ"));
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="نسخ"
      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-[color:var(--primary)] hover:border-[color:var(--primary)] transition-colors"
    >
      {copied ? <FaCheck className="w-3.5 h-3.5 text-green-500" /> : <FaCopy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function AdminContent() {
  const toast = useToast();
  const { refreshTheme } = useSiteSettings();
  const [activeSection, setActiveSection] = useState(sections[0].key);
  const [sectionSearch, setSectionSearch] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSection = async (key) => {
    setLoading(true);
    try {
      const res = await api.get(`/content/${key}`);
      setData(res.data.data || {});
    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSection(activeSection); setIsDirty(false); }, [activeSection]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/content/${activeSection}`, data);
      toast.success("تم حفظ المحتوى — سيظهر التغيير فوراً على الموقع");
      setLastSaved(new Date());
      setIsDirty(false);
      if (activeSection === "theme") refreshTheme?.();
    } catch {
      toast.error("فشل الحفظ — تحقق من اتصال الشبكة");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("هل تريد إعادة تعيين هذا القسم وتحميل البيانات المحفوظة من السيرفر؟")) return;
    loadSection(activeSection);
    toast.success("تم إعادة تحميل البيانات");
  };

  const getCompletion = (sectionKey) => {
    const sec = sections.find((s) => s.key === sectionKey);
    if (!sec || sectionKey !== activeSection) return null;
    const textFields = sec.fields.filter((f) => f.type !== "image");
    if (!textFields.length) return null;
    const filled = textFields.filter((f) => data[f.key]?.toString().trim()).length;
    return { filled, total: textFields.length };
  };

  const filteredGroups = sectionSearch.trim()
    ? GROUPS.map((g) => ({
        ...g,
        sections: g.sections.filter((s) => s.label.includes(sectionSearch.trim())),
      })).filter((g) => g.sections.length > 0)
    : GROUPS;

  const currentSection = sections.find((s) => s.key === activeSection);
  const isToggleOn = (val) => val === "true" || val === true;

  return (
    <div className="space-y-5">
      <HelpCard
        title="دليل إدارة محتوى الموقع"
        tips={[
          "اختر القسم من القائمة اليسرى لتعديل نصوصه وصوره",
          "التغييرات تظهر فوراً على الموقع بعد الحفظ",
          "صور التذييل والهيدر يجب أن تكون بجودة عالية (1920×1080 على الأقل)",
          "رقم واتساب بصيغة دولية: ابدأ بـ 20 بدلاً من 0 (مثال: 201234567890)",
          "لون التمييز يؤثر على الأزرار والروابط في الموقع",
        ]}
      />

      <PageHeader
        title="إدارة المحتوى"
        subtitle="تحكم في محتوى الموقع بالكامل بدون كود — التغييرات فورية"
        icon={<FaPalette />}
        actions={
          <>
            {isDirty && (
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full font-medium animate-pulse">
                تغييرات غير محفوظة
              </span>
            )}
            {lastSaved && !isDirty && (
              <span className="text-xs text-gray-400">
                آخر حفظ: {lastSaved.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <SecondaryButton
              icon={<FaEye className="w-4 h-4" />}
              onClick={() => window.open("/", "_blank")}
            >
              <span className="hidden sm:inline">معاينة الموقع</span>
            </SecondaryButton>
            <PrimaryButton
              icon={<FaFloppyDisk className="w-4 h-4" />}
              onClick={handleSave}
              loading={saving}
              style={{ background: isDirty ? "#f59e0b" : "var(--primary)" }}
            >
              {saving ? "جاري..." : "حفظ"}
            </PrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 px-6 pb-6">
        {/* Section sidebar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 h-fit">
          <div className="relative mb-2 hidden lg:block">
            <input
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              placeholder="بحث في الأقسام..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]/30 text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {filteredGroups.map((group) => (
              <div key={group.label} className="flex lg:flex-col gap-1 flex-shrink-0 lg:flex-shrink-0">
                <div className="hidden lg:block px-3 pt-3 pb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{group.label}</p>
                </div>
                {group.sections.map((s) => {
                  const comp = activeSection === s.key ? getCompletion(s.key) : null;
                  return (
                    <button
                      key={s.key}
                      onClick={() => setActiveSection(s.key)}
                      className={`flex-shrink-0 lg:flex-shrink text-right px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-between gap-2 ${
                        activeSection === s.key
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      style={activeSection === s.key ? { background: "var(--primary)" } : {}}
                    >
                      <span>{s.label}</span>
                      {comp && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-mono ${comp.filled === comp.total ? "bg-white/20" : "bg-white/10"}`}>
                          {comp.filled}/{comp.total}
                        </span>
                      )}
                    </button>
                  );
                })}
                <div className="hidden lg:block h-px bg-gray-100 dark:bg-gray-700 my-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Fields panel */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700 flex-wrap gap-2">
            <h2 className="font-bold text-gray-900 dark:text-white">{currentSection?.label}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
                التغييرات فورية على الموقع
              </span>
              {SECTION_URLS[activeSection] && (
                <a
                  href={SECTION_URLS[activeSection]}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <FaArrowUpRightFromSquare className="w-3 h-3" />
                  معاينة
                </a>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FaArrowsRotate className="w-3 h-3" />
                إعادة تعيين
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner className="h-32" />
          ) : (
            <div className="space-y-5">
              {/* Theme live preview */}
              {activeSection === "theme" && (data.primary_color || data.accent_color) && (
                <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs font-semibold text-gray-500 mb-3">معاينة مباشرة للألوان</p>
                  <div className="flex flex-wrap gap-3 items-center">
                    {[
                      { label: "الرئيسي", key: "primary_color", fallback: "var(--primary)" },
                      { label: "الثانوي",  key: "secondary_color", fallback: "#1a3d5c" },
                      { label: "التمييز",  key: "accent_color", fallback: "#f59e0b" },
                    ].map(({ label, key, fallback }) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg shadow border border-white/20"
                          style={{ background: data[key] || fallback }} />
                        <span className="text-xs text-gray-600 dark:text-gray-300">{label}</span>
                        <code className="text-[10px] text-gray-400 font-mono">{data[key] || fallback}</code>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">احفظ لتطبيق الألوان على الموقع فوراً</p>
                </div>
              )}

              {/* Popup preview */}
              {activeSection === "popup_announcement" && isToggleOn(data.popup_enabled) && data.popup_title && (
                <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-xs font-semibold text-amber-600 mb-2 flex items-center gap-1">
                    <FaBell className="w-3.5 h-3.5" /> معاينة الإعلان المنبثق
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 max-w-xs">
                    <p className="font-bold text-sm text-gray-900 dark:text-white mb-1">{data.popup_title}</p>
                    {data.popup_message && <p className="text-xs text-gray-500 leading-relaxed">{data.popup_message}</p>}
                    {data.popup_button_text && (
                      <div className="mt-2">
                        <span className="text-xs px-3 py-1 rounded-lg text-white font-medium" style={{ background: "var(--primary)" }}>
                          {data.popup_button_text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentSection?.fields.map((field) => (
                <FormField key={field.key} label={field.label} hint={field.hint}>
                  {field.type === "image" ? (
                    <ImageUpload
                      value={data[field.key] || ""}
                      onChange={(url) => { setData({ ...data, [field.key]: url }); setIsDirty(true); }}
                    />
                  ) : field.type === "toggle" ? (
                    <ToggleField
                      checked={isToggleOn(data[field.key])}
                      onChange={(val) => { setData({ ...data, [field.key]: val ? "true" : "false" }); setIsDirty(true); }}
                      label={isToggleOn(data[field.key]) ? "مفعّل" : "معطّل"}
                    />
                  ) : field.type === "color" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={(data[field.key] || "var(--primary)").replace(/[^#0-9a-fA-F]/g, "").slice(0, 7) || "var(--primary)"}
                        onChange={(e) => { setData({ ...data, [field.key]: e.target.value }); setIsDirty(true); }}
                        className="w-12 h-10 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-700"
                        title="اختر اللون"
                      />
                      <input
                        type="text"
                        value={data[field.key] || ""}
                        onChange={(e) => { setData({ ...data, [field.key]: e.target.value }); setIsDirty(true); }}
                        placeholder="var(--primary)"
                        className={inputCls + " font-mono flex-1 uppercase"}
                        maxLength={7}
                      />
                      <CopyBtn value={data[field.key] || ""} />
                    </div>
                  ) : field.type === "textarea" ? (
                    <>
                      <TextareaField
                        value={data[field.key] || ""}
                        rows={3}
                        onChange={(e) => {
                          setData({ ...data, [field.key]: e.target.value });
                          setIsDirty(true);
                          e.target.style.height = "auto";
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onFocus={(e) => { e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
                        style={{ overflow: "hidden" }}
                      />
                      <p className="text-xs text-gray-400 mt-1 text-left">{(data[field.key] || "").length} حرف</p>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={data[field.key] || ""}
                        onChange={(e) => { setData({ ...data, [field.key]: e.target.value }); setIsDirty(true); }}
                        className={inputCls}
                      />
                      <CopyBtn value={data[field.key] || ""} />
                    </div>
                  )}
                </FormField>
              ))}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <PrimaryButton
                  icon={<FaFloppyDisk className="w-4 h-4" />}
                  onClick={handleSave}
                  loading={saving}
                >
                  {saving ? "جاري الحفظ..." : "حفظ هذا القسم"}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

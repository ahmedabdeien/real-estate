import { useEffect, useState } from "react";
import { Save, Eye, Image as ImageIcon, AlignLeft, Type, Megaphone, Bell, Copy, RotateCcw, ExternalLink } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ImageUpload from "../../Components/UI/ImageUpload";
import HelpCard from "../../Components/UI/HelpCard";
import { useToast } from "../../context/ToastContext";

// Sections organized into logical groups
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
          { key: "projects_count",   label: "عدد المشاريع (مثال: +50)",   type: "text" },
          { key: "projects_label",   label: "تسمية المشاريع (مثال: مشروع)", type: "text" },
          { key: "units_count",      label: "عدد الوحدات (مثال: +2000)",  type: "text" },
          { key: "units_label",      label: "تسمية الوحدات (مثال: وحدة)",  type: "text" },
          { key: "clients_count",    label: "عدد العملاء (مثال: +5000)",  type: "text" },
          { key: "clients_label",    label: "تسمية العملاء (مثال: عميل)", type: "text" },
          { key: "years_experience", label: "سنوات الخبرة (مثال: +15)",   type: "text" },
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
        icon: Megaphone,
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
        label: "الألوان والأزرار",
        fields: [
          { key: "primary_color",     label: "اللون الرئيسي (hex مثال: #2d5d89)", type: "text", hint: "اللون الرئيسي للموقع بصيغة HEX مثال: #2d5d89" },
          { key: "secondary_color",   label: "اللون الثانوي (hex مثال: #f59e0b)", type: "text" },
          { key: "accent_color",      label: "لون التمييز",                       type: "text" },
          { key: "font_family",       label: "نوع الخط",                          type: "text" },
          { key: "show_whatsapp_btn", label: "إظهار زر واتساب العائم",            type: "text" },
          { key: "cta_text",          label: "نص زر الدعوة للإجراء (الرئيسية)",   type: "text" },
          { key: "cta_secondary",     label: "نص الزر الثانوي (تواصل معنا)",      type: "text" },
          { key: "nav_logo_text",     label: "اسم الشركة في القائمة العلوية",     type: "text" },
          { key: "whatsapp_number",   label: "رقم واتساب (للزر العائم)",          type: "text", hint: "رقم الواتساب بصيغة دولية مثال: 201234567890" },
        ],
      },
      {
        key: "popup_announcement",
        label: "إعلان منبثق",
        icon: Bell,
        fields: [
          { key: "popup_enabled",     label: "تفعيل الإعلان",  type: "text" },
          { key: "popup_title",       label: "عنوان الإعلان",  type: "text" },
          { key: "popup_message",     label: "نص الإعلان",     type: "textarea" },
          { key: "popup_button_text", label: "نص الزر",        type: "text" },
          { key: "popup_button_link", label: "رابط الزر",      type: "text" },
        ],
      },
    ],
  },
];

// Flat list for lookup
const sections = GROUPS.flatMap((g) => g.sections);

const typeIcon = { text: Type, textarea: AlignLeft, image: ImageIcon };

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

export default function AdminContent() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState(sections[0].key);

  const copyToClipboard = (val) => {
    if (!val) return;
    navigator.clipboard.writeText(String(val))
      .then(() => toast.success("تم النسخ"))
      .catch(() => toast.error("فشل النسخ"));
  };

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

  useEffect(() => { loadSection(activeSection); }, [activeSection]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/content/${activeSection}`, data);
      toast.success("تم حفظ المحتوى — سيظهر التغيير فوراً على الموقع");
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

  const currentSection = sections.find((s) => s.key === activeSection);
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm";

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المحتوى</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">تحكم في محتوى الموقع بالكامل بدون كود — التغييرات فورية</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank"
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 px-3 sm:px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">معاينة الموقع</span>
          </a>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? "جاري..." : "حفظ"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Section Tabs — Grouped */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {GROUPS.map((group) => (
              <div key={group.label} className="flex lg:flex-col gap-1 flex-shrink-0 lg:flex-shrink-0">
                {/* Group header */}
                <div className="hidden lg:block px-3 pt-3 pb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{group.label}</p>
                </div>
                {group.sections.map((s) => (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    className={`flex-shrink-0 lg:flex-shrink text-right px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                      activeSection === s.key
                        ? "bg-[#2d5d89] text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}>
                    {s.label}
                  </button>
                ))}
                <div className="hidden lg:block h-px bg-gray-100 dark:bg-gray-700 my-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Fields */}
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
                  <ExternalLink className="w-3 h-3" />
                  معاينة
                </a>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                إعادة تعيين
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingSpinner className="h-32" />
          ) : (
            <div className="space-y-5">
              {currentSection?.fields.map((field) => {
                const FieldIcon = typeIcon[field.type] || Type;
                return (
                  <div key={field.key}>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      <FieldIcon className="w-3.5 h-3.5 text-gray-400" />
                      {field.label}
                    </label>

                    {field.type === "image" ? (
                      <ImageUpload
                        value={data[field.key] || ""}
                        onChange={(url) => setData({ ...data, [field.key]: url })}
                      />
                    ) : field.type === "textarea" ? (
                      <>
                        <textarea rows={3} value={data[field.key] || ""}
                          onChange={(e) => {
                            setData({ ...data, [field.key]: e.target.value });
                            e.target.style.height = "auto";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onFocus={(e) => { e.target.style.height = "auto"; e.target.style.height = `${e.target.scrollHeight}px`; }}
                          className={inputClass + " resize-none overflow-hidden"} />
                        <p className="text-xs text-gray-400 mt-1 text-left">{(data[field.key] || "").length} حرف</p>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input type="text" value={data[field.key] || ""}
                          onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                          className={inputClass} />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(data[field.key] || "")}
                          title="نسخ"
                          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-600 text-gray-400 hover:text-[#2d5d89] hover:border-[#2d5d89] transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {field.hint && <p className="text-xs text-gray-400 mt-1">{field.hint}</p>}
                  </div>
                );
              })}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? "جاري الحفظ..." : "حفظ هذا القسم"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

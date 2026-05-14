import { useEffect, useState } from "react";
import { Save, Eye, Image as ImageIcon, AlignLeft, Type } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";

const sections = [
  {
    key: "login_page",
    label: "صفحة تسجيل الدخول",
    fields: [
      { key: "heroTitle",    label: "العنوان الرئيسي",    type: "text" },
      { key: "heroSubtitle", label: "العنوان الفرعي",     type: "text" },
      { key: "heroTagline",  label: "الشعار / الوصف",    type: "text" },
      { key: "heroImage",    label: "صورة الخلفية (URL)", type: "image" },
    ],
  },
  {
    key: "footer",
    label: "الفوتر — معلومات الشركة",
    fields: [
      { key: "companyName", label: "اسم الشركة",         type: "text" },
      { key: "companyDesc", label: "وصف الشركة",         type: "textarea" },
      { key: "phone",       label: "رقم الهاتف",          type: "text" },
      { key: "email",       label: "البريد الإلكتروني",  type: "text" },
      { key: "address",     label: "العنوان",             type: "text" },
    ],
  },
  {
    key: "hero",
    label: "الصفحة الرئيسية — Hero",
    fields: [
      { key: "title_ar",          label: "العنوان الرئيسي (عربي)",         type: "text" },
      { key: "title_en",          label: "العنوان الرئيسي (إنجليزي)",       type: "text" },
      { key: "subtitle_ar",       label: "العنوان الفرعي (عربي)",           type: "textarea" },
      { key: "subtitle_en",       label: "العنوان الفرعي (إنجليزي)",         type: "textarea" },
      { key: "cta_text_ar",       label: "نص زر الدعوة للإجراء",            type: "text" },
      { key: "background_image",  label: "صورة خلفية Hero",                  type: "image" },
    ],
  },
  {
    key: "stats",
    label: "إحصائيات الرئيسية",
    fields: [
      { key: "projects_count",   label: "عدد المشاريع (مثال: +50)",   type: "text" },
      { key: "units_count",      label: "عدد الوحدات (مثال: +2000)",  type: "text" },
      { key: "clients_count",    label: "عدد العملاء (مثال: +5000)",  type: "text" },
      { key: "years_experience", label: "سنوات الخبرة (مثال: +15)",   type: "text" },
    ],
  },
  {
    key: "about",
    label: "صفحة عن الشركة",
    fields: [
      { key: "title_ar",       label: "العنوان (عربي)",          type: "text" },
      { key: "body_ar",        label: "النص الرئيسي (عربي)",     type: "textarea" },
      { key: "vision_ar",      label: "الرؤية (عربي)",           type: "textarea" },
      { key: "mission_ar",     label: "الرسالة (عربي)",          type: "textarea" },
      { key: "image",          label: "صورة الشركة",              type: "image" },
      { key: "founded_year",   label: "سنة التأسيس",             type: "text" },
    ],
  },
  {
    key: "contact",
    label: "معلومات التواصل",
    fields: [
      { key: "phone",          label: "رقم الهاتف",              type: "text" },
      { key: "whatsapp",       label: "واتساب",                   type: "text" },
      { key: "email",          label: "البريد الإلكتروني",        type: "text" },
      { key: "address_ar",     label: "العنوان (عربي)",           type: "text" },
      { key: "working_hours",  label: "أوقات العمل",              type: "text" },
      { key: "facebook",       label: "فيسبوك",                   type: "text" },
      { key: "instagram",      label: "إنستجرام",                 type: "text" },
      { key: "youtube",        label: "يوتيوب",                   type: "text" },
      { key: "map_embed",      label: "رابط Google Maps embed",  type: "text" },
    ],
  },
];

const typeIcon = { text: Type, textarea: AlignLeft, image: ImageIcon };

export default function AdminContent() {
  const toast = useToast();
  const [activeSection, setActiveSection] = useState(sections[0].key);
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
      toast.success("✅ تم حفظ المحتوى — سيظهر التغيير فوراً على الموقع");
    } catch {
      toast.error("فشل الحفظ — تحقق من اتصال الشبكة");
    } finally {
      setSaving(false);
    }
  };

  const currentSection = sections.find((s) => s.key === activeSection);
  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm";

  return (
    <div className="space-y-5">
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
        {/* Section Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 h-fit">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
            {sections.map((s) => (
              <button key={s.key} onClick={() => setActiveSection(s.key)}
                className={`flex-shrink-0 lg:flex-shrink text-right px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                  activeSection === s.key
                    ? "bg-[#2d5d89] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fields */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-gray-900 dark:text-white">{currentSection?.label}</h2>
            <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
              التغييرات فورية على الموقع
            </span>
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
                      <textarea rows={3} value={data[field.key] || ""}
                        onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                        className={inputClass + " resize-none"} />
                    ) : (
                      <input type="text" value={data[field.key] || ""}
                        onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
                        className={inputClass} />
                    )}
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

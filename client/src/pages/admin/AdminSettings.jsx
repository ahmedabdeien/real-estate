import { useEffect, useState } from "react";
import { Save, Globe, Share2, Building2, Palette, MapPin, Plus, Trash2 } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../Components/UI/LoadingSpinner";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";

const settingsGroups = [
  {
    key: "company",
    label: "معلومات الشركة",
    icon: Building2,
    settings: [
      { key: "company_name_ar",   label: "اسم الشركة (عربي)",        type: "text" },
      { key: "company_name_en",   label: "اسم الشركة (إنجليزي)",      type: "text" },
      { key: "company_logo",      label: "شعار الشركة",               type: "image" },
      { key: "company_phone",     label: "الهاتف الرئيسي",            type: "text" },
      { key: "company_whatsapp",  label: "واتساب",                    type: "text" },
      { key: "company_email",     label: "البريد الإلكتروني",          type: "email" },
      { key: "company_address",   label: "العنوان",                    type: "text" },
    ],
  },
  {
    key: "theme",
    label: "ألوان الموقع",
    icon: Palette,
    settings: [
      { key: "primary_color", label: "اللون الرئيسي (أزرق افتراضي #2d5d89)",  type: "color", defaultVal: "#2d5d89" },
      { key: "accent_color",  label: "اللون المميز (ذهبي افتراضي #f59e0b)",    type: "color", defaultVal: "#f59e0b" },
    ],
  },
  {
    key: "seo",
    label: "محركات البحث SEO",
    icon: Globe,
    settings: [
      { key: "meta_title_ar",         label: "عنوان الموقع (عربي)",       type: "text" },
      { key: "meta_description_ar",   label: "وصف الموقع (عربي)",          type: "textarea" },
      { key: "meta_title_en",         label: "عنوان الموقع (إنجليزي)",     type: "text" },
      { key: "google_analytics_id",   label: "Google Analytics ID",        type: "text" },
      { key: "facebook_pixel_id",     label: "Facebook Pixel ID",          type: "text" },
    ],
  },
  {
    key: "branches",
    label: "فروع الشركة",
    icon: MapPin,
    settings: [], // handled separately
  },
  {
    key: "social",
    label: "التواصل الاجتماعي",
    icon: Share2,
    settings: [
      { key: "facebook_url",   label: "فيسبوك",     type: "text" },
      { key: "instagram_url",  label: "إنستجرام",   type: "text" },
      { key: "youtube_url",    label: "يوتيوب",     type: "text" },
      { key: "tiktok_url",     label: "تيك توك",    type: "text" },
      { key: "linkedin_url",   label: "لينكدإن",    type: "text" },
      { key: "twitter_url",    label: "تويتر / X",  type: "text" },
    ],
  },
];

const emptyBranch = { name: "", address: "", phone: "", hours: "", map_link: "" };

export default function AdminSettings() {
  const toast = useToast();
  const [activeGroup, setActiveGroup] = useState(settingsGroups[0].key);
  const [values, setValues] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings")
      .then((r) => {
        const s = r.data.settings || {};
        setValues(s);
        try {
          const b = s.branches ? JSON.parse(s.branches) : [];
          setBranches(Array.isArray(b) ? b : []);
        } catch { setBranches([]); }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeGroup === "branches") {
        await api.post("/settings/bulk", {
          settings: [{ key: "branches", value: JSON.stringify(branches), group: "branches", label: "فروع الشركة" }],
        });
      } else {
        const group = settingsGroups.find((g) => g.key === activeGroup);
        const settings = group.settings.map(({ key, label }) => ({
          key, value: values[key] ?? "", group: activeGroup, label,
        }));
        await api.post("/settings/bulk", { settings });
      }
      toast.success("✅ تم حفظ الإعدادات بنجاح");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const addBranch = () => setBranches((b) => [...b, { ...emptyBranch }]);
  const removeBranch = (i) => setBranches((b) => b.filter((_, idx) => idx !== i));
  const updateBranch = (i, key, val) =>
    setBranches((b) => b.map((br, idx) => idx === i ? { ...br, [key]: val } : br));

  const set = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));
  const currentGroup = settingsGroups.find((g) => g.key === activeGroup);

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إعدادات الموقع</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">تحكم في كل إعدادات الموقع بدون كود</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>

      {loading ? <LoadingSpinner className="h-64" size="lg" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 h-fit">
            {settingsGroups.map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveGroup(key)}
                className={`w-full flex items-center gap-3 text-right px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeGroup === key
                    ? "bg-[#2d5d89] text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
              {currentGroup?.label}
            </h2>

            {/* Branches special UI */}
            {activeGroup === "branches" ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">أضف عناوين فروع الشركة — تظهر في صفحة التواصل معنا مع رابط الخريطة.</p>
                {branches.map((br, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-2xl p-4 space-y-3 relative">
                    <button onClick={() => removeBranch(i)}
                      className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <p className="text-xs font-semibold text-gray-500 uppercase">فرع {i + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">اسم الفرع</label>
                        <input value={br.name} onChange={(e) => updateBranch(i, "name", e.target.value)}
                          placeholder="مثال: فرع المعادي" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">الهاتف</label>
                        <input value={br.phone} onChange={(e) => updateBranch(i, "phone", e.target.value)}
                          placeholder="01xxxxxxxxx" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">العنوان</label>
                        <input value={br.address} onChange={(e) => updateBranch(i, "address", e.target.value)}
                          placeholder="مثال: القاهرة، المعادي، شارع 9" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">أوقات العمل</label>
                        <input value={br.hours} onChange={(e) => updateBranch(i, "hours", e.target.value)}
                          placeholder="السبت–الخميس: 9 ص – 6 م" className={inputClass} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">رابط الخريطة (Google Maps)</label>
                        <input value={br.map_link || ""} onChange={(e) => updateBranch(i, "map_link", e.target.value)}
                          placeholder="https://maps.google.com/..." className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addBranch}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#2d5d89] hover:text-[#2d5d89] px-4 py-3 rounded-2xl text-sm font-medium transition-colors w-full justify-center">
                  <Plus className="w-4 h-4" />
                  إضافة فرع جديد
                </button>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {saving ? "جاري الحفظ..." : "حفظ الفروع"}
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-5">
              {currentGroup?.settings.map((s) => (
                <div key={s.key}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{s.label}</label>

                  {s.type === "image" ? (
                    <ImageUpload
                      value={values[s.key] || ""}
                      onChange={(url) => set(s.key, url)}
                    />
                  ) : s.type === "color" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={values[s.key] || s.defaultVal || "#000000"}
                        onChange={(e) => set(s.key, e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={values[s.key] || s.defaultVal || ""}
                        onChange={(e) => set(s.key, e.target.value)}
                        placeholder={s.defaultVal}
                        className={inputClass + " flex-1 font-mono"}
                      />
                      {s.defaultVal && (
                        <button
                          type="button"
                          onClick={() => set(s.key, s.defaultVal)}
                          className="text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap px-2 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          إعادة الافتراضي
                        </button>
                      )}
                    </div>
                  ) : s.type === "textarea" ? (
                    <textarea rows={3} value={values[s.key] || ""} onChange={(e) => set(s.key, e.target.value)}
                      className={inputClass + " resize-none"} />
                  ) : (
                    <input type={s.type} value={values[s.key] || ""} onChange={(e) => set(s.key, e.target.value)}
                      className={inputClass} />
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                  {saving ? "جاري الحفظ..." : "حفظ هذا القسم"}
                </button>
              </div>
            </div>
            )} {/* end branches else */}
          </div>
        </div>
      )}
    </div>
  );
}

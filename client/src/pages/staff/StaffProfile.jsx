import { useEffect, useState } from "react";
import { User, Phone, MapPin, Mail, Shield, Building2 } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

const departmentLabels = {
  accounts:       "الحسابات",
  legal:          "الشئون القانونية",
  marketing:      "التسويق",
  administrative: "اداري",
  projects:       "مشروعات",
  warehouse:      "المخازن",
  purchasing:     "المشتريات",
};

export default function StaffProfile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name:    user.name    || "",
        phone:   user.phone   || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", form);
      if (updateUser) updateUser(res.data.user || form);
      toast.success("تم تحديث الملف الشخصي");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل تحديث الملف الشخصي");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm";

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-500 text-sm mt-1">بياناتك الشخصية ومعلوماتك</p>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-[#2d5d89]/10 flex items-center justify-center text-[#2d5d89] font-black text-2xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-[#2d5d89]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">الدور الوظيفي</p>
              <p className="text-sm font-semibold text-gray-900">{roleLabels[user?.role] || user?.role}</p>
            </div>
          </div>

          {user?.department && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-[#2d5d89]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">القسم</p>
                <p className="text-sm font-semibold text-gray-900">{departmentLabels[user.department] || user.department}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-[#2d5d89]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">البريد الإلكتروني</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            </div>
          </div>

          {user?.phone && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-lg bg-[#2d5d89]/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-[#2d5d89]" />
              </div>
              <div>
                <p className="text-xs text-gray-400">رقم الهاتف</p>
                <p className="text-sm font-semibold text-gray-900">{user.phone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-5">تعديل البيانات</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
              placeholder="الاسم الكامل"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
              placeholder="رقم الهاتف"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">العنوان</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputClass}
              placeholder="العنوان"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#2d5d89] hover:bg-[#245079] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

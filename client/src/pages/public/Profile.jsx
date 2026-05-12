import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Save, LogOut, ArrowRight, Phone, Mail, MapPin, Calendar, Lock, Edit3 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm transition-colors";
const lockedClass = "w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 text-sm cursor-not-allowed select-none";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
function canChange(changedAt) {
  if (!changedAt) return { ok: true };
  const ms = Date.now() - new Date(changedAt);
  return ms >= SEVEN_DAYS_MS ? { ok: true } : { ok: false, days: Math.ceil((SEVEN_DAYS_MS - ms) / 86400000) };
}

const roleLabel = { admin: "مدير النظام", sales: "مبيعات", viewer: "عضو" };
const roleBg    = { admin: "bg-[#2d5d89]/10 text-[#2d5d89]", sales: "bg-emerald-50 text-emerald-700", viewer: "bg-gray-100 text-gray-600" };

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", age: "" });
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setForm({ name: user.name || "", phone: user.phone || "", email: user.email || "", address: user.address || "", age: user.age || "" });
  }, [user]);

  if (!user) return null;

  const phoneStatus = canChange(user.phoneChangedAt);
  const emailStatus = canChange(user.emailChangedAt);
  const f = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("الاسم مطلوب"); return; }
    setSaving(true); setError("");
    try {
      const payload = { name: form.name, address: form.address, age: form.age || null };
      if (phoneStatus.ok) payload.phone = form.phone;
      if (emailStatus.ok && form.email !== user.email) payload.email = form.email;
      const res = await api.put("/auth/profile", payload);
      updateUser(res.data.user);
      setSuccess("تم حفظ التغييرات ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const avatar = user.name?.[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f6ff] to-[#f8fafc]" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-[#2d5d89] text-sm mb-8 transition-colors group">
          <ArrowRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          رجوع
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Identity card ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
              {/* Big Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2d5d89] to-[#1a3d5c] flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl font-black text-white">{avatar}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-400 text-sm mt-0.5 truncate">{user.email}</p>
              <span className={`inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full ${roleBg[user.role] || roleBg.viewer}`}>
                {roleLabel[user.role] || "عضو"}
              </span>

              <div className="border-t border-gray-100 mt-5 pt-5 space-y-3 text-right">
                {user.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-[#2d5d89] flex-shrink-0" />
                    <span dir="ltr">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#2d5d89] flex-shrink-0 mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                )}
                {user.age && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-[#2d5d89] flex-shrink-0" />
                    <span>{user.age} سنة</span>
                  </div>
                )}
              </div>

              {/* Logout */}
              <button onClick={async () => { await logout(); navigate("/"); }}
                className="mt-6 w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </motion.div>

          {/* ── Right: Edit form ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-[#2d5d89]/10 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-[#2d5d89]" />
                </div>
                <h3 className="font-bold text-gray-900">تعديل المعلومات</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" /> الاسم الكامل *
                  </label>
                  <input value={form.name} onChange={(e) => f("name", e.target.value)} required className={inputClass} />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> رقم الهاتف
                    {!phoneStatus.ok && (
                      <span className="mr-auto flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> بعد {phoneStatus.days} أيام
                      </span>
                    )}
                  </label>
                  <input value={form.phone} onChange={(e) => f("phone", e.target.value)}
                    disabled={!phoneStatus.ok} className={phoneStatus.ok ? inputClass : lockedClass} />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> البريد الإلكتروني
                    {!emailStatus.ok && (
                      <span className="mr-auto flex items-center gap-1 text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" /> بعد {emailStatus.days} أيام
                      </span>
                    )}
                  </label>
                  <input type="email" value={form.email} onChange={(e) => f("email", e.target.value)}
                    disabled={!emailStatus.ok} className={emailStatus.ok ? inputClass : lockedClass} />
                </div>

                {/* Address + Age */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> العنوان
                    </label>
                    <input value={form.address} onChange={(e) => f("address", e.target.value)}
                      placeholder="مثال: القاهرة، المعادي" className={inputClass} />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> السن
                    </label>
                    <input type="number" min="10" max="120" value={form.age} onChange={(e) => f("age", e.target.value)}
                      placeholder="مثال: 30" className={inputClass} />
                  </div>
                </div>

                {/* Feedback */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    ⚠️ {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                    {success}
                  </motion.div>
                )}

                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d5d89] hover:bg-[#245079] text-white py-3.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 mt-2">
                  <Save className="w-4 h-4" />
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

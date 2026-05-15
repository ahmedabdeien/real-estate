import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    if (attempts >= 5) {
      setLocked(true);
      setError("تم تجاوز عدد المحاولات المسموح بها. انتظر 15 دقيقة.");
      // Auto-unlock after 15 min
      setTimeout(() => { setLocked(false); setAttempts(0); setError(""); }, 15 * 60 * 1000);
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (err.message === "ACCESS_DENIED") {
        setError("ليس لديك صلاحية الوصول لنظام الحسابات");
      } else if (newAttempts >= 5) {
        setLocked(true);
        setError("تم تجاوز عدد المحاولات. انتظر 15 دقيقة.");
        setTimeout(() => { setLocked(false); setAttempts(0); setError(""); }, 15 * 60 * 1000);
      } else {
        setError(`بيانات غير صحيحة (المحاولة ${newAttempts}/5)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2336] via-[#1a3d5c] to-[#2d5d89] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">نظام الحسابات</h1>
          <p className="text-white/50 text-sm">الصرح للتطوير العقاري</p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300/80 bg-amber-400/10 px-3 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            منطقة محمية — للمصرح لهم فقط
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 text-red-200 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={locked}
                  placeholder="your@email.com"
                  className="w-full pr-10 pl-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm disabled:opacity-40"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-white/40" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  disabled={locked}
                  placeholder="••••••••"
                  className="w-full pr-10 pl-10 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm disabled:opacity-40"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-white/40 hover:text-white/70">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || locked}
              className="w-full py-3 rounded-xl bg-white text-[#1a3d5c] font-bold text-sm hover:bg-white/90 transition-colors disabled:opacity-40 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#1a3d5c] border-t-transparent rounded-full animate-spin" />
                  جاري التحقق...
                </span>
              ) : locked ? "محظور مؤقتاً" : "دخول آمن"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} الصرح للتطوير العقاري — جميع العمليات مسجلة ومراقبة
        </p>
      </div>
    </div>
  );
}

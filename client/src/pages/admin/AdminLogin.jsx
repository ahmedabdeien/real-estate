import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { Building2, Mail, Lock, Eye, EyeOff, Home } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";

// Google icon SVG
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminLogin() {
  const { user, login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // CMS content
  const [cms, setCms] = useState({
    heroTitle: "الصرح للتطوير العقاري",
    heroSubtitle: "تسجيل الدخول إلى لوحة التحكم",
    heroTagline: "ندير أعمالك بكفاءة واحترافية",
    heroImage: "",
  });

  useEffect(() => {
    api.get("/content/login_page")
      .then((r) => {
        const d = r.data.data || {};
        setCms({
          heroTitle:    d.heroTitle    || "الصرح للتطوير العقاري",
          heroSubtitle: d.heroSubtitle || "تسجيل الدخول إلى لوحة التحكم",
          heroTagline:  d.heroTagline  || "ندير أعمالك بكفاءة واحترافية",
          heroImage:    d.heroImage    || "",
        });
      })
      .catch(() => {});
  }, []);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("مرحباً بك في لوحة الإدارة");
      navigate("/admin");
    } catch (err) {
      toast.error(err.response?.data?.message || "بيانات غير صحيحة");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const u = await loginWithGoogle();
      toast.success(`مرحباً ${u.name}!`);
      navigate("/admin");
    } catch (err) {
      const msg = err.code === "auth/popup-closed-by-user"
        ? "تم إغلاق نافذة Google"
        : err.response?.data?.message || "فشل تسجيل الدخول بـ Google";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Left panel — info/image (desktop only) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 bg-gradient-to-br from-[#0f2336] via-[#1a3d5c] to-[#2d5d89] overflow-hidden"
      >
        {/* Background image overlay */}
        {cms.heroImage && (
          <div className="absolute inset-0">
            <img src={cms.heroImage} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f2336]/80 to-[#2d5d89]/60" />
          </div>
        )}
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3 leading-tight">{cms.heroTitle}</h1>
          <p className="text-white/70 text-lg mb-2">{cms.heroSubtitle}</p>
          <p className="text-white/90 text-base font-medium">{cms.heroTagline}</p>
          <div className="mt-10 flex flex-col gap-3 text-sm text-white/50">
            <div className="w-32 h-0.5 bg-white/20 mx-auto" />
            <p>© {new Date().getFullYear()} الصرح للتطوير العقاري</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#2d5d89] via-[#1a3d5c] to-[#0f2336] lg:bg-none lg:bg-[#f8fafc] relative p-4">
        {/* Home button */}
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 lg:bg-gray-100 lg:hover:bg-gray-200 text-white lg:text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">الرئيسية</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Mobile logo/title */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{cms.heroTitle}</h1>
            <p className="text-white/60 mt-1 text-sm">{cms.heroSubtitle}</p>
            <p className="text-white/80 mt-1 text-sm font-medium">{cms.heroTagline}</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8 text-center">
            <h2 className="text-2xl font-black text-gray-900">مرحباً بعودتك</h2>
            <p className="text-gray-500 mt-1 text-sm">{cms.heroSubtitle}</p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">تسجيل الدخول</h2>

            {/* Google Button */}
            <button
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 mb-4 text-sm"
            >
              {googleLoading ? (
                <span className="w-5 h-5 border-2 border-gray-400 border-t-[#4285F4] rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              {googleLoading ? "جاري التسجيل..." : "تسجيل الدخول بـ Google"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
              <span className="text-gray-400 text-xs">أو بالبريد الإلكتروني</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="admin@elsarh.com"
                    required
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2d5d89] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full bg-[#2d5d89] hover:bg-[#245079] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { signInStart, signInSuccess, signInFailure } from "../../redux/user/userSlice";
import OAuth from "../../OAuth/OAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { HiExclamationCircle } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { Helmet } from "react-helmet";
import Logoelsarh from '../../../assets/images/logo.svg';

export default function Signin() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const { loading, error }    = useSelector(s => s.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطأ في تسجيل الدخول');
      dispatch(signInSuccess(data));
      navigate("/");
    } catch (err) {
      dispatch(signInFailure(err.message));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ background: '#f5f4f1' }}>
      <Helmet><title>تسجيل الدخول | الصرح للتطوير العقاري</title></Helmet>

      {/* Left Panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #12283C 0%, #1e3f5a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(138,105,36,0.2), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16 text-center">
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl"><img src={Logoelsarh} alt="الصرح" className="h-24 w-24 object-contain" /></div>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            منصة الصرح<br />
            <span style={{ color: '#DFBA6B' }}>للاستثمار العقاري</span>
          </h2>
          <p className="text-sm leading-loose max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            أكثر من 20 عاماً من الخبرة في السوق العقاري المصري. ثقة أكثر من 50,000 عميل.
          </p>
          <div className="flex gap-6 mt-10">
            {[['150+', 'مشروع منجز'], ['20+', 'عاماً خبرة'], ['50K+', 'عميل']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black" style={{ color: '#DFBA6B' }}>{n}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={Logoelsarh} alt="الصرح" className="h-14 w-auto" />
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ color: '#12283C' }}>أهلاً بعودتك</h1>
          <p className="text-sm mb-8" style={{ color: '#6b5e3e' }}>سجّل دخولك للوصول إلى حسابك</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="example@email.com"
                className="w-full px-4 py-3 text-sm border transition-all focus:outline-none"
                style={{ border: '1.5px solid #e2e8f0', background: 'white' }}
                onFocus={e => e.target.style.borderColor = '#8A6924'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold" style={{ color: '#12283C' }}>كلمة المرور</label>
                <Link to="/Forgot-Password" className="text-[11px] font-bold hover:underline" style={{ color: '#8A6924' }}>
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-12 text-sm border transition-all focus:outline-none"
                  style={{ border: '1.5px solid #e2e8f0', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#8A6924'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setVisible(!visible)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {visible ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                boxShadow: '0 6px 24px rgba(138,105,36,0.4)',
              }}
            >
              {loading
                ? <><TbLoaderQuarter className="animate-spin" size={18} /> جارٍ الدخول...</>
                : 'تسجيل الدخول'}
            </button>
          </form>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 p-3 text-xs font-bold"
                style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                <HiExclamationCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
            <span className="text-[11px] font-bold" style={{ color: '#94a3b8' }}>أو</span>
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          </div>

          {/* Google */}
          <OAuth />

          {/* Register link */}
          <p className="text-center mt-6 text-sm" style={{ color: '#6b5e3e' }}>
            ليس لديك حساب؟{' '}
            <Link to="/Signup" className="font-black hover:underline" style={{ color: '#8A6924' }}>
              إنشاء حساب جديد
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

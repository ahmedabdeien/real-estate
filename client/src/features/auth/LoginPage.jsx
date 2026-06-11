import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaShield, FaChartBar, FaCity, FaCircleCheck } from 'react-icons/fa6';
import { authAPI } from '../../api/services';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';
import logoColor from '../../assets/logo.svg';
import { PublicNav } from '../public/PublicLayout';

const FEATURES = [
  { icon: FaCity,     label: 'إدارة المشاريع والوحدات العقارية' },
  { icon: FaBuilding, label: 'عقود وجداول أقساط ذكية' },
  { icon: FaChartBar, label: 'تقارير مالية وإحصاءات متقدمة' },
  { icon: FaShield,   label: 'نظام صلاحيات وأمان متعدد المستأجرين' },
];

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'البريد الإلكتروني مطلوب';
    if (!form.password) e.password = 'كلمة المرور مطلوبة';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      dispatch(setCredentials(res.data.data));
      toast.success('مرحباً بك في النظام!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'بريد إلكتروني أو كلمة مرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ fontFamily: 'Cairo, Tajawal, sans-serif', minHeight: '100vh', background: '#f9fafb' }}>
      <PublicNav />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

          {/* Left: Brand panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
            className="hidden lg:block rounded-3xl p-10 text-white"
            style={{ background: '#231f20' }}>
            <div className="absolute inset-0 opacity-[0.06] rounded-3xl"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div className="relative">
              <img src={logoColor} alt="EgyEstate" className="h-9 brightness-0 invert object-contain mb-8" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
                style={{ background: 'rgba(200,22,29,0.25)', border: '1px solid rgba(200,22,29,0.4)', color: '#ff9196' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                نظام SaaS متعدد المستأجرين
              </div>
              <h2 className="text-3xl font-black leading-tight mb-3">
                أدر مشاريعك<br />
                <span style={{ color: '#c8161d' }}>العقارية</span> بذكاء
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                منصة متكاملة لإدارة العقارات والعملاء والعقود والمحاسبة
              </p>
              <div className="space-y-3">
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCircleCheck className="text-sm flex-shrink-0" style={{ color: '#c8161d' }} />
                    <span className="text-sm text-white/65">{f.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/10">
                {[['500+', 'شركة'], ['50k+', 'وحدة'], ['99%', 'رضا']].map(([v, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-black">{v}</p>
                    <p className="text-xs mt-0.5 text-white/35">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100"
            style={{ color: 'var(--color-text-dark)' }}>
        <div className="w-full">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src={logoColor} alt="EgyEstate" className="h-10 object-contain" />
          </div>

          <div className="mb-7">
            <h2 className="text-2xl font-black mb-1.5" style={{ color: 'var(--color-text-dark)', letterSpacing: '-0.02em' }}>
              تسجيل الدخول
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              أدخل بياناتك للوصول إلى لوحة التحكم
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <FaEnvelope className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs transition-colors"
                  style={{ color: focused === 'email' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <input type="email"
                  className={`input pr-10 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  autoComplete="email" />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</motion.p>
                )}
              </AnimatePresence>
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <FaLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs transition-colors"
                  style={{ color: focused === 'pass' ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <input type={showPass ? 'text' : 'password'}
                  className={`input pr-10 pl-10 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused('')}
                  autoComplete="current-password" />
                <button type="button"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--color-text-muted)' }}
                  onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-1.5 text-xs text-red-600 font-medium">{errors.password}</motion.p>
                )}
              </AnimatePresence>
            </div>

            <motion.button type="submit" disabled={loading}
              whileTap={{ scale: 0.985 }}
              className="btn btn-primary w-full py-3 text-sm font-bold mt-1">
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جارٍ تسجيل الدخول...
                </span>
              ) : 'تسجيل الدخول →'}
            </motion.button>
          </form>

          <div className="mt-5 p-4 rounded-xl text-xs"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="font-bold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>بيانات تجريبية:</p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              <span className="font-semibold">البريد:</span> admin@egyestate.com &nbsp;|&nbsp;
              <span className="font-semibold">كلمة المرور:</span> Admin@123
            </p>
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--color-text-muted)' }}>
            EgyEstate © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
        </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

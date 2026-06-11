import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa6';
import { authAPI } from '../../api/services';
import { setCredentials } from '../../store/authSlice';
import toast from 'react-hot-toast';
import logoColor from '../../assets/logo.svg';
import { PublicNav } from '../public/PublicLayout';

const RED  = '#da1f27';
const DARK = '#231f20';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

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
    <div dir="rtl" style={{ minHeight: '100vh', background: '#f0f0f0' }}>
      <PublicNav />

      <div className="flex flex-col items-center justify-center px-4 py-16 min-h-[calc(100vh-72px)]">

        {/* Logo above card */}
        <motion.img
          src={logoColor} alt="EgyEstate"
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="h-12 object-contain mb-8"
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="w-full max-w-md bg-white rounded-2xl px-8 py-10"
          style={{ boxShadow: '0 4px 24px rgba(35,31,32,0.08)' }}>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-black" style={{ color: DARK }}>تسجيل الدخول</h1>
            <p className="text-sm text-gray-400 mt-2">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: DARK }}>البريد الإلكتروني</label>
              <div className="relative">
                <FaEnvelope className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input
                  type="email" dir="ltr" placeholder="admin@company.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full pr-11 pl-4 py-3 rounded-xl text-sm outline-none transition-colors text-left"
                  style={{ border: `1.5px solid ${errors.email ? RED : '#e5e7eb'}`, background: '#fff' }}
                  onFocus={e => e.target.style.borderColor = DARK}
                  onBlur={e => e.target.style.borderColor = errors.email ? RED : '#e5e7eb'}
                />
              </div>
              {errors.email && <p className="text-xs mt-1.5" style={{ color: RED }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: DARK }}>كلمة المرور</label>
              <div className="relative">
                <FaLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input
                  type={showPass ? 'text' : 'password'} dir="ltr" placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full pr-11 pl-11 py-3 rounded-xl text-sm outline-none transition-colors text-left"
                  style={{ border: `1.5px solid ${errors.password ? RED : '#e5e7eb'}`, background: '#fff' }}
                  onFocus={e => e.target.style.borderColor = DARK}
                  onBlur={e => e.target.style.borderColor = errors.password ? RED : '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5" style={{ color: RED }}>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: RED }}>
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  تسجيل الدخول
                  <FaArrowLeft className="text-xs" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-300 mt-8">
            EgyEstate © {new Date().getFullYear()} — جميع الحقوق محفوظة
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OAuth from '../../OAuth/OAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import { Helmet } from 'react-helmet';
import Logoelsarh from '../../../assets/images/logoElsarh.png';

export default function Signup() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', email: '', number: '', password: '' });
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطأ في إنشاء الحساب');
      setSuccess(true);
      setTimeout(() => navigate('/Signin'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex" style={{ background: '#f5f4f1' }}>
      <Helmet><title>إنشاء حساب | الصرح للتطوير العقاري</title></Helmet>

      {/* اللوحة اليسرى — زخرفية */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #12283C 0%, #1e3f5a 100%)' }}>
        <div className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(138,105,36,0.2), transparent 70%)' }} />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-16 text-center">
          <img src={Logoelsarh} alt="الصرح" className="h-20 w-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            انضم إلى<br />
            <span style={{ color: '#DFBA6B' }}>مجتمع الصرح</span>
          </h2>
          <p className="text-sm leading-loose max-w-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            سجّل حسابك مجاناً واستمتع بالوصول الحصري لأفضل الفرص العقارية في مصر.
          </p>
          <div className="flex gap-6 mt-10">
            {[['150+', 'مشروع منجز'], ['20+', 'عاماً خبرة'], ['50K+', 'عميل راضٍ']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-black" style={{ color: '#DFBA6B' }}>{n}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 space-y-3 text-right w-full max-w-xs">
            {['وصول فوري لجميع المشاريع', 'تواصل مباشر مع فريق المبيعات', 'تحديثات حصرية عبر الحساب'].map(f => (
              <div key={f} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: '#DFBA6B' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* اللوحة اليمنى — النموذج */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* شعار الموبايل */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={Logoelsarh} alt="الصرح" className="h-14 w-auto" />
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ color: '#12283C' }}>إنشاء حساب جديد</h1>
          <p className="text-sm mb-8" style={{ color: '#6b5e3e' }}>أنشئ حسابك وابدأ رحلتك العقارية</p>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 p-3 text-xs font-bold"
                style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a' }}>
                <HiCheckCircle size={16} />
                تم إنشاء الحساب! جارٍ التحويل...
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: 'name',     label: 'الاسم الكامل',       type: 'text',     placeholder: 'محمد أحمد',        required: true },
              { id: 'username', label: 'اسم المستخدم',        type: 'text',     placeholder: 'username',          required: true },
              { id: 'email',    label: 'البريد الإلكتروني',   type: 'email',    placeholder: 'example@email.com', required: true },
              { id: 'number',   label: 'رقم الهاتف',          type: 'tel',      placeholder: '01XXXXXXXXX',       required: false, optional: true },
            ].map(f => (
              <div key={f.id}>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>
                  {f.label}
                  {f.optional && <span className="font-normal mr-1" style={{ color: '#94a3b8' }}>(اختياري)</span>}
                </label>
                <input id={f.id} type={f.type} value={formData[f.id]} onChange={handleChange}
                  required={f.required} placeholder={f.placeholder}
                  className="w-full px-4 py-3 text-sm border transition-all focus:outline-none"
                  style={{ border: '1.5px solid #e2e8f0', background: 'white' }}
                  onFocus={e => e.target.style.borderColor = '#8A6924'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            ))}

            {/* كلمة المرور */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>كلمة المرور</label>
              <div className="relative">
                <input id="password" type={visible ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange} required placeholder="••••••••"
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

            <button type="submit" disabled={loading || success}
              className="w-full py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)', boxShadow: '0 6px 24px rgba(138,105,36,0.4)' }}>
              {loading ? <><TbLoaderQuarter className="animate-spin" size={18} /> جارٍ الإنشاء...</> : 'إنشاء الحساب'}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-2 p-3 text-xs font-bold"
                style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
                <HiExclamationCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
            <span className="text-[11px] font-bold" style={{ color: '#94a3b8' }}>أو</span>
            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
          </div>

          <OAuth />

          <p className="text-center mt-6 text-sm" style={{ color: '#6b5e3e' }}>
            لديك حساب بالفعل؟{' '}
            <Link to="/Signin" className="font-black hover:underline" style={{ color: '#8A6924' }}>
              تسجيل الدخول
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OAuth from '../../OAuth/OAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbLoader } from "react-icons/tb";
import { HiInformationCircle } from "react-icons/hi";
import { useTranslation } from 'react-i18next';

function Signup() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Error occurred during registration');
      }
      navigate('/signin');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 flex justify-center items-center py-12 px-4 font-body">
      <div className="max-w-md w-full bg-white p-10 border border-slate-200 shadow-xl rounded-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
            {t('create_account') || 'Create Account'}
          </h2>
          <p className="text-slate-500 text-sm">
            {t('signup_subtitle') || 'Join us today to explore exclusive properties'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {t('full_name') || 'Full Name'}
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder={t('name_placeholder') || "Full Name"}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {t('username') || 'Username'}
              </label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="username"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {t('email') || 'Email'}
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="name@email.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {t('phone_number') || 'Phone Number'}
              </label>
              <input
                id="number"
                type="tel"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                placeholder="012XXXXXXXX"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 uppercase mb-2">
                {t('password') || 'Password'}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className={`absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-slate-400 hover:text-primary-600 transition-colors`}
                  aria-label="Toggle password visibility"
                >
                  {visible ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white font-bold uppercase text-xs tracking-widest hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <TbLoader className="animate-spin w-4 h-4" />
                  {t('loading') || 'Loading...'}
                </>
              ) : (
                t('create_account') || 'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                {t('or_continue_with') || 'Or continue with'}
              </span>
            </div>
          </div>
          <OAuth />
        </div>

        <div className="mt-8 text-center pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase">
            {t('already_have_account') || 'Already have an account?'} {' '}
            <Link
              to="/signin"
              className="text-primary-600 hover:underline"
            >
              {t('sign_in') || 'Sign In'}
            </Link>
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-50 border border-red-100 rounded-sm flex items-start gap-3 text-red-600"
            >
              <HiInformationCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <span className="text-xs font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Signup;
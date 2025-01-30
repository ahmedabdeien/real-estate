import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import OAuth from '../../OAuth/OAuth';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { TbLoader } from "react-icons/tb";
import { HiInformationCircle } from "react-icons/hi";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

function Signup() {
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const egyptianPhonePattern = /^01[0125][0-9]{8}$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if(error) setError(null);
  };

  const validateForm = () => {
    const { email, password, number } = formData;
    const errors = [];

    if (!emailPattern.test(email)) {
      errors.push('البريد الإلكتروني غير صحيح');
    }
    if (!passwordPattern.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل أرقام وحروف');
    }
    if (number && !egyptianPhonePattern.test(number)) {
      errors.push('رقم الهاتف يجب أن يكون رقم مصري صحيح (11 رقم)');
    }

    return errors.length > 0 ? errors.join('\n') : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء التسجيل');
      }

      navigate('/signin');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 dark:from-gray-900 dark:to-gray-800 flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-6 bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            ابدأ رحلتك معنا بإنشاء حساب
          </p>
        </motion.div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <motion.div variants={itemVariants} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                الاسم الكامل
              </label>
              <input
                id="name"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="أحمد محمد"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                اسم المستخدم
              </label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="username@"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                البريد الإلكتروني
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="example@domain.com"
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                رقم الهاتف 
              </label>
              <input
                id="number"
                type="tel"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="01234567890"
                onChange={handleChange}
                pattern="01[0125][0-9]{8}"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  className="absolute inset-y-0 left-0 px-3 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {visible ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <TbLoader className="animate-spin w-5 h-5" />
                  جاري التسجيل...
                </>
              ) : (
                "إنشاء حساب"
              )}
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm">
                أو التسجيل باستخدام
              </span>
            </div>
          </div>
          <div className="mt-6">
            <OAuth />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center text-sm text-gray-600 dark:text-gray-400">
          لديك حساب بالفعل؟{' '}
          <Link
            to="/signin"
            className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400"
            >
              <HiInformationCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
              <div className="space-y-1">
                {error.split('\n').map((line, index) => (
                  <p key={index} className="text-sm">{line}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}

export default Signup;
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TbLoader } from 'react-icons/tb';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

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

function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (value) => {
        const minLength = 8;
        const hasNumber = /\d/;
        return value.length >= minLength && hasNumber.test(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validatePassword(password)) {
            setError('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل وتشمل أرقام وحروف');
            return;
        }

        if (password !== confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'حدث خطأ أثناء تحديث كلمة المرور');
            
            setSuccess(true);
            setError(null);
            setTimeout(() => navigate('/signin'), 2000);
        } catch (error) {
            setError(error.message);
            setSuccess(false);
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
                        تعيين كلمة مرور جديدة
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        الرجاء إدخال كلمة المرور الجديدة الخاصة بك
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div variants={itemVariants} className="space-y-3">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                كلمة المرور الجديدة
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if(error) setError(null);
                                }}
                                aria-describedby="password-requirements"
                            />
                            <p id="password-requirements" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                يجب أن تحتوي على 8 أحرف على الأقل وتشمل رقم واحد
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if(error) setError(null);
                                }}
                            />
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
                                    جاري التحديث...
                                </>
                            ) : (
                                "تحديث كلمة المرور"
                            )}
                        </button>
                    </motion.div>
                </form>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400"
                        >
                            <HiXCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3 text-green-700 dark:text-green-400"
                        >
                            <HiCheckCircle className="flex-shrink-0 w-5 h-5 mt-0.5" />
                            <span className="text-sm">
                                تم تحديث كلمة المرور بنجاح، سيتم تحويلك إلى صفحة تسجيل الدخول
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.section>
    );
}

export default ResetPassword;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateEmail(email)) {
            setError('الرجاء إدخال بريد إلكتروني صحيح');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'حدث خطأ أثناء إرسال الرابط');
            
            setSuccess(true);
            setError(null);
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
                        استعادة كلمة المرور
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        أدخل بريدك الإلكتروني لإرسال رابط الاستعادة
                    </p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div variants={itemVariants}>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if(error) setError(null);
                            }}
                            placeholder="example@domain.com"
                        />
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
                                    جاري الإرسال...
                                </>
                            ) : (
                                "إرسال رابط الاستعادة"
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
                                تم إرسال رابط الاستعادة إلى بريدك الإلكتروني
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div variants={itemVariants} className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <Link 
                        to="/signin" 
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 transition-colors"
                    >
                        العودة إلى صفحة تسجيل الدخول
                    </Link>
                </motion.div>
            </motion.div>
        </motion.section>
    );
}

export default ForgotPassword;
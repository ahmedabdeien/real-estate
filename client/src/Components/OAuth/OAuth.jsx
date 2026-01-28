import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice'
import { app } from "../../firebase";
import { useNavigate } from 'react-router-dom';
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiExclamation } from "react-icons/hi";

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleClick = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await fetch("/api/auth/google", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Google authentication failed');
      }

      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.error("Authentication error:", error);

      if (error.code === 'auth/unauthorized-domain') {
        setError('عذراً، هذا النطاق (Domain) غير مصرح به في Firebase. يرجى إضافته في إعدادات Firebase Console.');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول بجوجل. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <button
        onClick={handleGoogleClick}
        disabled={isLoading}
        className="w-full py-4 rounded-none bg-white border-2 border-slate-100 dark:border-slate-800 
          hover:border-primary-500 hover:bg-slate-50 transition-all flex items-center 
          justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed font-black"
      >
        {isLoading ? (
          <div className="h-6 w-6 border-3 border-primary-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <FcGoogle className="text-2xl" />
            <span className="text-slate-700 dark:text-slate-200">
              تسجيل الدخول بواسطة جوجل
            </span>
          </>
        )}
      </button>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-none flex items-start gap-3"
          >
            <HiExclamation className="text-red-600 mt-1 flex-shrink-0" size={20} />
            <p className="text-sm text-red-800 dark:text-red-400 font-medium leading-relaxed">
              {error}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
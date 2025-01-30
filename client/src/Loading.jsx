import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import Logo from "../src/assets/images/logoElsarh.png"; // Update path

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [showMessage, setShowMessage] = useState(false);

  // Simulated progress loader
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + (Math.random() * 15), 95));
    }, 800);

    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, 8000);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-gradient-to-b from-primary to-primary-dark flex flex-col items-center justify-center gap-6 p-4"
        role="alert"
        aria-live="assertive"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <img
            src={Logo}
            alt="شعار الشركة"
            className="w-32 mb-8 animate-pulse-slow"
            loading="eager"
          />
        </motion.div>

        {/* Progress Indicator */}
        <div className="w-full max-w-xs bg-white/20 rounded-full h-2.5 mb-4">
          <motion.div
            className="h-2.5 bg-secondary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Spinner */}
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-transparent border-secondary rounded-full animate-pulse" />
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <motion.h1
            className="text-2xl font-semibold text-white flex items-center justify-center gap-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Clock className="animate-pulse-slow" />
            ... جار التحميل
          </motion.h1>
          
          <p className="text-white/80 text-sm">
            {Math.round(progress)}% اكتمال
          </p>
        </div>

        {/* Long Loading Message */}
        {showMessage && (
          <motion.p
            className="text-white/80 text-sm mt-4 max-w-md text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            نعتذر عن التأخير، جاري تحميل المحتوى المطلوب. يرجى التحقق من اتصال الإنترنت إذا استمرت المشكلة.
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default Loading;
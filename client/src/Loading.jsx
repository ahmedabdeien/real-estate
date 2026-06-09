import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock } from "react-icons/fa6";
import Logo from "./assets/images/logo.svg";

const Loading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 100));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center gap-6 p-4">
      <div className="w-36 h-36 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-2xl animate-pulse">
        <img src={Logo} alt="Logo" className="w-28 h-28 object-contain" />
      </div>
      <div className="w-full max-w-xs bg-white/20 rounded-full h-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h1 className="text-white text-xl font-bold flex items-center gap-2">
        <FaClock className="w-5 h-5 animate-spin" />
        Loading...
      </h1>
    </div>
  );
};

export default Loading;
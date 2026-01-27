import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import Logo from "./assets/images/logoElsarh.png";

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
      <img src={Logo} alt="Logo" className="w-32 mb-8 animate-pulse" />
      <div className="w-full max-w-xs bg-white/20 rounded-full h-2">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <h1 className="text-white text-xl font-bold flex items-center gap-2">
        <Clock className="animate-spin" size={20} />
        Loading...
      </h1>
    </div>
  );
};

export default Loading;
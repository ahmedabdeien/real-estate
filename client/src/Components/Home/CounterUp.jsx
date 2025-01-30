import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion, useInView } from "framer-motion";

const counterItems = [
  { end: 12, text: "مشاريع تحت الإنشاء" },
  { end: 138, text: "مشروعات تم تسلمها" },
  { end: 150, text: "مشروعات الشركة" },
];

const ProgressRing = ({ progress }) => (
  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
    <circle
      cx="50%"
      cy="50%"
      r="45%"
      className="stroke-current text-white/20"
      strokeWidth="2"
      fill="transparent"
    />
    <circle
      cx="50%"
      cy="50%"
      r="45%"
      className="stroke-current text-[#ff9505]"
      strokeWidth="2"
      fill="transparent"
      strokeLinecap="round"
      strokeDasharray="283"
      strokeDashoffset={283 - (283 * progress) / 100}
    />
  </svg>
);

export default function CounterUp() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    if (isInView) {
      setStartAnimation(true);
    }
  }, [isInView]);

  return (
    <div ref={ref} className="w-full container bg-gradient-to-br from-[#033e8a] to-[#016FB9] py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="text-4xl md:text-5xl font-bold text-center text-white mb-12 md:mb-16"
        >
          إنجازاتنا الرقمية
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {counterItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.15,
                type: 'spring',
                stiffness: 100,
                damping: 15
              }}
              className="relative group"
            >
              <div className="relative p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-[#ff9505]/30 transition-all duration-300 overflow-hidden">
                {/* Animated background pattern */}
                <motion.div 
                  className="absolute inset-0 opacity-10"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDIyQzYuNDc3IDIyIDIgMTcuNTIzIDIgMTJTMiAyIDYuNDc3IDIgMTIgNi40NzcgMTIgMTJzNC40NzcgMTAgMTAgMTB6bTAtMkM3LjM5MyAyMCAyIDE0LjYwNyAyIDhTNy4zOTMtMCAxNCAwczEyIDUuMzkzIDEyIDEyLTUuMzkzIDIwLTEyIDIweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvc3ZnPg==')]" />
                </motion.div>

                {/* Progress ring */}
                <div className="absolute w-32 h-32 -top-16 -right-16 opacity-20">
                  <ProgressRing progress={(item.end / 150) * 100} />
                </div>

                {/* Counter number */}
                <motion.div 
                  className="relative z-10 text-center mb-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="inline-block relative">
                    <div className="absolute inset-0 bg-[#ff9505] blur-[60px] opacity-30" />
                    <span className="text-6xl md:text-7xl font-bold text-[#ff9505] relative">
                      {startAnimation && (
                        <CountUp
                          start={0}
                          end={item.end}
                          duration={3}
                          separator=","
                        />
                      )}
                      <span className="text-4xl absolute -top-4 -right-7"> +</span>
                    </span>
                  </div>
                </motion.div>

                {/* Counter text */}
                <motion.p
                  className="text-xl text-center text-white/90 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  {item.text}
                </motion.p>

                {/* Hover effect line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#ff9505] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
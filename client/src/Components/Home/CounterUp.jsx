import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion, useInView } from "framer-motion";

const counterItems = [
  { end: 12, text: "مشاريع قيد الإنشاء" },
  { end: 138, text: "مشروعاً تم تسليمه" },
  { end: 150, text: "إجمالي مشاريع الشركة" },
];

export default function CounterUp() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    if (isInView) setStartAnimation(true);
  }, [isInView]);

  return (
    <div ref={ref} className="w-full bg-primary-950 py-24 relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0yMCAyMHYyMGgyMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] shadow-inner" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-accent-500 font-black uppercase tracking-[0.3em] text-[10px]">إنجازاتنا بالأرقام</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-white mt-4">
            ثقة تبنى على الواقع
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {counterItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group text-center"
            >
              <div className="relative inline-block mb-6 pt-10 px-10">
                <div className="absolute inset-0 bg-accent-600/10 rounded-full blur-3xl scale-150 group-hover:scale-200 transition-transform duration-700" />
                <span className="text-6xl md:text-8xl font-heading font-black text-accent-600 relative rtl:flex rtl:justify-center">
                  {startAnimation && (
                    <CountUp start={0} end={item.end} duration={4} />
                  )}
                  <span className="text-4xl text-accent-500/50 mr-1">+</span>
                </span>
              </div>

              <div className="h-0.5 w-16 bg-accent-600 mx-auto mb-6 group-hover:w-24 transition-all duration-500" />

              <p className="text-xl md:text-2xl font-heading font-bold text-white tracking-wide">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
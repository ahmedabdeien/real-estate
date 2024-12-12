import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion } from "framer-motion";

export default function CounterUp() {
  const [counterOn, setCounterOn] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setCounterOn(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  const counterItems = [
    { end: 90, text: "مشاريعنا" },
    { end: 8, text: "مشاريع تحت الإنشاء" },
    { end: 1160, text: "الوحدات التي تم تسليمها" },
  ];

  return (
    <div ref={counterRef} className="w-full bg-gradient-to-br from-[#033e8a] to-[#016FB9] py-16 text-center">
      <div className="container mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-center text-white mb-10"
        >
          إنجازاتنا
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {counterItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="p-8 font-sans rounded-xl bg-white/10 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                className="text-7xl font-extrabold text-[#ff9505] mb-4"
              >
                {counterOn && (
                  <CountUp
                    start={0}
                    end={item.end}
                    duration={3}
                    separator=","
                  />
                )}
                <span className="text-5xl">+</span>
              </motion.div>
              <p className="text-xl font-medium text-white">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
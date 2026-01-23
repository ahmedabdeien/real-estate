import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion, useInView } from "framer-motion";

const counterItems = [
  { end: 12, text: "مشاريع قيد الإنشاء", label: "Active" },
  { end: 138, text: "مشروعاً تم تسليمه", label: "Delivered" },
  { end: 150, text: "إجمالي مشاريع الشركة", label: "Total" },
];

export default function CounterUp() {
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    if (isInView) setStartAnimation(true);
  }, [isInView]);

  return (
    <section ref={ref} className="w-full bg-primary-950 py-32 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070')] bg-cover bg-fixed opacity-5 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950 via-primary-950/90 to-primary-950" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          {counterItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative group flex flex-col items-center text-center"
            >
              <div className="absolute -top-10 -left-10 text-[120px] font-black text-white/[0.03] pointer-events-none select-none uppercase tracking-tighter">
                {item.label}
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 bg-accent-600/20 rounded-full blur-[50px] group-hover:blur-[70px] transition-all duration-700" />
                <div className="relative flex items-end justify-center">
                  <span className="text-7xl md:text-9xl font-heading font-black text-white tracking-tighter flex items-center">
                    {startAnimation && (
                      <CountUp start={0} end={item.end} duration={5} />
                    )}
                    <span className="text-3xl md:text-4xl text-accent-600 ml-2 mb-4 font-black">+</span>
                  </span>
                </div>
              </div>

              <div className="h-1 w-20 bg-accent-600 mb-8 rounded-full transform origin-right group-hover:scale-x-150 transition-transform duration-700" />

              <p className="text-2xl font-heading font-black text-slate-100 uppercase tracking-widest max-w-[200px] leading-tight">
                {item.text}
              </p>

              <p className="text-xs text-slate-500 mt-4 uppercase tracking-[0.4em] font-bold">Excellent Service</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
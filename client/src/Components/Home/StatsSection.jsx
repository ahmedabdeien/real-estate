import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import { FaBuilding, FaHandshake, FaUsers, FaStar } from 'react-icons/fa';

const STATS = [
  { icon: FaBuilding, value: 200, label: 'مشروع منجز', suffix: '+' },
  { icon: FaHandshake, value: 150, label: 'صفقة ناجحة', suffix: '+' },
  { icon: FaUsers, value: 300, label: 'عميل راضٍ', suffix: '+' },
  { icon: FaStar, value: 10, label: 'سنوات خبرة', suffix: '+' },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-16 bg-[#12283C]" ref={ref}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="text-center px-4 py-6 border border-[#DFBA6B]/15 hover:border-[#DFBA6B]/40 transition-colors group"
            >
              <stat.icon
                size={28}
                className="text-[#DFBA6B] mx-auto mb-3 group-hover:scale-110 transition-transform"
              />
              <div className="text-white font-black text-3xl md:text-4xl mb-1">
                {inView ? (
                  <CountUp end={stat.value} duration={2} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </div>
              <div className="text-white/50 text-sm font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

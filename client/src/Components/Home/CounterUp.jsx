import React, { useState, useEffect, useRef } from 'react';
import CountUp from 'react-countup';
import { motion, useInView } from "framer-motion";
import { useSelector } from 'react-redux';
import { useCms } from '../../hooks/useCms';

const parseNum = (str) => parseInt((str || '').replace(/\D/g, '')) || 0;

const defaultItems = [
  { key: 'projects',   label: 'إجمالي المشاريع',        fallback: 150   },
  { key: 'experience', label: 'سنوات الخبرة',            fallback: 20    },
  { key: 'clients',    label: 'عميل سعيد',               fallback: 50000 },
  { key: 'units',      label: 'وحدة سكنية مُسلَّمة',    fallback: 500   },
];

export default function CounterUp() {
  const { config } = useSelector(s => s.config);
  const { data: cmsStats } = useCms('stats', {
    projects_count: '',
    units_count: '',
    clients_count: '',
    years_experience: '',
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: "-100px", once: true });
  const [startAnimation, setStartAnimation] = useState(false);

  const counterItems = defaultItems.map(item => {
    // Map CMS keys to defaultItems keys
    const cmsKeyMap = {
      projects:   'projects_count',
      experience: 'years_experience',
      clients:    'clients_count',
      units:      'units_count',
    };
    const cmsKey = cmsKeyMap[item.key];
    const cmsVal = cmsStats[cmsKey];
    const reduxVal = config?.stats?.[item.key];
    return {
      ...item,
      end: cmsVal ? parseNum(cmsVal) : reduxVal ? parseNum(reduxVal) : item.fallback,
      suffix: '+',
    };
  });

  useEffect(() => {
    if (isInView) setStartAnimation(true);
  }, [isInView]);

  return (
    <section
      ref={ref}
      dir="rtl"
      className="w-full py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #f7f4ef 0%, #ede8de 100%)' }}
    >
      {/* Subtle pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #8A6924 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #8A6924)' }} />
            <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: '#8A6924' }}>
              التميز بالأرقام
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #8A6924)' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mt-3" style={{ color: '#12283C' }}>
            ثلاثة عقود من التميز العقاري
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {counterItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.12 }}
              className="relative group flex flex-col items-center text-center py-10 px-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(138,105,36,0.12)',
                boxShadow: '0 4px 20px rgba(138,105,36,0.07)',
              }}
            >
              {/* Number */}
              <div className="relative mb-3">
                <span className="text-4xl md:text-5xl font-black tracking-tighter" style={{ color: '#12283C' }}>
                  {startAnimation && (
                    <CountUp
                      start={0}
                      end={item.end}
                      duration={3.5}
                      separator=","
                      formattingFn={(n) => n.toLocaleString('ar-EG')}
                    />
                  )}
                </span>
                <span className="text-2xl font-black ms-0.5" style={{ color: '#8A6924' }}>
                  {item.suffix}
                </span>
              </div>

              {/* Divider */}
              <div className="h-0.5 w-10 mb-4" style={{ background: 'linear-gradient(to right, transparent, #8A6924, transparent)' }} />

              {/* Label */}
              <p className="text-sm font-black leading-snug tracking-wide" style={{ color: '#12283C' }}>
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
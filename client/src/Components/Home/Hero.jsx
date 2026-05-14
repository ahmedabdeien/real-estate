import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';

const PROPERTY_TYPES = ['جميع الأنواع', 'فيلا', 'شقة', 'أرض', 'مجمع سكني', 'تجاري'];
const CITIES = ['جميع المدن', 'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر'];
const PRICE_RANGES = [
  { label: 'جميع الأسعار', value: '' },
  { label: 'أقل من 500 ألف', value: '0-500000' },
  { label: '500 ألف - مليون', value: '500000-1000000' },
  { label: 'مليون - 3 مليون', value: '1000000-3000000' },
  { label: 'أكثر من 3 مليون', value: '3000000+' },
];

export default function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (price) params.set('price', price);
    if (city) params.set('city', city);
    navigate(`/listings${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&auto=format&fit=crop')`,
        }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-l from-[#12283C]/95 via-[#12283C]/70 to-[#12283C]/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#12283C]/60 via-transparent to-transparent" />

      {/* Gold accent line */}
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-[#DFBA6B]/60 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-8 h-0.5 bg-[#DFBA6B]" />
            <span className="text-[#DFBA6B] text-xs font-black tracking-[0.4em] uppercase">
              الصرح للعقارات
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white font-black leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            اكتشف
            <span className="block text-[#DFBA6B]">عقارك المثالي</span>
            <span className="block text-white/80 text-[0.7em] font-bold mt-1">
              في أرقى مناطق المملكة
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/70 text-base mb-8 leading-relaxed max-w-lg"
          >
            نقدم أفضل العقارات السكنية والتجارية بأعلى معايير الجودة والخدمة المتميزة
          </motion.p>

          {/* Search box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-5"
          >
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {/* Type */}
                <div>
                  <label className="block text-[#DFBA6B] text-xs font-bold mb-1.5 tracking-wider">
                    نوع العقار
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#DFBA6B] transition-colors"
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t === 'جميع الأنواع' ? '' : t} className="bg-[#12283C]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[#DFBA6B] text-xs font-bold mb-1.5 tracking-wider">
                    نطاق السعر
                  </label>
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#DFBA6B] transition-colors"
                  >
                    {PRICE_RANGES.map((p) => (
                      <option key={p.value} value={p.value} className="bg-[#12283C]">
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-[#DFBA6B] text-xs font-bold mb-1.5 tracking-wider">
                    المدينة
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-[#DFBA6B] transition-colors"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c === 'جميع المدن' ? '' : c} className="bg-[#12283C]">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8A6924] hover:bg-[#DFBA6B] hover:text-[#12283C] text-white font-black text-sm tracking-wider transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FaSearch />
                ابحث عن عقارك الآن
              </button>
            </form>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6 mt-6"
          >
            {[
              { num: '+170', label: 'مشروع' },
              { num: '+3500', label: 'عميل راضٍ' },
              { num: '+20', label: 'سنوات خبرة' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[#DFBA6B] font-black text-xl">{stat.num}</div>
                <div className="text-white/50 text-xs">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

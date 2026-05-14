import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CITIES = [
  {
    name: 'الرياض',
    count: 45,
    image: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=600&auto=format&fit=crop',
  },
  {
    name: 'جدة',
    count: 38,
    image: 'https://images.unsplash.com/photo-1578894375264-16a82e54a2ea?w=600&auto=format&fit=crop',
  },
  {
    name: 'الدمام',
    count: 22,
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&auto=format&fit=crop',
  },
  {
    name: 'مكة المكرمة',
    count: 15,
    image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&auto=format&fit=crop',
  },
];

export default function CitiesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="section-badge">تغطية جغرافية واسعة</span>
          <h2 className="text-[#12283C] font-black text-3xl md:text-4xl">
            نخدمك في أبرز المدن
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CITIES.map((city, i) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/listings?city=${city.name}`}
                className="relative block overflow-hidden group cursor-pointer"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12283C]/90 via-[#12283C]/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <h3 className="text-white font-black text-lg">{city.name}</h3>
                  <p className="text-[#DFBA6B] text-xs font-bold">{city.count} مشروع</p>
                </div>
                <div className="absolute inset-0 border-2 border-[#DFBA6B]/0 group-hover:border-[#DFBA6B]/60 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

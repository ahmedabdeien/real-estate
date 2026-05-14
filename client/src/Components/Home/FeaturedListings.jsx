import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { getListings } from '../../lib/api';
import PropertyCard from '../ui/PropertyCard';

export default function FeaturedListings() {
  const { data, isLoading } = useQuery('featured-listings', () =>
    getListings({ limit: 6 }).then((r) => r.data)
  );

  const listings = data?.listings || data || [];

  return (
    <section className="py-20 bg-[#faf8f4]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-badge">مشاريعنا المتاحة</span>
          <h2 className="text-[#12283C] font-black text-3xl md:text-4xl mb-3">
            أحدث العقارات المعروضة
          </h2>
          <p className="text-[#6b5e3e] text-sm max-w-xl mx-auto">
            اكتشف مجموعة مختارة من أفضل العقارات في أرقى المناطق السعودية
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[#8A6924]/10">
                <div className="skeleton h-52 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 w-1/3 rounded" />
                  <div className="skeleton h-5 w-3/4 rounded" />
                  <div className="skeleton h-4 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 text-[#6b5e3e]">لا توجد مشاريع متاحة حالياً</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.slice(0, 6).map((listing, index) => (
              <PropertyCard key={listing._id} listing={listing} index={index} />
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#12283C] text-[#DFBA6B] font-black text-sm hover:bg-[#1e3a5c] transition-colors border border-[#DFBA6B]/20"
          >
            عرض جميع المشاريع
            <span className="text-lg">←</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

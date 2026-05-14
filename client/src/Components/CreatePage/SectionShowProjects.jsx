"use client";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineArrowsExpand } from 'react-icons/hi';
import { BsArrowLeft } from 'react-icons/bs';

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="overflow-hidden" style={{ background: 'white', border: '1px solid rgba(138,105,36,0.1)' }}>
        <div className="h-56 skeleton" />
        <div className="p-5 space-y-3">
          <div className="h-5 w-3/4 skeleton rounded" />
          <div className="h-3 w-1/2 skeleton rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default function SectionShowProjects() {
  
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  const { data, isLoading } = useQuery(
    'dataProject',
    () => axios.get(`${API_BASE}/listing/getListings?limit=4`),
    { staleTime: 300000 }
  );

  const projects = data?.data?.listings || [];

  return (
    <section
      dir="rtl"
      className="relative py-24 overflow-hidden"
      style={{ background: 'white' }}
    >
      {/* زخرفة */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-32 hidden lg:block"
        style={{ background: 'linear-gradient(to bottom, transparent, #8A6924, transparent)' }}
      />

      <div className="container mx-auto px-4 lg:px-12">

        {/* هيدر */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
              <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: '#8A6924' }}>
                واجهات الفخامة
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black leading-tight" style={{ color: '#12283C' }}>
              مشاريعنا
              <span className="font-light mr-2" style={{ color: 'rgba(18,40,60,0.35)' }}>المتميزة</span>
            </h2>
          </motion.div>

          <Link to="/Project">
            <motion.button
              whileHover={{ x: -4 }}
              className="flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest transition-all duration-300"
              style={{
                border: '2px solid #12283C',
                color: '#12283C',
              }}
            >
              <span>عرض الكل</span>
              <BsArrowLeft size={14} />
            </motion.button>
          </Link>
        </div>

        {/* المشاريع */}
        {isLoading ? (
          <Skeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((p, i) => {
              const name    = typeof p.name    === 'object' ? (p.name['ar'] || p.name['en'] || '') : (p.name || '');
              const address = typeof p.address === 'object' ? (p.address['ar'] || p.address['en'] || '') : (p.address || '');

              return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group overflow-hidden transition-all duration-500 hover:-translate-y-2"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(138,105,36,0.1)',
                    boxShadow: '0 4px 16px rgba(18,40,60,0.04)',
                  }}
                  whileHover={{
                    boxShadow: '0 20px 50px rgba(18,40,60,0.12)',
                    borderColor: 'rgba(138,105,36,0.25)',
                  }}
                >
                  {/* الصورة */}
                  <div className="relative h-56 overflow-hidden">
                    <Link to={`/Projects/${p.slug}`}>
                      <img
                        src={p.imageUrls?.[0]}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    {/* طبقة overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* شارة الحالة */}
                    <div className="absolute top-4 right-4">
                      <span
                        className="px-3 py-1 text-[10px] font-black tracking-widest text-white"
                        style={{ background: p.available === 'available' ? '#8A6924' : '#dc2626' }}
                      >
                        {p.available === 'available' ? 'متاح' : 'مباع'}
                      </span>
                    </div>

                    {/* زر مشاركة */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const url = `${window.location.origin}/Projects/${p.slug}`;
                        navigator.share
                          ? navigator.share({ title: name, url })
                          : navigator.clipboard.writeText(url);
                      }}
                      className="absolute bottom-4 left-4 w-9 h-9 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>

                  {/* المحتوى */}
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <HiOutlineLocationMarker size={13} style={{ color: '#8A6924' }} />
                      <span className="text-[11px] font-bold tracking-wide" style={{ color: '#8A6924' }}>{address}</span>
                    </div>

                    <Link to={`/Projects/${p.slug}`}>
                      <h3
                        className="text-base font-black mb-1 truncate group-hover:text-[#8A6924] transition-colors"
                        style={{ color: '#12283C' }}
                      >
                        {name}
                      </h3>
                    </Link>

                    <div
                      className="flex items-center justify-between pt-4 mt-3"
                      style={{ borderTop: '1px solid rgba(138,105,36,0.1)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <HiOutlineArrowsExpand size={13} style={{ color: '#8A6924' }} />
                        <span className="text-xs font-medium" style={{ color: '#6b5e3e' }}>{p.propertySize} م²</span>
                      </div>
                      <Link
                        to={`/Projects/${p.slug}`}
                        className="text-xs font-black tracking-widest transition-colors hover:underline"
                        style={{ color: '#8A6924' }}
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { BsArrowRightShort, BsSearch, BsClock } from "react-icons/bs";
// src/Components/Project.jsx
// Constants
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ENDPOINT = `${API_BASE}/listing/getPages`;
const QUERY_KEY = 'dataProjects';
const ITEMS_PER_PAGE = 12;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 }
};

const hoverEffect = {
  scale: 1.02,
  y: -5,
  transition: { type: 'spring', stiffness: 300 }
};

const ProjectCard = React.memo(({ item }) => {
  const isAvailable = item.available === "available";
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -10 }}
      layout
      className="bg-white rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-xl transition-all duration-500 border border-slate-100 group flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <Link to={`/Projects/${item.slug}`}>
          <img
            src={item.imageUrls[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
        </Link>

        {/* Ribbon Tag */}
        <div className="absolute top-4 left-0 z-10">
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg rounded-r-md ${isAvailable
            ? "bg-primary-500"
            : "bg-accent-500"
            }`}
          >
            {isAvailable ? "للبيــــع" : "للايـجار"}
          </span>
        </div>

        {/* Share Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (navigator.share) {
              navigator.share({
                title: item.name,
                text: item.description,
                url: `${window.location.origin}/Projects/${item.slug}`,
              });
            } else {
              navigator.clipboard.writeText(`${window.location.origin}/Projects/${item.slug}`);
              alert("تم نسخ رابط المشروع!");
            }
          }}
          className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 hover:bg-primary-500 hover:text-white transition-all shadow-lg active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors truncate">
          {item.name}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6">
          {item.description}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <BsClock size={14} />
            <span className="text-[10px] font-bold uppercase">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
          <Link
            to={`/Projects/${item.slug}`}
            className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline underline-offset-4"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </motion.div>
  );
});

const LoadingSkeleton = () => (
  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-premium border border-slate-100">
        <div className="h-64 bg-slate-50 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="h-6 bg-slate-50 rounded w-3/4 animate-pulse" />
          <div className="h-20 bg-slate-50 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-50 rounded w-1/4 animate-pulse pt-4" />
        </div>
      </div>
    ))}
  </motion.div>
);

export default function Project() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projects, isLoading, error } = useQuery(
    QUERY_KEY,
    async () => {
      const response = await fetch(`${API_ENDPOINT}?limit=200`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return (await response.json()).listings;
    },
    { staleTime: 300000, cacheTime: 3600000, retry: 3 }
  );

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const term = searchTerm.toLowerCase().trim();
    return term
      ? projects.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      )
      : projects;
  }, [projects, searchTerm]);

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  if (error) return (
    <motion.div
      className="min-h-[60vh] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-md text-center bg-white p-12 rounded-3xl shadow-premium border border-slate-100">
        <h3 className="text-2xl font-black text-red-600 mb-4">
          عذراً، حدث خطأ ما
        </h3>
        <p className="text-slate-500 mb-8 leading-relaxed">
          لم نتمكن من جلب قائمة المشاريع العقارية حالياً. يرجى محاولة تحديث الصفحة.
        </p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-primary-500 text-white font-black rounded-lg">
          تحديث الصفحة
        </button>
      </div>
    </motion.div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-white overflow-hidden pb-24">
      <Helmet>
        <title>دليل المشاريع العقارية | شركة الصرح</title>
        <meta name="description" content="تصفح قائمة مشاريع شركة الصرح العقارية، وجهتك الفاخرة للسكن والاستثمار في أرقى مناطق مصر." />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-slate-900 py-32 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 inline-block"
          >
            عقاراتنا المتميزة
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-10"
          >
            دليل المشاريع
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <input
              type="text"
              placeholder="ابحث عن مشروعك المفضل..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-8 py-6 text-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all pr-16 shadow-2xl"
            />
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <BsSearch size={18} />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 -mt-12 relative z-20">
        <LayoutGroup>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {paginatedProjects.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    layout
                  >
                    {paginatedProjects.map((item) => (
                      <ProjectCard key={item._id} item={item} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-32 bg-white dark:bg-slate-800 rounded-[40px] shadow-premium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-6xl mb-6">🔍</div>
                    <p className="text-2xl font-heading font-black text-primary-900 dark:text-white">
                      عذراً، لا توجد مشاريع مطابقة لبحثك
                    </p>
                    <p className="text-slate-500 mt-2">جرّب البحث بكلمة مفتاحية أخرى</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pagination */}
              {filteredProjects.length > ITEMS_PER_PAGE && (
                <motion.div
                  className="flex justify-center flex-wrap gap-3 mt-20"
                  layout
                >
                  {[...Array(Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))].map((_, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setCurrentPage(i + 1);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-lg transition-all duration-300 ${currentPage === i + 1
                        ? 'bg-accent-600 text-white shadow-premium-lg'
                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700'
                        }`}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {i + 1}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </>
          )}
        </LayoutGroup>
      </div>
    </div>
  );
}
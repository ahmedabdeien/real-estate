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
      className="group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-premium border border-slate-100 dark:border-slate-700 flex flex-col h-full"
    >
      <div className="relative h-64 overflow-hidden">
        <Link to={`/Projects/${item.slug}`}>
          <motion.img
            src={item.imageUrls[0]}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${isAvailable
            ? "bg-accent-600 text-white"
            : "bg-slate-900 text-white"
          }`}
        >
          {isAvailable ? "متاح الآن" : "قريباً"}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="mb-6 flex-1 text-right">
          <h2 className="text-xl font-heading font-black text-primary-900 dark:text-accent-500 mb-3 group-hover:text-accent-600 transition-colors truncate">
            {item.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
            {item.description}
          </p>
        </div>

        <Link
          to={`/Projects/${item.slug}`}
          className="flex items-center justify-end gap-3 text-primary-900 dark:text-white font-black text-sm uppercase tracking-tighter group/link"
        >
          <span className="border-b-2 border-accent-600 group-hover/link:pb-1 transition-all order-2">التفاصيل</span>
          <span className="text-accent-600 text-xl transition-transform group-hover/link:translate-x-[-5px] order-1">←</span>
        </Link>
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
      <div key={i} className="bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-premium border border-slate-100 dark:border-slate-700">
        <div className="h-64 bg-slate-100 dark:bg-slate-700 animate-pulse" />
        <div className="p-8 space-y-4">
          <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
          <div className="h-20 bg-slate-100 dark:bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-1/4 animate-pulse pt-4" />
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
      <div className="max-w-md text-center bg-white dark:bg-slate-800 p-12 rounded-[40px] shadow-premium border border-slate-100 dark:border-slate-700">
        <h3 className="text-2xl font-heading font-black text-red-600 mb-4">
          عذراً، حدث خطأ ما
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          لم نتمكن من جلب قائمة المشاريع العقارية حالياً. يرجى محاولة تحديث الصفحة.
        </p>
        <button onClick={() => window.location.reload()} className="btn-premium bg-accent-600 text-white">
          تحديث الصفحة
        </button>
      </div>
    </motion.div>
  );

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden pb-24">
      <Helmet>
        <title>دليل المشاريع العقارية | شركة الصرح</title>
        <meta name="description" content="تصفح قائمة مشاريع شركة الصرح العقارية، وجهتك الفاخرة للسكن والاستثمار في أرقى مناطق مصر." />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-primary-950 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0yMCAyMHYyMGgyMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] " />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 inline-block"
          >
            عقاراتنا المتميزة
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-black text-white mb-8"
          >
            دليل المشاريع
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group mt-12"
          >
            <input
              type="text"
              placeholder="ابحث عن مشروعك المفضل..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-8 py-6 text-lg bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-[32px] text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent-600/50 transition-all pr-16 shadow-premium-lg"
            />
            <div className="absolute top-1/2 right-6 -translate-y-1/2 w-10 h-10 bg-accent-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BsSearch size={20} />
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
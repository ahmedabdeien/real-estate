import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { BsArrowRightShort, BsSearch, BsClock } from "react-icons/bs";
// src/Components/Project.jsx
// Constants
const API_ENDPOINT = `${import.meta.env.VITE_API_BASE_URL}/listing/getPages`;
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
      className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      layout
    >

      <Link to={`/Projects/${item.slug}`} className="block">
        <div className="relative overflow-hidden aspect-video">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <motion.img
            src={item.imageUrls[0]}
            alt={item.name}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
            loading="lazy"
          />
        </div>
      </Link>

      <div className="absolute top-4 left-4 flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          isAvailable 
            ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500"
            : "bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-500"
        }`}>
          {item.available}
        </span>
        {!isAvailable && (
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm font-medium">
            <BsClock className="inline-block ml-1" />مشاريعنا
          </span>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 truncate">
          {item.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
        
        <motion.div whileHover="hover" className="overflow-hidden rounded-lg">
          <Link to={`/Projects/${item.slug}`} className="block">
            <motion.div
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-colors"
              variants={{ hover: { x: 5 } }}
            >
              <BsArrowRightShort className="text-xl" />
              <span className="ms-2 font-medium">عرض تفاصيل المشروع</span>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
});

const LoadingSkeleton = () => (
  <motion.div 
    className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        variants={cardVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-5 space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 animate-pulse" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </motion.div>
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
      <div className="max-w-md text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl">
        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
          فشل تحميل البيانات
        </h3>
        <p className="text-red-500 dark:text-red-300">
          يرجى التحقق من اتصال الشبكة أو المحاولة مرة أخرى لاحقًا
        </p>
      </div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>المشاريع العقارية - ElSarh Real Estate</title>
        <meta name="description" content="اكتشف مجموعة مشاريعنا العقارية الفريدة واستثمر في مستقبل ناجح مع نخبة من التصاميم المعمارية المتميزة." />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-7xl mx-auto space-y-12"
          initial="hidden"
          animate="show"
        >
          {/* Header Section */}
          <motion.div 
            className="space-y-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
              مشاريعنا العقارية
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              استكشف مجموعة مختارة من أبرز المشاريع العقارية التي تجمع بين الرفاهية والابتكار في التصميم
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="ابحث عن مشروع..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-5 py-3.5 text-lg bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-14"
              />
              <BsSearch className="absolute top-1/2 right-5 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </motion.div>

          {/* Projects Grid */}
          <LayoutGroup>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <AnimatePresence mode="popLayout">
                  {paginatedProjects.length > 0 ? (
                    <motion.div
                      className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      layout
                    >
                      {paginatedProjects.map((item) => (
                        <ProjectCard key={item.id} item={item} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-center py-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <p className="text-xl text-gray-600 dark:text-gray-400">
                        لا توجد مشاريع مطابقة لبحثك
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {filteredProjects.length > ITEMS_PER_PAGE && (
                  <motion.div 
                    className="flex justify-center gap-2"
                    layout
                  >
                    {[...Array(Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))].map((_, i) => (
                      <motion.button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-12 h-12 flex items-center justify-center rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
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
        </motion.div>
      </div>
    </>
  );
}
import React, { useMemo, useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from 'framer-motion';
import { BsArrowRightShort, BsSearch } from "react-icons/bs";

// Constants
const API_ENDPOINT = '/api/listing/getPages';
const QUERY_KEY = 'dataProjects';
const ITEMS_PER_PAGE = 12;

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

const ProjectCard = React.memo(({ item }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = item.available === "available";

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <motion.div
      {...fadeInUp}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/Projects/${item.slug}`} className="block">
        <div className="relative overflow-hidden aspect-video">
          <motion.img
            src={item.imageUrls[0]}
            alt={item.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <BsSearch className="text-white text-4xl" />
          </motion.div>
        </div>
      </Link>

      <motion.span
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
          isAvailable ? "bg-[#ff9505]" : "bg-[#353531] border border-white/30"
        } text-white`}
        animate={{ opacity: isHovered ? 1 : 0 }}
      >
        {item.available}
      </motion.span>

      <div className="p-4">
        <h2 className="text-2xl font-bold text-[#353531] dark:text-white truncate">
          {item.name}
        </h2>
        <p className="text-[#353531]/70 dark:text-gray-300 mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <Link to={`/Projects/${item.slug}`}>
          <motion.button 
            className="w-full flex items-center justify-center bg-[#016FB9] text-white py-3 px-6 rounded-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsArrowRightShort className="text-2xl" />
            <span className="ms-1">عرض المشروع</span>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
});

const LoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="w-full h-80 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-4">
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse" />
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const OldProjectsList = ({ projects }) => (
  <div className="mt-12">
    <h2 className="text-2xl font-bold dark:text-white text-center mb-5">
      المشاريع القديمة
    </h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl h-80 shadow-lg p-6 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-[#004483] dark:text-white truncate mb-2">
            {project.namePro_eq}
          </h3>
          <p className="text-[#353531]/70 dark:text-gray-300">
            {project.titlePro}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default function Project() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projects, isLoading, error } = useQuery(
    QUERY_KEY,
    async () => {
      const response = await fetch(`${API_ENDPOINT}?limit=200`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      return data.listings;
    },
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 3600000, // 1 hour
      retry: 3
    }
  );

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    const lowercasedTerm = searchTerm.toLowerCase().trim();
    if (!lowercasedTerm) return projects;
  
    return projects.filter(project => {
      const projectName = project.name?.toLowerCase() ?? '';
      const projectDescription = project.description?.toLowerCase() ?? '';
      return projectName.includes(lowercasedTerm) || 
             projectDescription.includes(lowercasedTerm);
    });
  }, [projects, searchTerm]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  }, []);

  if (error) {
    return (
      <motion.div 
        className="w-full min-h-[40vh] flex justify-center items-center"
        {...fadeInUp}
      >
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <p className="text-red-500 dark:text-red-400 text-lg">
            عذراً، حدث خطأ أثناء تحميل المشاريع. يرجى المحاولة مرة أخرى لاحقاً.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>مشاريع مميزة - ElSarh Real Estate</title>
        <meta 
          name="description" 
          content="اكتشف مجموعتنا المذهلة من العقارات الفاخرة وفرص الاستثمار العقاري الفريدة." 
        />
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-stone-100 dark:from-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="container mx-auto space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-t border-b-4 border-b-[#ff9505] shadow-lg">
            <motion.h1 
              className="text-4xl font-bold text-[#002E66] mb-4"
              {...fadeInUp}
            >
              مشاريعنا
            </motion.h1>
            <motion.p 
              className="text-xl text-[#353531] dark:text-gray-300 max-w-2xl mb-6"
              {...fadeInUp}
            >
              اكتشف عالمًا من العقارات الفاخرة والحلول العقارية المبتكرة المصممة لتتجاوز توقعاتك.
            </motion.p>

            <div className="relative">
              <input
                type="text"
                placeholder="البحث عن المشاريع..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full py-4 px-6 text-lg bg-stone-100 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-[#016FB9] focus:outline-none"
              />
              <BsSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <AnimatePresence mode="wait">
                {paginatedProjects.length > 0 ? (
                  <motion.div 
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                    layout
                  >
                    {paginatedProjects.map((item) => (
                      <ProjectCard key={item.id} item={item} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-center py-12"
                    {...fadeInUp}
                  >
                    <p className="text-2xl text-gray-600 dark:text-gray-300">
                      لم يتم العثور على أي مشاريع. جرّب مصطلح بحث مختلفًا.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {filteredProjects.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded ${
                        currentPage === i + 1
                          ? 'bg-[#016FB9] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}

            </>
          )}
        </div>
      </div>
    </>
  );
}
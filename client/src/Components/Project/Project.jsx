import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Helmet } from "react-helmet";
import { useQuery } from "react-query";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { BsArrowRightShort, BsSearch, BsClock, BsDoorOpen, BsBuilding, BsPlusCircle } from "react-icons/bs";
// src/Components/Project.jsx
// Constants
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_ENDPOINT = `${API_BASE}/listing/getListings`;
const QUERY_KEY = 'dataListings';
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
  const { i18n, t } = useTranslation();
  const { currentUser } = useSelector(state => state.user);
  const currentLang = i18n.language;
  const isAvailable = item.available === true;
  const name = item.name[currentLang] || item.name['en'] || item.name;
  const description = item.description[currentLang] || item.description['en'] || item.description;

  return (
    <div className="bg-white border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full rounded-sm overflow-hidden group">
      <div className="relative h-56 overflow-hidden">
        <Link to={`/Projects/${item.slug}`}>
          <img
            src={item.imageUrls[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-sm ${isAvailable ? 'bg-primary-600' : 'bg-red-500'}`}>
            {isAvailable ? t('available') : t('sold')}
          </span>
          {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
            <Link to={`/Update-Page/${item._id}`} className="mt-2 block text-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-accent-500 rounded-sm hover:bg-accent-600 transition-colors">
              {t('edit') || 'Edit'}
            </Link>
          )}
          {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
            <Link to={`/Update-Page/${item._id}`} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white bg-accent-500 rounded-sm hover:bg-accent-600 transition-colors mt-2 text-center block" style={{ textDecoration: 'none' }}>
              {t('edit') || 'Edit'}
            </Link>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-6">
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
          <div className="flex items-center gap-1">
            <BsDoorOpen /> <span>{item.rooms} {t('rooms')}</span>
          </div>
          <div className="flex items-center gap-1 border-l border-slate-200 ml-2 pl-4">
            <BsBuilding /> <span>{item.propertySize} m²</span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-primary-600 font-bold text-lg">
            {item.price?.toLocaleString()} {currentLang === 'ar' ? 'ج.م' : 'EGP'}
          </span>
          <Link to={`/Projects/${item.slug}`} className="text-xs font-bold uppercase text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-1">
            {t('details')} <BsArrowRightShort size={18} />
          </Link>
        </div>
      </div>
    </div>
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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRtl = currentLang === 'ar';

  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rooms, setRooms] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: projects, isLoading, error } = useQuery(
    QUERY_KEY,
    async () => {
      const response = await fetch(`${API_ENDPOINT}?limit=200`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const json = await response.json();
      return json.listings || []; // Handle new format
    },
    { staleTime: 300000, cacheTime: 3600000, retry: 3 }
  );

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const name = p.name[currentLang]?.toLowerCase() || p.name['en']?.toLowerCase() || '';
      const description = p.description[currentLang]?.toLowerCase() || p.description['en']?.toLowerCase() || '';
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || description.includes(term);
      const matchesType = !propertyType || p.propertyType === propertyType;
      const matchesMinPrice = !minPrice || p.price >= parseInt(minPrice);
      const matchesMaxPrice = !maxPrice || p.price <= parseInt(maxPrice);
      const matchesRooms = !rooms || p.rooms === parseInt(rooms);

      return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice && matchesRooms;
    });
  }, [projects, searchTerm, propertyType, minPrice, maxPrice, rooms, currentLang]);

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
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 font-body pb-24">
      <Helmet>
        <title>{t('listings')} | El Sarh</title>
      </Helmet>

      {/* Hero Banner - Standardized */}
      <div className="bg-primary-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-transparent opacity-90" />
        </div>
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <span className="text-accent-500 font-bold uppercase tracking-widest text-xs mb-4 block">
            {t('world_class_services')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            {t('listings')}
          </h1>

          {/* Search & Filter Bar */}
          <div className="max-w-5xl bg-white p-4 rounded-sm shadow-xl flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <BsSearch className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} text-slate-400`} />
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={handleSearch}
                className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-3 bg-slate-50 border border-slate-200 rounded-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm`}
              />
            </div>
            <div className="flex gap-4 flex-wrap lg:flex-nowrap">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-sm p-3 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
              >
                <option value="">{t('property_type')}</option>
                <option value="Apartment">{t('Apartment') || 'Apartment'}</option>
                <option value="Villa">{t('Villa') || 'Villa'}</option>
                <option value="Office">{t('Office') || 'Office'}</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-6 py-3 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-slate-200 transition-colors"
              >
                {t('advanced_filters')}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="max-w-5xl mt-4 bg-white p-6 rounded-sm shadow-lg border-t-4 border-accent-500"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('price_range')}</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-sm text-sm" />
                      <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-sm text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('rooms')}</label>
                    <input type="number" value={rooms} onChange={e => setRooms(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-sm text-sm" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={() => { setSearchTerm(''); setPropertyType(''); setMinPrice(''); setMaxPrice(''); setRooms(''); }} className="text-red-500 text-xs font-bold uppercase hover:underline">
                      {t('reset_filters')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-12 py-16">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {paginatedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {paginatedProjects.map((item) => (
                  <ProjectCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white border border-slate-200">
                <p className="text-xl font-bold text-slate-800">{t('no_results_found') || 'No results found'}</p>
                <button onClick={() => setSearchTerm('')} className="mt-4 text-primary-600 font-bold uppercase text-xs hover:underline">
                  {t('view_all_properties') || 'View all properties'}
                </button>
              </div>
            )}

            {/* Pagination Component */}
            {filteredProjects.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center items-center gap-4 mt-16">
                {[...Array(Math.ceil(filteredProjects.length / ITEMS_PER_PAGE))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm font-bold text-sm transition-all ${currentPage === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-slate-400 border border-slate-200 hover:border-primary-500'
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
  );
}
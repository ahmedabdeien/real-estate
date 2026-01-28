
"use client";
import { TbLoaderQuarter } from "react-icons/tb";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from "react-query";
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineArrowsExpand } from "react-icons/hi";
import { useTranslation } from "react-i18next";

const SectionShowProjects = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const { data, isLoading, error } = useQuery("dataProject",
    () => {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      return axios.get(`${API_BASE}/listing/getListings?limit=4`);
    }
  );

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <TbLoaderQuarter className="text-6xl text-primary-600" />
        </motion.div>
      </div>
    );
  }

  if (error) return null;

  const projects = data?.data?.listings || [];

  return (
    <section dir={currentLang === 'ar' ? 'rtl' : 'ltr'} className="bg-white dark:bg-slate-950 py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`max-w-2xl ${currentLang === 'ar' ? 'text-right' : 'text-left'}`}
          >
            <span className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs">واجهات الفخامة</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 mt-6 leading-tight">
              مشـاريع <br /><span className="text-slate-400 font-light italic">مـتميزة</span>
            </h2>
          </motion.div>

          <Link to="/Project">
            <button className="px-8 py-4 border-2 border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-all rounded-none">
              {t('explore_projects')}
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {projects.map((project, index) => {
            const name = typeof project.name === 'object' ? (project.name[currentLang] || project.name['en']) : project.name;
            const address = typeof project.address === 'object' ? (project.address[currentLang] || project.address['en']) : project.address;

            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white rounded-none overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 group border border-slate-100"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <Link to={`/Projects/${project.slug}`}>
                    <img
                      src={project.imageUrls?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all pointer-events-none" />

                  {/* Ribbon Tag */}
                  <div className={`absolute top-4 ${currentLang === 'ar' ? 'left-0' : 'right-0'} z-10`}>
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg rounded-none ${project.available ? "bg-primary-600" : "bg-accent-600"
                      }`}>
                      {project.available ? t('available') : t('sold')}
                    </span>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const url = `${window.location.origin}/Projects/${project.slug}`;
                      if (navigator.share) {
                        navigator.share({
                          title: name,
                          text: typeof project.description === 'object' ? (project.description[currentLang] || project.description['en']) : project.description,
                          url: url,
                        });
                      } else {
                        navigator.clipboard.writeText(url);
                        alert(t('link_copied') || "تم نسخ الرابط!");
                      }
                    }}
                    className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-none flex items-center justify-center text-slate-800 hover:bg-primary-600 hover:text-white transition-all shadow-lg active:scale-90"
                    title="مشاركة المشروع"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>

                {/* Content Box */}
                <div className="p-6">
                  <div className={`flex items-center gap-2 text-primary-600 mb-3 ${currentLang === 'ar' ? 'flex-row' : 'flex-row-reverse justify-end'}`}>
                    <HiOutlineLocationMarker size={16} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{address}</span>
                  </div>

                  <Link to={`/Projects/${project.slug}`}>
                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500">
                      <HiOutlineArrowsExpand size={16} />
                      <span className="text-xs font-medium">{project.propertySize} م²</span>
                    </div>

                    <Link to={`/Projects/${project.slug}`}>
                      <span className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline underline-offset-4">
                        {t('learn_more')}
                      </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SectionShowProjects;
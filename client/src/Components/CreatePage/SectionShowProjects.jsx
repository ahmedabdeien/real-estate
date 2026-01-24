"use client";
import { TbLoaderQuarter } from "react-icons/tb";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from "react-query";
import { motion } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineArrowsExpand } from "react-icons/hi";

const SectionShowProjects = () => {
  const { data, isLoading, error } = useQuery("dataProject",
    () => {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      return axios.get(`${API_BASE}/listing/getPages?limit=4`);
    }
  );

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <TbLoaderQuarter className="text-6xl text-accent-600" />
        </motion.div>
      </div>
    );
  }

  if (error) return null;

  const projects = data?.data?.listings || [];

  return (
    <section dir="rtl" className="bg-white dark:bg-slate-950 py-40">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl text-right"
          >
            <span className="text-primary-600 font-black uppercase tracking-[0.4em] text-xs">واجهات الفخامة</span>
            <h2 className="text-5xl md:text-7xl font-heading font-black text-slate-900 mt-6 leading-tight">
              مشـاريع <br /><span className="text-slate-400 font-light italic">مـتميزة</span>
            </h2>
          </motion.div>

          <Link to="/Project">
            <button className="px-8 py-4 border-2 border-slate-200 text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-primary-500 hover:border-primary-500 hover:text-white transition-all rounded-lg">
              استكشف جميع الوجهات
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-xl transition-all duration-500 group border border-slate-100"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.imageUrls[0]}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />

                {/* Ribbon Tag - Like the demo */}
                <div className="absolute top-4 left-0 z-10">
                  <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg rounded-r-md ${project.available === "available" ? "bg-primary-500" : "bg-accent-500"
                    }`}>
                    {project.available === "available" ? "للبيــــع" : "للايـجار"}
                  </span>
                </div>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (navigator.share) {
                      navigator.share({
                        title: project.name,
                        text: project.description,
                        url: `${window.location.origin}/Projects/${project.slug}`,
                      });
                    } else {
                      navigator.clipboard.writeText(`${window.location.origin}/Projects/${project.slug}`);
                      alert("تم نسخ رابط المشروع!");
                    }
                  }}
                  className="absolute bottom-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 hover:bg-primary-500 hover:text-white transition-all shadow-lg active:scale-90"
                  title="مشاركة المشروع"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Content Box */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-primary-600 mb-3">
                  <HiOutlineLocationMarker size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{project.address}</span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-1">
                  {project.name}
                </h3>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500">
                    <HiOutlineArrowsExpand size={16} />
                    <span className="text-xs font-medium">{project.propertySize} م²</span>
                  </div>

                  <Link to={`/Projects/${project.slug}`}>
                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 hover:text-primary-700 underline underline-offset-4">
                      المزيد
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionShowProjects;
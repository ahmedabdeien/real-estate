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
            <span className="text-accent-600 font-black uppercase tracking-[0.4em] text-xs">واجهات الفخامة</span>
            <h2 className="text-5xl md:text-7xl font-heading font-black text-primary-900 dark:text-white mt-6 leading-tight">
              مشـاريع <br /><span className="text-slate-400 font-light">تـخطف الأنـظار</span>
            </h2>
          </motion.div>

          <Link to="/Project">
            <button className="btn-premium border-2 border-slate-200 dark:border-slate-800 text-primary-900 dark:text-white hover:border-accent-600 hover:text-accent-600">
              استكشف جميع الوجهات
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative h-[600px] rounded-[60px] overflow-hidden shadow-premium-xl"
            >
              {/* Image Background */}
              <motion.img
                src={project.imageUrls[0]}
                alt={project.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              {/* Intelligent Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent" />
              <div className="absolute inset-0 border-[1.5rem] border-transparent group-hover:border-white/10 transition-all duration-700 pointer-events-none" />

              {/* Status Badge */}
              <div className="absolute top-10 right-10 z-10">
                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl ${project.available === "available" ? "bg-accent-600 text-white" : "bg-primary-900 text-white"
                  }`}>
                  {project.available === "available" ? "متاح الآن" : "قريباً"}
                </span>
              </div>

              {/* Content Box */}
              <div className="absolute inset-x-0 bottom-0 p-10 z-10 flex flex-col items-start text-right">
                <div className="flex items-center gap-2 text-accent-500 mb-4">
                  <HiOutlineLocationMarker size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">القاهرة الجديدة</span>
                </div>

                <h3 className="text-3xl font-heading font-black text-white mb-4 group-hover:text-accent-500 transition-colors">
                  {project.name}
                </h3>

                <div className="flex items-center gap-6 mb-8 text-white/60">
                  <div className="flex items-center gap-2">
                    <HiOutlineArrowsExpand size={16} />
                    <span className="text-xs">120م - 450م</span>
                  </div>
                </div>

                <Link to={`/Projects/${project.slug}`} className="w-full">
                  <button className="w-full py-4 rounded-2xl bg-white text-primary-950 font-black text-xs uppercase tracking-[0.2em] transform translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 hover:bg-accent-600 hover:text-white">
                    التـــفاصيل
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionShowProjects;
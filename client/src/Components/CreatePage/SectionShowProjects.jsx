"use client";
import { TbLoaderQuarter } from "react-icons/tb";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from "react-query";
import { motion, AnimatePresence } from 'framer-motion';

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.5
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
  }
};

const statusVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

function SectionShowProjects() {
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
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <TbLoaderQuarter className="text-5xl text-accent-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="w-full py-24 flex flex-col justify-center items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-slate-500 text-xl font-heading font-bold">عذراً، لم نتمكن من تحميل المشاريع حالياً</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-premium bg-accent-600 text-white"
        >
          محاولة مرة أخرى
        </button>
      </motion.div>
    );
  }

  const SectionShow = data?.data?.listings || [];

  return (
    <section dir="rtl" className="bg-slate-50 dark:bg-slate-900 py-32 overflow-hidden border-y border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="text-accent-600 font-black uppercase tracking-[0.2em] text-xs">مشاريعنا المختارة</span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-900 dark:text-white mt-4">
              وجهات سكنية صُممت <br />بإتقان لتلبي تطلعاتك
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/Project" className="btn-premium border-2 border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white dark:border-white dark:text-white">
              عرض كافة المشاريع
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          {SectionShow.map((item) => (
            <motion.div
              key={item._id}
              variants={cardVariants}
              whileHover="hover"
              className="group bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-premium border border-slate-100 dark:border-slate-700 flex flex-col h-full"
            >
              <div className="relative h-64 overflow-hidden">
                <Link to={`/Projects/${item.slug}`}>
                  <motion.img
                    src={item.imageUrls[0]}
                    alt={item.name}
                    className="w-full h-full object-cover origin-center"
                    transition={{ duration: 0.6 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>

                <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${item.available === "available"
                    ? "bg-accent-600 text-white"
                    : "bg-slate-900 text-white"
                  }`}
                >
                  {item.available === "available" ? "متاح الآن" : "قريباً"}
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <div className="mb-6 flex-1">
                  <h3 className="text-xl font-heading font-black text-primary-900 dark:text-accent-500 mb-3 group-hover:text-accent-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <Link
                  to={`/Projects/${item.slug}`}
                  className="flex items-center gap-3 text-primary-900 dark:text-white font-black text-sm uppercase tracking-tighter group/link"
                >
                  <span className="border-b-2 border-accent-600 group-hover/link:pb-1 transition-all">التفاصيل</span>
                  <span className="text-accent-600 text-xl transition-transform group-hover/link:translate-x-[-5px]">←</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default SectionShowProjects;
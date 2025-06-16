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
    () => axios.get(`${import.meta.env.VITE_API_BASE_URL}/listing/getPages?limit=4`)
  );

  if (isLoading) {
    return (
      <div className="w-full h-96 flex justify-center items-center">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <TbLoaderQuarter className="text-4xl text-[#ff9505]" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="w-full h-96 flex flex-col justify-center items-center gap-4 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-red-500 text-lg">حدث خطأ في تحميل البيانات</div>
        <motion.button 
          onClick={() => window.location.reload()}
          className="bg-[#ff9505] text-white px-6 py-2 rounded-lg hover:bg-[#ff6b00] transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          حاول مرة أخرى
        </motion.button>
      </motion.div>
    );
  }

  const SectionShow = data?.data?.listings || [];

  return (
    <section dir="rtl" className="bg-stone-100 container mx-auto dark:bg-gradient-to-br from-gray-900 to-gray-800 py-16 overflow-hidden">
      <div className=" px-4">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-[#353531] dark:text-white mb-12"
        >
        بعض من مشاريعنا
        </motion.h2>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
              }
            }
          }}
        >
          <AnimatePresence>
            {SectionShow.map((item, index) => (
              <motion.div
                key={item._id}
                variants={cardVariants}
                whileHover="hover"
                className="group relative bg-white dark:bg-gray-900  rounded-2xl overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <Link to={`/Projects/${item.slug}`}>
                    <motion.img 
                      src={item.imageUrls[0]} 
                      alt={item.name}
                      className="w-full h-60 object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </Link>

                  <motion.div
                    variants={statusVariants}
                    className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium ${
                      item.available === "available" 
                        ? "bg-[#ff9505] text-white" 
                        : "bg-stone-700 text-stone-100"
                    }`}
                  >
                    {item.available}
                  </motion.div>
                </div>

                <div className="p-6 flex flex-col justify-between h-48">
                  <div>
                    <h3 className="text-xl font-semibold text-[#033e8a] dark:text-[#ff9505] mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                  
                  <motion.div whileHover={{ x: 5 }}>
                    <Link 
                      to={`/Projects/${item.slug}`}
                      className="inline-flex items-center gap-2 text-[#016FB9] dark:text-[#ff9505] hover:text-[#002E66] dark:hover:text-[#ff6b00] transition-colors"
                    >
                      اقرأ المزيد
                      <span className="text-lg">→</span>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="relative mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px bg-stone-300 dark:bg-stone-700" />
          <Link
            to="/Project"
            className="relative inline-block bg-stone-100 dark:bg-stone-900 px-8 py-3 text-[#002E66] dark:text-[#ff9505] rounded-full border-2 border-[#002E66] dark:border-[#ff9505] hover:bg-[#002E66] hover:text-white dark:hover:bg-[#ff9505] dark:hover:text-white transition-all"
          >
            اكتشف جميع المشاريع
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default SectionShowProjects;
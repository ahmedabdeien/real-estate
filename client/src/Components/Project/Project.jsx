import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from 'framer-motion';
import {  BsArrowRightShort, BsSearch } from "react-icons/bs";
import logeselsarh from "../../assets/images/logoElsarh.png";
const ProjectCard = ({ item, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.5,}}
      className="group relative  dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300  "
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/Projects/${item.slug}`} className="">
      <div className="relative overflow-hidden w-full ">
        <motion.img
          src={item.imageUrls[0]}
          alt={item.name}
          className="w-full h-52 object-cover transition-transform duration-300"
          animate={{ scale: isHovered ? 1.1 : 1 }}
        />
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 transition-opacity duration-300"
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <BsSearch className="text-white text-4xl" />
        </motion.div>
        
      </div></Link>
      <motion.div
        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
          item.available === "available" ? "bg-[#ff9505]" : "bg-[#353531] border border-white/30"
        } text-white`}
        initial={{ opacity: 1, x: 1 }}
        animate={{ opacity:isHovered ? 1: 0 }}
        transition={{ duration: 0.3}}
      >
        {item.available}
        
      </motion.div>
      <div className='px-4 pt-3 '>
          <h2 className="text-2xl font-bold text-[#353531] dark:text-white  truncate">{item.name}</h2>
          <p className="text-[#353531]/70 dark:text-gray-300 mb-4 line-clamp-1">{item.description}</p>
        </div>
      <div className="p-3 pt-0 ">
        
        <Link to={`/Projects/${item.slug}`} className="">
          <motion.div 
            className="flex items-center justify-center  bg-[#016FB9] border text-white py-3 px-6 rounded-xl transition-all"
            whileHover={{ scale: 1.02,  }}
            whileTap={{ scale: 0.95 }}
          >
            <BsArrowRightShort className='text-2xl' />
            <span className="ms-1">عرض المشروع</span>
            
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

export default function Project() {
  const [searchTerm, setSearchTerm] = useState("");

  const getDataProjects = async () => {
    const response = await axios.get('/api/listing/getPages?limit=200');
    return response.data.listings;
  };

  const { data: projects, isLoading, error } = useQuery("dataProjects", getDataProjects);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    const lowercasedTerm = searchTerm.toLowerCase().trim();
  
    return projects.filter(project => {
      const projectName = project.name ? project.name.toLowerCase() : '';
      const projectDescription = project.description ? project.description.toLowerCase() : '';
  
      return projectName.includes(lowercasedTerm) || projectDescription.includes(lowercasedTerm);
    });
  }, [projects, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div 
        className="w-full h-screen flex justify-center items-center flex-col bg-stone-100 "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="animate-pulse text-4xl mb-4">
         <img src={logeselsarh} alt="logeselsarh" className='w-60'/> 
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="w-full h-screen flex justify-center items-center bg-red-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-red-500 text-2xl">Error: {error.message}</p>
      </motion.div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Stunning Projects - ElSarh Real Estate</title>
        <meta name="description" content="Explore our breathtaking collection of luxurious properties and unique real estate opportunities." />
      </Helmet>
      <div dir="rtl" className='pb-8 px-2 md:px-4 bg-stone-100 overflow-hidden dark:from-gray-800 dark:to-gray-900 min-h-screen pt-5'>
        <div className=" container mx-auto space-y-7">
          <motion.div 
            className="p-3 md:p-4 lg:p-6 bg-white  text-black  border-t border-b-4 border-b-[#ff9505] shadow overflow-hidden relative"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute top-0 right-0 w-64 h-64"
            >
            </motion.div>
            <h1 className="text-4xl md:text-4xl font-bold mb-2 relative text-[#002E66] z-10"> مشاريعنا</h1>
            <p className="text-xl font-light max-w-2xl relative z-10 text-[#353531]">اكتشف عالمًا من العقارات الفاخرة والحلول العقارية المبتكرة المصممة لتتجاوز توقعاتك.</p>
           
            <motion.div 
            className="relative mt-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="البحث عن المشاريع . . ."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-6 py-4 text-lg bg-stone-100 dark:bg-gray-700 rounded-2xl focus:bg-white border-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#353531] dark:text-white"
            />
            <BsSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </motion.div>

          </motion.div>


          <AnimatePresence>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
              layout
            >
              {filteredProjects.map((item, index) => (
                <ProjectCard key={item.id || index} item={item} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <p className="text-2xl text-gray-600 dark:text-gray-300">لم يتم العثور على أي مشاريع. جرّب مصطلح بحث مختلفًا.</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
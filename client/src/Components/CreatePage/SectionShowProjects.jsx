"use client";
import { TbLoaderQuarter } from "react-icons/tb";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from "react-query";
import { motion, AnimatePresence } from 'framer-motion'

function SectionShowProjects() {


  async function getDataProjects() {
    return await axios.get('/api/listing/getPages?limit=4');
  }

  const { data, isLoading, error } = useQuery("dataProject", getDataProjects);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <TbLoaderQuarter className="text-4xl animate-spin text-gray-500" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col p-4">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  const SectionShow = data?.data?.listings || [];

  return (
    <AnimatePresence>
    <div dir="rtl"  className="bg-stone-100 dark:bg-stone-900 overflow-hidden">
      <div  className="py-8 space-y-3 container ">
        <div className="px-2 flex justify-center items-center">
          <div className=" mb-5 flex justify-center items-center flex-col">
            <h1 className="text-4xl font-bold text-[#353531] dark:text-white">بعض من مشاريعنا</h1>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SectionShow.map((item, index) => (
            <div 
             key={index}  className="flex flex-col hover:-translate-y-2 transition-all bg-white dark:bg-stone-800  rounded-2xl overflow-hidden duration-300 hover:shadow-lg group">
              <div className="relative">
                <Link to={`/Projects/${item.slug}`}>
                  <img src={item.imageUrls[0]} alt={item.name} className="w-full object-cover h-[200px] transition-all duration-300 group-hover:saturate-150" />
                </Link>

                <div className={`absolute top-0 text-white dark:bg-stone-900 left-0 flex justify-center items-center p-1 w-full -translate-y-20 group-hover:translate-y-0 transition-transform duration-300 
                  ${item.available === "available" ? "bg-[#ff9505]" : "bg-[#353531]"}`}>
                  <p>{item.available}</p>
                </div>
              </div>
              <div className="p-4 flex flex-col justify-between h-full">
                <div className="mb-2">
                  <h5 className="text-lg font-semibold text-[#033e8a] dark:text-[#FF9505]">{item.name}</h5>
                  <p className="truncate text-gray-700 dark:text-gray-300">{item.description}</p>
                </div>
                <Link to={`/Projects/${item.slug}`} className="bg-[#016FB9] text-white p-2 text-center rounded-lg transition-all duration-300 hover:bg-[#002E66] ">اقرأ المزيد</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center py-6 relative pt-10">
          <div className="border-b w-full dark:border-stone-700"></div>
          <Link to="/Project" className="absolute bg-stone-100 dark:bg-stone-900 hover:scale-110 transition-transform text-[#002E66] p-3 px-5  text-center rounded-full">عرض جميع المشاريع</Link>
        </div>
      </div>
    </div>
    </AnimatePresence>
  );
}

export default SectionShowProjects;

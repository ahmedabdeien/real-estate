"use client";
import { TbLoaderQuarter } from "react-icons/tb";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from "react-query";

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
    <div className="bg-stone-100 dark:bg-stone-900">
      <div className="py-6 space-y-3 container">
        <div className="px-2 flex justify-center items-center">
          <div className="space-y-3 mb-4 flex justify-center items-center flex-col">
            <h1 className="text-3xl font-bold text-black dark:text-white">Our Projects</h1>
            <div className="w-32 h-1 bg-[#033e8a] dark:bg-[#016FB9]"></div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SectionShow.map((item, index) => (
            <div key={index} className="flex flex-col shadow bg-white dark:bg-stone-800 dark:border-stone-700 border rounded-2xl overflow-hidden hover:scale-95 transition-transform duration-500 ease-[cubic-bezier(.42,1.3,0,1.43)] group/itemss">
              <div className="relative">
                <Link to={`/Projects/${item.slug}`}>
                  <img src={item.imageUrls[0]} alt={item.name} className="w-full object-cover h-[200px]" />
                </Link>

                <div className={`absolute top-0 bg-stone-50 dark:bg-stone-900 left-0 flex justify-center items-center px-2 w-full -translate-y-20 group-hover/itemss:translate-y-0 transition-transform duration-300 
                  ${item.available === "available" ? "text-green-500" : "text-red-500"}`}>
                  <p>{item.available}</p>
                </div>
              </div>
              <div className="p-3 flex flex-col justify-between h-full">
                <div className="mb-2">
                  <h5 className="text-lg font-semibold">{item.name}</h5>
                  <p className="truncate">{item.description}</p>
                </div>
                <Link to={`/Projects/${item.slug}`} className="bg-[#033e8a] dark:bg-[#016FB9] text-white p-2 text-center rounded-full">Read More</Link>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center py-6 relative">
          <div className="border-b w-full dark:border-stone-700"></div>
          <Link to="/Project" className="absolute bg-stone-100 dark:bg-stone-900 hover:scale-110 transition-transform text-[#033e8a] dark:text-[#016FB9] p-2 px-4 text-center rounded-lg">View All Projects</Link>
        </div>
      </div>
    </div>
  );
}

export default SectionShowProjects;

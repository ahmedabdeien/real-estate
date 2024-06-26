"use client"
import axios from 'axios';
import { useEffect } from 'react';
// import  { useEffect, useState } from 'react'
import { TbLoaderQuarter } from 'react-icons/tb';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {Helmet} from "react-helmet";
export default function Project() {

  function getDataProjects() {
    return axios.get('/api/listing/getPages?limit=200');

  }


  const { data, isLoading, error } = useQuery("dataProjects", getDataProjects);
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <div className="">
          <TbLoaderQuarter className="text-4xl animate-spin text-gray-500" />
        </div>
        <p className="text-gray-500">loading...</p>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  const SectionShow = data?.data?.listings || [];



    
          
          
          


  // const [SectionShow, setSectionShow] = useState(false)
  // const [loading, setLoading] = useState(true);
  // useEffect(() => {
  //     try{
  //        const fetchSectionShowProjects = async () =>{
  //          const res = await fetch(`/api/listing/getPages?limit=200`);
  //             const data = await res.json();
  //             if(res.ok){
  //                 setLoading(true)
  //                 setSectionShow(data.listings);
  //                 setLoading(false)
  //             }
  //        }
  //        fetchSectionShowProjects()
  //     }catch(error){
  //        console.log(error)
  //     }
  // }, [])
  return <>
    <Helmet>
      <title>Our Projects - elsarh real estate</title>
      <meta name="description" content="Discover our amazing properties, luxurious homes, and unique experiences." />
      <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
    </Helmet>
  <div className='bg-stone-100 dark:bg-stone-800'>
      <div className="container mx-auto py-4 space-y-6 ">
  <div className=" p-4 border-b-2">
    <div className="flex items-center justify-between">
      <h4 className="text-4xl font-bold">Our Projects</h4>

    </div>
  </div>

  <div className="  rounded-3xl  dark:border-gray-700">
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {SectionShow &&
        SectionShow.map((item, index) => (
          <div
            key={index}
            className="group/edit flex flex-col bg-white dark:bg-stone-900 border dark:border-stone-600 rounded-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 hover:shadow-lg"
          >
            <div className="relative">
              <Link to={`/Projects/${item.slug}`}>
                <img
                  src={item.imageUrls[0]}
                  alt={item.name}
                  className="w-full h-60 object-cover rounded-t-2xl"
                />
              </Link>
              <div
                className={`absolute top-4 left-4 px-3 py-1 rounded-full shadow-lg text-sm font-semibold -translate-x-20 -translate-y-20 group-hover/edit:-translate-y-0 group-hover/edit:-translate-x-0 transition-transform ${
                  item.available === "available" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {item.available}
              </div>
            </div>
            <div className="p-4 flex flex-col justify-between flex-grow">
              <div>
                <h5 className="text-xl font-bold text-[#033e8a] ">{item.name}</h5>
                <p className="text-gray-700 dark:text-gray-300 truncate">
                  {item.description}
                </p>
              </div>
              <Link
                to={`/Projects/${item.slug}`}
                className="mt-4 bg-[#033e8a] text-white py-2 text-center rounded-full hover:from-blue-600 hover:to-blue-800 transition-all"
              >
                Read More
              </Link>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>
  </div>

</>

}

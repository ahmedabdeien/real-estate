"use client";

import { useEffect, useState } from "react";
import {  Link, useParams } from "react-router-dom"
import { Carousel } from "flowbite-react";

import { TbLoaderQuarter } from "react-icons/tb";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
// import { useSelector } from "react-redux";
import {  FaBorderStyle, FaBuilding, FaCheck, FaDrawPolygon, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import { HiArrowsExpand } from "react-icons/hi";


function ShowPage() {
  // const {currentUser} = useSelector((state) => state.user);
  const {pageSlug} = useParams();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(false);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);
  useEffect(() => {
    const fetchPage = async () =>{
       try {
          setLoading(true);
          const res = await fetch(`/api/listing/getPages?slug=${pageSlug}`);
          const data = await res.json();
          if(!res.ok){
            setError(true)
            setLoading(false);
            return;
          }
          if(res.ok){
            setPages(data.listings[0]);
           setLoading(false);
           setError(false)
          }
       } catch (error) {
          setError(true)
          setLoading(false);
       }
    }
    fetchPage()
  },[pageSlug])

  if(loading){
    return<div className="w-full h-screen flex justify-center items-center flex-col">
    <div className="">
    <TbLoaderQuarter  className="text-4xl animate-spin text-gray-500 "></TbLoaderQuarter>
    </div>
    <p className="text-gray-500">loading...</p>
</div>
  }

  
  return (
    <main className=" w-full">
      
      {/* {currentUser.isAdmin === true &&
      <div className="fixed top-1/2 left-0 z-50">
        <button><Link to={`/Update-Page/${pages._id}`} className="p-2 bg-green-500 text-white"> Edit Page</Link> </button>
      </div>} */}


      <div className=" h-96 border-b-2 dark:border-gray-600">
          <PhotoProvider>
          <Carousel pauseOnHover className="rounded-none"  >
        {pages && pages.imageUrls.map((image, index) => (
          <PhotoView key={index} src={image} alt={index} >
          <img src={image} alt={index}  className="w-full h-full object-cover "/>
          </PhotoView>
          ))}
          </Carousel>
          </PhotoProvider>
          
    </div>
    <div className="container mx-auto space-y-5 py-7">
      <div className=" space-y-2 mb-6">
        <h1 className="text-4xl font-bold text-center text-black dark:text-white">{pages && pages.name}</h1>
        <span className="flex items-center justify-center space-x-1 text-gray-600 dark:text-gray-400">
          <FaMapMarkerAlt/>
          <span>{pages && pages.address}</span>
        </span>
      </div>
      <div className="bg-gray-50 dark:bg-gray-700 p-2">
        <div>
          <h4 className="font-bold text-2xl mb-2">Description</h4>
        </div>
      <div dangerouslySetInnerHTML={{__html:pages && pages.description}} className=" description-pages"></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className=" space-y-2 ">
          <div className="divide-y dark:divide-gray-600 border dark:border-gray-600">
          <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
          <h4 className="text-lg font-semibold">The Project Size: </h4>
          <p className="font-bold"><span className="text-green-500 ">{pages && pages.propertySize}</span> m<sup>2</sup></p>
          <FaBorderStyle />
         </div>
         <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Number Floors:</h4>
           <p className="font-bold"><span className="text-green-500 ">{pages && pages.numberFloors}</span></p>
            <FaBuilding/>
         </div>
         <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Apartments:</h4>
           <p className="font-bold translate-x-5"><span className={`${pages && pages.available == "available"? 'text-green-500':"text-red-500"} `}>{pages && pages.available}</span></p>
           {pages && pages.available == "available"? <FaCheck/> :<FaTimes />}
         </div>
         <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Size Apartments:</h4>
           <p className="font-bold"><span className="text-green-500 ">{pages && pages.titleApartments}</span></p>
           <FaDrawPolygon />
         </div>
          </div>
         <div>
         <span className="text-sm">{pages && new Date(pages.createdAt).toLocaleDateString()} Page created</span>
         </div>

         <div className={`${showNew?"hidden w-0":''}bg-green-50 dark:bg-green-800/50 border dark:border-gray-600 w-full  `}>
          <div className=" flex justify-between items-center p-2">
            <h4 className="text-lg font-semibold text-green-500 dark:text-green-300">new</h4>
            <FaTimes onClick={()=> setShowNew(!showNew)} className=" hover:text-red-500 cursor-pointer"/>
          </div>
          <div className="border-t mt-1 p-2 dark:border-gray-600">
             <p>
             A Prettier plugin for Tailwind CSS that automatically sorts classes based on our recommended class order.
             </p>
             <Link to="/" className="text-blue-600 dark:text-blue-400 underline">home</Link>
          </div>
          </div>

       </div>
       <div className="relative group/itemHover overflow-hidden border dark:border-gray-600 ">
        <div className="text-lg absolute bottom-0 translate-y-20 left-0 bg-white/60 dark:bg-gray-900/60  backdrop-blur w-full p-2 group-hover/itemHover:translate-y-0 transition-transform font-bold flex justify-between items-center border-t dark:border-gray-600">
        <h5>plan</h5>
        <PhotoProvider>
        <PhotoView src={pages && pages.imagePlans} alt={pages && pages.imagePlans} >
        <button> <HiArrowsExpand  className="text-2xl hover:text-blue-600 hover:scale-125 transition-all"/></button>
       </PhotoView>
       </PhotoProvider>
        </div>
        <img src={pages && pages.imagePlans} alt="img Plan"  className="w-full"/>
       </div>
      </div>
    </div>


    <div className=" bg-gray-50/70   dark:bg-gray-700/40">
      <div className="container mx-auto py-2 space-y-3">
        <h5 className="">
          <span className="text-2xl font-bold">Apartments</span>
        </h5>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <PhotoProvider>
        {pages && pages.imageApartments.map((img,index)=>
            <div key={index} className="relative group/itemHover overflow-hidden border dark:border-gray-600 dark:bg-gray-900/70 h-[250px] flex justify-center items-center bg-white  rounded-lg">
              <div className="text-lg absolute bottom-0 translate-y-20 left-0 bg-white/60 dark:bg-gray-900/60  backdrop-blur w-full p-2 group-hover/itemHover:translate-y-0 transition-transform font-bold flex justify-between items-center  border-t dark:border-gray-600">
              <h5>Apartment {index+1}</h5>
              <PhotoView src={img} alt={img} >
              <button> <HiArrowsExpand  className="text-2xl hover:text-blue-600 hover:scale-125 transition-all"/></button>
             </PhotoView>
              </div>
              <img src={img} alt="img Apartment"  className="w-full"/>
             </div>
        )}
          </PhotoProvider>

        </div>
      </div>
    </div>


    </main>
  )
}

export default ShowPage
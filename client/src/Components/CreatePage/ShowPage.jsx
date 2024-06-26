

import { useEffect, useState } from "react";
import {  Link, useParams } from "react-router-dom"
import { Carousel } from "flowbite-react";
import {Helmet} from "react-helmet";
import { TbLoaderQuarter } from "react-icons/tb";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useSelector } from "react-redux";
import {  FaArrowLeft, FaArrowRight, FaBorderStyle, FaBuilding, FaCheck, FaDrawPolygon, FaExpand, FaMapMarkerAlt, FaTimes } from "react-icons/fa";
import NewElsarh from "./NewElsarh";
import SectionShowProjects from './SectionShowProjects';


function ShowPage() {
  
  const currentUser = useSelector((state) => state.user?.currentUser);
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

  const sizeApartments = [
    pages && pages.sizeApartmentsOne, 
    pages && pages.sizeApartmentsTwo, 
    pages && pages.sizeApartmentsThree, 
    pages && pages.sizeApartmentsFour, 
    pages && pages.sizeApartmentsFive, 
    pages && pages.sizeApartmentsSix, 
    pages && pages.sizeApartmentsSeven, 
    pages && pages.sizeApartmentsEight
  ]

  if(loading){
    return<div className="w-full h-screen flex justify-center items-center flex-col">
    <div className="">
    <TbLoaderQuarter  className="text-4xl animate-spin text-gray-500 "></TbLoaderQuarter>
    </div>
    <p className="text-gray-500">loading...</p>
</div>
  }

  
  return (
    <>
    <Helmet>
      <title>{pages && pages.name}</title>
      <meta name="description" content={pages && pages.description} />
    </Helmet>
    <main className=" w-full dark:bg-gray-800 ">
      
      {currentUser?.isAdmin && ( // Add a safe check here
        <div className="fixed top-1/2 left-0 z-50">
          <button className="hover:scale-150 hover:translate-x-5 transition-transform">
            <Link to={`/Update-Page/${pages._id}`} className="p-3 bg-green-500 text-white">
              Edit Page
            </Link>
          </button>
        </div>
      )}

 
      <div className=" h-[35rem]">
          <PhotoProvider>
          <Carousel pauseOnHover   className="rounded-none custom-carousel"
      leftControl={<div className="w-10 flex justify-center items-center bg-black h-10 overflow-hidden text-white hover:scale-110 transition-transform group/arrows group/arrowsTwo"><FaArrowLeft className="group-hover/arrows:-translate-x-11 translate-x-2 transition-transform"/><FaArrowLeft className="group-hover/arrowsTwo:-translate-x-2 translate-x-11 transition-transform"/></div>}
      rightControl={<div className="w-10 flex justify-center items-center bg-black h-10 overflow-hidden text-white hover:scale-110 transition-transform group/arrows group/arrowsTwo"><FaArrowRight className="group-hover/arrows:translate-x-11 translate-x-2 transition-transform"/><FaArrowRight className="group-hover/arrowsTwo:-translate-x-2 -translate-x-11 transition-transform"/></div>}  >
        {pages && pages.imageUrls.map((image, index) => (
          <PhotoView key={index} src={image} alt={index} >
          <img src={image} alt={index}  className="w-full h-full object-cover "/>
          </PhotoView>
          ))}
          </Carousel>
          </PhotoProvider>
          
    </div>
    <div className=" bg-stone-100">
      <div className=" space-y-2 bg-[#016FB9] py-7 container ">
        <h1 className="text-4xl font-bold  text-white">{pages && pages.name}</h1>
        <span className="flex items-center justify-start space-x-1 text-[#ff9505]">
          <FaMapMarkerAlt/>
          <span>{pages && pages.address}</span>
        </span>
      </div>
      {pages.description ?
      <div className="bg-white shadow dark:bg-gray-700 container mx-auto py-6">
          <h4 className=" text-[#016FB9] py-2 dark:text-white border-b-2 dark:border-gray-600 "><span className="text-2xl font-bold">Description</span></h4>
        <div className="py-5 ">
          <p className="whitespace-pre-line">
            {pages && pages.description}
          </p>
        </div>
      </div>:""}

      <div className=" dark:bg-gray-700 container mx-auto py-6">
        <h5 className=" text-[#016FB9] py-2 dark:text-white  dark:border-gray-600">
          <span className="text-2xl font-bold">Project Details</span>
        </h5>
         <div className="grid lg:grid-cols-2 gap-4 ">
        <div className=" bg-white shadow p-2">
          <div className="divide-y dark:divide-gray-600 dark:border-gray-600  dark:bg-gray-700 ">
          <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
          <h4 className="text-lg font-semibold">The Project Size: </h4>
          <p className="font-bold"><span className="text-[#016FB9] ">{pages && pages.propertySize}</span> m<sup>2</sup></p>
          <FaBorderStyle className="text-[#016FB9]"/>
         </div>
         <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Number Floors:</h4>
           <p className="font-bold"><span className="text-[#016FB9] ">{pages && pages.numberFloors}</span></p>
            <FaBuilding className="text-[#016FB9]"/>
         </div>
         <div className="flex items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Apartments:</h4>
           <p className="font-bold translate-x-5"><span className={`${pages && pages.available == "available"? 'text-green-500':"text-red-500"} `}>{pages && pages.available}</span></p>
           {pages && pages.available == "available"? <FaCheck className="text-[#016FB9]"/> :<FaTimes className="text-[#016FB9]"/>}
         </div>
         <div className="flex flex-wrap items-center justify-between space-x-3 py-1 px-2 ">
            <h4 className="text-lg font-semibold">Size Apartments:</h4>
            <div>
             {sizeApartments.map((size,index)=> <ul key={index} className="text-sm">{size && <li>Apartment {index+1} : {size} m<sup>2</sup></li>}</ul>)}
            </div>
           <FaDrawPolygon className="text-[#016FB9] hidden md:block"/>
         </div>
          </div>
         <div>
         <span className="text-sm">{pages && new Date(pages.createdAt).toLocaleDateString()} Page created</span>
         </div>

         <div className={`${showNew?"hidden w-0  ":''}bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 w-full `}>
          <div className=" flex justify-between items-center p-2">
            <h4 className="text-lg font-semibold text-[#016FB9] dark:text-blue-200">new</h4>
            <FaTimes onClick={()=> setShowNew(!showNew)} className=" hover:text-red-500 cursor-pointer"/>
          </div>
          <div className="border-t mt-1 p-2 dark:border-blue-900 border-blue-200">
            <NewElsarh/>
          </div>
          </div>

       </div>

       {pages?.imagePlans ? (
  <div>
    <div className="relative group/itemHover overflow-hidden border dark:border-gray-600 w-full h-80">
      <div className="text-lg absolute bottom-0 left-0 bg-stone-200 text-black dark:bg-gray-900 w-full p-2 font-bold flex justify-between items-center border-t dark:border-gray-600">
        <h5>Plan</h5>
        <PhotoProvider>
          <PhotoView src={pages.imagePlans} alt="Plan Image">
            <button>
              <FaExpand className="text-2xl hover:text-[#ff9505] hover:scale-110 transition-all" />
            </button>
          </PhotoView>
        </PhotoProvider>
      </div>
      <img src={pages.imagePlans} alt="Plan Image" className="w-full h-full object-cover" />
    </div>
  </div>
) : null}

     

      </div>
      </div>
     

      {pages?.imageApartments?.length > 0 && (
  <div className="container mx-auto py-6 bg-white dark:bg-gray-700/40">
    <div className="">
      <h5 className="text-[#016FB9] py-2 dark:text-white border-b-2 dark:border-gray-600">
        <span className="text-2xl font-bold">Apartments</span>
      </h5>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
        <PhotoProvider>
          {pages.imageApartments.map((img, index) => (
            <div key={index} className="group/itemHover flex justify-center items-center flex-col">
              <PhotoView src={img} alt={`Apartment ${index + 1}`}>
                <div className="overflow-hidden h-52 w-full">
                  <img src={img} alt="Apartment" className="w-full h-full object-cover cursor-zoom-in" />
                </div>
              </PhotoView>
              <div className="flex justify-between w-full p-2 bg-stone-50">
                <h5>Apartment {index + 1}</h5>
                <p>
                  {sizeApartments[index] && (
                    <span>Size <span className="text-blue-600">{sizeApartments[index]}</span> m<sup>2</sup></span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </PhotoProvider>
      </div>
    </div>
  </div>
)}

    </div>


   

      <div className="">
        <SectionShowProjects></SectionShowProjects>
      </div>
    </main>
    </>
  )
}

export default ShowPage
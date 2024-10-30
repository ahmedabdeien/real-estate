

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
import { BsArrowLeft, BsArrowRight, BsGear, BsStars } from "react-icons/bs";

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
    <main className=" w-full bg-stone-100 dark:bg-gray-800 ">
      
      {currentUser?.isAdmin && ( // Add a safe check here
        <div className="fixed top-1/2 left-0 z-50">
          <button className="hover:scale-150 hover:translate-x-5 transition-transform ">
            <Link to={`/Update-Page/${pages._id}`} className="p-3 bg-[#ff9505] text-[#353531] flex items-center justify-center space-x-1">
              <span>
                Edit Page
              </span>
              <BsGear className="size-6 animate-pulse"/>
            </Link>
          </button>
        </div>
      )}

 
      <div className="">
        <div className=" overflow-hidden h-[30rem]">
        <PhotoProvider>
          <Carousel pauseOnHover   className="rounded-none custom-carousel"
      leftControl={<div className="w-10 flex justify-center items-center hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all"><BsArrowLeft className="text-5xl" /></div>}
      rightControl={<div className="w-10 flex justify-center items-center hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all"><BsArrowRight className="text-5xl"/></div>}  >
        {pages && pages.imageUrls.map((image, index) => (
          <PhotoView key={index} src={image} alt={index} >
          <img src={image} alt={index}  className="w-full h-full object-cover  "/>
          </PhotoView>
          ))}
          </Carousel>
          </PhotoProvider>
        </div>      
    </div>
    <div className=" container py-5">
      <div className="bg-white rounded-2xl shadow border">
        <div className=" space-y-2 py-5 ">
        <div className="px-5">
          <h1 className="text-4xl font-bold  text-[#002E66]">{pages && pages.name}</h1>
          <div className="flex items-center justify-start mx-auto space-x-1  text-[#ff9505] ">
              <FaMapMarkerAlt/>
              <span className=" ">{pages && pages.address}</span>
          </div>
        </div>
        </div>
        {pages.description ?
        <div className=" dark:bg-gray-700  px-5">
          
        <div className="pb-5 ">
          <p className="whitespace-pre-line text-[#353531]/80">
            {pages && pages.description}
          </p>
        </div>
        </div>:""}
      </div>
      <div className={`dark:bg-gray-700 grid ${pages.imagePlans && pages.imagePlans.length > 0 ? "lg:grid-cols-2": "lg:grid-cols-1"}  gap-4 py-4`}>
         <div className="bg-white shadow p-5 rounded-2xl">
        <h5 className=" text-[#353531] pb-2 dark:text-white dark:border-gray-600">
          <span className="text-2xl font-bold">Project Details</span>
        </h5>
        <div className=" ">
          <div className="divide-y border-y dark:divide-gray-600 dark:border-gray-600  dark:bg-gray-700 ">
          <div className="flex items-center justify-between space-x-3 py-1">
          <h4 className="text-lg">The Project Size: </h4>
          <p className="font-bold"><span className="text-[#016FB9] ">{pages && pages.propertySize} m<sup>2</sup></span></p>
          <FaBorderStyle className="text-[#ff9505]"/>
         </div>
         <div className="flex items-center justify-between space-x-3 py-1">
            <h4 className="text-lg">Number Floors:</h4>
           <p className="font-bold"><span className="text-[#016FB9] ">{pages && pages.numberFloors}</span></p>
            <FaBuilding className="text-[#ff9505]"/>
         </div>
         <div className="flex items-center justify-between space-x-3 py-1">
            <h4 className="text-lg">Apartments:</h4>
           <p className="font-bold translate-x-5"><span className={`${pages && pages.available == "available"? 'text-green-500':"text-red-500"} `}>{pages && pages.available}</span></p>
           {pages && pages.available == "available"? <FaCheck className="text-[#016FB9]"/> :<FaTimes className="text-[#ff9505]"/>}
         </div>
         <div className="flex flex-wrap items-center justify-between space-x-3 py-1 ">
            <h4 className="text-lg">Size Apartments:</h4>
            <div>
             {sizeApartments.map((size,index)=> <ul key={index} className="text-sm text-[#016FB9]">{size && <li>Apartment {index+1} : {size} m<sup>2</sup></li>}</ul>)}
            </div>
           <FaDrawPolygon className="text-[#ff9505] hidden md:block"/>
         </div>
          </div>
         <div>
         <span className="text-sm">{pages && new Date(pages.createdAt).toLocaleDateString()} Page created</span>
         </div>

         <div className={`${showNew?"hidden w-0  ":''} bg-stone-100 dark:bg-blue-950/50 border rounded-xl mt-4 dark:border-blue-900 w-full `}>
          <div className=" flex justify-between items-center p-2">
            <h4 className="text-lg font-semibold flex items-center space-x-1 dark:text-blue-200"><span>new</span><BsStars className="text-[#ff9505]"/>            </h4>
            <FaTimes onClick={()=> setShowNew(!showNew)} className=" hover:text-red-500 cursor-pointer"/>
          </div>
          <div className="border-t mt-1 p-2 dark:border-blue-900">
            <NewElsarh/>
          </div>
          </div>
       </div>
      </div>
{pages.imagePlans && pages.imagePlans.length > 0 ? 
  <div className="bg-white shadow p-5 rounded-2xl ">
     <h5 className=" text-[#353531] dark:text-white  dark:border-gray-600 text-2xl font-bold">
        Project Details
        </h5>
    <div className=" dark:border-gray-600 w-full bg-stone-100 border mt-3 overflow-hidden ">
      <div className=" bg-stone-200 dark:bg-gray-900 w-full font-bold dark:border-gray-600">
        <PhotoProvider>
          <PhotoView src={pages && pages.imagePlans} alt="Plan Image">
            <div className=" w-full">
              <img src={pages && pages.imagePlans} alt="Plan Image" className="w-full h-80 object-cover cursor-zoom-in" />
              </div>
          </PhotoView>
        </PhotoProvider>
      </div>
    </div>
  </div>
 : ""}
      </div>
     

      {pages?.imageApartments?.length > 0 && (
  <div className="p-5 bg-white rounded-2xl dark:bg-gray-700/40">
    <div className="">
      <h5 className="text-[#353531] dark:text-white ">
        <span className="text-2xl font-bold">Apartments</span>
      </h5>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        <PhotoProvider>
          {pages.imageApartments.map((img, index) => (
            <div key={index} className="group/itemHover flex justify-center items-center flex-col rounded-xl overflow-hidden">
              <PhotoView src={img} alt={`Apartment ${index + 1}`}>
                <div className="overflow-hidden h-52 w-full">
                  <img src={img} alt="Apartment" className="w-full h-full object-cover cursor-zoom-in" />
                </div>
              </PhotoView>
              <div className="flex justify-between w-full p-3 border bg-stone-200">
                <h5>Apartment {index + 1}</h5>
                <p>
                  {sizeApartments[index] && (
                    <span>Size <span className="text-[#ff9505]">{sizeApartments[index]} m<sup>2</sup></span></span>
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
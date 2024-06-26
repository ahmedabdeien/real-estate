import { Carousel } from "flowbite-react"
import { PhotoProvider} from "react-photo-view"
import photosOne from "../../assets/images/realestateimages.jpg"
import photostwo from "../../assets/images/image_fx.jpg"

import { BsArrowLeft,BsArrowRight } from "react-icons/bs";
function sectionCarousel() {
   

  
     // fetch data from API or local storage
     const sections = [ photosOne , photostwo, photosOne]
     const datatext = ["Choosing Al-Sarh Investment Real Estate means getting the ideal partner who ensures success in all aspects of your real estate investments.", 
      "We offer properties in prime locations that ensure value appreciation over time.", 
      " We provide the highest standards of quality in construction and design, ensuring you long-lasting comfort and luxury."]
     
   

  return (
    <div>
      <div className=" h-96 overflow-hidden">
          <PhotoProvider>
          <Carousel pauseOnHover   className="rounded-none custom-carousel"
      leftControl={<div className="w-10 flex justify-center items-center  hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all group/arrows group/arrowsTwo"><BsArrowLeft className="group-hover/arrows:scale-110 transition-transform text-5xl"/></div>}
      rightControl={<div className="w-10 flex justify-center items-center hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all group/arrows group/arrowsTwo"><BsArrowRight className="group-hover/arrows:scale-110  transition-transform text-5xl"/></div>}  >
        {sections && sections.map((image, index) => (
          <>
          <img key={index} src={image} alt={index}  className="w-full h-full object-cover "/>
          <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center translate-x-32 ">
          <div className="bg-white/95 dark:bg-stone-900 text-[#033e8a] font-bold border-s-4 lg:w-96 border-[#033e8a] hidden lg:block">
           <p className="p-4">
             {datatext[index]}
           </p>
           <div className="">
            <h1 className="text-xs font-bold text-stone-700 bg-stone-100 bg-gradient-to-r from-[ #ff9505] px-4 p-1 w-auto  ">Section {index + 1 }/3</h1>
          </div>
          </div>
          </div>
          </>
          ))}
          </Carousel>
          </PhotoProvider>
          
    </div>
    </div>
  )
}

export default sectionCarousel
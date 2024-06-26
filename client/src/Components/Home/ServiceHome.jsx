
// import { BsMegaphone } from "react-icons/bs";
// import { BsBinoculars } from "react-icons/bs";
import { BsBuildingCheck,BsBriefcase,BsArrowRepeat,BsGraphUpArrow} from "react-icons/bs";
export default function ServiceHome() {
  return (
    <div className=" dark:bg-stone-800">
      <div className="py-6 space-y-4 container">
      <div className=" px-2 flex justify-center items-center ">
        <div className=" space-y-3 mb-4 flex justify-center items-center flex-col">
            <h2 className="text-3xl font-bold  text-black dark:text-white">Service</h2>
            <div className="w-16 h-1 bg-[#033e8a] dark:bg-[#016FB9]"></div>
        </div>
      </div>
         <div className="flex flex-wrap">
            <div className="w-full md:w-1/2 lg:w-1/4 p-2">
               <div className="p-4 bg-white dark:bg-stone-900 shadow space-y-2 h-full">
                 <BsBuildingCheck  className="text-4xl"/>
                 <p className="">From planning to execution, we handle all aspects of real estate project development to ensure the best results.</p>
               </div>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/4 p-2">
               <div className="p-4 bg-white dark:bg-stone-900 shadow space-y-2 h-full">
                 <BsBriefcase  className="text-4xl"/>
                 <p className="">We ensure the safety of legal procedures by offering specialized legal advice and preparing contracts that protect your rights.</p>
               </div>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/4 p-2 ">
               <div className="p-4 bg-white dark:bg-stone-900 shadow space-y-2 h-full">
                 <BsArrowRepeat  className="text-4xl"/>
                 <p className="">Even after the deal is closed, we&apos;re with you to provide the additional support and services you need.</p>
               </div>
            </div>
            <div className="w-full md:w-1/2 lg:w-1/4 p-2 ">
               <div className="p-4 bg-white dark:bg-stone-900 shadow space-y-2 h-full">
                 <BsGraphUpArrow  className="text-4xl"/>
                 <p className="">We provide you with accurate market analyses and investment opportunities to ensure you achieve the highest returns on your investments.</p>
               </div>
            </div>

         </div>

      </div>
    </div>
  )
}

import { useState } from "react";
import {  BsChevronLeft, BsEnvelope , BsTelephone } from "react-icons/bs";
import { FaEllipsisH } from "react-icons/fa";
export default function ButtonTop() {
  let [contactBtn , setContactBtn] = useState(false)
  return (
    <>
    <div className={` ${contactBtn? 'left-5':'-left-[75px]'} transition-all duration-300 ease-in-out fixed bottom-4 z-40  p-2  flex  items-center justify-between`}>
        <div className={`${contactBtn? 'scale-100':' scale-0'} ease-in-out shadow transition-all duration-300 space-y-2 rounded-full bg-white p-2 `}>
          <a href="tel:+201212622210" className="w-12 h-12 rounded-full bg-[#8fbc8f] hover:bg-[#8fbc8f]/80 transition-colors border border-black/10 shadow p-1 px-2 flex flex-col justify-center items-center" target="_blank" rel="noopener noreferrer" >
            <BsTelephone className="text-3xl text-stone-700"/>
          </a>
          <a href="mailto:elsarhegypt@gmail.com" className="w-12 h-12 rounded-full bg-[#779ecb] hover:bg-[#779ecb]/80 transition-colors border border-black/10 shadow  p-1 px-2 flex flex-col justify-center items-center" target="_blank" rel="noopener noreferrer">
            <BsEnvelope className="text-3xl text-stone-700"/>
          </a>
        </div>        
        <div onClick={()=>setContactBtn(!contactBtn)} className={` transition-transform duration-300 p-2 translate-x-2 bg-stone-300 cursor-pointer hover:scale-110 rounded-full`}>
            <FaEllipsisH className={`${contactBtn?" rotate-0":"rotate-180"} text-3xl text-stone-700`}/>
        </div>
    </div>
    </>
  )
}

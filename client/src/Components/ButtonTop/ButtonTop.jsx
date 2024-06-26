import { BsArrowUp, BsTelephone } from "react-icons/bs";
import { BsEnvelope } from "react-icons/bs";
export default function ButtonTop() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

  return (
    <>
    <div onClick={scrollToTop} className="bg-stone-300 hover:bg-[#ff9505] hover:scale-y-110 transition-transform fixed bottom-5 left-3 p-2 z-50 flex items-center cursor-pointer"><span>ButtonTop</span><BsArrowUp className="text-xl"/></div>
    <div className="">
        <div className="fixed bottom-16 z-50 left-3 space-y-1">
            <a href="tel:+201212622210"className=" bg-green-400 border border-black/20 rounded p-1 px-2 flex flex-col justify-center items-center " target="_blank" rel="noopener noreferrer" >
                <BsTelephone/>
                <span>phone</span>
            </a>
            <a href="mailto:elsarhegypt@gmail.com" className="bg-blue-400 border border-black/20 rounded p-1 px-2 flex flex-col justify-center items-center" target="_blank" rel="noopener noreferrer">
            <BsEnvelope/>
            <span>Email</span>
            </a>
        </div>
    </div>
    </>
  )
}

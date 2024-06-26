import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from '../redux/theme/themeSlice';
import { Link } from "react-router-dom";

export default function Settings() {
    const dispatchTheme = useDispatch();
    const {theme} = useSelector(state => state.theme);
    const styleNavLink = ({isActive}) => {
        return {
          
          background: isActive ? (theme === "dark" ? '' : (theme === "light" ? '' : '')) : '',
          position: isActive ? 'relative' : 'relative',
          
        }
     }
  return (
    <div className="container mx-auto py-7">
     <div className="">
        <h2 className="text-center text-3xl border-b dark:border-gray-600 pb-3">
            Settings
        </h2>
        <div className="flex justify-center">
            <div className="w-1/2 divide-y dark:divide-opacity-10 dark:divide-white">
                <div className="flex justify-between items-center py-2">
                    <h3 className="text-xl">{theme === "light" ?"Dark mode":"Light mode"}</h3>
                    <button onClick={()=>dispatchTheme(toggleTheme())} className={`${theme === "light" ?"bg-transparent":"bg-[#ff9505]"} transition-colors border dark:border-gray-600 text-white p-1 rounded-full w-14`}>
                        <div className={` ${theme === "light" ?"translate-x-0 bg-[#0d5b8f]":"translate-x-7 bg-white"} transition-all w-4 h-4  rounded-full`}></div></button>
                </div>
                <div className="flex justify-between items-center py-2">
                    <h3 className="text-xl">Change Name And Email And Password ...</h3>
                    <Link to="/Dashboard?tab=Profile" className="bg-[#016FB9] hover:bg-[#016FB9]/80 text-white p-2 rounded-lg">Change</Link>
                </div>
                <div className="flex justify-between items-center py-2">
                    <h3 className="text-xl">Home</h3>
                    <Link to="/" className="bg-[#016FB9] hover:bg-[#016FB9]/80 text-white p-2 rounded-lg">Go Back</Link>
                </div>
                <div className="flex justify-between items-center py-2">
                    <h3 className="text-xl">Logout</h3>
                    <Link to="/" className="bg-[#ff0000] hover:bg-[#ff0000]/80 text-white p-2 rounded-lg">Logout</Link>
                </div>
            </div>
        </div>
     </div>
    </div>
  )
}

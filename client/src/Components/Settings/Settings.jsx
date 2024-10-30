import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from '../redux/theme/themeSlice';
import { Link } from "react-router-dom";
import { BsGearWideConnected, BsMoon, BsSun, BsPencil, BsHouseDoor, BsBoxArrowRight } from "react-icons/bs";
import { Helmet } from "react-helmet";
import { FaGear } from "react-icons/fa6";
export default function Settings() {
    const dispatchTheme = useDispatch();
    const { theme } = useSelector(state => state.theme);
    
    return (
        <>
        <Helmet>
            <title>Settings | StockMarket</title>
        </Helmet>
        <div className="container mx-auto ">
            <div className="bg-white mx-auto max-w-3xl dark:bg-stone-900  space-y-6 border">
                <div className="space-y-4 border-b dark:border-gray-700 p-6 bg-stone-200 dark:bg-stone-800">
                    <div className="w-20 h-20 flex justify-center items-center bg-[#016FB9] mx-auto shadow-lg">
                        <FaGear className="text-5xl text-white"/>
                    </div>
                    <h2 className="text-center text-3xl font-bold text-gray-800 dark:text-white">
                        Settings
                    </h2> 
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Customize your experience
                    </p>
                </div>

                <div className=" p-5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 py-4">
                            {theme === "light" ? <BsMoon className="text-2xl text-gray-600" /> : <BsSun className="text-2xl text-yellow-400" />}
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                {theme === "light" ? "Dark mode" : "Light mode"}
                            </h3>
                        </div>
                        <button 
                            onClick={() => dispatchTheme(toggleTheme())} 
                            className={`${theme === "light" ? "bg-gray-200" : "bg-blue-600"} transition-colors border-2 border-transparent focus:border-blue-500 p-1 rounded-full flex items-center w-16 h-8`}
                        >
                            <div className={`${theme === "light" ? "translate-x-0 bg-white" : "translate-x-[30px] bg-white"} transition-all w-6 h-6 rounded-full shadow-md`}></div>
                        </button>
                    </div>

                    <SettingItem 
                        icon={<BsPencil />}
                        title="Edit Profile"
                        linkTo="/Dashboard?tab=Profile"
                        buttonText="Edit"

                    />

                    <SettingItem 
                        icon={<BsHouseDoor />}
                        title="Return Home"
                        linkTo="/"
                        buttonText="Go Back"
                    />

                    <SettingItem 
                        icon={<BsBoxArrowRight />}
                        title="Logout"
                        linkTo="/"
                        buttonText="Logout"
                        danger
                    />
                </div>
            </div>
        </div>
        </>
    )
}

function SettingItem({ icon, title, linkTo, buttonText, danger = false }) {
    return (
        <div className="flex justify-between items-center py-3 border-t dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <div className={`text-2xl ${danger ? 'text-red-500' : 'text-blue-500'}`}>{icon}</div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">{title}</h3>
            </div>
            <Link 
                to={linkTo} 
                className={`${
                    danger 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    danger ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
            >
                {buttonText}
            </Link>
        </div>
    )
}
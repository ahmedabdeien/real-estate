import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from '../redux/theme/themeSlice';
import { Link } from "react-router-dom";
import { BiMoon, BiSun, BiPencil, BiHome, BiLogOut } from "react-icons/bi";
import { Helmet } from "react-helmet";
import { FaComments ,FaColumns,FaCoins ,FaCogs} from "react-icons/fa";
export default function Settings() {
    const dispatchTheme = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <>
        <Helmet>
            <title>Settings | StockMarket</title>
        </Helmet>
        <div dir="rtl" className="bg-stone-100 dark:bg-gray-900 py-8 md:p-8 ">
        <div className="md:container mx-auto ">
            <div className="  max-w-3xl mx-auto">
                <div className="p-6 ">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 flex justify-center items-center bg-[#033e8a] rounded-2xl">
                            <FaCogs className="text-6xl text-white" />
                        </div>
                    </div>
                    <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mt-4">
                    إعدادات
                    </h2>
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                    قم بتخصيص تجربتك
                    </p>
                </div>

                <div className="px-4 py-3 bg-white dark:bg-gray-800 md:rounded-lg">
                    <div className="flex justify-between items-center py-2">
                        <div className="flex items-center space-x-3">
                           
                            <h3 className="text-lg  text-gray-800 dark:text-white">
                                {theme === "light" ? "الوضع المظلم" : "وضع الضوء"}
                            </h3>
                        </div>
                        <button 
                            onClick={() => dispatchTheme(toggleTheme())}
                            className={`${theme === "light" ? "bg-gray-200 dark:bg-gray-600" : "bg-blue-500 dark:bg-blue-600"} transition-colors border-2 border-transparent focus:border-blue-500 p-1 rounded-full flex items-center w-16 h-8`}
                        >
                            <div className={`${theme === "light" ? "translate-x-0 bg-white" : "-translate-x-[30px] bg-white"} transition-all w-6 h-6 rounded-full shadow-md`}></div>
                        </button>
                    </div>

                    <SettingItem 
                        title="تعديل الملف الشخصي"
                        linkTo="/Dashboard?tab=Profile"
                        buttonText="يحرر"
                    />

                    <SettingItem 
                        title="العودة الصفحة الرئيسية"
                        linkTo="/"
                        buttonText="العودة الى"
                    />

                    <SettingItem 
                        title="تسجيل الخروج"
                        linkTo="/"
                        buttonText="تسجيل الخروج"
                        danger
                    />
                </div>
            </div>
        </div></div>
        </>
    )
}

function SettingItem({ icon, title, linkTo, buttonText, danger = false }) {
    return (
        <div className="flex justify-between items-center py-2 border-t dark:border-gray-600">
            <div className="flex items-center space-x-3">
                <div className={`text-2xl ${danger ? 'text-red-500' : 'text-blue-500'}`}>{icon}</div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white">{title}</h3>
            </div>
            <Link 
                to={linkTo}
                className={`${
                    danger 
                        ? 'bg-red-700 hover:bg-red-600' 
                        : 'bg-stone-700 hover:bg-blue-600'
                } text-white py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    danger ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
            >
                {buttonText}
            </Link>
        </div>
    )
}
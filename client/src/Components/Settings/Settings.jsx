import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from '../redux/theme/themeSlice';
import { Link } from "react-router-dom";
import { BiMoon, BiSun, BiPencil, BiHome, BiLogOut } from "react-icons/bi";
import { Helmet } from "react-helmet";
import { FaCogs } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Settings() {
    const dispatchTheme = useDispatch();
    const { theme } = useSelector(state => state.theme);

    return (
        <>
            <Helmet>
                <title>Settings | StockMarket</title>
            </Helmet>
            <div dir="rtl" className="bg-stone-100 dark:bg-gray-900 min-h-screen py-8 md:p-8">
                <div className="md:container mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                        >
                            <div className="flex justify-center">
                                <div className="w-20 h-20 flex justify-center items-center bg-gray-200 rounded-2xl border border-gray-300 dark:border-gray-700 text-blue-600 dark:bg-gray-800 dark:text-blue-500">
                                    <FaCogs className="text-6xl " />
                                </div>
                            </div>
                            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mt-4">
                                إعدادات
                            </h2>
                            <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                                قم بتخصيص تجربتك
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="px-4 py-6 bg-white dark:bg-gray-800 rounded-2xl "
                        >
                            {/* Theme Toggle */}
                            <div className="flex justify-between items-center py-3">
                                <div className="flex items-center space-x-3">
                                    {theme === "light" ? (
                                        <BiSun className="text-2xl text-yellow-500" />
                                    ) : (
                                        <BiMoon className="text-2xl text-blue-500" />
                                    )}
                                    <h3 className="text-lg text-gray-800 dark:text-white">
                                        {theme === "light" ? "الوضع المظلم" : "وضع الضوء"}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => dispatchTheme(toggleTheme())}
                                    className={`${
                                        theme === "light" ? "bg-gray-200" : "bg-blue-500"
                                    } relative w-16 h-8 rounded-full transition-colors duration-300 focus:outline-none`}
                                >
                                    <motion.div
                                        className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1 left-1"
                                        animate={{
                                            x: theme === "light" ? 2 : 30,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    />
                                </button>
                            </div>

                            {/* Settings Items */}
                            <SettingItem
                                icon={<BiPencil className="text-2xl text-blue-500" />}
                                title="تعديل الملف الشخصي"
                                linkTo="/Dashboard?tab=Profile"
                                buttonText="يحرر"
                            />

                            <SettingItem
                                icon={<BiHome className="text-2xl text-blue-500" />}
                                title="العودة الصفحة الرئيسية"
                                linkTo="/"
                                buttonText="العودة الى"
                            />

                            <SettingItem
                                icon={<BiLogOut className="text-2xl text-red-500" />}
                                title="تسجيل الخروج"
                                linkTo="/"
                                buttonText="تسجيل الخروج"
                                danger
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SettingItem({ icon, title, linkTo, buttonText, danger = false }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-between items-center py-3 border-t dark:border-gray-700"
        >
            <div className="flex items-center space-x-3">
                <div className={`text-2xl ${danger ? 'text-red-500' : 'text-blue-500'}`}>
                    {icon}
                </div>
                <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    {title}
                </h3>
            </div>
            <Link
                to={linkTo}
                className={`${
                    danger
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                } text-white py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 ${
                    danger ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                }`}
            >
                {buttonText}
            </Link>
        </motion.div>
    );
}
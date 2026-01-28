import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from '../redux/theme/themeSlice';
import { Link } from "react-router-dom";
import { BiMoon, BiSun, BiPencil, BiHome, BiLogOut } from "react-icons/bi";
import { Helmet } from "react-helmet";
import { FaCogs } from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function Settings() {
    const dispatchTheme = useDispatch();
    const { theme } = useSelector(state => state.theme);
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('settings') || 'الإعدادات'} | {t('site_name') || 'الصرح'}</title>
            </Helmet>
            <div dir="rtl" className="bg-stone-50 dark:bg-gray-900 min-h-screen py-8 md:p-8 font-body">
                <div className="md:container mx-auto">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                        >
                            <div className="flex justify-center">
                                <div className="w-20 h-20 flex justify-center items-center bg-white rounded-none border-2 border-primary-600 text-primary-600 dark:bg-gray-800 shadow-lg">
                                    <FaCogs className="text-4xl" />
                                </div>
                            </div>
                            <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white mt-6 uppercase tracking-widest">
                                {t('settings') || 'إعدادات النظام'}
                            </h2>
                            <p className="text-center text-slate-500 dark:text-gray-400 mt-2 font-medium">
                                {t('settings_subtitle') || 'قم بتخصيص تجربتك الفريدة في الصرح'}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="px-8 py-10 bg-white dark:bg-gray-800 rounded-none border border-slate-200 shadow-xl"
                        >
                            {/* Theme Toggle */}
                            <div className="flex justify-between items-center py-6 border-b border-slate-100">
                                <div className="flex items-center space-x-4 space-x-reverse">
                                    <div className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center border border-slate-200">
                                        {theme === "light" ? (
                                            <BiSun className="text-xl text-yellow-500" />
                                        ) : (
                                            <BiMoon className="text-xl text-primary-500" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                        {theme === "light" ? (t('dark_mode') || 'الوضع المظلم') : (t('light_mode') || 'وضع الضوء')}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => dispatchTheme(toggleTheme())}
                                    className={`${theme === "light" ? "bg-slate-200" : "bg-primary-600"
                                        } relative w-16 h-8 rounded-none transition-colors duration-300 focus:outline-none`}
                                >
                                    <motion.div
                                        className="w-6 h-6 bg-white rounded-none shadow-md absolute top-1 left-1"
                                        animate={{
                                            x: theme === "light" ? 0 : 32,
                                        }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    />
                                </button>
                            </div>

                            {/* Settings Items */}
                            <SettingItem
                                icon={<BiPencil className="text-xl" />}
                                title={t('edit_profile') || "تعديل الملف الشخصي"}
                                linkTo="/Dashboard?tab=Profile"
                                buttonText={t('edit') || "تعديل"}
                            />

                            <SettingItem
                                icon={<BiHome className="text-xl" />}
                                title={t('back_home') || "العودة للرئيسية"}
                                linkTo="/"
                                buttonText={t('go') || "اذهب"}
                            />

                            <SettingItem
                                icon={<BiLogOut className="text-xl text-red-500" />}
                                title={t('logout') || "تسجيل الخروج"}
                                linkTo="/"
                                buttonText={t('logout') || "خروج"}
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
            className="flex justify-between items-center py-6 border-b border-slate-100 dark:border-gray-700"
        >
            <div className="flex items-center space-x-4 space-x-reverse">
                <div className={`w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center border border-slate-200 ${danger ? 'text-red-600 bg-red-50' : 'text-primary-600'}`}>
                    {icon}
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    {title}
                </h3>
            </div>
            <Link
                to={linkTo}
                className={`${danger
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                        : 'bg-slate-900 hover:bg-black shadow-slate-200'
                    } text-white py-2 px-6 rounded-none transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-md`}
            >
                {buttonText}
            </Link>
        </motion.div>
    );
}
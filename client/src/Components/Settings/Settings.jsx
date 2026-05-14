import React from "react";
import { Link } from "react-router-dom";
import { BiPencil, BiHome, BiLogOut } from "react-icons/bi";
import { Helmet } from "react-helmet";
import { FaCogs } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Settings() {
    return (
        <>
            <Helmet>
                <title>الإعدادات | الصرح</title>
            </Helmet>
            <div dir="rtl" className="min-h-screen py-8 md:p-8 font-body" style={{ background: '#f7f5f0' }}>
                <div className="md:container mx-auto">
                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8"
                        >
                            <div className="w-16 h-16 mx-auto flex items-center justify-center mb-5"
                                style={{ background: 'rgba(138,105,36,0.1)', border: '1px solid rgba(138,105,36,0.2)' }}>
                                <FaCogs size={28} style={{ color: '#8A6924' }} />
                            </div>
                            <h2 className="text-2xl font-black" style={{ color: '#12283C' }}>إعدادات الحساب</h2>
                            <p className="text-sm mt-1" style={{ color: '#8A6924' }}>إدارة تفضيلاتك الشخصية</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white border border-stone-200 shadow-sm overflow-hidden"
                        >
                            <SettingItem
                                icon={<BiPencil size={18} />}
                                title="تعديل الملف الشخصي"
                                desc="تحديث بياناتك الشخصية وصورتك"
                                linkTo="/Dashboard?tab=Profile"
                                buttonText="تعديل"
                            />
                            <SettingItem
                                icon={<BiHome size={18} />}
                                title="الصفحة الرئيسية"
                                desc="العودة إلى الصفحة الرئيسية"
                                linkTo="/"
                                buttonText="اذهب"
                            />
                            <SettingItem
                                icon={<BiLogOut size={18} />}
                                title="تسجيل الخروج"
                                desc="الخروج من حسابك بأمان"
                                linkTo="/"
                                buttonText="خروج"
                                danger
                            />
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SettingItem({ icon, title, desc, linkTo, buttonText, danger = false }) {
    return (
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 last:border-0">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center"
                    style={{
                        background: danger ? 'rgba(239,68,68,0.08)' : 'rgba(138,105,36,0.08)',
                        color: danger ? '#dc2626' : '#8A6924',
                        border: `1px solid ${danger ? 'rgba(239,68,68,0.15)' : 'rgba(138,105,36,0.15)'}`,
                    }}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-black" style={{ color: '#12283C' }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#9b8869' }}>{desc}</p>
                </div>
            </div>
            <Link
                to={linkTo}
                className="px-5 py-2 text-xs font-black tracking-wide transition-all duration-200 hover:-translate-y-0.5"
                style={{
                    background: danger ? '#dc2626' : '#12283C',
                    color: danger ? 'white' : '#DFBA6B',
                }}
            >
                {buttonText}
            </Link>
        </div>
    );
}
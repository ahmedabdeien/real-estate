import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteUserFailure, deleteUserStart, deleteUserSuccess,
    logOutUserFailure, logOutUserStart, logOutUserSuccess
} from '../redux/user/userSlice';
import {
    HiHome, HiUser, HiUsers, HiChartBar, HiCog, HiDocumentText,
    HiMail, HiNewspaper, HiPencilAlt, HiOfficeBuilding, HiLogout,
    HiTrash, HiExclamation, HiChevronDown, HiChevronRight,
    HiViewGrid, HiCollection, HiBriefcase
} from 'react-icons/hi';
import Logoelsarh from '../../assets/images/logoElsarh.png';

function DashSideBar() {
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab') || '';
    const [showModal, setShowModal] = useState(false);
    const [openGroups, setOpenGroups] = useState({ projects: true, content: true });
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const toggleGroup = (key) => {
        setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) dispatch(deleteUserFailure(data.message));
            else dispatch(deleteUserSuccess(data));
        } catch {
            dispatch(deleteUserFailure());
        }
    };

    const handleSignout = async () => {
        try {
            dispatch(logOutUserStart());
            const res = await fetch('/api/user/signout', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) dispatch(logOutUserFailure(data.message));
            else dispatch(logOutUserSuccess());
        } catch {
            dispatch(logOutUserFailure());
        }
    };

    const roleLabel = currentUser?.isAdmin
        ? 'مسؤول النظام'
        : currentUser?.role === 'Sales'
            ? 'فريق المبيعات'
            : 'مستخدم';

    const NavItem = ({ to, icon: Icon, label, tabKey }) => {
        const isActive = tab === tabKey;
        return (
            <Link to={to}>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-sm cursor-pointer transition-all text-sm font-medium
                    ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-slate-600 hover:bg-primary-50 hover:text-primary'
                    }`}>
                    <Icon size={15} />
                    <span>{label}</span>
                </div>
            </Link>
        );
    };

    const SectionHeader = ({ label, groupKey }) => (
        <button
            onClick={() => toggleGroup(groupKey)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors mt-3 mb-1"
        >
            <span>{label}</span>
            {openGroups[groupKey]
                ? <HiChevronDown size={11} />
                : <HiChevronRight size={11} />
            }
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-sm" dir="rtl">
            {/* Logo Header - Odoo-like dark header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-secondary border-b border-secondary-800 flex-shrink-0">
                <img src={Logoelsarh} alt="الصرح" className="h-7 w-auto brightness-0 invert" />
                <div>
                    <div className="text-white font-black text-sm tracking-tight leading-tight">الصرح للعقارات</div>
                    <div className="text-slate-400 text-[10px] leading-tight">{roleLabel}</div>
                </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-8 h-8 rounded-sm object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 truncate">{currentUser?.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{currentUser?.email}</div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">

                <NavItem to="/Dashboard?tab=Profile" icon={HiUser} label="ملفي الشخصي" tabKey="Profile" />

                {currentUser?.isAdmin && (
                    <>
                        <NavItem to="/Dashboard?tab=dashbordData" icon={HiChartBar} label="لوحة الإحصائيات" tabKey="dashbordData" />

                        <SectionHeader label="إدارة المشاريع" groupKey="projects" />
                        {openGroups.projects && (
                            <div className="space-y-0.5">
                                <NavItem to="/Dashboard?tab=pagesFinished" icon={HiCollection} label="المشاريع المنجزة" tabKey="pagesFinished" />
                                <NavItem to="/CreatePage" icon={HiPencilAlt} label="إضافة مشروع جديد" tabKey="_createPage" />
                                <NavItem to="/PageBroker" icon={HiBriefcase} label="عرض الوسيط" tabKey="_pageBroker" />
                            </div>
                        )}

                        <SectionHeader label="إدارة المحتوى" groupKey="content" />
                        {openGroups.content && (
                            <div className="space-y-0.5">
                                <NavItem to="/Dashboard?tab=staticPages" icon={HiViewGrid} label="الصفحات الثابتة" tabKey="staticPages" />
                                <NavItem to="/Dashboard?tab=blogs" icon={HiNewspaper} label="الأخبار والمدونة" tabKey="blogs" />
                                <NavItem to="/Dashboard?tab=messages" icon={HiMail} label="صندوق الرسائل" tabKey="messages" />
                                <NavItem to="/Dashboard?tab=users" icon={HiUsers} label="إدارة المستخدمين" tabKey="users" />
                                <NavItem to="/Admin-Settings" icon={HiCog} label="إعدادات الموقع" tabKey="_adminSettings" />
                            </div>
                        )}
                    </>
                )}

                {currentUser?.role === 'Sales' && !currentUser?.isAdmin && (
                    <NavItem to="/Dashboard?tab=messages" icon={HiMail} label="الرسائل الواردة" tabKey="messages" />
                )}
            </nav>

            {/* Sign Out & Delete */}
            <div className="border-t border-slate-100 p-2 space-y-0.5 flex-shrink-0">
                <button
                    onClick={handleSignout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                    <HiLogout size={15} />
                    <span>تسجيل الخروج</span>
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-sm text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-red-400 transition-colors"
                >
                    <HiTrash size={15} />
                    <span>حذف الحساب</span>
                </button>
            </div>

            {/* Confirm Delete Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-sm shadow-2xl w-96 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        dir="rtl"
                    >
                        <div className="flex items-center gap-3 bg-red-500 text-white p-4">
                            <HiExclamation size={20} />
                            <h3 className="font-bold">تأكيد حذف الحساب</h3>
                        </div>
                        <div className="p-6 text-center space-y-3">
                            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <HiTrash className="text-red-400 text-2xl" />
                            </div>
                            <p className="text-slate-700 font-semibold text-sm">هل أنت متأكد من حذف حسابك؟</p>
                            <p className="text-xs text-slate-400">هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بياناتك بشكل دائم.</p>
                        </div>
                        <div className="flex gap-2 p-4 border-t border-slate-100 justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 text-sm font-bold bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors"
                            >
                                حذف الحساب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashSideBar;

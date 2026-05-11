import { useEffect, useState } from 'react';
import {
    HiArrowSmRight, HiChartPie, HiDocumentText,
    HiOutlineExclamationCircle, HiOutlineTrash,
    HiUserGroup, HiCog, HiInbox, HiPlusSm
} from 'react-icons/hi';
import { MdApartment, MdArticle, MdDashboard } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteUserFailure, deleteUserStart, deleteUserSuccess,
    logOutUserFailure, logOutUserStart, logOutUserSuccess
} from '../redux/user/userSlice';

const NavItem = ({ to, icon: Icon, label, active }) => (
    <Link to={to}>
        <div className={`flex items-center gap-3 px-3 py-2.5 my-1 rounded-none cursor-pointer transition-all text-sm font-medium
            ${active
                ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-primary-600'
            }`}>
            <Icon className="text-lg flex-shrink-0" />
            <span>{label}</span>
        </div>
    </Link>
);

const SectionLabel = ({ label }) => (
    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-5 mb-1">{label}</p>
);

function DashSideBar() {
    const location = useLocation();
    const [tab, setTab] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const isAdmin = currentUser?.role === 'Admin';
    const isSales = currentUser?.role === 'Sales';

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl) setTab(tabFromUrl);
    }, [location.search]);

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) dispatch(deleteUserFailure(data.message));
            else dispatch(deleteUserSuccess(data));
        } catch (error) {
            dispatch(deleteUserFailure());
        }
    };

    const handleSignout = async () => {
        try {
            dispatch(logOutUserStart());
            const res = await fetch('/api/user/signout', { method: "POST" });
            const data = await res.json();
            if (!res.ok) dispatch(logOutUserFailure(data.message));
            else dispatch(logOutUserSuccess());
        } catch (error) {
            dispatch(logOutUserFailure());
        }
    };

    const roleLabel = isAdmin ? 'مدير النظام' : isSales ? 'فريق المبيعات' : 'مستخدم';

    return (
        <div className="flex h-full bg-[var(--card)] border-r border-[var(--border)] shadow-premium transition-colors duration-500">
            <div className="lg:w-64 w-full h-full p-3">
                <div className="h-full w-full">

                    {/* Header */}
                    <div className="px-3 py-4 mb-2 border-b border-[var(--border)]">
                        <h2 className="text-base font-black text-[var(--foreground)] uppercase tracking-widest">لوحة التحكم</h2>
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-widest mt-0.5 block">{roleLabel}</span>
                    </div>

                    {/* Admin Overview - Admin only */}
                    {isAdmin && (
                        <>
                            <SectionLabel label="نظرة عامة" />
                            <NavItem to="/Dashboard?tab=dashbordData" icon={MdDashboard} label="الإحصائيات" active={tab === 'dashbordData'} />
                            <NavItem to="/Dashboard?tab=users" icon={HiUserGroup} label="المستخدمون" active={tab === 'users'} />
                        </>
                    )}

                    {/* Projects & Units - Admin & Sales */}
                    <SectionLabel label="المحتوى العقاري" />
                    <NavItem to="/Dashboard?tab=pagesFinished" icon={MdApartment} label="المشاريع والوحدات" active={tab === 'pagesFinished'} />
                    <NavItem to="/Dashboard?tab=blogs" icon={MdArticle} label="المقالات والأخبار" active={tab === 'blogs'} />
                    <NavItem to="/Dashboard?tab=messages" icon={HiInbox} label="الرسائل الواردة" active={tab === 'messages'} />

                    {/* Admin-only CMS */}
                    {isAdmin && (
                        <>
                            <SectionLabel label="إدارة الموقع" />
                            <NavItem to="/CreatePage" icon={HiPlusSm} label="إنشاء مشروع جديد" active={false} />
                            <NavItem to="/Admin/Blog-Editor" icon={HiPlusSm} label="مقال جديد" active={false} />
                            <NavItem to="/Dashboard?tab=staticPages" icon={HiDocumentText} label="الصفحات الثابتة" active={tab === 'staticPages'} />
                            <NavItem to="/Admin-Settings" icon={HiCog} label="إعدادات الموقع" active={false} />
                        </>
                    )}

                    <div className="border-t border-[var(--border)] my-4" />

                    {/* Logout & Delete */}
                    <div
                        onClick={handleSignout}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-none cursor-pointer transition-all"
                    >
                        <HiArrowSmRight className="text-lg flex-shrink-0" />
                        <span>تسجيل الخروج</span>
                    </div>
                    <div
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-none cursor-pointer transition-all"
                    >
                        <HiOutlineTrash className="text-lg flex-shrink-0" />
                        <span>حذف الحساب</span>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-none w-11/12 md:w-1/2 lg:w-1/3 shadow-2xl">
                        <div className="bg-red-500 text-white p-4">
                            <h2 className="text-lg font-semibold">حذف الحساب</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <HiOutlineExclamationCircle className="text-red-500 text-5xl" />
                                <h3 className="text-xl font-semibold text-gray-900">هل أنت متأكد من حذف حسابك؟</h3>
                                <p className="text-gray-600">هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك بشكل دائم.</p>
                            </div>
                        </div>
                        <div className="flex justify-end p-4 gap-3 border-t border-slate-100">
                            <button
                                onClick={handleDeleteUser}
                                className="bg-red-500 text-white px-4 py-2 rounded-none hover:bg-red-600 transition-colors uppercase tracking-widest text-xs font-bold"
                            >
                                نعم، احذف
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-none hover:bg-gray-300 transition-colors uppercase tracking-widest text-xs font-bold"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashSideBar;

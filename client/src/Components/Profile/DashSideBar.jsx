import { useEffect, useState } from 'react';
import { HiArrowSmRight, HiChartPie, HiDocumentText, HiOutlineExclamationCircle, HiOutlineTrash, HiUser, HiUserGroup } from 'react-icons/hi';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';

function DashSideBar() {
    const location = useLocation();
    const [tab, setTab] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { currentUser, error } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabFromUrl = urlParams.get('tab');
        if (tabFromUrl) {
            setTab(tabFromUrl);
        }
    }, [location.search]);

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            } else {
                dispatch(deleteUserSuccess(data));
            }
        } catch (error) {
            dispatch(deleteUserFailure());
        }
    };

    const handleSignout = async () => {
        try {
            dispatch(logOutUserStart());
            const res = await fetch('/api/user/signout', {
                method: "POST",
            });
            const data = await res.json();
            if (!res.ok) {
                dispatch(logOutUserFailure(data.message));
            } else {
                dispatch(logOutUserSuccess());
            }
        } catch (error) {
            dispatch(logOutUserFailure());
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-[var(--card)] border-r border-[var(--border)] shadow-premium transition-colors duration-500">
            {/* Custom Sidebar */}
            <div className="lg:w-64 w-full h-full p-4">
                <div className='h-full w-full'>
                    <div className='space-y-3'>
                        <div className="px-4 py-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                            <p className="text-sm text-gray-600">{currentUser.isAdmin ? "Admin" : currentUser.isBroker ? "Broker" : "User"}</p>
                        </div>
                        <Link to="/Dashboard?tab=Profile">
                            <div className={`flex items-center p-2 my-2 ${tab === "Profile" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                <HiUser className="mr-2" />
                                Profile
                            </div>
                        </Link>
                        {currentUser.isAdmin && (
                            <>
                                <Link to="/Dashboard?tab=pagesFinished">
                                    <div className={`flex items-center p-2 my-2 ${tab === "pagesFinished" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiDocumentText className="mr-2" />
                                        Pages finished
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=users">
                                    <div className={`flex items-center p-2 my-2 ${tab === "users" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiUserGroup className="mr-2" />
                                        Users
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=dashbordData">
                                    <div className={`flex items-center p-2 my-2 ${tab === "dashbordData" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiChartPie className="mr-2" />
                                        Dashboard
                                    </div>
                                </Link>
                                <Link to="/Admin-Settings">
                                    <div className={`flex items-center p-2 my-2 hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiChartPie className="mr-2" />
                                        Site Configuration
                                    </div>
                                </Link>
                                <Link to="/CreatePage">
                                    <div className={`flex items-center p-2 my-2 hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiDocumentText className="mr-2" />
                                        Create New Project
                                    </div>
                                </Link>
                                <Link to="/PageBroker">
                                    <div className={`flex items-center p-2 my-2 hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiUser className="mr-2" />
                                        Broker Page (Project View)
                                    </div>
                                </Link>
                                <div className="my-2 border-t border-slate-200"></div>
                                <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">Content Managment</p>
                                <Link to="/Dashboard?tab=staticPages">
                                    <div className={`flex items-center p-2 my-2 ${tab === "staticPages" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiDocumentText className="mr-2" />
                                        Static Pages (Privacy/Terms)
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=blogs">
                                    <div className={`flex items-center p-2 my-2 ${tab === "blogs" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiDocumentText className="mr-2" />
                                        News & Blogs
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=messages">
                                    <div className={`flex items-center p-2 my-2 ${tab === "messages" ? 'bg-blue-100' : ''} hover:bg-gray-100 rounded-none cursor-pointer transition-all`}>
                                        <HiUserGroup className="mr-2" />
                                        Inbox Messages
                                    </div>
                                </Link>
                            </>
                        )}
                        <div className="border-t border-[var(--border)] my-4"></div>
                        <div onClick={handleSignout} className="flex items-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-none cursor-pointer transition-all font-semibold">
                            <HiArrowSmRight className="mr-2 text-xl" />
                            تسجيل الخروج
                        </div>
                        <div onClick={() => setShowModal(true)} className="flex items-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-none cursor-pointer transition-all font-semibold">
                            <HiOutlineTrash className="mr-2 text-xl" />
                            حذف الحساب
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
                    <div className="bg-white rounded-none w-11/12 md:w-1/2 lg:w-1/3 shadow-2xl">
                        <div className="bg-red-500 text-white p-4 rounded-none">
                            <h2 className="text-lg font-semibold">Delete Account</h2>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col items-center space-y-4 text-center">
                                <HiOutlineExclamationCircle className="text-red-500 text-5xl" />
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Are you sure you want to delete your account?
                                </h3>
                                <p className="text-gray-600">
                                    This action cannot be undone. This will permanently delete your
                                    account and all your data.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end p-4 space-x-4 border-t border-slate-100">
                            <button onClick={handleDeleteUser} className="bg-red-500 text-white px-4 py-2 rounded-none hover:bg-red-600 transition-colors uppercase tracking-widest text-xs font-bold">
                                Yes, Delete My Account
                            </button>
                            <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded-none hover:bg-gray-600 transition-colors uppercase tracking-widest text-xs font-bold">
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashSideBar;
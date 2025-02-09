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
        <div className="flex h-full overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg">
            {/* Custom Sidebar */}
            <div className="lg:w-64 w-full h-full dark:bg-gray-800 bg-white  p-4">
                <div className='h-full w-full'>
                    <div className='space-y-3'>
                        <div className="px-4 py-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                            <p className="text-sm text-gray-600">{currentUser.isAdmin ? "Admin" : currentUser.isBroker ? "Broker" : "User"}</p>
                        </div>
                        <Link to="/Dashboard?tab=Profile">
                            <div className={`flex items-center p-2 my-2 ${tab === "Profile" ? 'bg-blue-100' : ''} hover:bg-gray-100 cursor-pointer`}>
                                <HiUser className="mr-2" />
                                Profile
                            </div>
                        </Link>
                        {currentUser.isAdmin && (
                            <>
                                <Link to="/Dashboard?tab=pagesFinished">
                                    <div className={`flex items-center p-2 my-2 ${tab === "pagesFinished" ? 'bg-blue-100' : ''} hover:bg-gray-100 cursor-pointer`}>
                                        <HiDocumentText className="mr-2" />
                                        Pages finished
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=users">
                                    <div className={`flex items-center p-2 my-2 ${tab === "users" ? 'bg-blue-100' : ''} hover:bg-gray-100 cursor-pointer`}>
                                        <HiUserGroup className="mr-2" />
                                        Users
                                    </div>
                                </Link>
                                <Link to="/Dashboard?tab=dashbordData">
                                    <div className={`flex items-center p-2 my-2 ${tab === "dashbordData" ? 'bg-blue-100' : ''} hover:bg-gray-100 cursor-pointer`}>
                                        <HiChartPie className="mr-2" />
                                        Dashboard
                                    </div>
                                </Link>
                            </>
                        )}
                        <div className="border-t border-gray-200 my-4"></div>
                        <div onClick={handleSignout} className="flex items-center p-2 text-red-600 hover:bg-gray-100 cursor-pointer">
                            <HiArrowSmRight className="mr-2" />
                            Sign Out
                        </div>
                        <div onClick={() => setShowModal(true)} className="flex items-center p-2 text-red-600 hover:bg-gray-100 cursor-pointer">
                            <HiOutlineTrash className="mr-2" />
                            Delete Account
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-11/12 md:w-1/2 lg:w-1/3">
                        <div className="bg-red-500 text-white p-4 rounded-t-lg">
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
                        <div className="flex justify-end p-4 space-x-4">
                            <button onClick={handleDeleteUser} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                Yes, Delete My Account
                            </button>
                            <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
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
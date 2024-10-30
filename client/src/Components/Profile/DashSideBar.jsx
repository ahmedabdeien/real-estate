import { Button, Modal, Sidebar } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { HiArrowSmRight, HiChartPie, HiDocumentText, HiOutlineExclamationCircle, HiOutlineTrash, HiUser, HiUserGroup } from 'react-icons/hi'
import { Link, useLocation } from 'react-router-dom'
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'

function DashSideBar() {
    const location = useLocation()
    const [tab, setTab] = useState('')
    const [showModal, setShowModal] = useState(false);
    const { currentUser, error } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        if (tabFromUrl) {
            setTab(tabFromUrl)
        }
    }, [location.search])

    const handleDeleteUser = async () => {
        setShowModal(false);
        try {
            dispatch(deleteUserStart());
            const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                method: "DELETE",
            })
            const data = await res.json();
            if (!res.ok) {
                dispatch(deleteUserFailure(data.message));
            } else {
                dispatch(deleteUserSuccess(data));
            }
        } catch (error) {
            dispatch(deleteUserFailure());
        }
    }

    const handleSignout = async () => {
        try {
            dispatch(logOutUserStart());
            const res = await fetch('/api/user/signout', {
                method: "POST",
            })
            const data = await res.json();
            if (!res.ok) {
                dispatch(logOutUserFailure(data.message));
            } else {
                dispatch(logOutUserSuccess());
            }
        } catch (error) {
            dispatch(logOutUserFailure());
        }
    }

    return (
        <div className="flex h-full overflow-hidden bg-gray-100 ">
            <Sidebar className="lg:w-64 w-full h-full bg-white border ">
                <Sidebar.Items className='h-full w-full '>
                    <Sidebar.ItemGroup className='space-y-3 '>
                        <div className="px-4 py-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
                            <p className="text-sm text-gray-600">{currentUser.isAdmin ? "Admin" : currentUser.isBroker ? "Broker" : "User"}</p>
                        </div>
                        <Link to="/Dashboard?tab=Profile">
                            <Sidebar.Item active={tab === "Profile"} icon={HiUser} className=" my-2">
                                Profile
                            </Sidebar.Item>
                        </Link>
                        {currentUser.isAdmin && (
                            <>
                                <Link to="/Dashboard?tab=pagesFinished">
                                    <Sidebar.Item active={tab === "pagesFinished"} icon={HiDocumentText} className=" my-2">
                                        Pages finished
                                    </Sidebar.Item>
                                </Link>
                                <Link to="/Dashboard?tab=users">
                                    <Sidebar.Item active={tab === "users"} icon={HiUserGroup} className=" my-2">
                                        Users
                                    </Sidebar.Item>
                                </Link>
                                <Link to="/Dashboard?tab=dashbordData">
                                    <Sidebar.Item active={tab === "dashbordData"} icon={HiChartPie} className="my-2">
                                        Dashboard
                                    </Sidebar.Item>
                                </Link>
                                
                            </>
                        )}
                        <div className="border-t border-gray-200 my-4"></div>
                        <Sidebar.Item onClick={handleSignout} icon={HiArrowSmRight} className=" transition-colors text-red-600">
                            Sign Out
                        </Sidebar.Item>
                        <Sidebar.Item onClick={() => setShowModal(true)} icon={HiOutlineTrash} className=" transition-colors text-red-600">
                            Delete Account
                        </Sidebar.Item>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>

            <Modal show={showModal} onClose={() => setShowModal(false)} size="md">
                <Modal.Header className="bg-red-500 text-white">Delete Account</Modal.Header>
                <Modal.Body>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button color="failure" onClick={handleDeleteUser}>
                        Yes, Delete My Account
                    </Button>
                    <Button color="gray" onClick={() => setShowModal(false)}>
                        No, Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default DashSideBar
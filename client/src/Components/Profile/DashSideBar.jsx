import {Button, Modal, Sidebar} from 'flowbite-react'
import { useEffect, useState } from 'react'
import {HiArrowSmRight, HiChartPie, HiOutlineExclamationCircle, HiOutlineTrash, HiTemplate, HiUser} from 'react-icons/hi'
import { Link, useLocation } from 'react-router-dom'
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice'
import { useDispatch, useSelector } from 'react-redux'

function DashSideBar() {
    const location = useLocation()
    const [tab, setTab] = useState('')
    useEffect(()=>{
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        if(tabFromUrl){
            setTab(tabFromUrl)}
    },[location.search])
  //delete user account
   const [showModal, setShowModal] = useState(false);
    const {currentUser,error} = useSelector((state) => state.user);
   const dispatch = useDispatch();
   const handleDeleteUser = async () => {
      setShowModal(false);
      try {
        dispatch(deleteUserStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`,{
          method:"DELETE",
        })
        const data = await res.json();
        if(!res.ok){
          dispatch(deleteUserFailure(data.message));
        }else{
          dispatch(deleteUserSuccess(data));
        }
      } catch (error) {
        dispatch(deleteUserFailure());
      }
   }
   const handleSignout = async () =>{
      try {
        dispatch(logOutUserStart());
        const res = await fetch('/api/user/signout',{
          method:"POST",
        })
        const data = await res.json();
        if(!res.ok){
          dispatch(logOutUserFailure(data.message));
        }else{
          dispatch(logOutUserSuccess());
        }
      } catch (error) {
        dispatch(logOutUserFailure());
      }
   }
   

 
  return <>
 
    <Sidebar className='w-full md:w-56 border-e-2'>
        <Sidebar.Items className=' sticky top-0'>
            <Sidebar.ItemGroup className='flex-col flex  w-full'>
                 <Link to="/Dashboard?tab=Profile" className=''>
                   <Sidebar.Item active={tab === "Profile"} icon={HiUser} label={currentUser.isAdmin?"Admin": currentUser.isBroker ?"Broker":"User"} labelColor="dark" as="div">
                      Profile
                   </Sidebar.Item>
                 </Link>
                 {currentUser.isAdmin &&<>
                 <Link to="/Dashboard?tab=CreatePage">                 
                 <Sidebar.Item active={tab === "CreatePage"} icon={HiTemplate} className="cursor-pointer">
                  Create Page
                 </Sidebar.Item>
                 </Link>
                 <Link to="/Dashboard?tab=Dashboard">
                 <Sidebar.Item active={tab === "Dashboard"} icon={HiChartPie} className="cursor-pointer">
                 Dashboard
                 </Sidebar.Item>
                 </Link>
                 </>
                 }
                 
                 <Sidebar.Item onClick={handleSignout} active icon={HiArrowSmRight} className="cursor-pointer">
                    Sign Out
                 </Sidebar.Item>
                 
                 <Sidebar.Item onClick={setShowModal} active icon={HiOutlineTrash} className="cursor-pointer">
                    Delete Account
                 </Sidebar.Item>
            </Sidebar.ItemGroup>
        </Sidebar.Items>
    </Sidebar>

<Modal
show={showModal}
onClose={() => setShowModal(false)}
popup
size="md">
   <Modal.Header/>
   <Modal.Body>
      <div className="flex flex-col items-center space-y-3 text-center">
        <HiOutlineExclamationCircle className="text-[#034078]/80 text-4xl " />
        <h1 className="text-[#034078] font-semibold text-xl">
          Are you sure you want to delete your account?
        </h1>
        <p className="text-stone-600">
          This action cannot be undone. This will permanently delete your
          account and all your data.
        </p>
        <div className=" flex gap-2">
        <Button color="failure" onClick={handleDeleteUser}>
          Delete Account
        </Button>
        <Button color="light" onClick={() => setShowModal(false)}>Cancel</Button>
        </div>
      </div>
   </Modal.Body>
</Modal>
</>
}

export default DashSideBar

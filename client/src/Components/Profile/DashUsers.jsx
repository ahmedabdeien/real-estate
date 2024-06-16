
import { Badge, Button, Modal, Table } from "flowbite-react";
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {  FaCircleNotch } from "react-icons/fa";
import { HiOutlineExclamationCircle } from "react-icons/hi";


export default function DashUsers() {
    const {currentUser} = useSelector(state => state.user)
    const [users,setUsers] = useState([])
    const [showMore,setShowMore] = useState(true)
    const [showModal,setShowModal] = useState(false)
    const [userIdToDelete,setUserIdToDelete]= useState('')

    useEffect(() =>{
       const fatchUsers = async () =>{
         try {
            const res = await fetch(`/api/user/getusers`)
            const data = await res.json();
            
            if(res.ok){
                setUsers(data.users)
                if(data.users.length < 10){
                    setShowMore(false)
                }
            }
         } catch (error) {
            console.log(error.message);
         }
         
       };
       if(currentUser.isAdmin){
           fatchUsers();
       }
    },[currentUser.isAdmin,currentUser._id]);

    const handleShowMore = async () => {
       const startIndex = users.length;
       try{
          const res = await fetch(`/api/user/getusers?startIndex=${startIndex}`)
          const data = await res.json();
            if(res.ok){
                setUsers([...users,...data.listings])
                if(data.users.length < 10){
                    setShowMore(false)
                }
            }
        }catch (error){
          console.log(error.massage)
       }
    }
    const handleDeleteUser = async () => {
        setShowModal(false)
        try {
            const res = await fetch(`/api/user/deleteuser/${userIdToDelete}/${currentUser._id}`,{
                method:"DELETE"
            })
            const data = await res.json();
            if(!res.ok){
                console.log(data.message)
            }else{
                setUsers((prev)=>
                  prev.filter(page => page._id!== userIdToDelete)
                )
            }
        } catch (error) {
            console.log(error.message)
        }
    }
  return (
    <>
    <div className=" ">
        {currentUser.isAdmin && users.length > 0 ? (
            <>
            <div className="overflow-x-auto shadow-md table-auto rounded-none scrollbar scrollbar-track-gray-100 
             dark:scrollbar-track-gray-900 scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <Table className="divide-y dark:divide-gray-600 drop-shadow-none">
                <Table.Head>
                    <Table.HeadCell>Date Created</Table.HeadCell>
                    <Table.HeadCell>User Image</Table.HeadCell>
                    <Table.HeadCell>Fall Name</Table.HeadCell>
                    <Table.HeadCell>Username</Table.HeadCell>
                    <Table.HeadCell>Email</Table.HeadCell>
                    <Table.HeadCell>Phone Number</Table.HeadCell>
                    <Table.HeadCell>Type User </Table.HeadCell>
                    <Table.HeadCell>Delete</Table.HeadCell>
                </Table.Head>
                {users.map((user,index) => (
                    <Table.Body key={index} className="divide-x dark:divide-gray-600 font-normal hover:bg-gray-100 dark:hover:bg-gray-700/70">
                        <Table.Cell className="p-2">{new Date(user.createAt).toLocaleDateString()}</Table.Cell>
                          <Table.Cell className="p-2 group/itemss">
                                <img className="w-10 h-10 rounded-full border-2 dark:border-gray-800 border-white object-cover" src={user.avatar} alt={user.avatar} key={user.avatar} />
                        </Table.Cell>
                        
                        <Table.Cell className="p-2 font-medium text-[#034078] dark:text-blue-500">{user.name}</Table.Cell>
                        <Table.Cell className="p-2 bg-gray-50/70 dark:bg-gray-900/50">{user.username}</Table.Cell>
                       
                        <Table.Cell className='p-2'>{user.email}</Table.Cell>
                        <Table.Cell className='p-2'>{user.number}</Table.Cell>
                        <Table.Cell className="p-2 bg-indigo-50/20 dark:bg-indigo-50/5 ">
                       
                        <Badge color={`${user.isAdmin?"success":user.isBroker?"info" :'gray'}`} className="rounded-full"> {user.isAdmin?"Admin":user.isBroker?"Broker":'User'}</Badge>
                        </Table.Cell>
                      
                        <Table.Cell className="p-2 relative">
                            <div onClick={()=>{setShowModal(true);setUserIdToDelete(user._id) }} className="absolute top-0 left-0 w-full h-full cursor-pointer font-medium text-red-500 hover:bg-red-100 dark:hover:bg-red-600 dark:hover:text-red-100 flex justify-center items-center">Delete</div>
                            </Table.Cell>
                        
                    </Table.Body>
                ))}
            </Table> 
            </div>
           <div className="p-4 flex justify-center">
            {showMore && <button 
            className=" bg-[#034078] hover:bg-[#034078]/95 dark:bg-blue-700 text-white py-3 w-3/4 rounded-md transition-transform hover:scale-125" 
            onClick={handleShowMore}>Show More</button>}
           </div>
            </>
        ) : (
            <div className="w-full h-screen flex justify-center items-center">
                <FaCircleNotch className="text-4xl animate-spin text-[#034078] dark:text-blue-400"></FaCircleNotch>
            </div>
        )}
    </div>
    <Modal
show={showModal}
onClose={() => setShowModal(false)}
popup dark={false}
size="md">
   <Modal.Header className='' />
   <Modal.Body className='' >
      <div className="flex flex-col items-center space-y-3 text-center">
        <HiOutlineExclamationCircle className="text-[#034078]/80  text-4xl " />
        <h1 className="text-[#034078] font-semibold text-xl">
          Are you sure you want to delete this users?
        </h1>
        <div className=" flex gap-2">
        <Button color="failure" onClick={handleDeleteUser}>
          Delete users
        </Button>
        <Button color="light"  onClick={() => setShowModal(false)}>Cancel</Button>
        </div>
      </div>
   </Modal.Body>
</Modal>
    </>
  )
}

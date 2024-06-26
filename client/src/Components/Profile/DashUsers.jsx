
import { Badge, Button, Modal, Table } from "flowbite-react";
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";


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
                setUsers([...users,...data.users])
                if(data.users.length < 10){
                    setShowMore(false)
                }
            }
        }catch (error){
          console.log(error.massage)
       }
    }
    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`/api/user/delete/${userIdToDelete}`,{
                method:"DELETE",
            })
            const data = await res.json();
            if(res.ok){
                setUsers((prev)=> prev.filter((user)=> user._id !== userIdToDelete));
                setShowModal(false);
            }else{
                console.log(data.message)
            }
        } catch (error) {
            console.log(error.message)
        }
    }
  return (
    <>
    <div className="p-4 bg-stone-100 dark:bg-stone-800">
      {currentUser.isAdmin && users.length > 0 ? (
        <>
          <div className="overflow-x-auto shadow-lg rounded-lg scrollbar-thin scrollbar-track-gray-200 dark:scrollbar-track-gray-900 scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
            <Table className="min-w-full divide-y  divide-gray-200 dark:divide-gray-600">
              <Table.Head className="bg-stone-400 dark:bg-gray-800">
                <Table.HeadCell>Date Created</Table.HeadCell>
                <Table.HeadCell>User Image</Table.HeadCell>
                <Table.HeadCell>Full Name</Table.HeadCell>
                <Table.HeadCell>Username</Table.HeadCell>
                <Table.HeadCell>Email</Table.HeadCell>
                <Table.HeadCell>Phone Number</Table.HeadCell>
                <Table.HeadCell>Type of User</Table.HeadCell>
                <Table.HeadCell>Delete</Table.HeadCell>
              </Table.Head>
              {users.map((user, index) => (
                <Table.Body key={index} className="bg-white dark:bg-gray-700 divide-y divide-gray-100 dark:divide-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <Table.Cell className="p-4 text-gray-700 dark:text-gray-300">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <img
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                      src={user.avatar}
                      alt={user.avatar}
                    />
                  </Table.Cell>
                  <Table.Cell className="p-4 font-medium text-[#034078] dark:text-blue-400">
                    {user.name}
                  </Table.Cell>
                  <Table.Cell className="p-4 text-gray-700 dark:text-gray-300">
                    {user.username}
                  </Table.Cell>
                  <Table.Cell className="p-4 text-gray-700 dark:text-gray-300">
                    {user.email}
                  </Table.Cell>
                  <Table.Cell className="p-4 text-gray-700 dark:text-gray-300">
                    {user.number}
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <Badge
                      color={user.isAdmin ? "success" : user.isBroker ? "info" : "gray"}
                      className="rounded-full"
                    >
                      {user.isAdmin ? "Admin" : user.isBroker ? "Broker" : "User"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="p-4">
                    <button
                      onClick={() => {
                        setShowModal(true);
                        setUserIdToDelete(user._id);
                      }}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </Table.Cell>
                </Table.Body>
              ))}
            </Table>
          </div>
          {showMore && (
            <div className="p-4 flex justify-center">
              <button
                className="bg-[#034078] hover:bg-[#034078]/95 dark:bg-blue-700 text-white py-3 px-6 rounded-md transition-transform hover:scale-105"
                onClick={handleShowMore}
              >
                Show More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-screen flex justify-center items-center flex-col">
          <TbLoaderQuarter className="text-4xl animate-spin text-gray-500" />
          <p className="text-gray-500 mt-2">Loading...</p>
        </div>
      )}
    </div>
    
    <Modal
      show={showModal}
      onClose={() => setShowModal(false)}
      popup
      dark={true}
      size="md"
    >
      <Modal.Header />
      <Modal.Body className="text-center">
        <HiOutlineExclamationCircle className="text-[#034078] text-4xl" />
        <h1 className="text-xl font-semibold text-[#034078] mt-4">
          Are you sure you want to delete this user?
        </h1>
        <div className="flex justify-center gap-4 mt-6">
          <Button color="failure" onClick={handleDeleteUser}>
            Delete User
          </Button>
          <Button color="light" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  </>
  
  )
}

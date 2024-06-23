
import { Badge, Button, Modal, Table } from "flowbite-react";
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { TbLoaderQuarter } from "react-icons/tb";

import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle } from "react-icons/hi";


export default function DashPagesFinished() {
    const {currentUser} = useSelector(state => state.user)
    const [userPages,setUserPages] = useState([])
    const [showMore,setShowMore] = useState(true)
    const [showModal,setShowModal] = useState(false)
    const [pageIdToDelete,setPageIdToDelete]= useState('')

    useEffect(() =>{
       const fatchPages = async () =>{
         try {
            const res = await fetch(`/api/listing/getPages?userId=${currentUser._id}`)
            const data = await res.json();
            
            if(res.ok){
                setUserPages(data.listings)
                if(data.listings.length < 10){
                    setShowMore(false)
                }
            }
         } catch (error) {
            console.log(error.message);
         }
         
       };
       if(currentUser.isAdmin){
           fatchPages()
       }
    },[currentUser.isAdmin,currentUser._id]);

    const handleShowMore = async () => {
       const startIndex = userPages.length;
       try{
          const res = await fetch(`/api/listing/getPages?userId=${currentUser._id}&startIndex=${startIndex}`)
          const data = await res.json();
            if(res.ok){
                setUserPages([...userPages,...data.listings])
                if(data.listings.length < 10){
                    setShowMore(false)
                }
            }
        }catch (error){
          console.log(error.massage)
       }
    }
    const handleDeletePage = async () => {
        setShowModal(false)
        try {
            const res = await fetch(`/api/listing/deletePage/${pageIdToDelete}/${currentUser._id}`,{
                method:"DELETE"
            })
            const data = await res.json();
            if(!res.ok){
                console.log(data.message)
            }else{
                setUserPages((prev)=>
                  prev.filter(page => page._id!== pageIdToDelete)
                )
            }
        } catch (error) {
            console.log(error.message)
        }
    }
  return (
    <>
    <div className=" ">
        {currentUser.isAdmin && userPages.length > 0 ? (
            <>
            <div className="overflow-x-auto shadow-md table-auto rounded-none scrollbar scrollbar-track-gray-100 
             dark:scrollbar-track-gray-900 scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                <Table className="divide-y dark:divide-gray-600 drop-shadow-none">
                <Table.Head>
                    <Table.HeadCell>Date updated</Table.HeadCell>
                    <Table.HeadCell>Title</Table.HeadCell>
                    <Table.HeadCell>Location</Table.HeadCell>
                    <Table.HeadCell>Available Or Not</Table.HeadCell>
                    <Table.HeadCell>Number Floors</Table.HeadCell>
                    <Table.HeadCell>Property Size</Table.HeadCell>
                    <Table.HeadCell>Image Cover </Table.HeadCell>
                    <Table.HeadCell>Image Plans</Table.HeadCell>
                    <Table.HeadCell>Image Apartments</Table.HeadCell>
                    <Table.HeadCell>Title Apartments</Table.HeadCell>
                    <Table.HeadCell><span>Edit</span></Table.HeadCell>
                    <Table.HeadCell><span>Delete</span></Table.HeadCell>
                    <Table.HeadCell><span>View</span></Table.HeadCell>
                </Table.Head>
                {userPages.map((page,index) => (
                    <Table.Body key={index} className="divide-x dark:divide-gray-600 font-normal hover:bg-gray-100 dark:hover:bg-gray-700/70">
                        <Table.Cell className="p-2">{new Date(page.updatedAt).toLocaleDateString()}
                        </Table.Cell>
                        <Table.Cell className="p-2 font-medium text-[#034078] dark:text-blue-500">{page.name}</Table.Cell>
                        <Table.Cell className="p-2 bg-gray-50/70 dark:bg-gray-900/50">{page.address}</Table.Cell>
                        <Table.Cell className={`p-2 ${page.available=='available'?"text-green-600":"text-red-600"}`}><Badge color={`${page.available=='available'?"success":"failure"}`} className="rounded-full">{page.available}</Badge></Table.Cell>
                        <Table.Cell className='p-2'>{page.numberFloors}</Table.Cell>
                        <Table.Cell className="p-2 bg-indigo-50/20 dark:bg-indigo-50/5 ">{page.propertySize} m</Table.Cell>
                        <Table.Cell className="p-2 group/itemss">
                            <Link to={`/Projects/${page.slug}`} className="flex -space-x-6">
                             {page.imageUrls.map((image,index) => (
                                <img className="w-10 h-10 rounded-full border-2 dark:border-gray-800 border-white object-cover" src={image} alt={image} key={index} />
                             ))}
                            </Link>
                        </Table.Cell>
                        <Table.Cell className="p-2">
                            <Link to={`/Projects/${page.slug}`} className="flex justify-center">
                                <img className="w-10 h-10 rounded-full border-2 dark:border-gray-800 border-white object-cover" src={page.imagePlans} alt={page.imagePlans} key={index} />
                            </Link>
                        </Table.Cell>
                        <Table.Cell className="p-2">
                            <Link to={`/Projects/${page.slug}`} className="flex -space-x-6">
                             {page.imageApartments.map((image,index) => (
                                <img className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover" src={image} alt={image} key={index} />
                             ))}
                            </Link>
                        </Table.Cell>
                        <Table.Cell className="p-2">{page.titleApartments}</Table.Cell>
                        <Table.Cell className="p-2 relative overflow-hidden">
                            <Link to={`/Update-Page/${page._id}`} className="absolute top-0 left-0 w-full h-full font-medium text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-600 dark:hover:text-blue-100 flex justify-center items-center">Edit</Link>
                        </Table.Cell>
                        <Table.Cell className="p-2 relative">
                            <div onClick={()=>{setShowModal(true);setPageIdToDelete(page._id) }} className="absolute top-0 left-0 w-full h-full cursor-pointer font-medium text-red-500 hover:bg-red-100 dark:hover:bg-red-600 dark:hover:text-red-100 flex justify-center items-center">Delete</div></Table.Cell>
                        <Table.Cell className="p-2 relative"><Link to={`/Projects/${page.slug}`} className="absolute top-0 left-0 w-full h-full  font-medium text-green-500 hover:bg-green-100 dark:hover:bg-green-600 dark:hover:text-green-100 flex justify-center items-center">View</Link></Table.Cell>
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
            <div className="w-full h-screen flex justify-center items-center flex-col">
                <div className="">
                <TbLoaderQuarter  className="text-4xl animate-spin text-gray-500 "></TbLoaderQuarter>
                </div>
                <p className="text-gray-500">loading...</p>
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
          Are you sure you want to delete this page?
        </h1>
        <div className=" flex gap-2">
        <Button color="failure" onClick={handleDeletePage}>
          Delete page
        </Button>
        <Button color="light"  onClick={() => setShowModal(false)}>Cancel</Button>
        </div>
      </div>
   </Modal.Body>
</Modal>
    </>
  )
}

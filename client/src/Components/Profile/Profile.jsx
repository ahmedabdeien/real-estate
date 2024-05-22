import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from './../../firebase';
import {updateUserStart,updateUserSuccess,updateUserFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess, logOutUserStart, logOutUserFailure, logOutUserSuccess} from "../redux/user/userSlice"

import { FaCamera } from "react-icons/fa6";
import { FaArrowsRotate } from "react-icons/fa6";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import { FaPlus } from "react-icons/fa6";

import videoElsarh from '../../assets/images/@ELSARHEGYPT.mp4';
import { Link } from "react-router-dom";
export default function Profile(){
  const [visible,setVisible] = useState()
  const style = 'text-center w-full md:w-3/4 p-2 rounded focus:border-0 focus:outline-blue-600 border-b '
  const {currentUser,loading,error} = useSelector((state)=> state.user);
  const fileRef = useRef(null);
  const [file ,setFile ] = useState(undefined);
  const [fileProgress , setFileProgress] = useState(0);
  const [fileUploadError , setFileUploadError] = useState(false);
  const [formData,setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(file){
      handleFileUpload(file)
    }
  },[file])
   const handleFileUpload = (file) =>{
       const storage = getStorage(app);
       const fileName = new Date().getTime() + file.name;
       const storageRef = ref(storage, fileName);
       const uploadTask = uploadBytesResumable(storageRef,file);  
        uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFileProgress(Math.round(progress) );
        },
        (error) => {
          setFileUploadError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData({...formData,avatar:downloadURL});
          });
        },
      );
   };
  //firebase to upload image
   const handleChange = (e) =>{
     setFormData({...formData ,[e.target.id]:e.target.value });
   }
   const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      }
   };
   const handleDeleteUser = async () =>{
      try {
        dispatch(deleteUserStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`,{
          method:"DELETE",
        })
        const data = await res.json();
        if(data.success === false){
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data));
      } catch (error) {
        dispatch(deleteUserFailure(error.message));
      }
    };
    const handleLogOut = async () =>{
      try{
        dispatch(logOutUserStart());
        const res = await fetch('/api/auth/logout');
        const data = await res.json();
        if(data.success === false){
          dispatch(logOutUserFailure(data.message))
          return;
        }
        dispatch(logOutUserSuccess(data));
      }catch (error){
        dispatch(logOutUserFailure(data.message))
      }
    }

 

  return <>
    <div>
      <h2 className='text-2xl font-bold py-2 text-white w-full bg-[#023E8A]  text-center'>Profile page</h2>
    </div>

      <div className="col-span-1 lg:col-span-2 justify-center flex items-center text-2xl font-bold shadow py-3 mb-3 lg:mb-0">
        <h2>
          Helloo <span className="text-blue-600">{currentUser.name}</span>
        </h2>
      </div>
    <div className='grid grid-cols-1 lg:gap-2 lg:grid-cols-2 md:px-10 p-4  '>

      <div className=''>
        
         <div className=" w-full   border-y-2 shadow-md  sm:rounded-md  overflow-hidden text-center">
           
            <div className="w-full p-3 ">
                <form onSubmit={handleSubmit} className="w-full space-y-2 flex items-center flex-col">
                  <div className="relative">
                  <input onChange={(e)=>setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*"/>
                  <img onClick={()=>fileRef.current.click()} src={formData.avatar||currentUser.avatar} alt="profile" 
                  className="rounded-full border-2 w-24 h-24 object-cover cursor-pointer mb-1 m-auto"/>
                    <div onClick={()=>fileRef.current.click()} className="absolute bottom-0 right-0 cursor-pointer bg-stone-200 p-2 rounded-full border">
                       <FaCamera className=""/>
                    </div>
                  
                  </div>

                  <p>
                    {fileUploadError?
                    <span className="text-sm text-red-700">error img upload // image must be less than 2 mb 
                    </span>:
                    fileProgress > 0 && fileProgress < 100 ?(
                      <span className="text-sm text-slate-700">{`uploading ${fileProgress}%`}</span>
                    ) : fileProgress === 100 ? (
                      <span className="text-sm text-green-700">image successFully uploaded!</span>
                    ):""
                    }
                    </p>
                  <input onChange={handleChange} defaultValue={currentUser.name} type="text" placeholder='Full Name' className={style} id="name"/>
                  <input onChange={handleChange} defaultValue={currentUser.username} type="text" placeholder='Username' className={style} id="username"/>
                  <input onChange={handleChange} defaultValue={currentUser.email} type="email" placeholder='Email' className={style} id="email"/>
                  <input onChange={handleChange} defaultValue={currentUser.number} type="number" number="number" placeholder='Number Phone' className={style} id="number"/>
                  <div className="relative w-full md:w-3/4 ">
                  <input onChange={handleChange} defaultValue={currentUser.password} type={visible?"text":"password"} placeholder='Password' className='w-full rounded focus:border-0 focus:outline-blue-600 border-b text-center p-2 ' id="password"/>
                   <div onClick={()=>setVisible(!visible)} className="absolute top-[50%] translate-y-[-50%] right-2">
                    {visible?<FaEye/>:<FaEyeSlash/>}
                   </div>
                  </div>
                  <button disabled={loading} className="group/acss w-full md:w-3/4 bg-blue-600 font-semibold text-white py-2 rounded hover:bg-blue-800  transition-all 
                    flex justify-center items-center">
                  {loading?<FaArrowsRotate className="animate-spin"/>:<span className="flex justify-center items-center"><FaArrowsRotate className="me-1 group-hover/acss:animate-spin"/><span>Update</span> </span>} </button>
                </form>
                <div className="w-full flex justify-center pt-2">
                  <div className="m-auto flex justify-between w-full md:w-3/4 overflow-hidden">
                    <span onClick={handleDeleteUser} className="text-red-700 hover:underline hover:text-red-600/90  cursor-pointer">
                      delete account
                    </span>
                    <span onClick={handleLogOut} className="text-red-700 hover:underline hover:text-red-600/90  cursor-pointer ">
                      log out
                    </span>
                  </div>
                </div>
           
                <div>
                  <p>
                    {updateSuccess?<span className="text-sm text-green-700">update successfull</span>:""}
                  </p>
                  <p className="text-sm mt-2">
                    {error?<span className="text-sm text-red-700">{error}</span>:""}
                  </p>
                  <p className="text-sm mt-2">
                    {loading?<span className="text-sm text-slate-700">loading...</span>:""}
                  </p>
                </div>
            </div>
          
         </div>
         <p className="text-sm text-stone-600 mt-2 text-center">click for input change name and email and phone number and password ahd avatar </p>
      </div>
      <div className="mt-8 border-t-2 pt-4 lg:mt-0 lg:border-none lg:pt-0"> 
          <div className="flex justify-center items-center relative py-2 overflow-hidden">
          <svg className="absolute top-0 left-0 -z-10 animate-pulse" id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='20' height='20' patternTransform='scale(1) rotate(65)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0,0%,100%,1)'/><path d='M3.25 10h13.5M10 3.25v13.5'  stroke='hsla(259, 0%, 92%, 1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(-1,-2)' fill='url(#a)'/></svg>
        <Link to={"/create-page"} className="group/acss bg-green-600 font-semibold text-white p-5 rounded  hover:bg-green-800 hover:scale-105 transition-all flex justify-center items-center">
          <FaPlus className="me-1"/>
          <span>Create Page</span>  
            
        </Link>
          </div>
        <video  autoPlay loop>
          <source src={videoElsarh}  type="video/mp4"/>
        </video>
      </div>

    </div>
  </>
}

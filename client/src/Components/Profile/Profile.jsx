import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { app } from './../../firebase';
import {updateUserStart,updateUserSuccess,updateUserFailure, deleteUserStart, deleteUserFailure, deleteUserSuccess, logOutUserStart, logOutUserFailure, logOutUserSuccess} from "../redux/user/userSlice"

import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";

export default function Profile(){
  const [visible,setVisible] = useState()
  const style = 'text-center w-full md:w-3/4 lg:w-1/2 p-2 rounded focus:border-0 focus:outline-blue-600 border-b border-black'
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
  return (
    <div className=' bg-cover bg-[url("https://cdn.pixabay.com/photo/2021/10/07/15/23/real-estate-6688945_1280.jpg")]'>
      <div className='flex justify-center h-[92.2vh] items-center bg-black/60 p-2 '>
         <div className=" w-full sm:w-4/5 md:w-4/6 lg:w-3/6 bg-white border-b-2 border-blue-600 rounded-md flex justify-center items-center flex-wrap overflow-hidden text-center">
            <h2 className='text-2xl font-bold py-2 text-white w-full bg-blue-600  '>Profile page</h2>
            <div className="w-full p-3">
                <form onSubmit={handleSubmit} className="w-full space-y-2 flex items-center flex-col">
                  <input onChange={(e)=>setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*"/>
                  <img onClick={()=>fileRef.current.click()} src={formData.avatar||currentUser.avatar} alt="profile" 
                  className="rounded-full border-2 w-24 h-24 object-cover cursor-pointer mb-1 m-auto"/>
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
                  <input onChange={handleChange} defaultValue={currentUser.number} type="tel" placeholder='Number Phone' className={style} id="number"/>
                  <div className="relative w-full md:w-3/4 lg:w-1/2  ">
                  <input onChange={handleChange} defaultValue={currentUser.password} type={visible?"text":"password"} placeholder='Password' className='w-full rounded focus:border-0 focus:outline-blue-600 border-b text-center p-2 border-black' id="password"/>
                   <div onClick={()=>setVisible(!visible)} className="absolute top-[50%] translate-y-[-50%] right-2">
                    {visible?<FaEye/>:<FaEyeSlash/>}
                   </div>
                  </div>
                  <button disabled={loading} className="w-full md:w-3/4 lg:w-1/2 bg-blue-600 text-white py-2 rounded hover:ring-offset-2 
      hover:ring-2 active:ring-offset-0 disabled:bg-blue-600/70 disabled:hover:ring-offset-0 
      disabled:hover:ring-0">
        {loading?'Loading...':"Update"}
      </button>
                </form>
                <div className="w-full flex justify-center pt-2">
                  <div className="m-auto flex w-full md:w-3/4 lg:w-1/2 rounded-md overflow-hidden">
                    <span onClick={handleDeleteUser} className=" text-white bg-red-600 hover:bg-red-800 cursor-pointer py-2 w-1/2">
                      delete account
                    </span>
                    <span onClick={handleLogOut} className=" text-white bg-red-500 hover:bg-red-700 cursor-pointer py-2 w-1/2">
                      log out
                    </span>
                  </div>
                </div>
                <div>
                  <p>
                    {updateSuccess?
                    <span className="text-sm text-green-700">update successfull</span>:""}
                  </p>
                  <p className="text-sm mt-2">
                    {error?
                    <span className="text-sm text-red-700">{error}</span>:""}
                  </p>
                  <p className="text-sm mt-2">
                    {loading?
                    <span className="text-sm text-slate-700">loading...</span>:""}
                  </p>
                  <p className="text-sm mt-2">
                    click for input change name and email and phone number and password ahd avatar 
                  </p>
                </div>
            </div>

         </div>

      </div>
    </div>
  )
}

import { useSelector } from "react-redux"

import { FaTimes } from "react-icons/fa";
import { useState } from "react";

export default function Profile() {
  const style = 'text-center w-full md:w-3/4 lg:w-1/2 p-2 rounded focus:border-0 focus:outline-blue-600 border-b border-black'
  const {currentUser} = useSelector((state)=> state.user)
  const [close,setClose] =useState(false)
  return (
    <div className=' bg-cover bg-[url("https://cdn.pixabay.com/photo/2021/10/07/15/23/real-estate-6688945_1280.jpg")]'>
      <div className='flex justify-center h-screen items-center bg-black/60 p-5 '>
         <div className=" w-full sm:w-4/5 md:w-4/6 lg:w-3/6 bg-white rounded-md flex justify-center items-center flex-wrap overflow-hidden text-center">
            <h2 className='text-2xl font-bold py-2 text-white w-full bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-blue-500 to-90% '>Profile page</h2>
            <div className="w-full p-3">
                <form className="w-full space-y-2 flex items-center flex-col">
                  <img src={currentUser.avatar} alt="profile" 
                  className="rounded-full w-24 h-24 object-cover cursor-pointer mb-4 m-auto"/>
                  <input type="text" placeholder='Full Name' className={style} id="name"/>
                  <input type="text" placeholder='Username' className={style} id="username"/>
                  <input type="email" placeholder='Email' className={style} id="email"/>
                  <input type="tel" placeholder='Number Phone' className={style} id="number"/>
                  <input type="text" placeholder='Password' className={style} id="password"/>
                  <button className="w-full md:w-3/4 lg:w-1/2 bg-blue-600 text-white py-2 rounded hover:ring-offset-2 
      hover:ring-2 active:ring-offset-0 disabled:bg-blue-600/70 disabled:hover:ring-offset-0 
      disabled:hover:ring-0">Update</button>
                </form>
                <div className="w-full flex justify-center pt-2">
                  <div className="m-auto flex w-full md:w-3/4 lg:w-1/2 rounded-md overflow-hidden">
                    <span className=" text-white bg-red-600 hover:bg-red-800 cursor-pointer py-2 w-1/2">
                      delete account
                    </span>
                    <span className=" text-white bg-red-500 hover:bg-red-700 cursor-pointer py-2 w-1/2">
                      log out
                    </span>
                  </div>
                </div>
                <div>
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

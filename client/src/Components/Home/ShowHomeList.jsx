import React, { useState,useEffect } from 'react';
import { FaXmark } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ShowHomeList() {
    const [showSignin, setShowSignin] = useState(false); // Fixed typo
    useEffect(()=>{
        if(showSignin || currentUser){
         document.body.style.overflow = 'auto' 
        }else{
          document.body.style.overflow = 'hidden';
        }

      },[showSignin])
  
    const { currentUser } = useSelector(state => state.user);

    if (currentUser) return null;

    return (
        <div className={`${showSignin ? "opacity-0 -translate-y-full" : ''} bg-black/60 backdrop-blur-sm w-full h-full fixed inset-0 z-50 ease-in-out p-2 flex justify-center items-center  `}>
            <div className={`${showSignin ? 'opacity-0 -translate-y-full' : "opacity-100"} bg-stone-100 text-[#353531] rounded-sm w-full md:max-w-lg  transition-all duration-300`}>
                <div className='container p-3'>
                    <div className='flex'>
                        <div className=' bg-white hover:bg-stone-50 text-xl p-1 rounded-sm ms-auto' onClick={() => setShowSignin(!showSignin)}>
                            <FaXmark />
                        </div>
                    </div>
                    <div className='p-3 md:p-6 space-y-6 font-medium'>
                        <p>Clients can stay up to date with the latest developments in the projects they are interested in.</p>
                        <div className='space-y-2 w-full flex flex-col text-center'>
                            <Link onClick={() => setShowSignin(!showSignin)} className='bg-stone-900 text-white px-4 py-2 rounded-sm hover:bg-stone-800 w-full' to='/signin'>Sign in</Link>
                            <Link onClick={() => setShowSignin(!showSignin)} className='bg-white px-4 py-2 rounded-sm text-stone-800 shadow-sm hover:bg-stone-50 w-full' to='/signup'>Sign up</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

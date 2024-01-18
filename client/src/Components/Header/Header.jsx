import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { FaUser } from "react-icons/fa";

export default function Header() {
    let styleIconMenu = `w-8 h-1 bg-slate-800 transition-transform`
    let [menuActions,setMenuActions] = useState(false); 
    const titleLikeNavbar = [
        {title:'Home',path:'/',style:''},
        {title:'About',path:'/About',style:''},
        {title:'Sing-In',path:'/SingIn',style:''},
 
    ]
    
  return (
    <header className='bg-gray-100/70 backdrop-blur-md border-b flex justify-between items-center p-2 relative '>
        <h2 className='font-bold'>
            <span className='text-blue-700/70'>Elsarh </span>
            <span>Rear Estate</span>
        </h2>
        <form className='w-1/2 md:w-1/3 border rounded bg-white outline-blue-600 flex justify-start items-center'>
            <FaSearch className='ms-3 text-black/50 '/>
            <input type="text" placeholder='Search...' className='p-2 w-full bg-transparent focus:outline-none '/>
        </form>
         {/* icon navbar on phone  */}
        <div onClick={()=>setMenuActions(!menuActions)} className='block md:hidden z-40 cursor-pointer '>
        {menuActions?
          <div className='-space-y-1'>
            <div className='w-8 h-1 -rotate-45  bg-slate-800 transition-transform'></div>
            <div className='w-8 h-1 -translate-x-5 opacity-0  transition-[transform_opacity]'></div>
            <div className='w-8 h-1 rotate-45  bg-slate-800 transition-transform'></div>
          </div>
          :
          <div className='space-y-1'>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
          </div>}
        </div>

        <nav className={`${menuActions? 'translate-y-0':'translate-y-[-100%]'} w-full h-screen fixed top-0 right-0 bg-white md:translate-y-0 md:static md:w-auto md:h-auto md:bg-transparent flex justify-center items-center`}>
            <ul className=' w-full md:p-0 divide-y md:divide-y-0 text-center space-y-2  md:w-auto md:space-y-0 md:space-x-0 md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                <NavLink className="px-3 py-2  block hover:text-blue-600 " to={link.path}>{link.title}</NavLink></li>)}
                <li className='absolute top-2 left-4 hover:opacity-70 md:static border-none w-auto'><NavLink to='/Profile'><div className='bg-white border w-12 h-12 md:w-8 md:h-8 rounded-full flex justify-center items-center'><FaUser className='text-xl md:text-base'/></div></NavLink></li>
            </ul>
        </nav>
    </header>
  )
}

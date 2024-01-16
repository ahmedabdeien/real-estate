import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";


export default function Header() {
    let styleIconMenu = `w-8 h-1 bg-slate-800 transition-transform`
    let [menuActions,setMenuActions] = useState(false); 
    const titleLikeNavbar = [
        {title:'Home',path:'/',style:''},
        {title:'About',path:'/About',style:''},
        {title:'Sing-In',path:'/SingIn',style:''},
        {title:'Sing-Up',path:'/SingUp',style:''},
        {title:'Profile',path:'/Profile',style:''},
    ]
  return (
    <header className='bg-gray-100 border-b flex justify-between items-center p-4 relative overflow-hidden'>
        <h2 className='font-bold'>
            <span className='text-blue-700/70'>Elsarh </span>
            <span>Rear Estate</span>
        </h2>
        <form className='w-1/2 md:w-1/3 border rounded bg-white outline-blue-600 relative'>
            <input type="text" placeholder='Search...' className='p-2 w-full bg-transparent focus:outline-none '/>
            <FaSearch className='me-3 text-blue-500 absolute top-[50%] translate-y-[-50%] right-[0px]'/>
        </form>
         {/* icon navbar on phone  */}
        <div onClick={()=>setMenuActions(!menuActions)} className='md:hidden z-40 cursor-pointer '>
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

        <div className={`${menuActions?'translate-y-0 ':'translate-y-[-100%]'} w-full h-screen fixed top-0 right-0 bg-white md:static md:w-auto md:h-auto md:bg-transparent flex justify-center items-center`}>
            <ul className=' w-[90%] divide-y md:divide-none bg-gray-100 rounded text-center space-y-2 md:w-auto md:rounded-none md:bg-transparent md:space-y-0 md:space-x-3 md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className='hover:bg-slate-400'>
                <Link to={link.path}>{link.title}</Link></li>)}
                <li><Link to='/Profile'>Profile</Link></li>
            </ul>
        </div>
    </header>
  )
}

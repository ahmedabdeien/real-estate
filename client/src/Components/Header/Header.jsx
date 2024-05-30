import  { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logoElsarh.png'
import { HiLogout } from "react-icons/hi";
import { HiOutlineUserCircle } from "react-icons/hi";
export default function Header() {
    let styleIconMenu = `w-8 h-1 bg-[#fefcfb] rounded-full transition-transform`
    let [menuActions,setMenuActions] = useState(false); 
    let [menuActionsList,setMenuActionsList] = useState(false);
   
    const titleLikeNavbar = [
        {title:'Home',path:'/',style:''},
        {title:'Project',path:'/Project',style:''},
        {title:'About',path:'/About',style:''},
        
       
    ]
    const {currentUser} = useSelector(state => state.user)
  return (
    <header  className='bg-[#001f54]  sticky z-50 top-0  backdrop-blur-md  flex justify-between items-center px-5 p-1  '>
        <h2 className='font-bold'>
        <Link to="/" className='text-stone-700'>
         <img src={Logoelsarh} alt="Logoelsarh" className='w-24 sm:w-24 p-1 ' title='Elsarh Real Estate' />
        </Link>
        </h2>
        <form className='w-1/2 md:w-1/3 border rounded-full bg-white  flex justify-start items-center '>
            <FaSearch className='ms-3 text-[#1282a2]'/>
            <input type="text" placeholder='Search...' className='p-2 w-full bg-transparent focus:outline-none border-none focus:ring-0'/>
        </form>
         {/* icon navbar on phone  */}
        <div onClick={()=>setMenuActions(!menuActions)} className='block md:hidden z-40 cursor-pointer text-[#fefcfb]'>
        {menuActions?
          <div className='-space-y-1'>
            <div className='w-8 h-1 -rotate-45 rounded-full bg-[#fefcfb] transition-transform'></div>
            <div className='w-8 h-1 -translate-x-5 opacity-0  transition-[transform_opacity]'></div>
            <div className='w-8 h-1 rotate-45 rounded-full bg-[#fefcfb] transition-transform'></div>
          </div>
          :
          <div className='space-y-1'>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
          </div>}
  
        </div>

        <nav className={`${menuActions? '':'translate-y-[-100%]'} text-[#fefcfb] w-full h-screen transition-transform fixed top-0 right-0 bg-[#001f54] md-translate-x-0 md:translate-y-0 md:static md:w-auto md:h-auto md:bg-transparent flex justify-center items-center`}>
            <ul className=' w-full md:p-0 divide-[#fefcfb]/30 divide-y md:divide-y-0 text-center space-y-2 md:w-auto md:space-y-0 md:space-x-0 md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                <NavLink onClick={()=>setMenuActions(!menuActions)} className='px-3 py-2  block hover:text-white ' to={link.path}>{link.title}</NavLink></li>)}
                {currentUser?
                <li onClick={()=>setMenuActionsList(!menuActionsList)} className='absolute border-none top-2 left-2 md:static'>
                  <div className='px-3 py-2 block hover:text-white '><img src={currentUser.avatar} className='w-8 rounded-full ring' alt='img' /></div>
                  <div className={`${menuActionsList?" flex":" hidden"} flex-col w-80 md:w-64 absolute top-12 left-0 md:-right-4 md:top-[3.25rem] bg-white shadow text-stone-600 border rounded-b `}>
                    <div className='text-sm p-2 py-4'>
                      <p>
                        @{currentUser.username}
                      </p>
                      <p className='font-medium truncate'>
                        {currentUser.email}
                      </p>
                    </div>
                    <div className='border-t p-1' >
                      <NavLink onClick={()=>setMenuActions(!menuActions)} className='hover:bg-stone-100 w-full flex justify-center items-center py-2 rounded' to="/profile"><span><HiOutlineUserCircle className=' text-stone-600'/></span><span className=' text-stone-600 text-sm ms-1'>Profile</span></NavLink>
                    </div>
                    <div className='border-t p-1'>
                      <NavLink onClick={()=>setMenuActions(!menuActions)} className='hover:bg-stone-100 w-full flex justify-center items-center py-2 rounded ' to="/profile"><HiLogout className=' text-stone-600'/><span className='text-stone-600 text-sm ms-1'>Log Out</span></NavLink>
                    </div>
                  </div>
                </li>
                :<li className='absolute top-2 left-4 md:static'>
                        <Link onClick={()=>setMenuActions(!menuActions)} className="px-3 py-2 rounded  block font-bold  text-[#1282a2] bg-[#fefcfb] border border-[#1282a2]  " to='/Signin'>Sing in</Link></li>}
                
                
            </ul>
        </nav>
    </header>
  )
}

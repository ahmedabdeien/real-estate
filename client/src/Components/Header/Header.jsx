"use client";
import  { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logoElsarh.png'
import { Avatar, Dropdown } from "flowbite-react";
import { HiCog, HiCurrencyDollar, HiDocumentAdd, HiLogout, HiMoon, HiSun, HiUser, HiUsers, HiViewGrid } from "react-icons/hi";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';
import { FaSearch } from 'react-icons/fa';

export default function Header() {
  const dispatchTheme = useDispatch();
    const {theme} = useSelector(state => state.theme);
    let styleIconMenu = `w-8 h-1 bg-[#fefcfb] rounded-full transition-transform`
    let [menuActions,setMenuActions] = useState(false); 
    useEffect(()=>{
      if(menuActions){
        document.body.style.overflow = 'hidden';
      }else{
        document.body.style.overflow = 'auto'
      }
    },[menuActions])

    const titleLikeNavbar = [
        {title:'Home',path:'/',style:'' ,},
        {title:'Project',path:'/Project',style:''},
        {title:'About',path:'/About',style:''},
    ]
    const styleNavLink = ({isActive}) => {
       return {
         
         background: isActive ? (theme === "dark" ? '#374151' : (theme === "light" ? '#034078' : '')) : '',
         position: isActive ? 'relative' : 'static',
         
       }
    }
    const {currentUser} = useSelector(state => state.user)

//Sign Out function
   const dispatch = useDispatch();
  const handleSignout = async () =>{
      try {
        dispatch(logOutUserStart());
        const res = await fetch('/api/user/signout',{
          method:"POST",
        })
        const data = await res.json();
        if(!res.ok){
          dispatch(logOutUserFailure(data.message));
        }else{
          dispatch(logOutUserSuccess());
        }
      } catch (error) {
        dispatch(logOutUserFailure());
      }
   }
  return (
    <header  className='bg-[#001f54] dark:bg-gray-900/80 backdrop-blur-md dark:border-gray-500 dark:border-b  sticky z-50 top-0  flex justify-between items-center px-5 p-1  '>
        <h2 className='font-bold'>
        <Link to="/" className='text-stone-700'>
         <img src={Logoelsarh} alt="Logoelsarh" className='w-24 sm:w-24 p-1 ' title='Elsarh Real Estate' />
        </Link>
        </h2>
        <form className='w-1/2 md:w-1/3 border rounded-lg bg-white  flex justify-start items-center '>
            <FaSearch    className='ms-3 text-lg text-blue-800'/>
            <input type="text" placeholder='Search...' className='p-2 w-full dark:valid:text-blue-800 bg-transparent focus:outline-none border-none focus:ring-0'/>
        </form>
         {/* icon navbar on phone  */}
        <div onClick={()=>setMenuActions(!menuActions)} className='block md:hidden z-40 cursor-pointer text-[#fefcfb]'>
        {menuActions?
          <div className='-space-y-1 translate-y-2 '>
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

        <nav className={`${menuActions? 'translate-y-[0%]':'-translate-y-[100%]'} top-0 left-0 text-[#fefcfb] w-full h-screen transition-all fixed right-0 bg-[#001f54] dark:bg-gray-900 md:translate-y-0 md:static md:w-auto md:h-auto md:bg-transparent dark:md:bg-transparent flex justify-center items-center`}>
            <ul className='md:space-x-1 w-full md:p-0 divide-[#fefcfb]/30 divide-y md:divide-y-0 text-center space-y-2 md:w-auto md:space-y-0  md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                <NavLink onClick={()=>setMenuActions(false)} style={styleNavLink} className={` px-2 py-2  block hover:text-white hover:bg-[#034078] dark:hover:bg-gray-700  rounded `} to={link.path}>{link.title}</NavLink></li>)}
                {currentUser?
                <li className='absolute border-none top-2 left-4 md:static'>
                  
                  <Dropdown className=' block overflow-hidden' 
                  arrowIcon={false} 
                  inline 
                  label={
                  <Avatar  className='border-[3px] border-blue-600 rounded-full object-cover' 
                  alt='user' 
                  img={currentUser.avatar}
                  size={'sm'}
                  rounded
                  
                  />}>
                    <Dropdown.Header>
                      <span className="block text-sm">{currentUser.name}</span>
                      <span className="block truncate text-sm font-medium">{currentUser.email}</span>
                    </Dropdown.Header>
                    <Link to={"/Dashboard?tab=Profile"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiUser className='me-2 text-lg'/><span>Profile</span></div></Dropdown.Item></Link>
                    {currentUser.isAdmin &&<div>
                    <Link to={"/CreatePage"} className='group/anmit'> <Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiDocumentAdd className='me-2 text-lg'/><span>Create Page</span></div> </Dropdown.Item></Link>
                    <Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiViewGrid className='me-2 text-lg'/><span>Dashboard</span></div></Dropdown.Item>
                    <Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiCog className='me-2 text-lg'/><span>Settings</span></div></Dropdown.Item>
                    <Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiCurrencyDollar className='me-2 text-lg'/><span>Earnings</span></div></Dropdown.Item>
                    </div>}
                    {currentUser.isBroker &&
                    <div>
                    <Link to={"/PageBroker"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'><HiUsers className='me-2 text-lg'/><span>Broker</span></div></Dropdown.Item></Link>
                    </div>}
                    <Dropdown.Item onClick={()=>dispatchTheme(toggleTheme())} className='group/anmit'> <div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-blue-500'>{theme === "light" ?  <HiMoon className='me-2 text-lg'/>:<HiSun className='me-2 text-lg'/>}<span>{theme === "light" ?'Dark Mode':"Light Mode"}</span></div></Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={()=>{setMenuActions(false) ,handleSignout()}} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-red-500 dark:group-hover/anmit:text-red-400'><HiLogout className='me-2 text-lg'/><span>Sign out</span></div></Dropdown.Item>
                  </Dropdown>
                </li>
                :<li className='absolute top-2 left-4 md:static'>
                        <Link onClick={()=>setMenuActions(false)} className={` px-3 py-2 rounded  block font-bold  text-[#1282a2] bg-[#fefcfb] border border-[#1282a2]`} to='/Signin'>Sing in</Link></li>}
                
                
            </ul>
        </nav>
    </header>
  )
}

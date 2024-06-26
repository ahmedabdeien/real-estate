"use client";
import  { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logo_e_w.png'
import { Avatar, Dropdown } from "flowbite-react";
import { HiCog, HiCurrencyDollar, HiDocumentAdd, HiLogout, HiMoon, HiSun, HiUser, HiUsers, HiViewGrid } from "react-icons/hi";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';
import { FaSearch } from 'react-icons/fa';
export default function Header() {
  const dispatchTheme = useDispatch();
    const {theme} = useSelector(state => state.theme);
    let styleIconMenu = `w-8 h-1 bg-[#fff] rounded-full transition-transform duration-200 ease-in`
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
        {title:'Projects',path:'/Project',style:''},
        {title:'About',path:'/About',style:''},
        {title:'contact',path:'/contact',style:''},
    ]
    const styleNavLink = ({isActive}) => {
       return {
         
         background: isActive ? (theme === "dark" ? '' : (theme === "light" ? '' : '')) : '',
         position: isActive ? 'relative' : 'relative',
          color: isActive ? (theme === "dark" ? '#fff' : (theme === "light" ? '#033e8a' : '#033e8a')) : (theme === "dark" ? '#fefcfb' : (theme === "light" ? '#000' : '#000000')),
         
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
        <>
        
        <header  className='sticky z-50 top-0 w-full bg-white/90 backdrop-blur-sm shadow dark:bg-stone-950 border-b border-stone-300'>
        <div className=' container flex justify-between items-center '>
        <h2 className='font-bold'>
        <Link to="/" className='text-stone-700 '>
        <div className='bg-[#033e8a]'>
         <img src={Logoelsarh} alt="Logoelsarh" className='w-28 sm:w-[110px] p-2 ' title='Elsarh Real Estate' />
        </div>
        </Link>
        </h2>
         {/* icon navbar on phone  */}
        <div onClick={()=>setMenuActions(!menuActions)} className='order-3 lg:order-none block md:hidden z-40 cursor-pointer text-[#fefcfb]'>
        {menuActions?
          <div className='-space-y-1'>
            <div className='w-8 h-1 -rotate-45 rounded-full bg-[#fff] transition-transform duration-200 ease-in'></div>
            <div className='w-8 h-1 -translate-x-5 opacity-0  transition-[transform_opacity]'></div>
            <div className='w-8 h-1 rotate-45 rounded-full bg-[#fff] transition-transform duration-200 ease-in'></div>
          </div>
          :
          <div className='space-y-2'>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
          </div>}
  
        </div>  
        <nav className={`${menuActions? 'translate-x-[0%] ease-out':' ease-in -translate-x-[105%]'} top-0 left-0 w-[86%] h-screen transition-transform duration-200  fixed right-0 border-e border-t shadow border-[#016FB9] md:border-none md:shadow-none bg-[#033e8a] dark:bg-gray-900 md:translate-x-0 md:static md:w-auto md:h-auto md:bg-transparent dark:md:bg-transparent flex justify-center items-center`}>
            <ul className='md:space-x-1 w-full md:p-0 divide-[#016FB9] divide-y md:divide-y-0 text-center space-y-2 md:w-auto md:space-y-0  md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className='px-2 '>
                <NavLink onClick={()=>setMenuActions(false)} style={styleNavLink} className={`block py-1 hoverLink font-bold text-black sm:text-white`} to={link.path}>{link.title}</NavLink></li>)}
                <div className=''>
                 <div>
                
                </div>
                 </div>
                {currentUser?
                <li className='absolute border-none top-2 left-4 md:static'>
                  
                  <Dropdown className=' w-64  md:w-auto divide-y' 
                  arrowIcon={false} 
                  inline 
                  label={
                  <Avatar  className='border-[3px] border-[#FF9505] rounded-full object-cover' 
                  alt='user' 
                  img={currentUser.avatar}
                  size={'sm'}
                  rounded
                  
                  />}>
                    <Dropdown.Header >
                      <span className="block text-sm">{currentUser.name}</span>
                      <span className="block truncate text-sm font-medium">{currentUser.email}</span>
                    </Dropdown.Header>
                    <Link to={"/Dashboard?tab=Profile"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiUser className='me-2 text-lg'/><span>Profile</span></div></Dropdown.Item></Link>
                    {currentUser.isAdmin &&<div>
                    <Link to={"/CreatePage"} className='group/anmit'> <Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiDocumentAdd className='me-2 text-lg'/><span>Create Page</span></div> </Dropdown.Item></Link>
                    <Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiViewGrid className='me-2 text-lg'/><span>Dashboard</span></div></Dropdown.Item>
                    <Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiCurrencyDollar className='me-2 text-lg'/><span>Earnings</span></div></Dropdown.Item>
                    </div>}
                    {currentUser.isBroker &&
                    <div>
                    <Link to={"/PageBroker"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiUsers className='me-2 text-lg'/><span>Broker</span></div></Dropdown.Item></Link>
                    </div>}
                    <Dropdown.Item onClick={()=>dispatchTheme(toggleTheme())} className='group/anmit'> <div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'>{theme === "light" ?  <HiMoon className='me-2 text-lg'/>:<HiSun className='me-2 text-lg'/>}<span>{theme === "light" ?'Dark Mode':"Light Mode"}</span></div></Dropdown.Item>
                    <Link to={"/Settings"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><HiCog className='me-2 text-lg'/><span>Settings</span></div></Dropdown.Item></Link>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={()=>{setMenuActions(false) ,handleSignout()}} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-red-500 dark:group-hover/anmit:text-red-400'><HiLogout className='me-2 text-lg'/><span>Sign out</span></div></Dropdown.Item>
                  </Dropdown>
                </li>
                :<li className='absolute top-2 left-4 md:static'>
                        <Link onClick={()=>setMenuActions(false)} className={` px-3 py-2 rounded hover:scale-105 transition-transform block font-bold bg-white text-[#033e8a] border-2 border-[#016FB9] dark:text-white dark:bg-gray-700`} to='/Signin'>Sing in</Link></li>}
            </ul>
        </nav>
        <form className={`order-first sm:order-2 lg:order-none ${menuActions? 'hidden': 'block'}`} >
        <div className='w-11  sm:w-8 h-11 sm:h-8 bg-[#FF9505] flex justify-center items-center  rounded-full after:bg-[#FF9505] after:w-8 after:sm:w-7 after:h-8 after:sm:h-7  after:absolute after:rounded-full after:-z-10  after:animate-ping relative translate-x-1'>
          <FaSearch  className={` text-lg text-white dark:text-gray-700 `}/>
        </div>
        </form>
        </div>
    </header>
    </>
  )
}

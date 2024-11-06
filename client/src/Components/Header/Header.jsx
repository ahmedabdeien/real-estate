"use client";
import  { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logoElsarh.png'
import LogoelsarhTwo from '../../assets/images/logo_e_w.png'
import { Avatar, Dropdown } from "flowbite-react";
import { logOutUserFailure, logOutUserStart, logOutUserSuccess } from '../redux/user/userSlice';
import { toggleTheme } from '../redux/theme/themeSlice';
import { BsSearch } from "react-icons/bs";
import { FaComments ,FaColumns,FaCoins ,FaCogs,FaDoorOpen,FaMoon ,FaUser ,FaSun } from "react-icons/fa";

export default function Header() {
  const [showNavbar, setShowNavbar] = useState(false);

  // Function to handle scroll events
  const handleScroll = () => {
    if (window.scrollY > 300 ) {
      setShowNavbar(true); 
      
    } else {
      setShowNavbar(false);
    }
  };
  
  // Scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const dispatchTheme = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (searchTerm) {
          console.log(searchTerm);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const {theme} = useSelector(state => state.theme);
    let styleIconMenu = showNavbar ?  `w-8 h-1 bg-[#fefcfb] rounded-full transition-transform duration-200 ease-in` : `w-8 h-1 bg-[#000] rounded-full transition-transform duration-200 ease-in`
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
         
         background: isActive ? (theme === "dark" ? '' : (theme === "light" && showNavbar  ? "#002E66" :'#353531')) : '',
          position: isActive ? 'relative' : 'relative',
          color: isActive ? (theme === "dark" ? '#fff' : (theme === "light" ? '#fff' : '#000')) : (theme === "dark" ? '#fefcfb' : (theme === "light" && showNavbar  ? '#fff' : '#000')),
         
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
         <header  className={` fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${showNavbar 
          ? 'translate-y-0  bg-[#004483] shadow' 
          : '-translate-y-full  bg-[#004483]'
        }
        dark:bg-stone-950 py-1
      `}>
        <div className=' container flex justify-between items-center '>
        <h2 className='font-medium'>
        <Link to="/" className='text-stone-700 '>
        <div className=''>
         <img src={showNavbar ? LogoelsarhTwo: Logoelsarh} alt="Logoelsarh" className='w-28 sm:w-[100px] p-2 transition-colors' title='Elsarh Real Estate' />
        </div>
        </Link>
        </h2>
         {/* icon navbar on phone  */}
         <form  className={`order-first md:order-none hidden lg:block w-1/3 sm:1/2 ${menuActions? 'hidden': 'block'} relative `} >
          <input onChange={()=>setSearchTerm} type="text" placeholder='Search' className='rounded-full w-full ps-8' />
          <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 opacity-80'/>
        </form>

        <div onClick={()=>setMenuActions(!menuActions)} className='order-3 lg:order-none block md:hidden z-40 cursor-pointer text-[#fefcfb]'>
        {menuActions?
          <div className='-space-y-1'>
            <div className={`${showNavbar ? " bg-white" : "bg-[#000]"} w-8 h-1 -rotate-45 rounded-full  transition-transform duration-200 ease-in`}></div>
            <div className='w-8 h-1 -translate-x-5 opacity-0  transition-[transform_opacity]'></div>
            <div className={`${showNavbar ? " bg-white" : "bg-[#000]"} w-8 h-1 rotate-45 rounded-full  transition-transform duration-200 ease-in`}></div>
          </div>
          :
          <div className='space-y-1'>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
            <div className={styleIconMenu}></div>
          </div>}
  
        </div> 

        <nav className={`${menuActions? 'translate-x-[0%] ease-out':' ease-in -translate-x-[105%]'} ${showNavbar ? 'bg-[#033e8a]': 'bg-white/90 backdrop-blur-md'} top-0 left-0 w-full h-screen transition-transform duration-200  fixed right-0 md:shadow-none dark:bg-gray-900 md:translate-x-0 md:static md:w-auto md:h-auto md:bg-transparent dark:md:bg-transparent flex justify-center items-center`}>
            <ul className=' w-full md:p-0 text-center space-y-0 md:w-auto md:space-y-0  md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                <NavLink onClick={()=>setMenuActions(false)} style={styleNavLink} className={`py-3 md:mx-1  md:px-2 md:py-2  hoverLink font-medium md:border-none md:bg-transparent border-b border-black/20 flex justify-center items-center md:rounded-full hover:bg-[#016FB9]/20 `} to={link.path}>{link.icons} {link.title}</NavLink></li>)}

                {currentUser?
                <li className='absolute border-none top-2 left-4 md:static'>
                  
                  <Dropdown className=' w-64  md:w-auto' 
                  arrowIcon={false} 
                  inline 
                  label={
                  <Avatar  className='border-[3px] rounded-full object-cover focus:border-[#FF9505] focus:ring-[#FF9505]' 
                  alt='user' 
                  img={currentUser.avatar}
                  size={'md'}
                  rounded
                  
                  />}>
                    <Dropdown.Header >
                      <span className="block text-sm">{currentUser.name}</span>
                      <span className="block truncate text-sm font-medium">{currentUser.email}</span>
                    </Dropdown.Header>
                    <Link to={"/Dashboard?tab=Profile"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaUser className='me-2 text-base'/><span>Profile</span></div></Dropdown.Item></Link>
                    {currentUser.isAdmin &&<div>
                    <Link to={"/CreatePage"} className='group/anmit'> <Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaColumns  className='me-2 text-lg'/><span>Create Page</span></div> </Dropdown.Item></Link>
                    <Link to={"/Dashboard?tab=dashbordData"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)} ><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaCoins className='me-2 text-lg'/><span>Dashboard</span></div></Dropdown.Item> </Link>
                    </div>}
                    {currentUser.isBroker &&
                    <div>
                    <Link to={"/PageBroker"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaComments  className='me-2 text-lg'/><span>Contact List</span></div></Dropdown.Item></Link>
                    </div>}
                    <Dropdown.Item onClick={()=>dispatchTheme(toggleTheme())} className='group/anmit'> <div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'>{theme === "light" ?  <FaMoon  className='me-2 text-base'/>:<FaSun className='me-2 text-lg'/>}<span>{theme === "light" ?'Dark Mode':"Light Mode"}</span></div></Dropdown.Item>
                    <Link to={"/Settings"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaCogs  className='me-2 text-lg'/><span>Settings</span></div></Dropdown.Item></Link>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={()=>{setMenuActions(false) ,handleSignout()}} className='group/anmit '><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-red-500 dark:group-hover/anmit:text-red-400'><FaDoorOpen className='me-2 text-lg'/><span>Sign out</span></div></Dropdown.Item>
                  </Dropdown>
                </li>
                :<li className='absolute top-2 left-4 md:static md:ms-2'>
                        <Link onClick={()=>setMenuActions(false)} className={` ${showNavbar ? "hover:text-black text-white ring-stone-200 hover:bg-stone-200":""} px-3 py-2 rounded hover:scale-110 transition-all block font-bold text-black ring-2 ring-[#016FB9] dark:bg-gray-700`} to='/Signin'>Sing in</Link></li>}
            </ul>
        </nav>
        </div>
    </header> 
    
    
    <header  className={`
        relative top-0 left-0 w-full z-50
        transition-all duration-300 ease-in-out py-2
        ${showNavbar ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}
         md:bg-white dark:bg-stone-950 
      `}>
          <div className=' container flex justify-between items-center '>
          <h2 className='font-bold'>
          <Link to="/" className='text-stone-700 '>
          <div className=''>
           <img src={showNavbar ? LogoelsarhTwo: Logoelsarh} alt="Logoelsarh" className='w-28 sm:w-[100px]  transition-colors' title='Elsarh Real Estate' />
          </div>
          </Link>
          </h2>
           {/* icon navbar on phone  */}
           <form  className={`order-first md:order-none hidden lg:block w-1/3 sm:1/2 ${menuActions? 'hidden': 'block'} relative`} >
            <input onChange={()=>setSearchTerm} type="text" placeholder='Search' className='rounded-full ps-8 w-full bg-stone-100 focus:outline focus:outline-[#353531] focus:bg-white focus:outline-offset-2 focus:ring-0 border-none p-2' />
            <BsSearch className='absolute left-3 top-1/2 -translate-y-1/2 opacity-70'/>
          </form>
  
          <div onClick={()=>setMenuActions(!menuActions)} className='order-3 lg:order-none block md:hidden z-40 cursor-pointer text-[#fefcfb]'>
          {menuActions?
            <div className='-space-y-1'>
              <div className="s w-8 h-1 -rotate-45 rounded-full bg-black transition-transform duration-200 ease-in"></div>
              <div className='w-8 h-1 -translate-x-5 opacity-0  transition-[transform_opacity]'></div>
              <div className='w-8 h-1 rotate-45 rounded-full bg-black transition-transform duration-200 ease-in'></div>
            </div>
            :
            <div className='space-y-1'>
              <div className={styleIconMenu}></div>
              <div className={styleIconMenu}></div>
              <div className={styleIconMenu}></div>
            </div>}
    
          </div> 
  
          <nav className={`${menuActions? 'translate-x-[0%] ease-out':' ease-in -translate-x-[105%]'} ${showNavbar ? 'bg-[#033e8a]': 'bg-white/90 backdrop-blur-md'} top-0 left-0 w-full h-screen transition-transform duration-200  fixed right-0 md:shadow-none dark:bg-gray-900 md:translate-x-0 md:static md:w-auto md:h-auto md:bg-transparent dark:md:bg-transparent flex justify-center items-center`}>
              <ul className=' w-full md:p-0 text-center space-y-0 md:w-auto md:space-y-0  md:flex items-center justify-center '>
                 {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                  <NavLink onClick={()=>setMenuActions(false)} style={styleNavLink} className={`py-3 md:mx-1  md:px-2 md:py-2  hoverLink font-medium md:border-none md:bg-transparent border-b border-black/20 flex justify-center items-center md:rounded-full hover:bg-[#016FB9]/20 `} to={link.path}>{link.icons} {link.title}</NavLink></li>)}
  
                  {currentUser?
                  <li className='absolute border-none top-2 left-4 md:static'>
                    
                    <Dropdown className=' w-64  md:w-auto ' 
                    arrowIcon={false} 
                    inline 
                    label={
                    <Avatar  className='border-[3px] rounded-full object-cover focus:border-[#FF9505] focus:ring-[#FF9505]' 
                    alt='user' 
                    img={currentUser.avatar}
                    size={'md'}
                    rounded
                    />}>
                      <Dropdown.Header className=' '>
                        <span className="block text-sm font-bold">{currentUser.name}</span>
                        <span className="block truncate text-sm font-medium">{currentUser.email}</span>
                      </Dropdown.Header>
                      <Link to={"/Dashboard?tab=Profile"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaUser className='me-2 text-base'/><span>Profile</span></div></Dropdown.Item></Link>
                      {currentUser.isAdmin &&<div>
                      <Link to={"/CreatePage"} className='group/anmit'> <Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaColumns  className='me-2 text-lg'/><span>Create Page</span></div> </Dropdown.Item></Link>
                      <Link to={"/Dashboard?tab=dashbordData"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)} ><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaCoins  className='me-2 text-lg '/><span>Dashboard</span></div></Dropdown.Item> </Link>
                      </div>}
                      {currentUser.isBroker &&
                      <div>
                      <Link to={"/PageBroker"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)}><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaComments   className='me-2 text-lg'/><span>Contact List</span></div></Dropdown.Item></Link>
                      </div>}
                      <Dropdown.Item onClick={()=>dispatchTheme(toggleTheme())} className='group/anmit'> <div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'>{theme === "light" ?  <FaMoon  className='me-2 text-base'/>:<FaSun className='me-2 text-lg'/>}<span>{theme === "light" ?'Dark Mode':"Light Mode"}</span></div></Dropdown.Item>
                      <Link to={"/Settings"} className='group/anmit'><Dropdown.Item onClick={()=>setMenuActions(false)} className='group/anmit'><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-[#FF9505]'><FaCogs className='me-2 text-lg'/><span>Settings</span></div></Dropdown.Item></Link>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={()=>{setMenuActions(false) ,handleSignout()}} className='group/anmit '><div className='group-hover/anmit:translate-x-6 transition-transform flex items-center group-hover/anmit:text-red-500 dark:group-hover/anmit:text-red-400'><FaDoorOpen className='me-2 text-lg'/><span>Sign out</span></div></Dropdown.Item>
                    </Dropdown>
                  </li>
                  :<li className='absolute top-2 left-4 md:static md:ms-2'>
                          <Link onClick={()=>setMenuActions(false)} className={` ${showNavbar ? "text-white  ring-amber-500":""} px-3 py-2 rounded hover:scale-110 transition-all block font-bold text-[#353531] bg-stone-200 outline  dark:bg-gray-700`} to='/Signin'>Sing in</Link></li>}
              </ul>
          </nav>
          </div>
      </header>

      

    </>
  )
}

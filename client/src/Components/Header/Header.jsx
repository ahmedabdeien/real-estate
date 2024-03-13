import  { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FaSearch } from "react-icons/fa";
import { useSelector } from 'react-redux';
import Logoelsarh from '../../assets/images/logo_nawe-03.png'

export default function Header() {
    let styleIconMenu = `w-8 h-1 bg-slate-800 transition-transform`
    let [menuActions,setMenuActions] = useState(false); 
    const titleLikeNavbar = [
        {title:'Home',path:'/',style:''},
        {title:'About',path:'/About',style:''},
       
    ]
    const {currentUser} = useSelector(state => state.user)
  return (
    <header className='bg-gray-100/85 sticky z-50 top-0 backdrop-blur-md border-b flex justify-between items-center px-5 p-1  '>
        <h2 className='font-bold'>
        <Link to="/" className='text-stone-700'>
         <img src={Logoelsarh} alt="Logoelsarh" className='w-24 sm:w-28 ' title='Elsarh Real Estate' />
        </Link>
        </h2>
        <form className='w-1/2 md:w-1/3 border rounded-full bg-white  flex justify-start items-center group-focus/edittts:outline-blue-600'>
            <FaSearch className='ms-3 text-black/50'/>
            <input type="text" placeholder='Search...' className='p-2 w-full bg-transparent focus:outline-none group/edittts'/>
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

        <nav className={`${menuActions? 'translate-y-0':'translate-y-[-100%]'} w-full h-screen transition-transform fixed top-0 right-0 bg-white md:translate-y-0 md:static md:w-auto md:h-auto md:bg-transparent flex justify-center items-center`}>
            <ul className=' w-full md:p-0 divide-y md:divide-y-0 text-center space-y-2  md:w-auto md:space-y-0 md:space-x-0 md:flex items-center justify-center '>
               {titleLikeNavbar.map((link)=><li key={link.path} className=''>
                <NavLink onClick={()=>setMenuActions(!menuActions)} className='px-3 py-2  block hover:text-blue-600 ' to={link.path}>{link.title}</NavLink></li>)}
                {currentUser?<li className='absolute top-2 left-4 hover:opacity-70 md:static border-none w-auto'>
                  <NavLink onClick={()=>setMenuActions(!menuActions)} to='/Profile'  title='Profile'>
                    <div className='bg-white border-2 w-10 h-10 md:w-7 md:h-7 rounded-full flex justify-center items-center overflow-hidden'>
                      <img src={currentUser.avatar} alt="profile" />
                      </div></NavLink></li>:<li className=''><NavLink onClick={()=>setMenuActions(!menuActions)} className="px-3 py-2  block hover:text-blue-600 " to='/Signin'>Sing in</NavLink></li>}
                
                
            </ul>
        </nav>
    </header>
  )
}

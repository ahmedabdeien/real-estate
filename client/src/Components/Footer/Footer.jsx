
import { FaRegWindowMinimize } from "react-icons/fa6";
import { Link } from "react-router-dom";
import SocialMediaLink from "../SocialMedia/SocialMediaLink";

export default function Footer() {
  return (
    <footer className=' text-sm'>
       <div className='p-5 grid md:grid-cols-3 gap-3 border-t dark:border-stone-700 dark:bg-stone-950 bg-[#033e8a]'>
       <div>
           <h6 className='text-xl font-semibold mb-3 text-white'>Work Hours</h6>
            <ul className="space-y-1 text-gray-300 dark:text-gray-400/90">
                <li className='flex items-start'><span>Saturday</span><FaRegWindowMinimize/><span>Thursday</span> </li>
                <li className='flex items-start'><span>10am</span><FaRegWindowMinimize /><span>5am</span> </li>
            </ul>
          </div>
          
         <div>
            <h6 className='text-xl font-semibold mb-3 text-white'>Quick Links</h6>
            <ul className=" space-y-1 text-gray-300 dark:text-gray-400/90">
              <li><Link to="/Home" className='hover:text-[#ff9505]'>Home</Link></li>
              <li><Link to="/Project" className='hover:text-[#ff9505]'>Project</Link></li>
              <li><Link to="/About" className='hover:text-[#ff9505]'>About</Link></li>
              <li><Link to="/Signin" className='hover:text-[#ff9505]'>sign in</Link></li>
            </ul>
         </div>



          <div className=''>
            <h6 className='text-xl font-semibold mb-3 text-white'>Site Title</h6>
            <ul className="space-y-1  text-gray-300 dark:text-gray-400/90">
              <li>14 El Mokhtar Street from Nasr Street</li>
              <li>New Maadi , Cairo</li>
              <li><a href="mailto:elsarhegypt@gmail.com" className='hover:text-[#ff9505]'>elsarhegypt@gmail.com</a></li>
              <li><a href="tel:+0227547988" className='hover:text-[#ff9505]'>0227547988</a></li>
              </ul>
          </div>


          <div className='border-t border-[#016FB9] dark:border-gray-600/20  md:col-span-3  flex justify-between items-center py-2 text-gray-300 dark:text-gray-400/90' >
            <p>
              © 2021 <a className="hover:underline" href="">Elsarh Real Estate.</a> All Rights Reserved.
            </p>
           <div className="  ">
              <SocialMediaLink/>
           </div>
          
          </div>
      </div>

    </footer>
  )
}


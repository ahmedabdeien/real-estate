import { FaFacebook } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa6";
import { FaRegWindowMinimize } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className=' text-sm'>
       <div className='p-5 grid md:grid-cols-3 gap-3  border-t-2 dark:bg-gray-900  dark:border-gray-600'>
       <div>
           <h6 className='text-xl font-semibold mb-3 '>Work Hours</h6>
            <ul className="space-y-1 text-gray-500 dark:text-gray-400/90">
                <li className='flex items-start'><span>Saturday</span><FaRegWindowMinimize/><span>Thursday</span> </li>
                <li className='flex items-start'><span>10am</span><FaRegWindowMinimize /><span>5am</span> </li>
            </ul>
          </div>
          
         <div>
            <h6 className='text-xl font-semibold mb-3 '>Quick Links</h6>
            <ul className=" space-y-1 text-gray-500 dark:text-gray-400/90">
              <li><Link to="/Home" className='hover:text-[#1282a2]'>Home</Link></li>
              <li><Link to="/Project" className='hover:text-[#1282a2]'>Project</Link></li>
              <li><Link to="/About" className='hover:text-[#1282a2]'>About</Link></li>
              <li><Link to="/Signin" className='hover:text-[#1282a2]'>sign in</Link></li>
            </ul>
         </div>



          <div className=''>
            <h6 className='text-xl font-semibold mb-3 '>Site Title</h6>
            <ul className="space-y-1  text-gray-500 dark:text-gray-400/90">
              <li>14 El Mokhtar Street from Nasr Street</li>
              <li>New Maadi , Cairo</li>
              <li><a href="mailto:elsarhegypt@gmail.com" className='hover:text-[#1282a2]'>elsarhegypt@gmail.com</a></li>
              <li><a href="tel:+0227547988" className='hover:text-[#1282a2]'>0227547988</a></li>
              </ul>
          </div>


          <div className='border-t dark:border-gray-600  md:col-span-3  flex justify-between items-center py-2 text-gray-500 dark:text-gray-400/90' >
            <p>
              © 2021 <a className="hover:underline" href="">Elsarh Real Estate.</a> All Rights Reserved.
            </p>
           <div className="  ">
              <ul className='flex text-gray-500 dark:text-gray-400/90 text-lg space-x-2'>
              <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-[#1282a2] underline '><FaFacebook/></a></li>
              <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-[#1282a2] underline '><FaInstagram/></a></li>
              <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-[#1282a2] underline '><FaLinkedinIn/></a></li>
              </ul>
           </div>
          
          </div>
      </div>

    </footer>
  )
}


import React from 'react'
import { FaRegWindowMinimize } from "react-icons/fa6";export default function Footer() {
  return (
    <footer className='bg-stone-50 p-5 grid md:grid-cols-3 gap-3 text-stone-700 border-t '>

<div className=''  >
    
<h6 className='text-xl font-semibold mb-3 text-stone-900'>Work Hours</h6>
      <ul>
          <li className='flex items-start'><span>Saturday</span><FaRegWindowMinimize/><span>Thursday</span> </li>
          <li className='flex items-start'><span>10am</span><FaRegWindowMinimize /><span>5am</span> </li>
          </ul>
      
      </div>
      
      <div className='' >
      <h6 className='text-xl font-semibold mb-3 text-stone-900'>Social</h6>
      <ul>
          <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-blue-800 underline '>Facebook</a></li>
          <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-blue-800 underline '>Instagram</a></li>
          <li><a href="http://" target="_blank" rel="noopener noreferrer" className='hover:text-blue-800 underline '>Linkedin</a></li>
          </ul>
      </div>
      <div className=''>
        <h6 className='text-xl font-semibold mb-3 text-stone-900'>Site Title</h6>
        <ul>
          <li>14 El Mokhtar Street from Nasr Street</li>
          <li>New Maadi , Cairo</li>
          <li><a href="mailto:elsarhegypt@gmail.com" className='hover:text-blue-800'>elsarhegypt@gmail.com</a></li>
          <li><a href="tel:+0227547988" className='hover:text-blue-800'>0227547988</a></li>
          </ul>
      </div>
    </footer>
  )
}


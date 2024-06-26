import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

export default function SocialMediaLink() {
  return (
    <div className='flex items-center text-[#016FB9] space-x-4'>
    <a href="http://" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaFacebookF/></a>
  <a href="http://" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaInstagram/></a>
  <a href="http://" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaLinkedinIn/></a>
  <a href="http://" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaWhatsapp/></a>
  </div>
  )
}

import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

export default function SocialMediaLink() {
  return (
    <div className='flex items-center text-[#016FB9] space-x-3'>
    <a href="http://www.facebook.com/elsarh.eg" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full me-3'>
  <FaFacebookF/></a>
  <a href="https://www.instagram.com/elsarh.eg?igsh=MTdjem1weDNvZXlicA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaInstagram/></a>
  <a href="https://www.linkedin.com/company/elsarh/" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaLinkedinIn/></a>
  <a href="http://wa.me/201000554192" target="_blank" rel="noopener noreferrer" className='bg-gray-100 text-[#033e8a] p-1 rounded-full'>
  <FaWhatsapp/></a>
  </div>
  )
}
export function SocialMediaLinkTow(){
  return (
    <div className='flex items-center space-x-3 text-3xl text-white w-full'>
    <a href="http://www.facebook.com/elsarh.eg" target="_blank" rel="noopener noreferrer" className='bg-[#016FB9] rounded-full hover:opacity-90  p-2 flex justify-center items-center h-full w-1/4 transition-all me-3'>
  <FaFacebookF/></a>
  <a href="https://www.instagram.com/elsarh.eg?igsh=MTdjem1weDNvZXlicA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className='bg-[#016FB9] rounded-full hover:opacity-80  p-2 flex justify-center items-center h-full'>
  <FaInstagram/></a>
  <a href="http://www.linkedin.com/company/elsarh/" target="_blank" rel="noopener noreferrer" className='bg-[#016FB9] rounded-full hover:opacity-90  p-2 flex justify-center items-center h-full'>
  <FaLinkedinIn/></a>
  <a href="http://wa.me/201000554192" target="_blank" rel="noopener noreferrer" className='bg-[#016FB9] rounded-full hover:opacity-90  p-2 flex justify-center items-center h-full'>
  <FaWhatsapp/></a>
  </div>
  )
}

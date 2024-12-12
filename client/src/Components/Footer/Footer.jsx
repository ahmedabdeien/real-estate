import { BsArrowUpCircle } from "react-icons/bs";
import { FaRegWindowMinimize } from "react-icons/fa";
import { Link } from "react-router-dom";
import SocialMediaLink from "../SocialMedia/SocialMediaLink";
import { useEffect, useState } from "react";

export default function Footer() {
  const [showButton, setShowButton] = useState(false);

  // Function to handle scroll events
  const handleScroll = () => {
    if (window.scrollY > 500) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  // Scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer dir="rtl" className='text-sm'>
      {/* Scroll to Top Button */}
      {showButton &&
      <div onClick={scrollToTop} 
           className={`${showButton ? 'scale-100' : ' scale-50 transition-all'} fixed bottom-6 right-6 bg-[#ff9505] hover:bg-[#033e8a] text-white rounded-full p-3 cursor-pointer shadow-lg transition-all duration-300`}>
        <BsArrowUpCircle className="text-3xl" />
      </div>}

      {/* Footer Content */}
      <div className='p-8 grid md:grid-cols-3 gap-8 bg-white border-t text-black-300 dark:bg-stone-950'>
        {/* Work Hours Section */}
        <div>
          <h6 className='text-xl font-semibold mb-3 text-black underline underline-offset-8'>ساعات العمل</h6>
          <ul className="space-y-1 text-gray-700 dark:text-gray-400/90">
            <li className='flex items-center'><span>السبت</span><FaRegWindowMinimize className="mx-2"/><span> الخميس</span></li>
            <li className='flex items-center'><span>10am</span><FaRegWindowMinimize className="mx-2"/><span>5pm</span></li>
          </ul>
        </div>

        {/* Quick Links Section */}
        <div>
          <h6 className='text-xl font-semibold mb-3 text-black underline underline-offset-8'>روابط سريعة</h6>
          <ul className="space-y-2 text-gray-700 dark:text-gray-400/90">
            <li><Link to="/Home" className='hover:text-[#ff9505] transition-colors duration-200'>الصفحة الرئيسية</Link></li>
            <li><Link to="/Project" className='hover:text-[#ff9505] transition-colors duration-200'>المشاريع</Link></li>
            <li><Link to="/About" className='hover:text-[#ff9505] transition-colors duration-200'>عن الصرح</Link></li>
            <li><Link to="/Signin" className='hover:text-[#ff9505] transition-colors duration-200'>تسجيل الدخول</Link></li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h6 className='text-xl font-semibold mb-3 text-black underline underline-offset-8'>اتصل بنا </h6>
          <ul className="space-y-1 text-gray-700 dark:text-gray-400/90">
            <li>14 شارع المختار من شارع النصر</li>
            <li>المعادي الجديدة، القاهرة</li>
            <li><a href="mailto:elsarhegypt@gmail.com" className='hover:text-[#ff9505] transition-colors duration-200'>elsarhegypt@gmail.com</a></li>
            <li><a href="tel:+0227547988" className='hover:text-[#ff9505] transition-colors duration-200'>0227547988</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className=' border-t bg-[#004483] py-4 px-8 md:col-span-3 flex justify-between items-center text-white dark:text-gray-400/90'>
        <p>
          © 2021 <a className="hover:underline" href="#">الصرح للاستثمار العقاري</a> جميع الحقوق محفوظة.
        </p>
        <div className="flex space-x-4">
          <SocialMediaLink />
        </div>
      </div>
    </footer>
  );
}

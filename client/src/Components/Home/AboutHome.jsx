import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import { useEffect, useState } from 'react';
import logoElsarh from "../../assets/images/apartment-2179337-removebg-preview.png";

import { Link } from 'react-router-dom';
export default function AboutHome() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSecondSectionVisible, setIsSecondSectionVisible] = useState(false);

  // Scroll handler to add animation when the section comes into view
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    // If user scrolls down 300px, trigger animation for first section
    if (scrollPosition > 150 && scrollPosition < 250) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
    // If user scrolls down 700px, trigger animation for the second section
    if (scrollPosition > 250 && scrollPosition < 1500) {
      setIsSecondSectionVisible(true);
    } else {
      setIsSecondSectionVisible(false); 
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div dir="rtl" className='overflow-hidden'>
      
      <div className={`bg-white dark:bg-stone-800 transition-transform duration-500 ${isScrolled ? ' -translate-y-4' : ' translate-y-0'} duration-300 ease-in-out`}>
        <div className='py-6 grid gap-3 grid-cols-1 lg:grid-cols-2 items-center container mx-auto'>
          <div className='mb-3 flex flex-col  justify-center'>
            <h2 className='text-3xl font-semibold mb-2 text-black  border-[#002E66] border-s-4 ps-2 md:border-none md:ps-0'>
              الصرح للاستثمار العقاري
            </h2>
            <p className='text-[#353531]/90 dark:text-gray-300 text-lg'>
          شركة الصرح للاستثمار العقاري خبرة اكثرمن 20 عـامًا ذات إستراتيجية شاملة لمستقبل المعمــار فـي مصـر تعتمـد علـى الدراسات العلميـة والتكنولوجيـا المتطـورة التـى تواكب النهضـة العقارية العالمية شركة تهدف إلى إحداث تطور معمارى غير مسبوق فى مصر ...
            </p>
            <div className='mt-5'>
            <Link to='/about'><button className='bg-[#004483] font-medium transition-all text-white py-2 px-4 rounded-lg hover:bg-white hover:outline hover:text-[#004483]'>عرض المزيد</button></Link>
            </div>
          </div>
          <div className='flex  justify-end '>
            <div className='relative'>
            <img src={logoElsarh} alt="aboutImg" className='w-[20rem] md:w-[25rem] border-b'/>
             <div className='absolute bottom-0 left-0 w-full h-full bg-gradient-to-t to-white/0 from-white'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Section */}
      <div className={`bg-stone-100 dark:bg-stone-900 transition-all duration-500 ${isSecondSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ease-in-out`}>
        <div className='py-8 grid gap-12 grid-cols-1 lg:grid-cols-2 items-center container mx-auto'>
          <div className='flex justify-center  '>
            <img
              src={imgElsarh}
              alt="El Sarh Real Estate"
              className=' rounded-2xl'
            />
          </div>
          <div className=' order-first lg:order-2 lg-4 '>
            <h2 className='md:text-3xl text-3xl font-semibold mb-2 text-[#002E66] border-[#002E66] border-s-4 ps-2 md:border-none md:ps-0'>
              الصرح
            </h2>

            <p className='text-gray-700 text-lg dark:text-gray-300'>
            جودة لا مثيل لها ومعايير بناء استثنائية .</p>
            <p className='text-gray-700 text-lg dark:text-gray-300'>
            تصاميم مبتكرة وأساليب معمارية معاصرة.
            </p>
            <p className='text-gray-700 text-lg dark:text-gray-300'>
            وحدات متنوعة تلبي مجموعة متنوعة من الاحتياجات والتفضيلات.
            </p>
            <p className='text-gray-700 text-lg dark:text-gray-300'>
            الالتزام ببناء مجتمعات نابضة بالحياة مع وسائل راحة لا مثيل لها.
            </p>
            <p className='text-gray-700 text-lg dark:text-gray-300'>
            الممارسات المستدامة والتركيز الواضح على المسؤولية البيئية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

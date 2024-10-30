import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import { useEffect, useState } from 'react';

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
    if (scrollPosition > 250 && scrollPosition < 1300) {
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
    <div className='overflow-hidden'>
      
      <div className={`bg-white dark:bg-stone-800 transition-transform duration-500 ${isScrolled ? ' -translate-y-4' : ' translate-y-0'} duration-300 ease-in-out`}>
        <div className='py-8 grid gap-3 grid-cols-1 lg:grid-cols-2 items-center container mx-auto'>
          <div className='mb-3'>
            <h2 className='text-3xl font-semibold mb-2 text-[#002E66] border-[#002E66] border-s-4 ps-2 md:border-none md:ps-0'>
              El Sarh Real Estate Investment Company
            </h2>
            <p className='text-[#353531]/90 dark:text-gray-300'>
              El Sarh Investment Company (El Sarh) stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces. Since its inception in 2005, El Sarh has carved a path of excellence, leaving an indelible mark on the Egyptian real estate landscape.
            </p>
          </div>
          <div className='flex justify-end'>
            <iframe
              className='w-full lg:w-[84%] shadow-lg lg:rounded-2xl'
              width="560"
              height="315"
              src="https://www.youtube.com/embed/5r-IJ2CcGIs?si=_fKg71zXOGam7A7R&start=1"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Second Section */}
      <div className={`bg-stone-100 dark:bg-stone-900 transition-all duration-500 ${isSecondSectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ease-in-out`}>
        <div className='py-8 grid gap-12 grid-cols-1 lg:grid-cols-2 items-center container mx-auto'>
          <div className='flex justify-start md:py-5'>
            <img
              src={imgElsarh}
              alt="El Sarh Real Estate"
              className='lg:rounded-2xl shadow-md '
            />
          </div>
          <div className=' order-first lg:order-2 lg-4 '>
            <h2 className='md:text-3xl text-3xl font-semibold mb-2 text-[#002E66] border-[#002E66] border-s-4 ps-2 md:border-none md:ps-0'>
              El Sarh Real Estate Investment Company
            </h2>
            <p className='text-[#353531]/90 dark:text-gray-300'>
              El Sarh Investment Company (El Sarh) stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces.
            </p>
            <p className='text-gray-700 dark:text-gray-300'>
              Since its inception in 2005, El Sarh has carved a path of excellence, leaving an indelible mark on the Egyptian real estate landscape.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import photosOne from "../../assets/images/realestateimages.jpg";
import photosthree from "../../assets/images/image_fx2.jpeg";
import photostwo from "../../assets/images/photoTwo.jpg";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

function SectionCarousel() {
  const sections = [photosOne, photosthree,photostwo];
  const datatext = [
    "نحن نقدم أعلى معايير الجودة في البناء والتصميم، لضمان لك الراحة والفخامة على المدى الطويل.",
    "اختيار شركة الصرح للاستثمار العقاري يعني الحصول على الشريك المثالي الذي يضمن لك النجاح في كافة جوانب استثماراتك العقارية.",
    "طريقك أسهل  لبيتك مع شركة الصرح للاستثمار العقاري"
  ];

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="relative group">
      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        loop={true}
        autoplay={{ delay: 5000 }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
        className="h-[80vh] w-full"
      >
        {sections.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <img
                src={image}
                alt={`Real estate image ${index + 1}`}
                className="w-full h-full object-cover brightness-75"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-[#003366]/30 to-[#003366]/80" />
              
              <div className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 w-full max-w-2xl">
                <div className="glass-effect p-6 md:p-8 text-white rounded-2xl shadow-xl">
                  <p className="text-lg md:text-2xl leading-relaxed text-end mb-6">
                    {datatext[index]}
                  </p>
                  
                  <div className="flex flex-col items-end gap-4">
                    <Link 
                      to="/Projects/sarayat-abdeen-compound"
                      className="bg-white hover:bg-gray-200 text-[#004483] px-8 py-3 rounded-lg
                                transition-all duration-300 hover:-translate-y-1 shadow-md"
                    >
                      عرض المزيد
                    </Link>
                    
                    <div className="flex items-center gap-2 text-[#ff9505]">
                      <span className="text-sm font-medium">{index + 1}</span>
                      <span className="text-xl">/</span>
                      <span className="text-sm font-medium">{sections.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Navigation Buttons */}
        <div className="absolute bottom-8 right-8 z-10 flex gap-4">

                    <button
            ref={navigationNextRef}
            className="p-3 bg-white/40 hover:bg-white/30 rounded-full backdrop-blur-sm
                      transition-all duration-300 hover:scale-110"
          >
            <BsArrowLeft className="text-2xl text-white" />
          </button>
          <button
            ref={navigationPrevRef}
            className="p-3 bg-white/40 hover:bg-white/30 rounded-full backdrop-blur-sm
                      transition-all duration-300 hover:scale-110"
          >
            <BsArrowRight className="text-2xl text-white" />
          </button>

        </div>
      </Swiper>

      <style jsx global>{`
        .glass-effect {
          background: rgba(255, 255, 255, 0.20);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .swiper-slide-active .glass-effect {
          animation: slideIn 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default SectionCarousel;
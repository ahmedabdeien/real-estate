import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade } from 'swiper/modules';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { motion } from 'framer-motion';
import photosOne from "../../assets/images/realestateimages.jpg";
import photosthree from "../../assets/images/image_fx2.jpeg";
import photostwo from "../../assets/images/photoTwo.jpg";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

function SectionCarousel() {
  const sections = [photosOne, photosthree, photostwo];
  const datatext = [
    "معايير عالمية في البناء والتصاميم العقارية المبتكرة لضمان استثمار آمن ومستقبل مشرق.",
    "التميز في الالتزام والجودة هو ما يجعل شركة الصرح الشريك العقاري المفضل في مصر.",
    "مساحتك الخاصة، بتصميمات عصرية تلبي طموحاتك في شركة الصرح للاستثمار العقاري."
  ];

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="relative group overflow-hidden">
      <Swiper
        modules={[Navigation, Autoplay, EffectFade]}
        effect="fade"
        speed={1500}
        loop={true}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = navigationPrevRef.current;
          swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
        className="h-[85vh] md:h-[90vh] w-full"
      >
        {sections.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-full w-full">
              <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                src={image}
                alt={`Premium Real Estate Slide ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Refined Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/40 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute inset-0 flex items-center justify-center md:justify-end px-6 md:px-20">
                <div className="max-w-3xl text-right" dir="rtl">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="glass-card p-10 md:p-14 rounded-[40px] border border-white/10 shadow-premium-xl"
                  >
                    <span className="inline-block px-4 py-1.5 bg-accent-600/20 text-accent-500 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                      تميز عقاري بلا حدود
                    </span>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-white leading-[1.2] mb-8">
                      {datatext[index]}
                    </h2>

                    <div className="flex flex-col sm:flex-row-reverse items-center justify-start gap-6">
                      <Link
                        to="/Project"
                        className="btn-premium bg-accent-600 text-white hover:bg-accent-500 w-full sm:w-auto text-center"
                      >
                        اكتشف مشاريعنا
                      </Link>
                      <Link
                        to="/Contact"
                        className="btn-premium bg-white/10 text-white backdrop-blur-md hover:bg-white/20 w-full sm:w-auto text-center border border-white/20"
                      >
                        تواصل معنا
                      </Link>
                    </div>

                    <div className="mt-12 flex items-center justify-end gap-3 text-slate-400">
                      <span className="w-12 h-px bg-slate-700"></span>
                      <span className="text-sm font-black font-heading text-accent-500">{index + 1}</span>
                      <span className="text-slate-700">/</span>
                      <span className="text-sm font-bold">{sections.length}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation */}
        <div className="absolute bottom-10 left-10 md:left-20 z-10 hidden md:flex gap-4">
          <button
            ref={navigationNextRef}
            className="w-14 h-14 rounded-full glass-card hover:bg-accent-600 hover:text-white flex items-center justify-center transition-all duration-300 text-white border border-white/20 group/btn"
          >
            <BsArrowLeft size={24} className="group-hover/btn:-translate-x-1 transition-transform" />
          </button>
          <button
            ref={navigationPrevRef}
            className="w-14 h-14 rounded-full glass-card hover:bg-accent-600 hover:text-white flex items-center justify-center transition-all duration-300 text-white border border-white/20 group/btn"
          >
            <BsArrowRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </Swiper>
    </div>
  );
}

export default SectionCarousel;
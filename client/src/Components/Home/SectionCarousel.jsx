import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { motion } from 'framer-motion';
import photosOne from "../../assets/images/realestateimages.jpg";
import photosthree from "../../assets/images/image_fx2.jpeg";
import photostwo from "../../assets/images/photoTwo.jpg";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const SectionCarousel = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const slides = [
    {
      image: photosOne,
      badge: t('badge_innovation'),
      title: t('hero_title_1'),
      description: t('hero_desc_1'),
      cta: t('explore_projects'),
      link: "/Project"
    },
    {
      image: photosthree,
      badge: t('badge_experience'),
      title: t('hero_title_2'),
      description: t('hero_desc_2'),
      cta: t('about'),
      link: "/About"
    },
    {
      image: photostwo,
      badge: t('badge_community'),
      title: t('hero_title_3'),
      description: t('hero_desc_3'),
      cta: t('contact'),
      link: "/contact"
    }
  ];

  return (
    <section className="relative h-[600px] w-full overflow-hidden bg-slate-900 font-body">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade, Navigation]}
        effect="fade"
        speed={1500}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          el: '.custom-pagination',
          bulletClass: 'hero-bullet',
          bulletActiveClass: 'hero-bullet-active'
        }}
        navigation={{
          prevEl: '.hero-prev',
          nextEl: '.hero-next',
        }}
        loop
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="container relative z-10 h-full flex items-center px-4 lg:px-12">
              <div className="max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6"
                >
                  <span className="inline-block px-3 py-1 bg-accent-500 text-white text-xs font-bold uppercase tracking-widest rounded-none">
                    {slide.badge}
                  </span>

                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-lg text-slate-200 max-w-xl leading-relaxed">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start gap-4 pt-6">
                    <Link to={slide.link}>
                      <button className="px-8 py-3 bg-white text-primary-900 font-bold hover:bg-slate-100 transition-colors uppercase tracking-wide text-sm rounded-none">
                        {slide.cta}
                      </button>
                    </Link>
                    <Link to="/contact">
                      <button className="px-8 py-3 bg-transparent border-2 border-white text-white font-bold hover:bg-white/10 transition-colors uppercase tracking-wide text-sm rounded-none">
                        {t('get_consultation')}
                      </button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation */}
        <div className="absolute bottom-8 right-12 z-20 hidden lg:flex items-center gap-4">
          <div className="flex gap-2">
            <button className="hero-prev w-10 h-10 bg-white/10 hover:bg-primary-500 backdrop-blur-sm flex items-center justify-center text-white transition-all rounded-none">
              <BsArrowRight className="text-lg" />
            </button>
            <button className="hero-next w-10 h-10 bg-white/10 hover:bg-primary-500 backdrop-blur-sm flex items-center justify-center text-white transition-all rounded-none">
              <BsArrowLeft className="text-lg" />
            </button>
          </div>
          <div className="custom-pagination !static !flex !gap-2" />
        </div>
      </Swiper>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.3);
          border-radius: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-bullet-active {
          background: #5BC1D7;
          transform: scale(1.2);
        }
      `}} />
    </section>
  );
};

export default SectionCarousel;
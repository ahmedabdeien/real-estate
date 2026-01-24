import { useEffect, useRef } from 'react';
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
  const slides = [
    {
      image: photosOne,
      badge: "ابتكار مـعماري",
      title: "نصنع مستقبلاً يليق بطموحاتك",
      description: "شركة الصرح للاستثمار العقاري تقدم معايير عالمية في البناء والتصميم لضمان استثمار آمن وحياة راقية.",
      cta: "استكشف مشاريعنا",
      link: "/Project"
    },
    {
      image: photosthree,
      badge: "خبرة 20 عاماً",
      title: "الجودة والتميز في كل تفصيلة",
      description: "نلتزم بأعلى معايير الجودة لنكون الشريك العقاري المفضل في مصر عبر عقدين من العطاء المستمر.",
      cta: "من نحن",
      link: "/About"
    },
    {
      image: photostwo,
      badge: "مجتمعات متكاملة",
      title: "حيث تجتمع الفخامة مع الراحة",
      description: "وحدات سكنية وتجارية مصممة بعناية لتلبي احتياجات العائلة العصرية والمستثمر الذكي.",
      cta: "تواصل معنا",
      link: "/contact"
    }
  ];

  return (
    <section className="relative h-[90vh] w-full overflow-hidden bg-slate-900 font-heading">
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
            {/* Parallax Background */}
            <motion.div
              className="absolute inset-0 z-0"
              initial={{ scale: 1.1 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 10, ease: "easeOut" }}
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            {/* Content Layer - Centered like the demo */}
            <div className="container relative z-10 h-full flex items-center justify-center px-6 lg:px-12 text-center">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-6"
                >
                  <span className="inline-block px-4 py-1.5 bg-primary-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg">
                    {slide.badge}
                  </span>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
                    {slide.title}
                  </h1>

                  <p className="text-lg md:text-xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    {slide.description}
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                    <Link to={slide.link}>
                      <button className="px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-black text-sm uppercase tracking-widest rounded-lg shadow-xl shadow-primary-500/20 transition-all active:scale-95">
                        {slide.cta}
                      </button>
                    </Link>
                    <Link to="/contact">
                      <button className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-sm uppercase tracking-widest rounded-lg transition-all active:scale-95">
                        احصل على استشارة
                      </button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation */}
        <div className="absolute bottom-10 left-10 z-20 hidden lg:flex items-center gap-6">
          <div className="flex gap-2">
            <button className="hero-prev w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-primary-500 hover:border-primary-500 transition-all">
              <BsArrowRight className="text-xl" />
            </button>
            <button className="hero-next w-12 h-12 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-primary-500 hover:border-primary-500 transition-all">
              <BsArrowLeft className="text-xl" />
            </button>
          </div>
          <div className="custom-pagination !static !flex !gap-1.5" />
        </div>
      </Swiper>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-bullet {
          width: 6px;
          height: 6px;
          background: rgba(255,255,255,0.4);
          border-radius: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-bullet-active {
          width: 24px;
          background: #6cb635;
        }
      `}} />
    </section>
  );
};

export default SectionCarousel;
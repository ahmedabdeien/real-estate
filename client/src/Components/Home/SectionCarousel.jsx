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
    <section className="relative h-[95vh] w-full overflow-hidden bg-primary-950">
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
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "easeOut" }}
            >
              <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-l from-primary-950/90 via-primary-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-transparent to-transparent" />
            </motion.div>

            {/* Content Layer */}
            <div className="container relative z-10 h-full flex items-center justify-end px-6 lg:px-12" dir="rtl">
              <div className="max-w-3xl text-right">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="space-y-8"
                >
                  <span className="inline-flex items-center gap-2 px-5 py-2 bg-accent-600/20 backdrop-blur-md rounded-full border border-accent-600/30 text-accent-500 text-xs font-black uppercase tracking-[0.3em]">
                    <span className="w-2 h-2 rounded-full bg-accent-600 animate-pulse" />
                    {slide.badge}
                  </span>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black text-white leading-[1.1] text-glow">
                    {slide.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl ml-auto leading-relaxed opacity-90">
                    {slide.description}
                  </p>

                  <div className="flex items-center justify-end gap-6 pt-10">
                    <Link to={slide.link}>
                      <button className="btn-premium bg-accent-600 text-white group">
                        {slide.cta}
                        <span className="text-2xl transition-transform group-hover:translate-x-[-8px]">←</span>
                      </button>
                    </Link>
                    <div className="hidden md:flex items-center gap-4 text-white/40">
                      <div className="h-px w-12 bg-white/20" />
                      <span className="text-[10px] uppercase font-black tracking-widest italic">Est. 2004</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation & Pagination */}
        <div className="absolute bottom-12 left-12 z-20 flex items-center gap-12">
          <div className="flex gap-4">
            <button className="hero-next w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <BsArrowRight className="text-2xl" />
            </button>
            <button className="hero-prev w-14 h-14 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all">
              <BsArrowLeft className="text-2xl" />
            </button>
          </div>
          <div className="custom-pagination !static !flex !gap-2" />
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 right-1/2 translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-4"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-accent-600 to-transparent" />
          <span className="text-[10px] text-white/30 uppercase tracking-[0.5em] [writing-mode:vertical-lr]">Scroll</span>
        </motion.div>
      </Swiper>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hero-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-bullet-active {
          width: 40px;
          background: #d97706;
          border-radius: 8px;
        }
      `}} />
    </section>
  );
};

export default SectionCarousel;
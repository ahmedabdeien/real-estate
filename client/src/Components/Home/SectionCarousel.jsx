import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { BsTelephone } from 'react-icons/bs';
import { HiArrowLeft } from 'react-icons/hi';
import photosOne   from '../../assets/images/realestateimages.jpg';
import photosThree from '../../assets/images/image_fx2.jpeg';
import photosTwo   from '../../assets/images/photoTwo.jpg';
import 'swiper/css';
import 'swiper/css/effect-fade';

export default function SectionCarousel() {
  const { config } = useSelector(s => s.config);
  const [activeIndex, setActiveIndex] = useState(0);

  const defaultSlides = [
    {
      image: photosOne,
      badge: 'ابتكار معماري',
      title: 'نصنع مستقبلاً يليق\nبطموحاتك',
      desc:  'شركة الصرح للاستثمار العقاري — معايير عالمية في البناء والتصميم منذ 2004.',
      link:  '/Project',
      cta:   'استكشف مشاريعنا',
    },
    {
      image: photosThree,
      badge: 'خبرة 20 عاماً',
      title: 'الجودة والتميز\nفي كل تفصيلة',
      desc:  'نلتزم بأعلى معايير الجودة عبر عقدين من العطاء المستمر والإنجاز الموثوق.',
      link:  '/About',
      cta:   'تعرف أكثر',
    },
    {
      image: photosTwo,
      badge: 'مجتمعات متكاملة',
      title: 'حيث تجتمع الفخامة\nمع الراحة',
      desc:  'وحدات سكنية وتجارية مصممة بعناية لتلبية احتياجات العائلة العصرية.',
      link:  '/Contact',
      cta:   'احصل على استشارة',
    },
  ];

  const heroConfig = config?.hero;
  const slides = heroConfig?.images?.length > 0
    ? heroConfig.images.map((img, i) => ({
        ...defaultSlides[i % defaultSlides.length],
        image: img,
        title: heroConfig.title?.ar || defaultSlides[i % defaultSlides.length].title,
        desc:  heroConfig.subtitle?.ar || defaultSlides[i % defaultSlides.length].desc,
      }))
    : defaultSlides;

  return (
    <section
      dir="rtl"
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100vh - 72px)', minHeight: 580 }}
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        speed={1600}
        autoplay={{ delay: 6500, disableOnInteraction: false }}
        pagination={{ clickable: true, el: '.hero-dots', bulletClass: 'hero-dot', bulletActiveClass: 'hero-dot-active' }}
        loop
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        className="h-full w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i} className="relative overflow-hidden">
            {/* Background image with slow zoom */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt=""
                className="w-full h-full object-cover"
                style={{
                  transform: 'scale(1.08)',
                  transition: 'transform 8s ease-out',
                  transformOrigin: 'center center',
                }}
              />
              {/* Multi-layer dark gradient */}
              <div className="absolute inset-0" style={{
                background: 'linear-gradient(105deg, rgba(18,40,60,0.93) 0%, rgba(18,40,60,0.60) 50%, rgba(18,40,60,0.10) 100%)',
              }} />
              {/* Bottom vignette */}
              <div className="absolute bottom-0 inset-x-0 h-56" style={{
                background: 'linear-gradient(to top, rgba(18,40,60,0.75), transparent)'
              }} />
              {/* Subtle gold accent bar */}
              <div className="absolute top-0 inset-x-0 h-[3px]" style={{
                background: 'linear-gradient(to right, transparent, #8A6924 30%, #DFBA6B 50%, #8A6924 70%, transparent)',
                opacity: 0.7
              }} />
            </div>

            {/* Decorative geometric accent */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div
                className="absolute w-[500px] h-[500px] rounded-full opacity-[0.04]"
                style={{
                  background: 'radial-gradient(circle, #DFBA6B, transparent)',
                  top: '-10%',
                  left: '-5%',
                }}
              />
              <div
                className="absolute opacity-[0.03]"
                style={{
                  width: 300,
                  height: 300,
                  border: '40px solid #DFBA6B',
                  borderRadius: '50%',
                  bottom: '5%',
                  right: '5%',
                }}
              />
            </div>

            {/* ===== Content ===== */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-6 lg:px-20">
                <motion.div
                  key={`slide-${i}`}
                  className="max-w-2xl"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Badge */}
                  <motion.div
                    className="flex items-center gap-3 mb-7"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <div className="h-px w-10" style={{ background: '#DFBA6B' }} />
                    <span
                      className="text-[10px] font-black tracking-[0.35em] uppercase"
                      style={{ color: '#DFBA6B' }}
                    >
                      {slide.badge}
                    </span>
                    <div className="h-px w-10" style={{ background: 'rgba(223,186,107,0.3)' }} />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5 whitespace-pre-line"
                    style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)', letterSpacing: '-0.01em' }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.3 }}
                  >
                    {slide.title}
                  </motion.h1>

                  {/* Animated gold divider */}
                  <motion.div
                    className="mb-6 h-[3px] w-24"
                    style={{
                      background: 'linear-gradient(to left, #8A6924, #DFBA6B, transparent)',
                      transformOrigin: 'right',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                  />

                  {/* Description */}
                  <motion.p
                    className="text-sm sm:text-base leading-relaxed mb-10 max-w-[480px]"
                    style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.8 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                  >
                    {slide.desc}
                  </motion.p>

                  {/* CTA Buttons */}
                  <motion.div
                    className="flex flex-wrap gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.7 }}
                  >
                    <Link to={slide.link}>
                      <button
                        className="group flex items-center gap-2.5 px-8 py-4 text-sm font-black tracking-wide text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #8A6924 0%, #c4983a 50%, #8A6924 100%)',
                          backgroundSize: '200% 100%',
                          boxShadow: '0 8px 32px rgba(138,105,36,0.55)',
                        }}
                      >
                        <span>{slide.cta}</span>
                        <HiArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" />
                      </button>
                    </Link>

                    <Link to="/Contact">
                      <button
                        className="group flex items-center gap-2.5 px-7 py-4 text-sm font-black tracking-wide text-white transition-all duration-300 hover:-translate-y-1"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          backdropFilter: 'blur(16px)',
                          border: '1.5px solid rgba(255,255,255,0.18)',
                        }}
                      >
                        <BsTelephone size={13} className="transition-transform duration-300 group-hover:scale-110" />
                        <span>استشارة مجانية</span>
                      </button>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Pagination dots */}
        <div className="absolute z-20 flex items-center gap-2" style={{ bottom: 32, left: 32 }}>
          <div className="hero-dots flex gap-2 items-center" />
        </div>

        {/* Phone quick-link */}
        {config?.contact?.phone && (
          <a
            href={`tel:${config.contact.phone}`}
            className="absolute z-20 hidden lg:flex items-center gap-3 px-5 py-3 transition-all duration-300 hover:scale-105"
            style={{
              bottom: 32,
              right: 32,
              background: 'rgba(18,40,60,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(223,186,107,0.2)',
              color: '#DFBA6B',
            }}
          >
            <div className="w-9 h-9 flex items-center justify-center" style={{ background: 'rgba(138,105,36,0.35)' }}>
              <BsTelephone size={14} />
            </div>
            <div>
              <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                الخط الساخن
              </p>
              <p className="text-sm font-black" dir="ltr">{config.contact.phone}</p>
            </div>
          </a>
        )}

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 z-20 hidden md:flex flex-col items-center gap-2"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <span className="text-[9px] font-black tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            انتقل
          </span>
          <div className="w-px h-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <motion.div
              className="w-full h-full"
              style={{ background: '#DFBA6B' }}
              animate={{ y: ['-100%', '200%'] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>
      </Swiper>

      <style>{`
        .hero-dot {
          display: inline-block;
          width: 6px; height: 6px;
          background: rgba(255,255,255,0.25);
          cursor: pointer;
          transition: all 0.4s ease;
          border-radius: 0;
        }
        .hero-dot-active {
          width: 28px;
          background: #8A6924;
          box-shadow: 0 0 12px rgba(138,105,36,0.7);
        }
      `}</style>
    </section>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'react-photo-view/dist/react-photo-view.css';
import { useTranslation } from 'react-i18next';
import { FaBed, FaBath, FaVideo, FaMapMarkerAlt, FaExpand, FaBuilding, FaRegFilePdf, FaPhone } from 'react-icons/fa';
import { BsArrowLeft, BsArrowRight, BsChevronRight, BsDoorOpen, BsBuilding, BsRulers, BsCalendarCheck } from "react-icons/bs";
import { TbLoaderQuarter } from "react-icons/tb";
import SectionShowProjects from './SectionShowProjects';

function ShowPage() {
  const { t } = useTranslation();
  const currentLang = 'ar';
  const isRtl = true;
  const currentUser = useSelector((state) => state.user?.currentUser);
  const { pageSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
        const res = await fetch(`${API_BASE}/listing/getListings?slug=${pageSlug}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load project');
        setPages(data.listings[0]);
        setError(false);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageSlug]);

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col" style={{ background: '#faf8f4' }}>
        <TbLoaderQuarter className="text-5xl animate-spin" style={{ color: '#8A6924' }} />
        <p className="mt-4 text-xs font-bold tracking-widest" style={{ color: '#8A6924' }}>جارٍ تحميل تفاصيل المشروع...</p>
      </div>
    );
  }

  if (error || !pages) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col" style={{ background: '#faf8f4' }}>
        <div className="p-12 text-center" style={{ background: 'white', border: '1px solid rgba(138,105,36,0.15)', boxShadow: '0 16px 48px rgba(18,40,60,0.08)' }}>
          <p className="text-red-600 text-lg font-black mb-6">{error || 'المشروع غير موجود'}</p>
          <Link to="/" className="px-8 py-3 text-sm font-black text-white"
            style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)' }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const propertyName = typeof pages.name === 'object' ? (pages.name[currentLang] || pages.name['en']) : pages.name;
  const propertyDesc = typeof pages.description === 'object' ? (pages.description[currentLang] || pages.description['en']) : pages.description;
  const propertyAddress = typeof pages.address === 'object' ? (pages.address[currentLang] || pages.address['en']) : pages.address;

  return (
    <div dir="rtl" className="pb-24 min-h-screen" style={{ background: '#faf8f4' }}>
      <Helmet>
        <title>{propertyName} | الصرح للتطوير العقاري</title>
        <meta name="description" content={propertyDesc} />
      </Helmet>

      {/* Corporate Hero - Large Image Slider */}
      <div className="relative h-[65vh] w-full bg-slate-900 overflow-hidden">
        <PhotoProvider>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{ nextEl: '.next-nav', prevEl: '.prev-nav' }}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000 }}
            loop={true}
            className="h-full"
          >
            {pages.imageUrls.map((image, index) => (
              <SwiperSlide key={index}>
                <PhotoView src={image}>
                  <div className="relative h-full w-full cursor-zoom-in">
                    <img src={image} alt={propertyName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(18,40,60,0.88) 0%, rgba(18,40,60,0.35) 50%, transparent 100%)' }} />
                    <div className="absolute bottom-12 left-0 right-0">
                      <div className="container mx-auto px-4 lg:px-12">
                        <span className="inline-block px-3 py-1 text-[10px] font-black tracking-widest text-white mb-4"
                          style={{ background: '#8A6924' }}>
                          مشروع مميز
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 flex flex-wrap items-center gap-4">
                          {propertyName}
                          {currentUser && (currentUser.isAdmin || currentUser.role === 'Sales') && (
                            <Link to={`/Update-Page/${pages._id}`}
                              className="inline-block px-4 py-1 text-sm font-black text-white transition-colors"
                              style={{ background: 'rgba(138,105,36,0.85)' }}>
                              تعديل
                            </Link>
                          )}
                        </h1>
                        <p className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          <FaMapMarkerAlt style={{ color: '#DFBA6B' }} /> {propertyAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </PhotoView>
              </SwiperSlide>
            ))}
          </Swiper>
          {/* Custom Navigation */}
          <button className={`prev-nav absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} z-20 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20`}>
            {isRtl ? <BsArrowRight size={24} /> : <BsArrowLeft size={24} />}
          </button>
          <button className={`next-nav absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} z-20 w-12 h-12 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20`}>
            {isRtl ? <BsArrowLeft size={24} /> : <BsArrowRight size={24} />}
          </button>
        </PhotoProvider>
      </div>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-12">

            {/* Overview */}
            <section className="p-8" style={{ background: 'white', border: '1px solid rgba(138,105,36,0.12)' }}>
              <h2 className="text-sm font-black uppercase tracking-widest mb-5 pb-3" style={{ color: '#12283C', borderBottom: '1px solid #f1f5f9' }}>
                نظرة عامة
              </h2>
              <p className="leading-loose text-sm whitespace-pre-wrap" style={{ color: '#4a3e2a' }}>
                {propertyDesc}
              </p>
            </section>

            {/* Quick Specs Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BsRulers, label: 'المساحة', value: `${pages.propertySize} م²` },
                { icon: BsDoorOpen, label: 'الغرف', value: pages.rooms },
                { icon: FaBath, label: 'الحمامات', value: pages.bathrooms },
                { icon: BsBuilding, label: 'الطوابق', value: pages.numberFloors }
              ].map((spec, i) => (
                <div key={i}
                  className="p-6 text-center group transition-all"
                  style={{ background: 'white', border: '1px solid rgba(138,105,36,0.1)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(138,105,36,0.1)'}
                >
                  <spec.icon className="mx-auto mb-3 group-hover:scale-110 transition-transform" size={22} style={{ color: '#8A6924' }} />
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#8A6924' }}>{spec.label}</p>
                  <p className="text-lg font-black" style={{ color: '#12283C' }}>{spec.value}</p>
                </div>
              ))}
            </section>

            {/* Video Placeholder or Embed */}
            {pages.videoUrl && (
              <section className="bg-white p-8 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight border-b border-slate-100 pb-4 flex items-center gap-2">
                  <FaVideo className="text-primary-600" /> {t('video_tour') || 'Video Tour'}
                </h2>
                <div className="aspect-video bg-slate-900">
                  <iframe
                    src={pages.videoUrl.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video Tour"
                  />
                </div>
              </section>
            )}

            {/* Gallery Grid */}
            {pages.imageApartments?.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{t('gallery') || 'Gallery'}</h2>
                <PhotoProvider>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pages.imageApartments.map((img, idx) => (
                      <PhotoView key={idx} src={img}>
                        <div className="h-48 overflow-hidden cursor-zoom-in border border-slate-200 hover:border-primary-500 transition-all">
                          <img src={img} alt="Gallery" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                      </PhotoView>
                    ))}
                  </div>
                </PhotoProvider>
              </section>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="space-y-8">
            {/* Inquiry Card */}
            <div className="p-8 text-white shadow-xl" style={{ background: '#12283C', borderTop: '4px solid #8A6924' }}>
              <h3 className="text-xl font-black mb-4">مهتم بهذا المشروع؟</h3>
              <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                مستشارونا العقاريون جاهزون لمساعدتك في التسعير والمخططات وتفاصيل الاستثمار.
              </p>
              <div className="space-y-3">
                <a href="tel:+201212622210"
                  className="flex items-center justify-center gap-2 w-full py-4 text-white text-xs font-black tracking-widest transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)' }}>
                  <FaPhone size={12} /> اتصل بنا الآن
                </a>
                <a href="https://wa.me/201212622210" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 border text-white text-xs font-black tracking-widest transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(223,186,107,0.3)', color: '#DFBA6B' }}>
                  واتساب
                </a>
              </div>
            </div>

            {/* Documents */}
            <div className="p-8" style={{ background: 'white', border: '1px solid rgba(138,105,36,0.12)' }}>
              <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-5 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
                ملفات المشروع
              </h4>
              <button className="flex items-center justify-between w-full p-4 transition-colors hover:bg-slate-50" style={{ background: '#faf8f4', border: '1px solid rgba(138,105,36,0.1)' }}>
                <div className="flex items-center gap-3">
                  <FaRegFilePdf className="text-red-600" size={20} />
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">PDF</p>
                    <p className="text-xs font-black" style={{ color: '#12283C' }}>تحميل البروشور</p>
                  </div>
                </div>
                <BsChevronRight className="text-slate-400" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Projects */}
      <div className="bg-white border-t border-slate-200 mt-16 pt-24 pb-24">
        <SectionShowProjects />
      </div>
    </div>
  );
}

export default ShowPage;
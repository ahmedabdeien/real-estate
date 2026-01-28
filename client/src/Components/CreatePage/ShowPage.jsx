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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRtl = currentLang === 'ar';
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
      <div className="w-full h-screen flex justify-center items-center flex-col bg-slate-50">
        <TbLoaderQuarter className="text-6xl animate-spin text-primary-600" />
        <p className="mt-4 text-slate-500 font-bold uppercase text-xs tracking-widest">{t('loading_details') || 'Loading Project Details...'}</p>
      </div>
    );
  }

  if (error || !pages) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col bg-slate-50">
        <div className="bg-white p-12 border border-slate-200 text-center shadow-xl">
          <p className="text-red-600 text-xl font-bold mb-4">{error || 'Project not found'}</p>
          <Link to="/" className="px-8 py-3 bg-primary-900 text-white font-bold uppercase text-xs tracking-widest hover:bg-primary-800 transition-colors">
            {t('back_home') || 'Back to Home'}
          </Link>
        </div>
      </div>
    );
  }

  const propertyName = typeof pages.name === 'object' ? (pages.name[currentLang] || pages.name['en']) : pages.name;
  const propertyDesc = typeof pages.description === 'object' ? (pages.description[currentLang] || pages.description['en']) : pages.description;
  const propertyAddress = typeof pages.address === 'object' ? (pages.address[currentLang] || pages.address['en']) : pages.address;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-slate-50 font-body pb-24 min-h-screen">
      <Helmet>
        <title>{propertyName} | El Sarh</title>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent" />
                    <div className="absolute bottom-12 left-0 right-0">
                      <div className="container mx-auto px-4 lg:px-12">
                        <span className="inline-block px-3 py-1 bg-accent-500 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
                          {t('featured_property') || 'Featured Property'}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex flex-wrap items-center gap-4">
                          {propertyName}
                          {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Sales') && (
                            <Link to={`/Update-Page/${pages._id}`} className="inline-block px-4 py-1 text-sm bg-accent-500 hover:bg-accent-600 text-white font-bold uppercase tracking-widest rounded-none transition-colors">
                              {t('edit')}
                            </Link>
                          )}
                        </h1>
                        <p className="flex items-center gap-2 text-primary-50 opacity-80 text-sm">
                          <FaMapMarkerAlt /> {propertyAddress}
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
            <section className="bg-white p-8 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight border-b border-slate-100 pb-4">
                {t('overview')}
              </h2>
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">
                {propertyDesc}
              </p>
            </section>

            {/* Quick Specs Grid */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: BsRulers, label: t('area'), value: `${pages.propertySize} m²` },
                { icon: BsDoorOpen, label: t('rooms'), value: pages.rooms },
                { icon: FaBath, label: t('bathrooms'), value: pages.bathrooms },
                { icon: BsBuilding, label: t('floors'), value: pages.numberFloors }
              ].map((spec, i) => (
                <div key={i} className="bg-white p-6 border border-slate-200 text-center group hover:border-primary-500 transition-all">
                  <spec.icon className="mx-auto text-primary-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{spec.label}</p>
                  <p className="text-lg font-bold text-slate-900">{spec.value}</p>
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
            <div className="bg-primary-900 p-8 text-white rounded-none shadow-xl border-t-4 border-accent-500">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-tight">{t('interested_in_this') || 'Interested in this project?'}</h3>
              <p className="text-primary-100 text-sm mb-8 opacity-80 leading-relaxed">
                {t('contact_cta_desc') || "Our real estate advisors are ready to help you with pricing, floor plans, and investment details."}
              </p>
              <div className="space-y-4">
                <a href="tel:+201212622210" className="flex items-center justify-center gap-2 w-full py-4 bg-accent-600 hover:bg-accent-700 text-white font-bold uppercase text-xs tracking-widest transition-all">
                  <FaPhone /> {t('call_us') || 'Call Us'}
                </a>
                <a href="https://wa.me/201212622210" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold uppercase text-xs tracking-widest transition-all">
                  واتساب WhatsApp
                </a>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white p-8 border border-slate-200 rounded-none">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">{t('documents') || 'Documents'}</h4>
              <button className="flex items-center justify-between w-full p-4 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200">
                <div className="flex items-center gap-3">
                  <FaRegFilePdf className="text-red-600" size={20} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">PDF</p>
                    <p className="text-xs font-bold text-slate-700">{t('download_brochure') || 'Download Brochure'}</p>
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
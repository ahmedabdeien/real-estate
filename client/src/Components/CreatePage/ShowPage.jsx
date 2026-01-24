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

// Add these imports
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
// import { FaExpand } from "react-icons/fa";
import {
  TbLoaderQuarter,
  TbLayoutCollage,
  TbBuildingSkyscraper,
  TbRulerMeasure,
  TbCalendar
} from "react-icons/tb";
import {
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaExpand
} from "react-icons/fa";
import {
  BsGear,
  BsStars,
  BsGrid3X3Gap
} from "react-icons/bs";
import NewElsarh from "./NewElsarh";
import SectionShowProjects from './SectionShowProjects';
import 'react-photo-view/dist/react-photo-view.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

function ShowPage() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const { pageSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(false);
  const [error, setError] = useState(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
        const res = await fetch(`${API_BASE}/listing/getPages?slug=${pageSlug}`);
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

  const sizeApartments = pages ? [
    pages.sizeApartmentsOne,
    pages.sizeApartmentsTwo,
    pages.sizeApartmentsThree,
    pages.sizeApartmentsFour,
    pages.sizeApartmentsFive,
    pages.sizeApartmentsSix,
    pages.sizeApartmentsSeven,
    pages.sizeApartmentsEight
  ].filter(Boolean) : [];

  if (loading) {
    return (
      <motion.div
        className="w-full h-screen flex justify-center items-center flex-col bg-white dark:bg-slate-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <TbLoaderQuarter className="text-6xl animate-spin text-accent-600" />
        <p className="mt-6 text-slate-500 font-heading font-black tracking-widest uppercase text-xs">جاري جلب تفاصيل المشروع...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col bg-white dark:bg-slate-900">
        <div className="bg-red-50 dark:bg-red-950/20 p-12 rounded-[40px] text-center border border-red-100 dark:border-red-900/30 shadow-premium">
          <p className="text-red-600 text-2xl font-heading font-black mb-4">{error}</p>
          <Link to="/" className="btn-premium bg-slate-900 text-white">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.main dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-white dark:bg-slate-900"
    >
      <Helmet>
        <title>{pages.name} | شركة الصرح</title>
        <meta name="description" content={pages.description} />
      </Helmet>

      {currentUser?.isAdmin && (
        <motion.div
          className="fixed top-32 right-10 z-50"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
        >
          <Link
            to={`/Update-Page/${pages._id}`}
            className="group btn-premium bg-accent-600 text-white shadow-premium-lg hover:bg-accent-500 flex items-center gap-3 px-8"
          >
            <BsGear size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-black text-sm uppercase tracking-tighter">تعديل المشروع</span>
          </Link>
        </motion.div>
      )}

      {/* Luxury Hero Slider */}
      <PhotoProvider>
        <motion.div
          className="relative h-[75vh] md:h-[85vh] w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={{
              nextEl: '.swiper-next-show',
              prevEl: '.swiper-prev-show',
            }}
            pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={true}
            className="h-full overflow-hidden"
          >
            {pages.imageUrls.map((image, index) => (
              <SwiperSlide key={index}>
                <PhotoView src={image}>
                  <div className="relative h-full w-full cursor-zoom-in overflow-hidden">
                    <motion.img
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      transition={{ duration: 10 }}
                      src={image}
                      alt={`Project ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-900/20 to-transparent" />

                    <div className="absolute inset-0 flex items-end p-8 md:p-24">
                      <div className="max-w-4xl text-right">
                        <motion.span
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          className="inline-block px-4 py-1 bg-accent-600 text-white text-[10px] font-black uppercase tracking-widest mb-6 rounded-full"
                        >
                          مشروع متميز
                        </motion.span>
                        <motion.h1
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-7xl font-heading font-black text-white mb-6"
                        >
                          {pages.name}
                        </motion.h1>
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center justify-start gap-3 text-slate-300 text-lg md:text-xl font-medium"
                        >
                          <FaMapMarkerAlt className="text-accent-500" />
                          {pages.address}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                </PhotoView>
              </SwiperSlide>
            ))}

            {/* Premium Pagination & Nav */}
            <div className="absolute bottom-12 left-12 z-20 hidden md:flex items-center gap-8">
              <div className="swiper-pagination-custom !relative flex gap-2" />
              <div className="flex gap-4">
                <div className="swiper-prev-show glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-accent-600 transition-all cursor-pointer border border-white/20">
                  <BsArrowLeft size={20} />
                </div>
                <div className="swiper-next-show glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-accent-600 transition-all cursor-pointer border border-white/20">
                  <BsArrowRight size={20} />
                </div>
              </div>
            </div>
          </Swiper>
        </motion.div>
      </PhotoProvider>

      {/* Breadcrumbs & Simple Stats */}
      <div className="bg-white border-b border-slate-100">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="text-slate-400 hover:text-primary-600 transition-colors">الرئيسية</Link>
            <span className="text-slate-200">/</span>
            <Link to="/Project" className="text-slate-400 hover:text-primary-600 transition-colors">المشاريع</Link>
            <span className="text-slate-200">/</span>
            <span className="text-slate-900">{pages.name}</span>
          </nav>

          <div className="flex items-center gap-6">
            {/* Share Button */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: pages.name,
                    text: pages.description,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("تم نسخ رابط المشروع!");
                }
              }}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-all border border-slate-200 px-4 py-2 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              مشاركة
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-all border border-slate-200 px-4 py-2 rounded-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة
            </button>
          </div>
        </div>
      </div>

      <div className="container py-20 px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

          {/* Content Column */}
          <div className="lg:col-span-2 space-y-16">

            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black text-slate-900 border-r-4 border-primary-500 pr-6">
                نظرة عامة على المشروع
              </h2>
              <div className="prose max-w-none">
                <p className="text-lg text-slate-600 leading-relaxed">
                  {pages.description}
                </p>
              </div>
            </motion.section>

            {/* Features Grid */}
            <motion.section
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                { label: "مساحة المشروع", value: `${pages.propertySize} م²`, icon: TbRulerMeasure },
                { label: "عدد الأدوار", value: pages.numberFloors, icon: TbBuildingSkyscraper },
                { label: "حالة التوفر", value: pages.available === "available" ? "متاح للبيع" : "قريباً", icon: BsGrid3X3Gap, accent: true },
                { label: "الموقع", value: pages.address, icon: FaMapMarkerAlt }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-premium-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-all">
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                    <p className={`text-lg font-black ${stat.accent ? 'text-primary-600' : 'text-slate-900'}`}>
                      {stat.value}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Unit Sizes */}
            {sizeApartments.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-black text-slate-900">المساحات المتاحة</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {sizeApartments.map((size, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-lg text-center shadow-sm hover:shadow-md transition-all">
                      <p className="text-primary-600 font-black text-xl">{size} <span className="text-[10px] text-slate-400">م²</span></p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Floor Plans */}
            {pages.imagePlans?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-black text-slate-900">المخطط الهندسي</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pages.imagePlans.map((plan, index) => (
                    <PhotoView key={index} src={plan}>
                      <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 cursor-zoom-in hover:shadow-lg transition-all">
                        <img src={plan} alt={`Floor Plan ${index + 1}`} className="w-full h-64 object-contain" />
                      </div>
                    </PhotoView>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Apartment Gallery */}
            {pages?.imageApartments?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <h2 className="text-2xl font-black text-slate-900">معرض الوحدات</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.imageApartments.map((img, index) => (
                    <PhotoView key={index} src={img}>
                      <div className="relative h-64 bg-slate-50 rounded-xl overflow-hidden cursor-zoom-in group shadow-sm">
                        <img src={img} alt={`Apartment ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                      </div>
                    </PhotoView>
                  ))}
                </div>
              </motion.section>
            )}

          </div>

          {/* Sidebar Area */}
          <aside className="space-y-10">
            {/* Contact Card */}
            <div className="bg-primary-950 p-10 rounded-[48px] shadow-premium-xl relative overflow-hidden text-center sticky top-32">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0yMCAyMHYyMGgyMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] " />
              </div>
              <div className="relative z-10 space-y-8">
                <BsStars className="text-accent-500 mx-auto text-5xl animate-pulse" />
                <h3 className="text-3xl font-heading font-black text-white">هل أنت مهتم <br />بهذا المشروع؟</h3>
                <p className="text-slate-400 text-sm leading-relaxed">تواصل مع مستشارينا العقاريين للحصول على عرض سعر وتفاصيل كاملة</p>
                <div className="pt-4 flex flex-col gap-4">
                  <a href="tel:+201014166661" className="btn-premium bg-accent-600 text-white hover:bg-accent-500 w-full text-center">
                    اتصل بنا الآن
                  </a>
                  <a href="https://wa.me/201014166661" target="_blank" rel="noreferrer" className="btn-premium bg-white/10 text-white border border-white/20 hover:bg-white/20 w-full text-center">
                    واتساب
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Assets */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800">
              <h4 className="text-xl font-heading font-black text-primary-900 dark:text-white mb-8">ملفات المشروع</h4>
              <div className="space-y-4">
                <button className="flex items-center justify-between w-full p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-premium group hover:bg-accent-600 transition-all duration-500">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white/60 mb-1">الكتالوج</p>
                    <p className="font-heading font-black text-primary-900 dark:text-white group-hover:text-white">تحميل البروشور</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-900 group-hover:bg-white">
                    ↓
                  </div>
                </button>
              </div>
            </div>

          </aside>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 py-32">
        <SectionShowProjects />
      </div>
    </motion.main >
  );
}

export default ShowPage;
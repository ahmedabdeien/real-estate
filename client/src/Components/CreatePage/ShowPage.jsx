import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="container py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <nav className="flex gap-4 text-xs font-black uppercase tracking-widest">
            <Link to="/" className="text-slate-400 hover:text-accent-600">الرئيسية</Link>
            <span className="text-slate-300">/</span>
            <Link to="/Project" className="text-slate-400 hover:text-accent-600">المشاريع</Link>
            <span className="text-slate-300">/</span>
            <span className="text-primary-900 dark:text-white">{pages.name}</span>
          </nav>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-accent-600 shadow-[0_0_10px_rgba(242,166,0,0.8)]" />
              <span className="text-xs font-black uppercase tracking-widest text-primary-900 dark:text-white">قيد الحجز</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              تاريخ النشر: {new Date(pages.createdAt).toLocaleDateString('ar-EG')}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-24 px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">

          {/* Content Column */}
          <div className="lg:col-span-2 space-y-20">

            {/* Description */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-heading font-black text-primary-900 dark:text-white border-r-8 border-accent-600 pr-6">
                نظرة عامة على المشروع
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-xl text-slate-600 dark:text-slate-400 leading-loose">
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
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {[
                { label: "مساحة المشروع", value: `${pages.propertySize} م²`, icon: TbRulerMeasure },
                { label: "عدد الأدوار", value: pages.numberFloors, icon: TbBuildingSkyscraper },
                { label: "حالة توافر الوحدات", value: pages.available === "available" ? "متاح" : "قريباً", icon: BsGrid3X3Gap, accent: true },
                { label: "موقع متميز", value: pages.address, icon: FaMapMarkerAlt }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium group hover:bg-white dark:hover:bg-slate-800 transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-premium flex items-center justify-center text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500">
                      <stat.icon size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                      <p className={`text-2xl font-heading font-black ${stat.accent ? 'text-accent-600' : 'text-primary-900 dark:text-white'}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.section>

            {/* Floor Plans */}
            {pages.imagePlans?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
              >
                <h2 className="text-3xl font-heading font-black text-primary-900 dark:text-white">
                  المخطط الهندسي
                </h2>
                <PhotoProvider>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {pages.imagePlans.map((plan, index) => (
                      <PhotoView key={index} src={plan}>
                        <motion.div
                          whileHover={{ y: -8 }}
                          className="relative group bg-slate-50 dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-premium cursor-zoom-in border border-slate-100 dark:border-slate-800"
                        >
                          <img src={plan} alt={`Floor Plan ${index + 1}`} className="w-full h-80 object-contain p-8" />
                          <div className="absolute inset-0 bg-primary-950/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-white text-primary-900 flex items-center justify-center shadow-2xl">
                              <FaExpand size={20} />
                            </div>
                          </div>
                        </motion.div>
                      </PhotoView>
                    ))}
                  </div>
                </PhotoProvider>
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
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-heading font-black text-primary-900 dark:text-white">
                    معرض الوحدات
                  </h2>
                  <span className="text-accent-600 font-black text-xs uppercase tracking-widest">{pages.imageApartments.length} صورة</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <PhotoProvider>
                    {pages.imageApartments.map((img, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="group relative h-64 bg-slate-100 dark:bg-slate-800 rounded-[32px] overflow-hidden shadow-premium cursor-zoom-in"
                      >
                        <PhotoView src={img}>
                          <div className="relative h-full w-full">
                            <img src={img} alt={`Apartment ${index + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />
                            <div className="absolute bottom-6 right-6">
                              <p className="text-white font-heading font-black text-sm uppercase">وحدة {index + 1}</p>
                            </div>
                          </div>
                        </PhotoView>
                      </motion.div>
                    ))}
                  </PhotoProvider>
                </div>
              </motion.section>
            )}

          </div>

          {/* Sidebar Area */}
          <aside className="space-y-12">

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
    </motion.main>
  );
}

export default ShowPage;
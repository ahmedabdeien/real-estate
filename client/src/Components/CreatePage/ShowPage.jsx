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
import { IconContext } from "react-icons";
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
        const res = await fetch(`/api/listing/getPages?slug=${pageSlug}`);
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
        className="w-full h-screen flex justify-center items-center flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <TbLoaderQuarter className="text-4xl animate-spin text-blue-600" />
        <p className="mt-3 text-gray-600">جاري التحميل...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <motion.main dir="rtl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full bg-stone-50 dark:bg-gray-900"
    >
      <Helmet>
        <title>{pages.name}</title>
        <meta name="description" content={pages.description} />
      </Helmet>

      {currentUser?.isAdmin && (
        <motion.div 
          className="fixed top-32 right-4 z-50"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
        >
          <Link
            to={`/Update-Page/${pages._id}`}
            className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <BsGear className="animate-spin-slow" />
            <span className="hidden sm:inline">تعديل الصفحة</span>
          </Link>
        </motion.div>
      )}

      {/* Main Image Gallery */}
      {/* <PhotoProvider>
        <motion.div 
          className="h-[40vh] md:h-[60vh] relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 h-full">
            {pages.imageUrls.map((image, index) => (
              <PhotoView key={index} src={image}>
                <motion.div
                  className="relative group cursor-zoom-in"
                  whileHover={{ scale: 1.02 }}
                >
                  <img
                    src={image}
                    alt={`Project ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FaExpand className="text-white text-2xl" />
                  </div>
                </motion.div>
              </PhotoView>
            ))}
          </div>
        </motion.div>
      </PhotoProvider> */}

<PhotoProvider>
  <motion.div 
    className="relative h-[60vh] w-full group"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation={{
        nextEl: '.swiper-next',
        prevEl: '.swiper-prev',
      }}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000 }}
      loop={true}
      className="h-full overflow-hidden shadow-xl"
    >
      {pages.imageUrls.map((image, index) => (
        <SwiperSlide key={index}>
          <PhotoView src={image}>
            <motion.div
              className="relative h-full w-full cursor-zoom-in"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={image}
                alt={`Project ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent flex items-end p-6">
                <div className="text-white space-y-2">
                  <h3 className="text-2xl font-bold">{pages.name}</h3>
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt />
                    {pages.address}
                  </p>
                </div>
              </div>
              <div className="absolute top-4 right-6 p-2 bg-white/20 backdrop-blur-sm rounded-full">
                <FaExpand className="text-white text-xl" />
              </div>
            </motion.div>
          </PhotoView>
        </SwiperSlide>
      ))}

      {/* Custom Navigation Arrows */}
      <div className="swiper-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 transition-colors cursor-pointer">
        <BsArrowLeft className="text-2xl text-white" />
      </div>
      <div className="swiper-next absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50 transition-colors cursor-pointer">
        <BsArrowRight className="text-2xl text-white" />
      </div>
    </Swiper>

    {/* Pagination Style Overrides */}
    <style>{`
      .swiper-pagination-bullet {
        background: rgba(255,255,255,0.5) !important;
        width: 10px !important;
        height: 10px !important;
      }
      .swiper-pagination-bullet-active {
        background: #016FB9 !important;
        width: 30px !important;
        border-radius: 4px !important;
      }
    `}</style>
  </motion.div>
</PhotoProvider>

      {/* Project Details */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container py-8 space-y-8"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            {pages.name}
          </h1>
          <div className="flex items-center text-blue-600 dark:text-blue-400 gap-2">
            <FaMapMarkerAlt />
            <span className="text-lg">{pages.address}</span>
          </div>
        </motion.div>

        {pages.description && (
          <motion.div variants={itemVariants} className="prose dark:prose-invert max-w-4xl">
            <p className="text-lg leading-relaxed">{pages.description}</p>
          </motion.div>
        )}

        {/* Project Stats */}
        <motion.div 
          variants={containerVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <TbRulerMeasure className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold">مساحة المشروع</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">
              {pages.propertySize}m²
            </p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <TbBuildingSkyscraper className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold">عدد الأدوار</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{pages.numberFloors}</p>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <BsGrid3X3Gap className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold">حالة الشقق</h3>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`text-lg font-bold ${
                pages.available === "available" ? "text-green-600" : "text-red-600"
              }`}>
                {pages.available}
              </span>
              {pages.available === "available" ? (
                <FaCheck className="text-green-600" />
              ) : (
                <FaTimes className="text-red-600" />
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <TbCalendar className="text-2xl text-blue-600" />
              <h3 className="text-lg font-semibold">تاريخ الإنشاء الصفحة</h3>
            </div>
            <p className="mt-2 text-lg">
              {new Date(pages.createdAt).toLocaleDateString('ar-EG')}
            </p>
          </motion.div>
        </motion.div>

        {/* Floor Plans */}
        {pages.imagePlans?.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold">التصميم الداخلي</h2>
            <PhotoProvider>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.imagePlans.map((plan, index) => (
                  <PhotoView key={index} src={plan}>
                    <motion.div
                      className="relative group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm cursor-zoom-in"
                      whileHover={{ scale: 1.02 }}
                    >
                      <img
                        src={plan}
                        alt={`Floor Plan ${index + 1}`}
                        className="w-full h-64 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaExpand className="text-white text-2xl" />
                      </div>
                    </motion.div>
                  </PhotoView>
                ))}
              </div>
            </PhotoProvider>
          </motion.div>
        )}

        {/* Apartments */}
        {sizeApartments.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-2xl font-bold">تفاصيل الشقق</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sizeApartments.map((size, index) => (
                <motion.div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold">شقة {index + 1}</span>
                    <TbLayoutCollage className="text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {size}m²
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}


        {/* Apartment Gallery */}
{pages?.imageApartments?.length > 0 && (
  <motion.div 
    variants={itemVariants}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
      معرض الشقق
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <PhotoProvider>
        {pages.imageApartments.map((img, index) => (
          <motion.div
            key={index}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
            whileHover={{ y: -5 }}
          >
            <PhotoView src={img}>
              <div className="relative h-52 w-full cursor-zoom-in">
                <img
                  src={img}
                  alt={`Apartment ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaExpand className="text-white text-2xl" />
                </div>
              </div>
            </PhotoView>
            <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center">
              <h5 className="font-medium">شقة {index + 1}</h5>
              {sizeApartments[index] && (
                <span className="text-blue-600 dark:text-blue-400 text-sm">
                  {sizeApartments[index]}m²
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </PhotoProvider>
    </div>
  </motion.div>
)}

        {/* New Section */}
        <AnimatePresence>
          {!showNew && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BsStars className="text-blue-600" />
                  <h3 className="font-semibold">ما هو الجديد؟</h3>
                </div>
                <button
                  onClick={() => setShowNew(true)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mt-2">
                <NewElsarh />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>




      <SectionShowProjects />
    </motion.main>
  );
}

export default ShowPage;
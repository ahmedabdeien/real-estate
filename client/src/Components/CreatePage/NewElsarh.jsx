import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaDollarSign, 
  FaCalendarAlt,
  FaBuilding,
  FaPhone,
  FaHashtag
} from "react-icons/fa";

const NewElsarh = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br  p-6 "
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center gap-4 mb-6">
        {/* Add your company logo here */}
        <div className="bg-blue-600 text-white p-3 rounded-lg">
          <FaBuilding className="text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-300">
          عروض جديدة حصرياً من شركة الصرح
        </h2>
      </div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-white dark:bg-blue-950 p-4 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-300">
            <FaDollarSign className="text-blue-500" />
            امتلك وحدتك الآن بتسهيلات مميزة تصل إلى 36 شهر!
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaBuilding className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold">موقع المشروع</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  قريب من مجمع المحاكم - الشارع الرئيسي بجوار شركة الفيل
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FaDollarSign className="text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h4 className="font-semibold">الاقساط الشهرية</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  تبدأ من 7,000 جنيه شهريًا لمدة 3 سنوات
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-blue-600 text-white p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-xl" />
            <span>العرض ساري حتى يناير 2025</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
            فرصة محدودة!
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-white dark:bg-blue-950 p-4 rounded-xl shadow-sm">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FaPhone className="text-blue-600 dark:text-blue-300" />
            للحجز والاستفسار:
          </h4>
          <div className="flex flex-col gap-2">
            <a href="tel:01068110499" className="flex items-center gap-2 hover:text-blue-600">
              <span>01068110499</span>
            </a>
            <a href="tel:01124947255" className="flex items-center gap-2 hover:text-blue-600">
              <span>01124947255</span>
            </a>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm">
          <FaHashtag className="text-blue-600 dark:text-blue-300" />
          شركة_الصرح_للاستثمار_العقاري
        </span>
        <span className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm">
          <FaHashtag className="text-blue-600 dark:text-blue-300" />
          صرحك_المستقبلي_قرارك_الأمثل
        </span>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-300 hover:underline"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default NewElsarh;
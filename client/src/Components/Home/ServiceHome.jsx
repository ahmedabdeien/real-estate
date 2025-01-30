// import React from 'react';
// import { motion } from 'framer-motion';
// import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow } from "react-icons/bs";

// const ServiceCard = ({ icon: Icon, text }) => (
//   <motion.div
//     className="w-full md:w-1/2 lg:w-1/4 p-2"
//     initial={{ opacity: 0, y: 50 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.5 }}
//   >
//     <motion.div
//       className="p-6 bg-white shadow-sm border rounded-2xl h-full flex flex-col justify-between"
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       <Icon className="text-6xl text-[#FF9505] mb-4" />
//       <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
//     </motion.div>
//   </motion.div>
// );

// export default function ServiceHome() {
//   const services = [
//     {
//       icon: BsBuildingCheck,
//       text: "من التخطيط إلى التنفيذ، نتولى جميع جوانب تطوير المشاريع العقارية لضمان أفضل النتائج."
//     },
//     {
//       icon: BsBriefcase,
//       text: "نحن نضمن سلامة الإجراءات القانونية من خلال تقديم المشورة القانونية المتخصصة وإعداد العقود التي تحمي حقوقك."
//     },
//     {
//       icon: BsArrowRepeat,
//       text: "حتى بعد إتمام الصفقة، سنكون معك لتقديم الدعم والخدمات الإضافية التي تحتاجها."
//     },
//     {
//       icon: BsGraphUpArrow,
//       text: "نحن نقدم لك تحليلات دقيقة للسوق وفرص الاستثمار لضمان تحقيق أعلى العوائد على استثماراتك."
//     }
//   ];

//   return (
//     <div dir="rtl" className=" overflow-hidden py-12 container">
//       <div className=" px-4">
//         <motion.div
//           className="text-center mb-6"
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//         >
//           <h2 className="text-4xl font-bold text-[#353531] dark:text-white mb-4">خدماتنا</h2>
//         </motion.div>
//         <div className="flex flex-wrap -mx-2">
//           {services.map((service, index) => (
//             <ServiceCard key={index} icon={service.icon} text={service.text} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }






import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow } from "react-icons/bs";

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.5
    }
  },
  hover: {
    y: -10,
    scale: 1.02,
   
  }
};

const ServiceCard = ({ icon: Icon, text }) => (
  <motion.div
    className="w-full p-4 sm:w-1/2 lg:w-1/4"
    variants={cardVariants}
    whileHover="hover"
  >
    <motion.div
      className="relative h-full p-8 bg-white/80 group/item dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl border border-gray-200/70 dark:border-gray-700 overflow-hidden"
      whileTap={{ scale: 0.98 }}
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#ff9505]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Animated icon */}
      <motion.div 
        className="mb-6 text-[#ff9505] relative"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="text-6xl" />
        <div className="absolute inset-0 bg-[#ff9505] blur-[40px] opacity-20" />
      </motion.div>

      {/* Content */}
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
        {text}
      </p>

      {/* Hover line effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff9505] to-[#ff6b00] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </motion.div>
  </motion.div>
);

export default function ServiceHome() {
  const services = [
   {
      icon: BsBuildingCheck,
      text: "من التخطيط إلى التنفيذ، نتولى جميع جوانب تطوير المشاريع العقارية لضمان أفضل النتائج."
    },
    {
      icon: BsBriefcase,
      text: "نحن نضمن سلامة الإجراءات القانونية من خلال تقديم المشورة القانونية المتخصصة وإعداد العقود التي تحمي حقوقك."
    },
    {
      icon: BsArrowRepeat,
      text: "حتى بعد إتمام الصفقة، سنكون معك لتقديم الدعم والخدمات الإضافية التي تحتاجها."
    },
    {
      icon: BsGraphUpArrow,
      text: "نحن نقدم لك تحليلات دقيقة للسوق وفرص الاستثمار لضمان تحقيق أعلى العوائد على استثماراتك."
    }
  ];

  return (
    <div dir="rtl" className="py-20 overflow-hidden container bg-gradient-to-b from-white to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#353531] dark:text-gray-100 mb-4">
            خدماتنا المتكاملة
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            حلول عقارية شاملة تلبّي جميع احتياجاتك
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap -mx-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
              }
            }
          }}
        >
          <AnimatePresence>
            {services.map((service, index) => (
              <ServiceCard key={index} icon={service.icon} text={service.text} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
// import React from 'react';
// import { motion } from 'framer-motion';
// import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

// export default function Reviews() {
//   const reviews = [
//     { name: "د. عصام محمد", review: 'تعاملت مع شركة "الصرح" لشراء منزلي الأول، وكانت التجربة أكثر من رائعة، جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة في اختياري.', rating: 5 },
//     { name: "م. محمد", review: "شركة محترفة بكل ما تحمله الكلمة من معنى، اشتريت شقة من خلال شركة 'الصرح'، وكانوا ملتزمين بالتسليم في الموعد المحدد وبتصميم فاق التوقعات.", rating: 4.5 },
//     { name: "ا. علي احمد", review: "ما يميز 'الصرح' هو اهتمامهم بأدق التفاصيل، فمنذ بداية المشروع وحتى اكتماله، قدموا لنا تجربة سلسة ومريحة.", rating: 4 },
//     { name: "م. خالد توفيق", review: "مشاريع 'الصرح' دائما ما تكون ذات جودة عالية، وكان الفريق متعاونا للغاية وساعدني في العثور على المنزل المثالي.", rating: 4.5 },
//     { name: "ا. نادية محمد", review: "إذا كنت تبحث عن شركة عقارية موثوقة وذات سمعة طيبة، أنصحك بشدة بشركة 'الصرح' حيث أن تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل.", rating: 4.5 },
//     { name: "د. عماد السيد", review: "كانت تجربة استثنائية مع 'الصرح'، فالأجواء المجتمعية التي يخلقونها في مشاريعهم فريدة من نوعها، وأنا سعيدة جدًا بقرار شراء منزل من خلالهم.", rating: 4.5 },
//   ];

//   // Shuffle function
//   function shuffle(array) {
//     let currentIndex = array.length, randomIndex;
//     while (currentIndex !== 0) {
//       randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex--;
//       [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
//     }
//     return array;
//   }

//   const shuffledReviews = shuffle([...reviews]);

//   return (
//     <div dir="rtl" className='py-8  overflow-hidden bg-stone-100 dark:from-gray-900 dark:to-indigo-900'>
//       <div className=" container mx-auto">
//         <motion.h2 
//           className="text-3xl font-bold text-center mb-8 text-[#353531] "
//           initial={{ opacity: 0, y: -50 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           ماذا يقول عملاؤنا
//         </motion.h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {shuffledReviews.slice(0, 3).map((review, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.2 }}
//               className="bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden"
//             >
//               <div className="p-6">
//                 <div className="flex items-center mb-4">
//                   <img
//                     src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.name}`}
//                     alt={review.name}
//                     className="w-12 h-12 rounded-full me-4"
//                   />
//                   <h3 className="text-lg font-semibold text-[#353531] dark:text-indigo-300">
//                     {review.name}
//                   </h3>
//                 </div>
//                 <p className="text-[#353531]/80 dark:text-gray-300 mb-4">{review.review}</p>
//                 <div className="flex justify-between items-center">
//                   <div className="flex space-x-1">
//                     {Array.from({ length: 5 }, (_, i) => {
//                       if (i + 1 <= Math.floor(review.rating)) {
//                         return <BsStarFill key={i} className="text-yellow-400" />;
//                       } else {
//                         return <BsStar key={i} className="text-yellow-400" />;
//                       }
//                     })}
//                   </div>
//                   <span className="text-sm  text-gray-500 dark:text-gray-400">
//                     {review.rating} النجوم
//                   </span>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

const reviewVariants = {
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
    y: -5,
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
  }
};

const starVariants = {
  hidden: { scale: 0, rotate: -90 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 300 }
  }
};

export default function Reviews() {
  const reviews = [
    { name: "د. عصام محمد", review: 'تعاملت مع شركة "الصرح" لشراء منزلي الأول، وكانت التجربة أكثر من رائعة، جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة في اختياري.', rating: 5 },
    { name: "م. محمد", review: "شركة محترفة بكل ما تحمله الكلمة من معنى، اشتريت شقة من خلال شركة 'الصرح'، وكانوا ملتزمين بالتسليم في الموعد المحدد وبتصميم فاق التوقعات.", rating: 4.5 },
    { name: "ا. علي احمد", review: "ما يميز 'الصرح' هو اهتمامهم بأدق التفاصيل، فمنذ بداية المشروع وحتى اكتماله، قدموا لنا تجربة سلسة ومريحة.", rating: 4 },
    { name: "م. خالد توفيق", review: "مشاريع 'الصرح' دائما ما تكون ذات جودة عالية، وكان الفريق متعاونا للغاية وساعدني في العثور على المنزل المثالي.", rating: 4.5 },
    { name: "ا. نادية محمد", review: "إذا كنت تبحث عن شركة عقارية موثوقة وذات سمعة طيبة، أنصحك بشدة بشركة 'الصرح' حيث أن تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل.", rating: 4.5 },
    { name: "د. عماد السيد", review: "كانت تجربة استثنائية مع 'الصرح'، فالأجواء المجتمعية التي يخلقونها في مشاريعهم فريدة من نوعها، وأنا سعيدة جدًا بقرار شراء منزل من خلالهم.", rating: 4.5 },
  ];

  return (
    <div dir="rtl" className='py-16 overflow-hidden container bg-gradient-to-b from-stone-100 to-stone-50 dark:from-gray-900 dark:to-gray-800'>
      <div className="container mx-auto px-4">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 text-[#353531] dark:text-gray-100"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          آراء عملائنا
        </motion.h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {reviews.slice(0, 3).map((review, index) => (
              <motion.div
                key={review.name}
                variants={reviewVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                exit="hidden"
                transition={{ delay: index * 0.15 }}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/50 dark:to-gray-900/50" />
                
                <div className="relative p-6">
                  {/* Author section */}
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.img
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.name}`}
                      alt={review.name}
                      className="w-12 h-12 rounded-full mr-3 border-2 border-[#ff9505]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-[#353531] dark:text-gray-200">
                        {review.name}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        عميل سابق
                      </span>
                    </div>
                  </motion.div>

                  {/* Review text */}
                  <motion.p
                    className="text-[#353531]/90 dark:text-gray-300 mb-4 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {review.review}
                  </motion.p>

                  {/* Rating stars */}
                  <motion.div 
                    className="flex justify-between  items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >                   
                   <span className="text-sm font-medium text-[#ff9505] dark:text-yellow-400">
                      {review.rating}/5
                    </span>
                    <div className="flex space-x-1 flex-row-reverse">
                      {Array.from({ length: 5 }, (_, i) => {
                        const StarIcon = i < Math.floor(review.rating) ? BsStarFill :
                                        i < review.rating ? BsStarHalf : BsStar;
                        
                        return (
                          <motion.span
                            key={i}
                            variants={starVariants}
                            className="text-yellow-400"
                          >
                            <StarIcon className="w-5 h-5" />
                          </motion.span>
                        );
                      })}
                    </div>

                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

export default function Reviews() {
  const reviews = [
    { name: "د. عصام محمد", review: 'تعاملت مع شركة "الصرح" لشراء منزلي الأول، وكانت التجربة أكثر من رائعة، جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة في اختياري.', rating: 5 },
    { name: "م. محمد", review: "شركة محترفة بكل ما تحمله الكلمة من معنى، اشتريت شقة من خلال شركة 'الصرح'، وكانوا ملتزمين بالتسليم في الموعد المحدد وبتصميم فاق التوقعات.", rating: 4.5 },
    { name: "ا. علي احمد", review: "ما يميز 'الصرح' هو اهتمامهم بأدق التفاصيل، فمنذ بداية المشروع وحتى اكتماله، قدموا لنا تجربة سلسة ومريحة.", rating: 4 },
    { name: "م. خالد توفيق", review: "مشاريع 'الصرح' دائما ما تكون ذات جودة عالية، وكان الفريق متعاونا للغاية وساعدني في العثور على المنزل المثالي.", rating: 4.5 },
    { name: "ا. نادية محمد", review: "إذا كنت تبحث عن شركة عقارية موثوقة وذات سمعة طيبة، أنصحك بشدة بشركة 'الصرح' حيث أن تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل.", rating: 4.5 },
    { name: "د. عماد السيد", review: "كانت تجربة استثنائية مع 'الصرح'، فالأجواء المجتمعية التي يخلقونها في مشاريعهم فريدة من نوعها، وأنا سعيدة جدًا بقرار شراء منزل من خلالهم.", rating: 4.5 },
  ];

  // Shuffle function
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  const shuffledReviews = shuffle([...reviews]);

  return (
    <div dir="rtl" className='py-8  overflow-hidden bg-stone-100 dark:from-gray-900 dark:to-indigo-900'>
      <div className=" container mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-center mb-8 text-[#353531] "
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          ماذا يقول عملاؤنا
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shuffledReviews.slice(0, 3).map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${review.name}`}
                    alt={review.name}
                    className="w-12 h-12 rounded-full me-4"
                  />
                  <h3 className="text-lg font-semibold text-[#353531] dark:text-indigo-300">
                    {review.name}
                  </h3>
                </div>
                <p className="text-[#353531]/80 dark:text-gray-300 mb-4">{review.review}</p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => {
                      if (i + 1 <= Math.floor(review.rating)) {
                        return <BsStarFill key={i} className="text-yellow-400" />;
                      } else {
                        return <BsStar key={i} className="text-yellow-400" />;
                      }
                    })}
                  </div>
                  <span className="text-sm  text-gray-500 dark:text-gray-400">
                    {review.rating} النجوم
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
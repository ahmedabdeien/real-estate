import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";

export default function Reviews() {
  const reviews = [
    { name: "Dr. Essam Mohamed", review: "I dealt with 'El Sarh' to buy my first home, and the experience was beyond amazing. The quality of construction and exceptional service made me feel confident in my choice.", rating: 5 },
    { name: "Eng. Mohammed", review: "A professional company in every sense! I purchased an apartment through 'El Sarh,' and they were committed to on-time delivery with a design that exceeded expectations.", rating: 4.5 },
    { name: "Prof. Ali Ahmed", review: "What sets 'El Sarh' apart is their attention to the smallest details. From the start of the project to its completion, they provided us with a smooth and comfortable experience.", rating: 4 },
    { name: "Eng. Khaled Tawfiq", review: "'El Sarh's' projects are always of high quality. The team was very helpful and assisted me in finding the perfect home.", rating: 4.5 },
    { name: "Prof. Nadia Mohammed", review: "If you're looking for a reliable and reputable real estate company, I highly recommend 'El Sarh.' Their modern designs and excellent service make them the best.", rating: 4.5 },
    { name: "Dr. Emad Al-Sayed", review: "It was an exceptional experience with 'El Sarh.' The community atmosphere they create in their projects is unique, and I am very happy with my decision to buy a home through them.", rating: 4.5 },
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
    <div className='py-8  overflow-hidden bg-stone-100 dark:from-gray-900 dark:to-indigo-900'>
      <div className=" container mx-auto">
        <motion.h2 
          className="text-3xl font-bold text-center mb-8 text-[#353531] "
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          What Our Clients Say
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
                    className="w-12 h-12 rounded-full mr-4"
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
                      } else if (i < review.rating && i + 1 > Math.floor(review.rating)) {
                        return <BsStarHalf key={i} className="text-yellow-400" />;
                      } else {
                        return <BsStar key={i} className="text-yellow-400" />;
                      }
                    })}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {review.rating} stars
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
import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    author: "أحمد محمد",
    role: "عميل سكني",
    text: "تجربة رائعة مع شركة الصرح، التنفيذ بأعلى معايير الجودة",
    avatar: "https://images.pexels.com/photos/5920775/pexels-photo-5920775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    author: "مريم خالد",
    role: "مالكة متجر",
    text: "التزامهم بالمواعيد والدقة في التنفيذ تفوق التوقعات",
    avatar: "https://images.pexels.com/photos/9587160/pexels-photo-9587160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

const Testimonials = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {testimonials.map((testimonial, index) => (
      <motion.div
        key={index}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <div className="flex items-center mb-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.author}
            className="w-12 h-12 rounded-full object-cover mr-4"
          />
          <div>
            <h4 className="font-semibold text-primary dark:text-secondary">
              {testimonial.author}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-gray-400">
              {testimonial.role}
            </p>
          </div>
        </div>
        <p className="text-zinc-700 dark:text-gray-300">
          {testimonial.text}
        </p>
      </motion.div>
    ))}
  </div>
);

export default Testimonials;
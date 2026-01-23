import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsQuote } from "react-icons/bs";

const testimonials = [
  {
    author: "أحمد محمد",
    role: "عميل سكني",
    text: "تجربة رائعة مع شركة الصرح، التنفيذ فاق توقعاتي من حيث الجودة والالتزام بالمواعيد. أشعر بالرضا التام عن استثماري معهم.",
    avatar: "https://images.pexels.com/photos/5920775/pexels-photo-5920775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    author: "مريم خالد",
    role: "مالكة متجر",
    text: "الاحترافية هي السمة الغالبة على كل فريق العمل. من اللحظة الأولى شعرت بأنني في أيدٍ أمينة، والنتيجة النهائية كانت مبهرة.",
    avatar: "https://images.pexels.com/photos/9587160/pexels-photo-9587160.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

const Testimonials = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
    {testimonials.map((testimonial, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="group relative bg-white dark:bg-slate-800 p-12 rounded-[50px] shadow-premium hover:shadow-premium-xl transition-all duration-700 border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="absolute -top-6 -left-6 text-accent-600/10 transform -rotate-12">
          <BsQuote size={120} />
        </div>

        <div className="relative z-10 text-right">
          <div className="flex gap-1 mb-6 justify-end">
            {[...Array(5)].map((_, i) => (
              <BsStarFill key={i} className="text-accent-500 text-sm" />
            ))}
          </div>

          <p className="text-xl text-slate-600 dark:text-slate-300 leading-loose mb-10 italic">
            "{testimonial.text}"
          </p>

          <div className="flex items-center justify-end gap-6 border-t border-slate-50 dark:border-slate-700 pt-8">
            <div className="text-right">
              <h4 className="text-xl font-heading font-black text-primary-900 dark:text-white leading-tight">
                {testimonial.author}
              </h4>
              <p className="text-accent-600 text-xs font-black uppercase tracking-widest mt-1">
                {testimonial.role}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl border-4 border-white dark:border-slate-900 shadow-premium overflow-hidden">
              <img
                src={testimonial.avatar}
                alt={testimonial.author}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default Testimonials;
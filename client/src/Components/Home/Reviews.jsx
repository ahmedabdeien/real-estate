import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsStarHalf, BsStar, BsQuote } from "react-icons/bs";

export default function Reviews() {
  const reviews = [
    { name: "د. عصام محمد", role: "مستثمر عقاري", review: 'تعاملت مع شركة "الصرح" لشراء منزلي الأول، وكانت التجربة أكثر من رائعة، جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة في اختياري.', rating: 5 },
    { name: "م. محمد حسن", role: "مهندس استشاري", review: "شركة محترفة بكل ما تحمله الكلمة من معنى، اشتريت شقة من خلالهم، وكانوا ملتزمين بالتسليم في الموعد المحدد وبتصميم فاق التوقعات.", rating: 5 },
    { name: "ا. نادية محمد", role: "ربة منزل", review: "إذا كنت تبحث عن شركة عقارية موثوقة وذات سمعة طيبة، أنصحك بشدة بشركة 'الصرح' حيث أن تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل.", rating: 4.5 },
  ];

  return (
    <div dir="rtl" className="py-32 bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent-600 font-black uppercase tracking-[0.3em] text-[10px]">شركاء النجاح</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-900 dark:text-white mt-4">
            ماذا يقول عملاؤنا
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="bg-white dark:bg-slate-800 p-10 rounded-[40px] shadow-premium relative group hover:shadow-premium-xl transition-all duration-500 border border-slate-100 dark:border-slate-700"
            >
              <div className="absolute top-10 left-10 text-accent-600/10 group-hover:text-accent-600/20 transition-colors">
                <BsQuote size={80} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-full border-2 border-accent-600 p-1">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.name}&backgroundColor=f8fafc`}
                      alt={review.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-black text-primary-900 dark:text-white leading-tight">
                      {review.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">
                      {review.role}
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-lg leading-loose mb-8 italic">
                  "{review.review}"
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <BsStarFill
                        key={i}
                        className={i < Math.floor(review.rating) ? "text-accent-500" : "text-slate-200 dark:text-slate-700"}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-black text-sm pt-1">
                    {review.rating}/5
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
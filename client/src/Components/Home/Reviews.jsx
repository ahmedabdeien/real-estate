import React from 'react';
import { motion } from 'framer-motion';
import { BsStarFill, BsQuote } from "react-icons/bs";

export default function Reviews() {
  const reviews = [
    { name: "د. عصام محمد", role: "مستثمر عقاري", review: 'تعاملت مع شركة "الصرح" لشراء منزلي الأول، وكانت التجربة أكثر من رائعة، جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة في اختياري.', rating: 5 },
    { name: "م. محمد حسن", role: "مهندس استشاري", review: "شركة محترفة بكل ما تحمله الكلمة من معنى، اشتريت شقة من خلالهم، وكانوا ملتزمين بالتسليم في الموعد المحدد وبتصميم فاق التوقعات.", rating: 5 },
    { name: "ا. نادية محمد", role: "ربة منزل", review: "إذا كنت تبحث عن شركة عقارية موثوقة وذات سمعة طيبة، أنصحك بشدة بشركة 'الصرح' حيث أن تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل.", rating: 5 },
  ];

  return (
    <section dir="rtl" className="py-40 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-accent-600 font-black uppercase tracking-[0.4em] text-xs">ارتقاء بالثقة</span>
          <h2 className="text-5xl md:text-7xl font-heading font-black text-primary-900 dark:text-white mt-6 leading-tight">
            ماذا يقول <br /><span className="text-slate-400">شركاء النجاح</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative bg-white dark:bg-slate-800 p-12 rounded-[60px] shadow-premium hover:shadow-premium-xl transition-all duration-700 border border-slate-100 dark:border-slate-700 hover:border-accent-600/30 overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 text-accent-600/5 group-hover:text-accent-600/10 transition-colors transform -rotate-12">
                <BsQuote size={200} />
              </div>

              <div className="relative z-10">
                <div className="flex gap-1 mb-10">
                  {[...Array(5)].map((_, i) => (
                    <BsStarFill
                      key={i}
                      className="text-accent-500 text-lg"
                    />
                  ))}
                </div>

                <p className="text-2xl text-primary-900 dark:text-slate-200 leading-[1.8] font-medium mb-12 italic">
                  "{review.review}"
                </p>

                <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-700 pt-10">
                  <div className="w-20 h-20 rounded-3xl border-4 border-white dark:border-slate-900 shadow-premium overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.name}&backgroundColor=d97706&fontFamily=Inter&fontWeight=700`}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-black text-primary-900 dark:text-white leading-tight">
                      {review.name}
                    </h3>
                    <p className="text-accent-600 text-sm font-black uppercase tracking-widest mt-1">
                      {review.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
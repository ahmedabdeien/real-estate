import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiTrendingUp, FiTarget } from 'react-icons/fi';
import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import logoElsarh from "../../assets/images/apartment-2179337-removebg-preview.png";

export default function AboutHome() {
  const achievements = [
    {
      title: 'أمان استثنائي',
      desc: 'نطبق أعلى معايير السلامة والجودة العالمية في جميع مشاريعنا.',
      icon: <FiShield className="w-8 h-8" />
    },
    {
      title: 'نمو مستدام',
      desc: 'رؤية استراتيجية تضمن أفضل عائد استثماري لعملائنا.',
      icon: <FiTrendingUp className="w-8 h-8" />
    },
    {
      title: 'دقة التنفيذ',
      desc: 'التزامنا بالمورد الزمني والمواصفات الفنية هو سر قوتنا.',
      icon: <FiTarget className="w-8 h-8" />
    }
  ];

  return (
    <section dir="rtl" className="py-32 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary-950/5 to-transparent" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent-600/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">

          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-accent-600/10 rounded-[80px] blur-[60px] -z-10" />
            <div className="relative rounded-[60px] overflow-hidden shadow-premium-xl border-[16px] border-white dark:border-slate-800">
              <img
                src={imgElsarh}
                alt="Elite Construction"
                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />

              <div className="absolute bottom-12 left-12 right-12 glass-card p-8 rounded-3xl border border-white/20">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-accent-600 rounded-2xl text-white">
                    <span className="text-3xl font-black font-heading">+20</span>
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl mb-1">عـاماً مـن الـخبرة</h4>
                    <p className="text-white/60 text-sm">في صياغة مستقبل العقار المصري</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Achievement Card */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-12 hidden xl:block glass-card p-8 rounded-[40px] border border-white/20 shadow-premium-xl w-64 text-center"
            >
              <div className="w-16 h-16 bg-accent-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                <FiCheckCircle size={32} />
              </div>
              <p className="font-heading font-black text-primary-900 dark:text-white">جودة معتمدة</p>
              <p className="text-xs text-slate-500 mt-2">نطبق معايير الـ ISO في التنفيذ</p>
            </motion.div>
          </motion.div>

          {/* Text Side */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-accent-600 font-black uppercase tracking-[0.4em] text-xs">إرث يمتد منذ 2004</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-primary-900 dark:text-white leading-tight">
                شركة الصرح <br />
                <span className="text-accent-600">رؤية عقارية</span> تتجاوز الحدود
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-loose">
                منذ انطلاقتنا في عام 2004، وضعنا نصب أعيننا هدفاً واحداً: أن نكون المطور العقاري الذي يعيد تعريف مفهوم السكن الفاخر في مصر. من خلال عقدين من الزمان، نجحنا في بناء مئات الوحدات التي تحمل طابع التميز والأمان.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-6">
              {achievements.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex items-start gap-6 p-6 rounded-3xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-premium"
                >
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-accent-600 group-hover:bg-accent-600 group-hover:text-white transition-all duration-500">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-black text-primary-900 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="pt-8 flex items-center gap-8"
            >
              <Link to="/about">
                <button className="btn-premium bg-primary-900 text-white hover:bg-primary-950">تعرف علينا أكثر</button>
              </Link>
              <div className="flex -space-x-4 rtl:space-x-reverse items-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                  </div>
                ))}
                <span className="mr-6 text-sm font-bold text-slate-500">+1000 عميل يثق بنا</span>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
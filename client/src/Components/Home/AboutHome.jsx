import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import logoElsarh from "../../assets/images/apartment-2179337-removebg-preview.png";

export default function AboutHome() {
  const benefits = [
    'جودة لا مثيل لها ومعايير بناء استثنائية',
    'تصاميم مبتكرة وأساليب معمارية معاصرة',
    'وحدات متنوعة تلبي جميع الاحتياجات',
    'الالتزام ببناء مجتمعات نابضة بالحياة',
    'ممارسات مستدامة ومسؤولية بيئية'
  ];

  return (
    <div dir="rtl" className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">

        {/* First Section: History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div>
              <span className="text-accent-600 font-black uppercase tracking-[0.2em] text-xs">من نحن</span>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-primary-900 dark:text-white mt-4 border-r-8 border-accent-600 pr-6">
                الريادة والتميز في <br />عالم العقار
              </h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-loose">
              شركة الصرح للاستثمار العقاري خبرة أكثر من 20 عـامًا، نتبنى إستراتيجية شاملة لمستقبل المعمار في مصر. نعتمد على الدراسات العلمية والتكنولوجيا المتطورة لمواكبة النهضة العقارية العالمية، ونهدف لإحداث تطور معماري غير مسبوق يليق بعملائنا.
            </p>
            <div className="pt-4">
              <Link to="/about">
                <button className="btn-premium bg-primary-900 text-white hover:bg-primary-800 shadow-premium">
                  قصتنا الكاملة
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent-100 dark:bg-accent-900/20 rounded-full blur-3xl -z-10" />
            <div className="bg-slate-50 dark:bg-slate-800 rounded-[40px] p-8 shadow-premium-xl border border-slate-100 dark:border-slate-700">
              <img src={logoElsarh} alt="Design" className="w-full h-auto transform hover:rotate-3 transition-transform duration-500" />
            </div>
          </motion.div>
        </div>

        {/* Second Section: Why Us */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-last lg:order-first relative"
          >
            <img
              src={imgElsarh}
              alt="Quality Construction"
              className="rounded-[40px] shadow-premium-xl w-full h-[500px] object-cover border-4 border-white dark:border-slate-800"
            />
            <div className="absolute -bottom-6 -left-6 bg-accent-600 text-white p-8 rounded-3xl shadow-premium-lg hidden md:block">
              <p className="text-3xl font-black font-heading leading-none">+20</p>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-2">عاماً من الخبرة</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div>
              <span className="text-accent-600 font-black uppercase tracking-[0.2em] text-xs">لماذا نحن؟</span>
              <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white mt-4">
                قيم نفخر بها وتنعكس <br />على مشاريعنا
              </h2>
            </div>

            <ul className="grid grid-cols-1 gap-4">
              {benefits.map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: -10 }}
                  className="flex items-center gap-5 p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-premium border border-slate-100 dark:border-slate-700 group hover:border-accent-600/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-accent-100 dark:bg-accent-950 flex items-center justify-center text-accent-600">
                    <FiCheckCircle size={20} />
                  </div>
                  <p className="text-lg font-heading font-bold text-slate-800 dark:text-slate-200">{item}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
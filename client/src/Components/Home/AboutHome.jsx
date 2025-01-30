import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import logoElsarh from "../../assets/images/apartment-2179337-removebg-preview.png";

export default function AboutHome() {
  const firstSectionRef = useRef(null);
  const secondSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slideIn');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (firstSectionRef.current) observer.observe(firstSectionRef.current);
    if (secondSectionRef.current) observer.observe(secondSectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div dir="rtl" className="overflow-hidden">
      {/* First Section */}
      <section 
        ref={firstSectionRef}
        className="bg-white dark:bg-gray-800 opacity-0"
      >
        <div className="py-16 px-4 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-[#002E66] dark:text-gray-300 relative pb-4">
              <span className="pr-4 border-r-4 border-[#002E66] dark:border-gray-300">
                الصرح للاستثمار العقاري
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              شركة الصرح للاستثمار العقاري خبرة اكثرمن 20 عـامًا ذات إستراتيجية شاملة لمستقبل المعمــار فـي مصـر تعتمـد علـى الدراسات العلميـة والتكنولوجيـا المتطـورة التـى تواكب النهضـة العقارية العالمية شركة تهدف إلى إحداث تطور معمارى غير مسبوق فى مصر ...
            </p>
            <Link 
              to="/about"
              className="inline-block px-8 py-3 dark:from-amber-600 bg-gradient-to-l from-[#002E66] to-[#004483] text-white rounded-lg
                        shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              عرض المزيد
            </Link>
          </div>
          
          <div className="relative group h-96 flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-bl from-[#002E66]/20 dark:from-gray-900 to-transparent rounded-3xl" />
            <img 
              src={logoElsarh} 
              alt="aboutImg" 
              className="h-full w-full object-contain transform transition-all duration-500 
                       "
            />
          </div>
        </div>
      </section>

      {/* Second Section */}
      <section 
        ref={secondSectionRef}
        className="bg-stone-100 dark:bg-gradient-to-br from-slate-900 to-gray-800 opacity-0"
      >
        <div className="py-16 px-4 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-last lg:order-first">
            <div className="relative group h-96">
              <div className="absolute inset-0 bg-gradient-to-tr from-stone-100/50 to-transparent dark:from-stone-900/50 rounded-3xl" />
              <img
                src={imgElsarh}
                alt="El Sarh Real Estate"
                className="h-full w-full object-cover rounded-3xl shadow-xl transform transition-all 
                          duration-500 group-hover:scale-105"
              />
            </div>
          </div>
          
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-[#002E66] dark:text-gray-300 pb-4">
              <span className="pr-4 border-r-4 border-[#002E66]  dark:border-gray-300">
              لماذا نختار الصرح؟              </span>
            </h2>
            
            <ul className="space-y-2">
              {[
                'جودة لا مثيل لها ومعايير بناء استثنائية',
                'تصاميم مبتكرة وأساليب معمارية معاصرة',
                'وحدات متنوعة تلبي جميع الاحتياجات',
                'التزام ببناء مجتمعات نابضة بالحياة',
                'ممارسات مستدامة ومسؤولية بيئية'
              ].map((item, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl
                            shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-3 h-1 bg-[#004483] dark:bg-amber-600 flex-shrink-0" />
                  <p className="text-lg text-gray-600 dark:text-gray-300">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.8s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
      `}</style>
    </div>
  );
}
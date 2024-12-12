
import elsarhLogo from "../../assets/images/logoElsarh.png";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
function About() {
  return (
    <>
      <Helmet>
        <title>About - El Sarh Real Estate Investment Company</title>
        <meta
          name="description"
          content="Discover El Sarh Real Estate Investment Company, a pioneering developer in Egypt, specializing in transformative real estate projects."
        />
        <meta
          property="og:title"
          content="About - El Sarh Real Estate Investment Company"
        />
        <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
      </Helmet>
      
      <section dir="rtl" className="overflow-hidden bg-stone-100 py-5 dark:from-gray-800 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className=" "
          >
            <div className="pb-5">
              <div className=" overflow-hidden flex items-start aboutImg h-72">
               <div className=" bg-[#002E66] bg-opacity-80 z-10 w-full h-full flex justify-center items-center">
              
                  <div className="flex flex-col justify-center items-center z-20">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">معلومات عنا</h1>
                    <div className="bg-white p-1 ">
                      <img src={elsarhLogo} alt="El Sarh Logo" className="w-44 h-auto object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-700 border py-6  mb-4 space-y-5 "
              >
                <div>
                  <h4 className="text-3xl font-bold text-[#033E8A] dark:text-[#FF9505] mb-4 px-6">
                    عن الصرح
                  </h4>
                  <p className="text-lg text-zinc-700 dark:text-gray-300 leading-relaxed px-6">
                  شركة الصرح للاستثمار العقاري خبرة اكثرمن 20 عـامًا  ذات إستراتيجية شاملة لمستقبل المعمــار فـي مصـر تعتمـد علـى الدراسات العلميـة والتكنولوجيـا المتطـورة التـى تواكب النهضـة العقارية  العالمية 
شركة تهدف إلى إحداث تطور معمارى غير مسبوق فى مصر يضاهـي التطـور الـذي تشهده في كافة المجالات الأخرى .
                  </p>
                </div>
                <p className="text-lg text-zinc-700 dark:text-gray-300 px-6 bg-gray-100 py-3 font-semibold whitespace-pre-line">
                شركة الصرح ليست مجرد شركة عقارية، بل هي قوة ثاقبة تعمل على تغيير وجه مصر وصياغة مساحات معيشية تتجاوز التوقعات.
                </p>
                <div className="bg-white dark:bg-gray-700 ">
                <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-gray-300 px-6">
                  <li>جودة لا مثيل لها ومعايير بناء استثنائية</li>
                  <li>تصاميم مبتكرة وأساليب معمارية معاصرة</li>
                  <li>وحدات متنوعة تلبي مجموعة متنوعة من الاحتياجات والتفضيلات</li>
                  <li>الالتزام ببناء مجتمعات نابضة بالحياة مع وسائل راحة لا مثيل لها</li>
                  <li>الممارسات المستدامة والتركيز الواضح على المسؤولية البيئية</li>
                </ul>
              </div>
              
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-700 border p-6 mb-4 space-y-5 divide-y"
              >
                <div>
                  <h4 className="text-3xl font-bold text-[#033E8A] dark:text-[#FF9505] mb-4">
                  رؤيتنا

                  </h4>
                  <p className="text-lg text-zinc-700 dark:text-gray-300 leading-relaxed">
                  تهدف شركه الصرح الي تلبية كافه متطلبات عملائها من خلال بناء مشاريع بجودة عالية ذات مستويات عاليه من الامان وبأرقي وأحدث التصميمات الاحترافيه وفي أقل وقت ممكن، كما تقدم الشركه خدمات التشطيب لكل من الشقق السكنيه والفلل والقصور والمنازل والشركات والمحلات تجاريه والمطاعم، وغيره من أعمال التشطيبات الداخلية الإبداعية، كما تهدف الشركة إلي تحقيق أعلي درجات النجاح وإرضاء العميل معتمدين في ذلك على الالتزام بالتنفيذ في الوقت المحدد وكذلك يتم تنفيذ جميع الأعمال بواسطة مهندسين وفنيين محترفين .
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-700 border p-6 mb-4 space-y-5 divide-y"
              >
                <div>
                  <h4 className="text-3xl font-bold text-[#033E8A] dark:text-[#FF9505] mb-4">
                  خدماتنا  
                  </h4>
                  <div className="py-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 ">
                  <div className=" border hover:shadow-sm bg-cover bg-[url('https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')]">
                      <div className="w-full h-60 font-semibold bg-[#033E8A]/80 text-white text-4xl flex justify-center items-center">
                      سكني  
                      </div>
                    </div>
                    <div className=" border hover:shadow-sm bg-cover bg-[url('https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')]">
                      <div className="w-full h-60 font-semibold bg-[#033E8A]/80 text-white text-4xl flex justify-center items-center">
                           إداري
                      </div>
                    </div>
                    <div className=" border hover:shadow-sm bg-cover bg-[url('https://images.pexels.com/photos/28388982/pexels-photo-28388982/free-photo-of-shopping-arcade-in-kuala-lumpur.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')]">
                      <div className="w-full h-60 font-semibold bg-[#033E8A]/80 text-white text-4xl flex justify-center items-center">
                      تجاري
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
            

          </motion.div>

        </div>

      </section>
    </>
  );
}

export default About;
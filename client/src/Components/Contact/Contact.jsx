import React from 'react';
import { motion } from 'framer-motion';
import { BsPeople, BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { SocialMediaLinkTow } from "../SocialMedia/SocialMediaLink.jsx";
import { Helmet } from "react-helmet";
import FormContact from './FormContact';

function Contact() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | El Sarh Real Estate Investment Company</title>
        <meta name="description" content="Contact El Sarh Real Estate Investment Company for more information about residential, commercial, or investment properties." />
        <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <div dir="rtl" className="dark:bg-gray-900  bg-stone-100 py-5 overflow-hidden ">
        <div className=" space-y-5 container  mx-auto">


          <motion.div 
            className="bg-white border dark:bg-gray-800 p-6 py-8 border-b-4 border-b-[#ff9505]  shadow-md"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-[#002E66] dark:text-gray-300 mb-2 ">ابقى على تواصل مع شركة الصرح</h2>
            <p className="text-[#353531] dark:text-gray-400 text-lg ">
            في شركة الصرح للاستثمار العقاري، نحن ملتزمون بتقديم خدمة استثنائية وتلبية جميع احتياجاتك العقارية. سواء كنت مهتمًا بالعقارات السكنية أو التجارية أو الاستثمارية، أو لديك سؤال أو استفسار، فإن فريقنا المتخصص موجود لمساعدتك .
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            
            <motion.div
              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border overflow-hidden flex flex-col"
              {...fadeIn}
            >
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="text-2xl font-semibold text-[#353531] dark:text-gray-300 mb-4">معلومات الاتصال</h3>
                <p className="text-[#353531]/80 dark:text-gray-400 mb-2">نحن مفتوحون 6 أيام في الأسبوع، من الساعة 10:00 صباحًا حتى 5:00 مساءً.</p>
                <p className="text-[#353531]/80 dark:text-gray-400">يرجى إعلامنا إذا كان لديك أي أسئلة أو تحتاج إلى مساعدة.</p>
              </div>
              <div className="flex-grow">
                <motion.a
                  href="mailto:example@elsarh.com"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsEnvelope className="text-3xl text-[#ff9505]" />
                  <p className="text-gray-800 dark:text-gray-300 mr-2">elsarhegypt@gmail.com</p>
                </motion.a>
                <motion.a
                  href="tel:+201212622210"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsTelephone className="text-3xl text-[#ff9505] " />
                  <p className="text-gray-800 dark:text-gray-300 mr-2">01212622210</p>
                </motion.a>
                <motion.a
                  href="https://maps.app.goo.gl/yv9HDSAdmwAT2Lft8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsGeoAlt className="text-3xl text-[#ff9505] me-2" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-300">14 شارع المختار من شارع النصر
                    المعادى الجديدة, القاهرة</p>
                    <p className="text-red-600">انتقل إلى خريطة </p>
                  </div>
                </motion.a>
                <motion.a
                  href="https://maps.app.goo.gl/ypNfngvXQSosxsXM9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsGeoAlt className="text-3xl text-[#ff9505] me-2" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-300"> شارع محمد حميدة فوق بنك مصر, بني سويف</p>
                    <p className="text-red-600">انتقل إلى خريطة </p>
                  </div>
                </motion.a>
              </div>
              <div className="border-t bg-stone-50 p-3 flex justify-center">
                <SocialMediaLinkTow />
              </div>
            </motion.div>
            
            <motion.div
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border overflow-hidden"
              {...fadeIn}
            >
              <div className="p-5">
                <h3 className="text-2xl font-semibold text-[#353531] dark:text-gray-300 mb-6">تواصل معنا</h3>
                
                <FormContact/>
              </div>
            </motion.div>

          </div>

          <motion.div
            className="w-full rounded-xl border overflow-hidden shadow-lg p-3 bg-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1728.0818356095576!2d31.274256562161206!3d29.974725938862846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145839b32f2e71d1%3A0x9758140509ccd109!2z2LTYsdmD2Kkg2KfZhNi12LHYrSDZhNmE2KfYs9iq2KvZhdin2LEg2KfZhNi52YLYp9ix2Yo!5e0!3m2!1sen!2seg!4v1727772284728!5m2!1sen!2seg" 
              className='w-full rounded-md'
              height="400"
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
              </iframe>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Contact;
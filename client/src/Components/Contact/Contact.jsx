import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { SocialMediaPrimary } from "../SocialMedia/SocialMediaLink.jsx";
import { Helmet } from "react-helmet";
import FormContact from './FormContact';

const fadeIn = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const ContactMethod = ({ icon: Icon, title, children, link }) => (
  <motion.div 
    className="group p-6 bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl  duration-300"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-start gap-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg text-white">
        <Icon className="text-2xl" />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{title}</h4>
        {link ? (
          <a href={link} className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
            {children}
          </a>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">{children}</p>
        )}
      </div>
    </div>
  </motion.div>
);

function Contact() {
  return (
    <>
      <Helmet>
        <title>تواصل معنا | شركة الصرح للاستثمار العقاري</title>
      </Helmet>

      <div dir="rtl" className="min-h-screen bg-gradient-to-b container from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            {...fadeIn}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-blue-600 mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              تواصل مع فريق الصرح
            </motion.h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              نحن هنا لمساعدتك في كل خطوة من رحلتك العقارية. تواصل معنا اليوم وستحصل على رد خلال 24 ساعة.
            </p>
          </motion.div>

          {/* Contact Grid */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 mb-16"
            variants={stagger}
          >
            {/* Left Column - Contact Methods */}
            <motion.div 
              className="space-y-3"
              {...fadeIn}
            >
              <ContactMethod 
                icon={FiMapPin} 
                title="المقر الرئيسي"
                link="https://maps.app.goo.gl/yv9HDSAdmwAT2Lft8"
              >
                14 شارع المختار، المعادي الجديدة، القاهرة
              </ContactMethod>

              <ContactMethod 
                icon={FiMapPin} 
                title="فرع بني سويف"
                link="https://maps.app.goo.gl/ypNfngvXQSosxsXM9"
              >
                شارع محمد حميدة فوق بنك مصر، بني سويف
              </ContactMethod>

              <ContactMethod 
                icon={FiPhone} 
                title="الاتصال المباشر"
                link="tel:+201212622210"
              >
                01212622210
              </ContactMethod>

              <ContactMethod 
                icon={FiMail} 
                title="البريد الإلكتروني"
                link="mailto:elsarhegypt@gmail.com"
              >
                elsarhegypt@gmail.com
              </ContactMethod>

              <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">ساعات العمل</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>السبت - الخميس: ١٠ صباحًا - ٥ مساءً</p>
                  <p>الجمعة : مغلق</p>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
              {...fadeIn}
            >
              <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
                أرسل رسالتك
              </h2>
              <FormContact />
            </motion.div>
          </motion.div>

          {/* Map Section */}
          <motion.div 
            className="rounded-2xl overflow-hidden shadow-2xl border dark:border-gray-700 relative"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 pointer-events-none" />
            <iframe
              title="Company Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1728.0818356095576!2d31.274256562161206!3d29.974725938862846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145839b32f2e71d1%3A0x9758140509ccd109!2z2LTYsdmD2Kkg2KfZhNi12LHYrSDZhNmE2KfYs9iq2KvZhdin2LEg2KfZhNi52YLYp9ix2Yo!5e0!3m2!1sen!2seg!4v1727772284728!5m2!1sen!2seg"
              className="w-full h-96"
              allowFullScreen
              loading="lazy"
            />
          </motion.div>

          {/* Social Media Floating Section */}
          <motion.div 
            className="fixed right-6 bottom-6 bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <SocialMediaPrimary className="flex gap-3" iconClass="text-2xl hover:text-[#6366f1] transition-colors" />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Contact;
import React, { useEffect } from 'react';
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
    className="group p-10 bg-white dark:bg-slate-800 rounded-[32px] shadow-premium border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-all duration-500"
    whileHover={{ y: -8 }}
  >
    <div className="flex items-start gap-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 shadow-premium flex items-center justify-center text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-xl font-heading font-black text-primary-900 dark:text-white mb-2">{title}</h4>
        {link ? (
          <a href={link} className="text-slate-500 dark:text-slate-400 hover:text-primary-600 transition-colors font-medium">
            {children}
          </a>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 font-medium">{children}</p>
        )}
      </div>
    </div>
  </motion.div>
);

function Contact() {
  useEffect(() => {
    const initializeMap = async () => {
      await customElements.whenDefined('gmpx-store-locator');
      const locator = document.querySelector('gmpx-store-locator');
      if (locator) {
        locator.configureFromQuickBuilder(CONFIGURATION);
      }
    };

    initializeMap();
  }, []);

  return (
    <div dir="rtl" className="bg-white dark:bg-slate-900 overflow-hidden pb-24">
      <Helmet>
        <title>تواصل معنا | شركة الصرح العقارية</title>
        <meta name="description" content="نحن هنا لمساعدتك في كل خطوة من رحلتك العقارية. تواصل مع مستشاري شركة الصرح اليوم." />
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        />
      </Helmet>

      {/* Hero Header */}
      <div className="bg-slate-900 py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0yMCAyMHYyMGgyMFYyMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')] " />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary-500 font-black uppercase tracking-[0.4em] text-[10px] mb-6 inline-block"
          >
            دعنا نساعدك
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-heading font-black text-white mb-8"
          >
            تواصل معنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg leading-relaxed"
          >
            فريق الصرح جاهز دائماً للرد على استفساراتك وتقديم المشورة العقارية المتخصصة التي تناسب تطلعاتك.
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-6 lg:px-12 -mt-12 relative z-20">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

          {/* Contact Details */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ContactMethod
                icon={FiMapPin}
                title="فرع المعادي"
                link="https://maps.app.goo.gl/0XEuL7M5WBQRCdHMCQUUWJc"
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
                title="الخط الساخن"
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
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-premium">
              <h3 className="text-2xl font-heading font-black text-primary-900 dark:text-white mb-6">ساعات العمل الرسمية</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                  <span className="text-slate-500 font-medium">السبت - الخميس</span>
                  <span className="font-black text-primary-900 dark:text-white uppercase tracking-tighter">١٠ صباحًا - ٥ مساءً</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">الجمعة</span>
                  <span className="text-primary-600 font-black uppercase tracking-widest">مغلق</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-slate-900 p-12 rounded-[48px] shadow-premium-xl relative overflow-hidden text-center">
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-heading font-black text-white">تابعنا على منصات التواصل</h3>
                <div className="flex justify-center">
                  <SocialMediaPrimary className="flex gap-6" iconClass="text-4xl text-white hover:text-primary-500 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white dark:bg-slate-800 p-12 md:p-16 rounded-[48px] shadow-premium border border-slate-100 dark:border-slate-700 h-full">
            <div className="mb-12">
              <span className="text-primary-500 font-black uppercase text-[10px] tracking-widest">نموذج التواصل</span>
              <h2 className="text-3xl font-heading font-black text-primary-900 dark:text-white mt-4">أرسل استفسارك الآن</h2>
              <p className="text-slate-500 mt-4 leading-relaxed">سقوم مستشارينا بالتواصل معك في أقرب وقت لتلبية طلبك.</p>
            </div>
            <FormContact />
          </div>

        </div>

        {/* Map Section */}
        <section className="mt-32 space-y-12">
          <div className="text-center">
            <h2 className="text-4xl font-heading font-black text-primary-900 dark:text-white">مواقعنا على الخريطة</h2>
            <p className="text-slate-500 mt-4">تفضل بزيارتنا في أحد فروعنا الرسمية</p>
          </div>
          <div className="rounded-[64px] overflow-hidden shadow-premium-xl border-8 border-white dark:border-slate-800 h-[600px] relative">
            <gmpx-api-loader
              key={CONFIGURATION.mapsApiKey}
              solution-channel="GMP_QB_locatorplus_v11_cABD"
            />
            <gmpx-store-locator
              map-id="DEMO_MAP_ID"
              style={{
                width: '100%',
                height: '100%',
                '--gmpx-color-surface': '#fff',
                '--gmpx-color-on-surface': '#1e293b',
                '--gmpx-color-on-surface-variant': '#64748b',
                '--gmpx-color-primary': '#6cb635',
                '--gmpx-color-outline': '#f1f5f9',
                '--gmpx-font-family-base': 'Inter, sans-serif',
              }}
            />
          </div>
        </section>

      </main>
    </div>
  );
}

export default Contact;
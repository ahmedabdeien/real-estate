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
    className="group p-6 bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-xl duration-300"
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

const CONFIGURATION = {
  locations: [
    {
      title: "شركة الصرح للاستثمار العقاري",
      address1: "طريق الكورنيش",
      address2: "بني سويف, بني سويف, Egypt",
      coords: { lat: 29.0747265, lng: 31.1152361 },
      placeId: "ChIJ_6fjLqKoAgoRw5FuY64T8Ec"
    },
    {
      title: "شركة الصرح للاستثمار العقاري",
      address1: "شارع المختار من النصر بجوار جاندوفلي",
      address2: "المعادي, القاهرة, Egypt",
      coords: { lat: 29.9742116, lng: 31.2742488 },
      placeId: "ChIJ0XEuL7M5WBQRCdHMCQUUWJc"
    }
  ],
  mapOptions: {
    center: { lat: 29.0747265, lng: 31.1152361 },
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoom: 12,
    zoomControl: true,
    maxZoom: 17
  },
  mapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY",
  capabilities: {
    input: true,
    autocomplete: true,
    directions: false,
    distanceMatrix: true,
    details: false,
    actions: false
  }
};

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
    <>
      <Helmet>
        <title>تواصل معنا | شركة الصرح للاستثمار العقاري</title>
        <script 
          type="module" 
          src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        />
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
            className="rounded-2xl overflow-hidden shadow-2xl border dark:border-gray-700 relative h-[600px]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
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
                '--gmpx-color-on-surface': '#212121',
                '--gmpx-color-on-surface-variant': '#757575',
                '--gmpx-color-primary': '#1967d2',
                '--gmpx-color-outline': '#e0e0e0',
                '--gmpx-fixed-panel-width-row-layout': '28.5em',
                '--gmpx-fixed-panel-height-column-layout': '65%',
                '--gmpx-font-family-base': 'Roboto, sans-serif',
                '--gmpx-font-family-headings': 'Roboto, sans-serif',
                '--gmpx-font-size-base': '0.875rem',
                '--gmpx-hours-color-open': '#188038',
                '--gmpx-hours-color-closed': '#d50000',
                '--gmpx-rating-color': '#ffb300',
                '--gmpx-rating-color-empty': '#e0e0e0'
              }}
            />
          </motion.div>

          {/* Social Media Floating Section */}
          <motion.div 
            className="fixed right-6 bottom-6 bg-white dark:bg-gray-800 p-4 rounded-full shadow-xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
          >
            <SocialMediaPrimary className="flex gap-3" iconClass="text-2xl hover:text-blue-500 transition-colors" />
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Contact;
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { SocialMediaPrimary } from "../SocialMedia/SocialMediaLink.jsx";
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import FormContact from './FormContact';

const CONFIGURATION = {
  mapsApiKey: import.meta.env.VITE_MAP_KEY || ''
};

const ContactMethod = ({ icon: Icon, title, children, link }) => (
  <div className="bg-white p-8 border border-slate-200 hover:border-primary-500 transition-all duration-300 rounded-none group shadow-sm">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 bg-slate-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 rounded-none">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-tight">{title}</h4>
        {link ? (
          <a href={link} className="text-slate-500 hover:text-primary-600 transition-colors text-sm">
            {children}
          </a>
        ) : (
          <p className="text-slate-500 text-sm leading-relaxed">{children}</p>
        )}
      </div>
    </div>
  </div>
);

function Contact() {
  const { t, i18n } = useTranslation();
  const { config } = useSelector(state => state.config);
  const isRtl = i18n.language === 'ar';

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (typeof CONFIGURATION !== 'undefined' && config.mapsApiKey) {
          await customElements.whenDefined('gmpx-store-locator');
          const locator = document.querySelector('gmpx-store-locator');
          if (locator) {
            locator.configureFromQuickBuilder({ ...CONFIGURATION, mapsApiKey: config.mapsApiKey });
          }
        }
      } catch (error) {
        console.error("Map initialization failed", error);
      }
    };
    initializeMap();
  }, [config.mapsApiKey]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="bg-slate-50 font-body pb-24 min-h-screen">
      <Helmet>
        <title>{t('contact_us')} | {config.siteName}</title>
        <script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        />
      </Helmet>

      {/* Hero Header - Standard Banner Style */}
      <div className="bg-primary-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-transparent opacity-90" />
        </div>
        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <span className="text-accent-500 font-bold uppercase tracking-widest text-xs mb-4 block">
            {t('contact_us')}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('reach_out_to_us_today') || 'Reach out to us today'}
          </h1>
          <p className="max-w-2xl text-primary-50 text-base leading-relaxed opacity-80">
            {t('contact_desc') || 'Our team is here to help you with any questions you may have. Feel free to contact us via any of the methods below.'}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-12 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Contact Details & Methods */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ContactMethod
                icon={FiMapPin}
                title={t('maadi_branch') || "Maadi"}
                link={config?.contact?.maadiBranchLink}
              >
                {config?.contact?.maadiBranchAddress || '14 Mokhtar St, New Maadi, Cairo, Egypt'}
              </ContactMethod>

              <ContactMethod
                icon={FiMapPin}
                title={t('beni_suef_branch') || "Beni Suef"}
                link={config?.contact?.beniSuefBranchLink}
              >
                {config?.contact?.beniSuefBranchAddress || 'Mohamed Hamida St, Beni Suef'}
              </ContactMethod>

              <ContactMethod
                icon={FiPhone}
                title={t('hotline') || "Hotline"}
                link={`tel:${config?.contact?.phone}`}
              >
                {config?.contact?.phone}
              </ContactMethod>

              <ContactMethod
                icon={FiMail}
                title={t('email') || "Email"}
                link={`mailto:${config?.contact?.email}`}
              >
                {config?.contact?.email}
              </ContactMethod>
            </div>

            {/* Working Hours Card */}
            <div className="bg-white p-10 border border-slate-200 rounded-none shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-tight border-b border-slate-100 pb-4">{t('working_hours')}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">{t('saturday')} - {t('thursday')}</span>
                  <span className="font-bold text-primary-600 text-sm">10:00 AM - 05:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                  <span className="text-slate-500 text-sm font-medium">{t('friday')}</span>
                  <span className="text-red-500 font-bold text-xs uppercase tracking-widest">{t('closed')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-white p-10 md:p-12 border border-slate-200 rounded-none shadow-xl border-t-4 border-primary-600">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('send_a_message')}</h2>
              <p className="text-slate-500 text-sm">{t('form_subtitle') || 'Our advisors will get back to you as soon as possible.'}</p>
            </div>
            <FormContact />
          </div>

        </div>

        {/* Map Section */}
        <section className="mt-24">
          <div className="bg-white border border-slate-200 rounded-none p-4">
            <div className="h-[500px] relative overflow-hidden bg-slate-100">
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
                  '--gmpx-color-primary': '#005B94',
                  '--gmpx-font-family-base': 'Inter, sans-serif',
                }}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
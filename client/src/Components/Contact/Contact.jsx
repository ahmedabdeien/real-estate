import React from 'react';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock } from 'react-icons/fi';
import { SocialMediaPrimary } from '../SocialMedia/SocialMediaLink.jsx';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import FormContact from './FormContact';

function Contact() {
  const { config } = useSelector(s => s.config);

  const contactMethods = [
    {
      icon: FiMapPin,
      title: 'فرع المعادي',
      value: config?.contact?.maadiBranchAddress || '14 شارع مختار، المعادي الجديدة، القاهرة',
      link:  config?.contact?.maadiBranchLink,
    },
    {
      icon: FiMapPin,
      title: 'فرع بني سويف',
      value: config?.contact?.beniSuefBranchAddress || 'شارع محمد حميدة، بني سويف',
      link:  config?.contact?.beniSuefBranchLink,
    },
    {
      icon: FiPhone,
      title: 'الخط الساخن',
      value: config?.contact?.phone,
      link:  config?.contact?.phone ? `tel:${config.contact.phone}` : null,
    },
    {
      icon: FiMail,
      title: 'البريد الإلكتروني',
      value: config?.contact?.email,
      link:  config?.contact?.email ? `mailto:${config.contact.email}` : null,
    },
  ].filter(m => m.value);

  return (
    <div dir="rtl" className="min-h-screen overflow-hidden" style={{ background: '#faf8f4' }}>
      <Helmet>
        <title>اتصل بنا | {config.siteName || 'الصرح للتطوير العقاري'}</title>
      </Helmet>

      {/* ===== Hero ===== */}
      <section
        className="relative py-28 flex items-center overflow-hidden"
        style={{ background: '#12283C' }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #DFBA6B 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute left-0 top-0 w-96 h-96 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(138,105,36,0.12), transparent 70%)' }}
        />

        <div className="container mx-auto px-4 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span
              className="inline-block px-4 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase mb-5"
              style={{ background: 'rgba(138,105,36,0.85)', color: '#DFBA6B', border: '1px solid rgba(223,186,107,0.3)' }}
            >
              تواصل معنا
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
              تواصل معنا اليوم
            </h1>
            <div className="h-1 w-16 mb-4" style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }} />
            <p className="text-sm max-w-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
              فريقنا متواجد لمساعدتك في أي استفسار. لا تتردد في التواصل معنا عبر أي من الطرق الموضحة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== المحتوى الرئيسي ===== */}
      <main className="container mx-auto px-4 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* ===== الجانب الأيمن — معلومات التواصل ===== */}
          <div className="lg:col-span-2 space-y-5">

            {/* بطاقات التواصل */}
            {contactMethods.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-5 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(138,105,36,0.1)',
                  boxShadow: '0 4px 16px rgba(18,40,60,0.05)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: 'rgba(138,105,36,0.1)', border: '1px solid rgba(138,105,36,0.2)' }}
                  >
                    <m.icon size={18} style={{ color: '#8A6924' }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black tracking-wider uppercase mb-1" style={{ color: '#8A6924' }}>
                      {m.title}
                    </h4>
                    {m.link ? (
                      <a
                        href={m.link}
                        className="text-sm font-medium break-all transition-colors hover:text-[#8A6924]"
                        dir={m.icon === FiPhone ? 'ltr' : 'rtl'}
                        style={{ color: '#12283C' }}
                      >
                        {m.value}
                      </a>
                    ) : (
                      <p className="text-sm" style={{ color: '#4a3e2a' }}>{m.value}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* ساعات العمل */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-6"
              style={{
                background: '#12283C',
                border: '1px solid rgba(223,186,107,0.15)',
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <FiClock size={16} style={{ color: '#DFBA6B' }} />
                <h3 className="text-xs font-black tracking-widest uppercase" style={{ color: '#DFBA6B' }}>
                  ساعات العمل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>السبت — الخميس</span>
                  <span className="font-black" style={{ color: '#DFBA6B' }}>10:00 - 17:00</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>الجمعة</span>
                  <span className="font-black text-red-400">مغلق</span>
                </div>
              </div>
            </motion.div>

            {/* سوشيال ميديا */}
            <div
              className="p-5"
              style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(138,105,36,0.1)' }}
            >
              <p className="text-xs font-black tracking-widest uppercase mb-4" style={{ color: '#8A6924' }}>
                تابعنا على
              </p>
              <SocialMediaPrimary />
            </div>
          </div>

          {/* ===== الجانب الأيسر — نموذج التواصل ===== */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div
              className="p-8 md:p-10"
              style={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(138,105,36,0.12)',
                boxShadow: '0 16px 48px rgba(18,40,60,0.08)',
                borderTop: '3px solid #8A6924',
              }}
            >
              <div className="mb-8">
                <h2 className="text-xl font-black mb-2" style={{ color: '#12283C' }}>أرسل رسالة</h2>
                <p className="text-xs" style={{ color: '#6b5e3e' }}>
                  سيعاود مستشارونا الاتصال بك في أقرب وقت ممكن.
                </p>
              </div>
              <FormContact />
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Contact;

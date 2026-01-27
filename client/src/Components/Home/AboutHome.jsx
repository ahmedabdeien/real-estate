import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiShield, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import imgElsarh from '../../assets/images/section_2__elsarhWebsite.png';
import logoElsarh from "../../assets/images/apartment-2179337-removebg-preview.png";

export default function AboutHome() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const isRtl = currentLang === 'ar';

  const achievements = [
    {
      title: t('about_feat_1_title'),
      desc: t('about_feat_1_desc'),
      icon: <FiShield className="w-8 h-8" />
    },
    {
      title: t('about_feat_2_title'),
      desc: t('about_feat_2_desc'),
      icon: <FiTrendingUp className="w-8 h-8" />
    },
    {
      title: t('about_feat_3_title'),
      desc: t('about_feat_3_desc'),
      icon: <FiTarget className="w-8 h-8" />
    }
  ];

  return (
    <section dir={isRtl ? 'rtl' : 'ltr'} className="py-24 bg-white font-body">
      <div className="container mx-auto px-4 lg:px-12">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`}>

          {/* Text Content */}
          <div className={`space-y-8 ${isRtl ? 'order-last lg:order-first' : ''}`}>
            <div>
              <span className="text-primary-600 font-bold uppercase tracking-widest text-xs mb-2 block">{t('legacy')}</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 leading-tight">
                {t('welcome_title_1')} <span className="text-primary-600">{t('welcome_title_2')}</span> {t('welcome_title_3')}
              </h2>
            </div>

            <p className="text-slate-500 leading-relaxed text-lg">
              {t('about_desc')}
            </p>

            <div className="space-y-6">
              {achievements.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center text-primary-600">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link to="/about">
                <button className="px-8 py-3 bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors uppercase tracking-wide text-sm rounded-sm">
                  {t('learn_more')}
                </button>
              </Link>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative">
            <div className="relative rounded-sm overflow-hidden shadow-lg border border-slate-200">
              <img
                src={imgElsarh}
                alt="About El Sarh"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* Simple Achievement Box */}
            <div className={`absolute bottom-8 ${isRtl ? 'left-8' : 'right-8'} bg-primary-600 p-6 shadow-xl rounded-sm text-white max-w-xs`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black">20+</span>
                <div>
                  <h4 className="font-bold leading-non uppercase tracking-wide text-sm">{t('years_exp_title')}</h4>
                  <p className="text-primary-100 text-xs mt-1">{t('years_exp_desc')}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
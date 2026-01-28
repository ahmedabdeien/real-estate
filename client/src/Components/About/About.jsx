import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";
import { useTranslation } from 'react-i18next';
import { Building, Award, ShieldCheck, Users, Target, Rocket } from 'lucide-react';
import TeamMembers from './TeamMembers';

const About = () => {
  const { t } = useTranslation();
  const [activeVision, setActiveVision] = useState(0);

  const visions = [
    {
      title: t('vision_tab') || "رؤيتنا",
      desc: t('vision_desc') || "أن نكون المطور العقاري الأكثر ثقة وابتكاراً في مصر، من خلال تقديم مجتمعات سكنية وتجارية تتجاوز التوقعات.",
      icon: <Target className="w-12 h-12 text-primary-600" />
    },
    {
      title: t('mission_tab') || "رسالتنا",
      desc: t('mission_desc') || "تحويل الأحلام إلى واقع ملموس من خلال التميز في التصميم، الالتزام بالجودة، والشفافية مع شركاء النجاح.",
      icon: <Rocket className="w-12 h-12 text-primary-600" />
    }
  ];

  return (
    <div dir="rtl" className="bg-[var(--background)] transition-colors duration-500 overflow-hidden">
      <Helmet>
        <title>{t('about_us') || 'عن الصرح'} | {t('experience_20_years') || 'خبرة 20 عاماً في الاستثمار العقاري'}</title>
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Real Estate Building"
          />
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>

        <div className="container relative z-10 text-center px-6">
          <span className="inline-block px-4 py-1 bg-primary-600 text-white rounded-none text-[10px] font-black tracking-widest mb-6">
            {t('history_of_achievement') || 'تاريخ من الإنجاز'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 font-heading uppercase">
            {t('site_name_long') || 'شركة الصرح للاستثمار العقاري'}
          </h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium">
            {t('about_hero_desc') || 'أكثر من عقدين من التميز في صياغة الفخامة والابتكار في قلب السوق العقاري المصري.'}
          </p>
        </div>
      </section>

      {/* Core Story */}
      <section className="py-20 container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-4">
              <div className="w-8 h-1 bg-primary-600 rounded-none" />
              <span className="text-primary-600 font-black uppercase tracking-widest text-xs">{t('our_story') || 'قصتنا'}</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[var(--foreground)] leading-tight font-heading">
              {t('about_story_title') || 'خبراتنا ممتدة منذ عام 2004'}
            </h2>
            <p className="text-base text-[var(--muted-foreground)] leading-relaxed text-justify">
              {t('about_story_desc') || 'تأسست شركة الصرح برؤية طموحة لمواكبة النهضة العمرانية في مصر. نحن نؤمن بأن العقار ليس مجرد جدران، بل هو قيمة استثمارية وإنسانية. نعتمد في مشاريعنا على أفضل الدراسات الهندسية وأحدث التكنولوجيا العالمية لنقدم لعملائنا مساحات حياة متكاملة.'}
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="p-6 bg-[var(--card)] rounded-none border border-[var(--border)]">
                <p className="text-3xl font-black text-primary mb-1">+20</p>
                <p className="text-xs font-bold text-[var(--muted-foreground)]">{t('years_of_experience') || 'عاماً من الخبرة'}</p>
              </div>
              <div className="p-6 bg-[var(--card)] rounded-none border border-[var(--border)]">
                <p className="text-3xl font-black text-primary mb-1">+50</p>
                <p className="text-xs font-bold text-[var(--muted-foreground)]">{t('successful_projects') || 'مشروع ناجح'}</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069"
              className="rounded-none shadow-lg w-full h-[400px] object-cover"
              alt="Office"
            />
          </div>
        </div>
      </section>

      {/* Vision & Mission Tabs */}
      <section className="bg-slate-900 py-24">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2 space-y-10">
              <div className="flex gap-3">
                {visions.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveVision(i)}
                    className={`px-8 py-2.5 rounded-none font-black text-xs transition-all ${activeVision === i
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-none inline-block">
                  {visions[activeVision].icon}
                </div>
                <h3 className="text-3xl font-black text-white font-heading">
                  {visions[activeVision].title} {t('site_name') || 'شركة الصرح'}
                </h3>
                <p className="text-lg text-slate-400 leading-relaxed">
                  {visions[activeVision].desc}
                </p>
              </div>
            </div>
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="p-8 bg-white/5 rounded-none border border-white/10 backdrop-blur-sm">
                  <ShieldCheck className="text-primary mb-4" size={32} />
                  <h4 className="text-white font-bold text-sm mb-1">{t('security_and_trust') || 'الأمان والثقة'}</h4>
                  <p className="text-[11px] text-slate-400">{t('security_desc') || 'نلتزم بأعلى معايير السلامة والأمان القانوني.'}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-none border border-white/10 backdrop-blur-sm">
                  <Award className="text-primary mb-4" size={32} />
                  <h4 className="text-white font-bold text-sm mb-1">{t('quality') || 'الجودة'}</h4>
                  <p className="text-[11px] text-slate-400">{t('quality_desc') || 'جودة البناء هي أساس سمعتنا الموثوقة.'}</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="p-8 bg-white/5 rounded-none border border-white/10 backdrop-blur-sm">
                  <Building className="text-primary mb-4" size={32} />
                  <h4 className="text-white font-bold text-sm mb-1">{t('sustainability') || 'الاستدامة'}</h4>
                  <p className="text-[11px] text-slate-400">{t('sustainability_desc') || 'تصاميم صديقة للبيئة تضمن كفاءة الطاقة.'}</p>
                </div>
                <div className="p-8 bg-white/5 rounded-none border border-white/10 backdrop-blur-sm">
                  <Users className="text-primary mb-4" size={32} />
                  <h4 className="text-white font-bold text-sm mb-1">{t('customer_first') || 'العميل أولاً'}</h4>
                  <p className="text-[11px] text-slate-400">{t('customer_desc') || 'رضا عملائنا هو المحرك الأساسي لقراراتنا.'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 container mx-auto px-6 lg:px-12 text-center">
        <span className="text-primary-600 font-black uppercase text-[10px] tracking-widest">{t('excellence_team') || 'فريق التميز'}</span>
        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mt-4 mb-16 font-heading">{t('leadership_title') || 'القيادة خلف نجاحاتنا'}</h2>
        <TeamMembers />
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center relative overflow-hidden bg-[var(--accent)] transition-colors duration-500">
        <h2 className="text-2xl md:text-4xl font-black text-[var(--foreground)] mb-6 font-heading uppercase">
          {t('ready_to_be_part') || 'هل أنت مستعد لتكون جزءاً من قصتنا؟'}
        </h2>
        <p className="text-lg text-[var(--muted-foreground)] mb-10 max-w-2xl mx-auto font-medium">
          {t('contact_cta_desc') || 'تواصل معنا اليوم لمناقشة فرص الاستثمار العقاري المتاحة والمستقبلية.'}
        </p>
        <Link to="/contact">
          <button className="px-12 py-4 bg-primary text-white font-black rounded-none hover:bg-primary-dark transition-all shadow-lg uppercase tracking-widest text-sm">
            {t('contact_us_now') || 'تواصل معنا الآن'}
          </button>
        </Link>
      </section>
    </div>
  );
};

export default About;
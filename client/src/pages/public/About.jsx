import { useEffect } from "react";
import { motion } from "framer-motion";

import { useCms } from "../../hooks/useCms";
import PageHero from "../../Components/shared/PageHero";
import SectionHeader from "../../Components/shared/SectionHeader";

export default function AboutPage() {
  useEffect(() => { document.title = "عن الشركة | الصرح للتطوير العقاري"; }, []);
  const { data: content } = useCms("about", {
    title_ar: "عن الصرح للتطوير العقاري",
    body_ar: "الصرح للتطوير العقاري شركة رائدة في مجال التطوير العقاري، تأسست بهدف تقديم أفضل الوحدات السكنية والتجارية بأعلى معايير الجودة وأسعار تنافسية. نؤمن بأن كل عائلة تستحق بيتاً يليق بها.",
    vision_ar: "أن نكون الخيار الأول للتطوير العقاري في مصر، من خلال تقديم مشاريع مبتكرة تلبي تطلعات العملاء وتساهم في بناء مجتمعات متكاملة.",
    mission_ar: "تقديم حلول عقارية متكاملة تجمع بين الجودة والابتكار وخدمة العملاء الاستثنائية، مع الحفاظ على أعلى معايير الشفافية والمصداقية.",
    image: "",
  });
  const { data: stats } = useCms("stats", {
    projects_count: "50+",
    units_count: "2000+",
    clients_count: "5000+",
    years_experience: "15+",
  });

  const { data: hero } = useCms("about_hero", {
    title_ar: "",
    subtitle_ar: "شركة رائدة في مجال التطوير العقاري",
    hero_image: "",
  });

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Hero */}
      <PageHero
        title={hero.title_ar || content.title_ar}
        subtitle={hero.subtitle_ar}
        badge="الصرح للتطوير العقاري"
        image={hero.hero_image}
      />

      {/* Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[var(--primary)] font-semibold text-sm uppercase tracking-widest">قصتنا</span>
              <h2 className="text-3xl font-black text-gray-900 mt-2 mb-5">
                {content.founded_year ? `منذ عام ${content.founded_year}` : "رواد في عالم العقارات"}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {content.body_ar}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "مشروع", value: stats.projects_count },
                  { label: "وحدة سكنية", value: stats.units_count },
                  { label: "عملاء", value: stats.clients_count },
                  { label: "سنة خبرة", value: stats.years_experience },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f8fafc] rounded-xl p-4">
                    <p className="text-3xl font-black text-[var(--primary)]">{value}</p>
                    <p className="text-gray-500 text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {content.image ? (
                <img src={content.image} alt="الصرح للتطوير العقاري" className="rounded-2xl w-full h-80 object-cover shadow-xl" />
              ) : (
                <div className="rounded-2xl w-full h-80 flex items-center justify-center shadow-xl" style={{ background: "linear-gradient(to bottom right, var(--primary), var(--primary-dark))" }}>
                  <FaBuilding className="w-24 h-24 text-white/30" />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-5">
                <FaEye className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">رؤيتنا</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.vision_ar}
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-5">
                <Target className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">رسالتنا</h3>
              <p className="text-gray-600 leading-relaxed">
                {content.mission_ar}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16" style={{ background: "var(--primary)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">قيمنا الأساسية</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل مشروع" },
              { icon: Users, title: "خدمة العملاء", desc: "عملاؤنا في قلب كل قرار نتخذه" },
              { icon: Building2, title: "الابتكار", desc: "نستمر في تطوير حلول عقارية مبتكرة" },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-center bg-white/10 backdrop-blur rounded-2xl p-6">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                <p className="text-white/70 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

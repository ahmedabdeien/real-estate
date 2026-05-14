import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShield, FiTrendingUp, FiTarget, FiAward, FiUsers, FiHome } from 'react-icons/fi';

const features = [
  { icon: FiShield,     title: 'أمان استثنائي',  desc: 'نطبق أعلى معايير السلامة والجودة العالمية في كل مشروع.' },
  { icon: FiTrendingUp, title: 'نمو مستدام',     desc: 'رؤية استراتيجية تضمن أفضل عائد استثماري على المدى البعيد.' },
  { icon: FiTarget,     title: 'دقة التنفيذ',    desc: 'التزام راسخ بالموعد المحدد والمواصفات الفنية المتفق عليها.' },
];

export default function AboutHome() {
  const { config } = useSelector(s => s.config);

  const badge      = config?.about?.badge             || 'إرث يمتد منذ 2004';
  const title      = config?.about?.title?.ar         || 'رؤية عقارية تتجاوز الحدود';
  const desc       = config?.about?.description?.ar   || 'منذ انطلاقتنا في عام 2004، أعدنا تعريف مفهوم السكن الفاخر في مصر، وبنينا مئات الوحدات بتميز وأمان يفوق التوقعات.';
  const experience = config?.stats?.experience        || '20+';
  const projects   = config?.stats?.projects          || '150+';
  const clients    = config?.stats?.clients           || '500+';
  const units      = config?.stats?.units             || '1000+';

  const stats = [
    { number: experience, label: 'عاماً من الخبرة',   icon: FiAward },
    { number: projects,   label: 'مشروع منجز',        icon: FiHome },
    { number: clients,    label: 'عميل راضٍ',          icon: FiUsers },
    { number: units,      label: 'وحدة مسلمة',         icon: FiShield },
  ];

  return (
    <section
      dir="rtl"
      className="py-16 md:py-24"
      style={{ background: 'white' }}
    >
      <div className="container mx-auto px-4 lg:px-12">

        {/* Section label */}
        <motion.div
          className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ width: 3, height: 24, background: '#8A6924', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: '#8A6924', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {badge}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Text column ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl font-black leading-snug mb-5"
              style={{ color: '#12283C' }}
            >
              {title}
            </h2>
            <p
              className="text-sm leading-loose mb-8"
              style={{ color: '#374151', lineHeight: 1.9 }}
            >
              {desc}
            </p>

            {/* Feature checklist */}
            <div className="space-y-3 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-3 p-4"
                  style={{
                    background: '#fafafa',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: 'rgba(138,105,36,0.1)',
                      border: '1px solid rgba(138,105,36,0.2)',
                    }}
                  >
                    <f.icon size={17} style={{ color: '#8A6924' }} />
                  </div>
                  <div>
                    <h4 className="font-black text-sm mb-0.5" style={{ color: '#12283C' }}>{f.title}</h4>
                    <p className="text-xs" style={{ color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <Link to="/About">
              <button
                className="px-7 py-3 text-sm font-black tracking-wide transition-all duration-200 hover:opacity-90"
                style={{
                  background: '#8A6924',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(138,105,36,0.3)',
                }}
              >
                اكتشف قصتنا
              </button>
            </Link>
          </motion.div>

          {/* ── Stats grid column ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                  className="flex flex-col items-center text-center p-6"
                  style={{
                    background: i % 2 === 0 ? '#fafafa' : 'white',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    borderTop: '3px solid #8A6924',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(138,105,36,0.1)',
                      marginBottom: 10,
                    }}
                  >
                    <s.icon size={18} style={{ color: '#8A6924' }} />
                  </div>
                  <span
                    className="text-3xl font-black"
                    style={{ color: '#12283C', lineHeight: 1 }}
                  >
                    {s.number}
                  </span>
                  <div
                    style={{
                      width: 28,
                      height: 2,
                      background: 'linear-gradient(to right, #8A6924, #DFBA6B)',
                      margin: '8px auto',
                    }}
                  />
                  <span className="text-xs font-bold" style={{ color: '#6b7280' }}>
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

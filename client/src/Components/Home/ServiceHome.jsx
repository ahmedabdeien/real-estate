import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow, BsArrowLeft } from 'react-icons/bs';

const serviceIcons = [BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow];
const serviceKeys = ['service_1', 'service_2', 'service_3', 'service_4'];

const defaultTitles = ['تطوير عقاري متكامل', 'استشارات قانونية', 'إدارة المرافق', 'استثمار ذكي'];
const defaultDescs  = [
  'إدارة شاملة للمشروع من الفكرة حتى التسليم بأعلى معايير الجودة.',
  'ضمان أمان استثماراتك وشفافية كاملة في جميع التعاقدات.',
  'خدمات صيانة وإدارة متكاملة تضمن الحفاظ على قيمة عقارك.',
  'فرص استثمارية مدروسة تحقق أعلى العوائد بأقل المخاطر.',
];

export default function ServiceHome() {
  const { config } = useSelector(s => s.config);

  const services = serviceIcons.map((icon, i) => {
    const cfgKey  = `s${i + 1}`;
    const cfgItem = config?.services?.[cfgKey];
    return {
      icon,
      title: cfgItem?.title || defaultTitles[i],
      desc:  cfgItem?.desc  || defaultDescs[i],
    };
  });

  return (
    <section
      dir="rtl"
      id="services"
      className="py-16 md:py-24"
      style={{ background: '#faf8f4' }}
    >
      <div className="container mx-auto px-4 lg:px-12">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div style={{ width: 3, height: 24, background: '#8A6924', flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#8A6924',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                خدمات عالمية المستوى
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black" style={{ color: '#12283C' }}>
              حلول عقارية متكاملة
            </h2>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              نقدم لك كل ما تحتاجه تحت سقف واحد
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/Contact">
              <button
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-black transition-all duration-200 hover:opacity-90"
                style={{
                  background: '#12283C',
                  color: '#DFBA6B',
                  border: 'none',
                }}
              >
                <span>احصل على استشارة مجانية</span>
                <BsArrowLeft size={13} />
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-6 transition-all duration-300 cursor-default hover:-translate-y-1"
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07)';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              {/* Icon */}
              <div
                className="w-12 h-12 flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(138,105,36,0.1)',
                  border: '1px solid rgba(138,105,36,0.2)',
                }}
              >
                <s.icon size={22} style={{ color: '#8A6924' }} />
              </div>

              {/* Gold accent line */}
              <div
                style={{
                  height: 2,
                  width: 32,
                  background: 'linear-gradient(to left, #8A6924, #DFBA6B)',
                  marginBottom: 14,
                  transition: 'width 0.3s ease',
                }}
              />

              {/* Title */}
              <h3 className="text-sm font-black mb-2" style={{ color: '#12283C' }}>
                {s.title}
              </h3>

              {/* Description */}
              <p className="text-xs leading-relaxed" style={{ color: '#6b7280', lineHeight: 1.8 }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

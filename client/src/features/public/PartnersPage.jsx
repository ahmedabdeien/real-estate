import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CmsPage from '../../components/cms/CmsPage';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import {
  FaHandshake, FaRocket, FaChartLine, FaGlobe,
  FaUsers, FaBuilding, FaArrowLeft, FaCircleCheck,
} from 'react-icons/fa6';

const P = '#c8161d';
const A = '#fbb140';

const PARTNER_TIERS = [
  {
    name: 'شريك استراتيجي',
    color: A,
    bg: '#fffbeb',
    border: '#fde68a',
    icon: FaRocket,
    desc: 'أعلى مستوى من الشراكة مع دعم مخصص وأولوية في المميزات',
    perks: ['دعم مخصص 24/7', 'White-label كامل', 'حصة من الإيرادات', 'شارة شريك استراتيجي'],
    partners: ['شركة الأمجاد العقارية', 'مجموعة سيتي تاور', 'العقارية للتطوير'],
  },
  {
    name: 'شريك موثوق',
    color: P,
    bg: '#fff5f5',
    border: '#fecaca',
    icon: FaBuilding,
    desc: 'شراكة متوسطة مع مزايا تسويقية ودعم تقني مميز',
    perks: ['دعم أولوي', 'API موسّع', 'تدريب مجاني', 'شارة شريك موثوق'],
    partners: ['نيو كايرو للعقارات', 'ريد سي ديفلوبمنت', 'كابيتال هايتس'],
  },
  {
    name: 'شريك معتمد',
    color: '#6b7280',
    bg: '#f9fafb',
    border: '#e5e7eb',
    icon: FaUsers,
    desc: 'مستوى الدخول للشراكة مع فرص نمو ومزايا أساسية',
    perks: ['دعم عبر البريد', 'Commission 20%', 'مواد تسويقية', 'شارة شريك معتمد'],
    partners: ['البنيان للعقارات', 'سكاي لاين', 'جولدن جيت'],
  },
];

const BENEFITS = [
  { icon: FaChartLine, title: 'عمولة مجزية',    desc: 'احصل على عمولة تصل لـ 30% على كل اشتراك تجلبه لنا' },
  { icon: FaGlobe,    title: 'تسويق مشترك',    desc: 'نروّج لشركتك على موقعنا وفي حملاتنا التسويقية' },
  { icon: FaRocket,   title: 'دعم تقني مميز',  desc: 'فريق متخصص لمساعدتك في الدمج والتكامل' },
  { icon: FaUsers,    title: 'مجتمع الشركاء',  desc: 'انضم لمجتمع من أفضل شركات القطاع العقاري' },
];

const StaticPartnersContent = () => (
  <>
    <PageHero
      tag="برنامج الشركاء"
      title="برنامج الشركاء"
      subtitle="انضم لشبكة شركاء EgyEstate وابنِ عملاً مربحاً باستخدام أقوى منصة لإدارة العقارات في العالم العربي"
      actions={<>
        <Link to="/contact" className="px-8 py-3 rounded-xl font-bold text-white text-sm" style={{ background: P }}>انضم كشريك</Link>
        <a href="#tiers" className="px-8 py-3 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>تعرف على الباقات</a>
      </>}
    />
    {/* Stats */}
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[
          { value: '150+', label: 'شريك نشط' },
          { value: '30%', label: 'أقصى عمولة' },
          { value: '48h', label: 'وقت الموافقة' },
          { value: '#1', label: 'في السوق العربي' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <p className="text-4xl font-black mb-1" style={{ color: P }}>{s.value}</p>
            <p className="text-sm" style={{ color: '#6b7280' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Benefits */}
    <section className="py-16 px-4" style={{ background: '#fafafa' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3" style={{ color: '#1a1a1a' }}>لماذا تصبح شريكاً؟</h2>
          <p className="text-base" style={{ color: '#6b7280' }}>نوفر لك كل ما تحتاجه للنجاح</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BENEFITS.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex gap-4 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${P}10`, color: P }}>
                <b.icon className="text-lg" />
              </div>
              <div>
                <h3 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>{b.title}</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Tiers */}
    <section id="tiers" className="py-16 px-4" style={{ background: '#fff' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3" style={{ color: '#1a1a1a' }}>مستويات الشراكة</h2>
          <p className="text-base" style={{ color: '#6b7280' }}>اختر المستوى المناسب لحجم عملك</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARTNER_TIERS.map((tier, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              className="rounded-2xl p-6 border-2 flex flex-col"
              style={{ borderColor: tier.border, background: tier.bg }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${tier.color}20`, color: tier.color }}>
                <tier.icon className="text-lg" />
              </div>
              <h3 className="font-black text-lg mb-1" style={{ color: '#1a1a1a' }}>{tier.name}</h3>
              <p className="text-sm mb-5" style={{ color: '#6b7280' }}>{tier.desc}</p>
              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.perks.map((p, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                    <FaCircleCheck className="text-xs flex-shrink-0" style={{ color: tier.color }} />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="border-t pt-4 mt-auto" style={{ borderColor: tier.border }}>
                <p className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>شركاء حاليون</p>
                {tier.partners.map((name, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs mb-1.5" style={{ color: '#374151' }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: `${tier.color}30` }} />
                    {name}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20 px-4 text-center text-white relative overflow-hidden"
      style={{ background: '#c8161d' }}>
      <h2 className="text-3xl font-black mb-4">جاهز للانضمام؟</h2>
      <p className="text-white/70 mb-8">أرسل لنا طلبك وسيتواصل معك فريقنا خلال 48 ساعة</p>
      <Link to="/contact"
        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm"
        style={{ background: A, color: '#1a1a1a' }}>
        <FaArrowLeft />
        تقدم بطلب الشراكة
      </Link>
    </section>
  </>
);

const PartnersPage = () => (
  <CmsPage pageKey="partners" fallback={<StaticPartnersContent />} />
);

export default PartnersPage;

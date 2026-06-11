import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CmsPage from '../../components/cms/CmsPage';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import {
  FaWhatsapp, FaGoogle, FaMeta, FaStripe, FaSlack, FaGithub,
  FaEnvelope, FaChartBar, FaCode, FaCircleCheck, FaArrowLeft, FaMagnifyingGlass,
  FaPlug, FaRocket, FaShield,
} from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const P = '#c8161d';
const A = '#fbb140';

const CATEGORIES = ['الكل', 'تواصل', 'مدفوعات', 'تحليلات', 'تطوير', 'تسويق'];

const INTEGRATIONS = [
  {
    name: 'WhatsApp Business',
    icon: FaWhatsapp,
    color: '#25d366',
    category: 'تواصل',
    status: 'متوفر',
    desc: 'أرسل تنبيهات الأقساط وإشعارات العقود تلقائياً عبر WhatsApp',
    features: ['إشعارات تلقائية', 'قوالب رسائل', 'تحقق الرقم', 'تتبع الإرسال'],
  },
  {
    name: 'Google Analytics',
    icon: FaGoogle,
    color: '#4285f4',
    category: 'تحليلات',
    status: 'متوفر',
    desc: 'تتبع سلوك الزوار على الموقع التسويقي وحلّل مسار التحويل',
    features: ['تتبع الأحداث', 'تقارير مخصصة', 'Conversion tracking', 'Real-time data'],
  },
  {
    name: 'Stripe',
    icon: FaStripe,
    color: '#6772e5',
    category: 'مدفوعات',
    status: 'قريباً',
    desc: 'استقبل مدفوعات الأقساط أونلاين مباشرة من داخل النظام',
    features: ['Visa / Mastercard', 'Apple Pay', 'فواتير تلقائية', 'Webhooks'],
  },
  {
    name: 'Meta Ads',
    icon: FaMeta,
    color: '#0866ff',
    category: 'تسويق',
    status: 'قريباً',
    desc: 'ربط حملاتك الإعلانية على Facebook و Instagram مع بياناتك العقارية',
    features: ['Custom audiences', 'Pixel tracking', 'Lead ads sync', 'Retargeting'],
  },
  {
    name: 'Slack',
    icon: FaSlack,
    color: '#4a154b',
    category: 'تواصل',
    status: 'متوفر',
    desc: 'استقبل إشعارات النظام وتنبيهات الفريق مباشرة في Slack',
    features: ['إشعارات العقود', 'تنبيهات الأقساط', 'Slash commands', 'Bot مخصص'],
  },
  {
    name: 'REST API',
    icon: FaCode,
    color: '#374151',
    category: 'تطوير',
    status: 'متوفر',
    desc: 'API كامل موثّق لدمج EgyEstate مع أي نظام خارجي أو تطبيق مخصص',
    features: ['JWT authentication', 'Rate limiting', 'Webhooks', 'Sandbox mode'],
  },
  {
    name: 'GitHub Actions',
    icon: FaGithub,
    color: '#24292e',
    category: 'تطوير',
    status: 'متوفر',
    desc: 'أتمتة نشر التطبيق واختبارات CI/CD مع GitHub Actions',
    features: ['Auto deploy', 'Test pipelines', 'Env secrets', 'Status badges'],
  },
  {
    name: 'Mailchimp',
    icon: FaEnvelope,
    color: '#ffe01b',
    category: 'تسويق',
    status: 'قريباً',
    desc: 'أرسل نشرات بريدية مخصصة للعملاء المحتملين وحافظ على التواصل',
    features: ['قوائم بريدية', 'Automation', 'A/B testing', 'Analytics'],
  },
  {
    name: 'Power BI',
    icon: FaChartBar,
    color: '#f2c811',
    category: 'تحليلات',
    status: 'قريباً',
    desc: 'صدّر بياناتك إلى Power BI لبناء لوحات تحليلية احترافية',
    features: ['Data connector', 'Auto refresh', 'Dashboards', 'Sharing'],
  },
];

const StaticIntegrationsContent = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('الكل');

  const filtered = INTEGRATIONS.filter(i =>
    (cat === 'الكل' || i.category === cat) &&
    (search === '' || i.name.toLowerCase().includes(search.toLowerCase()) || i.desc.includes(search))
  );

  return (
    <>
      <PageHero
        tag="التكاملات"
        title="التكاملات والإضافات"
        subtitle="اربط EgyEstate مع أدواتك المفضلة وأتمت سير العمل بالكامل"
      />

      {/* Filter + Search */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن تكامل..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
              style={{ borderColor: '#e5e7eb', fontFamily: 'Tajawal, sans-serif' }}
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: cat === c ? P : '#f3f4f6',
                  color: cat === c ? '#fff' : '#6b7280',
                }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 px-4" style={{ background: '#fafafa' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((intg, i) => (
              <motion.div key={intg.name} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${intg.color}15`, color: intg.color }}>
                    <intg.icon className="text-xl" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: intg.status === 'متوفر' ? '#dcfce7' : '#fef3c7',
                      color: intg.status === 'متوفر' ? '#15803d' : '#d97706',
                    }}>
                    {intg.status}
                  </span>
                </div>
                <h3 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>{intg.name}</h3>
                <span className="text-xs mb-3 inline-block px-2 py-0.5 rounded"
                  style={{ background: '#f3f4f6', color: '#6b7280' }}>{intg.category}</span>
                <p className="text-sm leading-relaxed mb-4 flex-1" style={{ color: '#6b7280' }}>{intg.desc}</p>
                <ul className="space-y-1.5 mb-5">
                  {intg.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-xs" style={{ color: '#374151' }}>
                      <FaCircleCheck className="text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 mt-auto"
                  style={{
                    background: intg.status === 'متوفر' ? P : '#f3f4f6',
                    color: intg.status === 'متوفر' ? '#fff' : '#9ca3af',
                    cursor: intg.status === 'متوفر' ? 'pointer' : 'default',
                  }}>
                  {intg.status === 'متوفر' ? 'ربط التكامل' : 'قريباً'}
                </button>
              </motion.div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <FaPlug className="text-4xl mx-auto mb-3" style={{ color: '#e5e7eb' }} />
              <p style={{ color: '#9ca3af' }}>لا توجد نتائج لـ "{search}"</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA: request integration */}
      <section className="py-16 px-4 text-center" style={{ background: '#fff' }}>
        <h2 className="text-2xl font-black mb-3" style={{ color: '#1a1a1a' }}>لا تجد التكامل الذي تريده؟</h2>
        <p className="text-sm mb-6" style={{ color: '#6b7280' }}>أخبرنا بما تحتاجه وسنضيفه في قائمة الأولويات</p>
        <Link to="/contact"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: P }}>
          <FaArrowLeft />
          اطلب تكاملاً
        </Link>
      </section>
    </>
  );
};

const IntegrationsPage = () => (
  <CmsPage pageKey="integrations" fallback={<StaticIntegrationsContent />} />
);

export default IntegrationsPage;

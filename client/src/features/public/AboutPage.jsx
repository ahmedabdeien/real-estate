import React from 'react';
import CmsPage from '../../components/cms/CmsPage';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { Link } from 'react-router-dom';
import { FaRocket, FaUsers, FaBuilding, FaGlobe } from 'react-icons/fa6';

const PRIMARY = '#c8161d';
const ACCENT  = '#fbb140';

const team = [
  { name: 'أحمد عبد العزيز', role: 'المؤسس والرئيس التنفيذي', avatar: 'أ' },
  { name: 'محمد السيد', role: 'مدير التطوير التقني', avatar: 'م' },
  { name: 'سارة إبراهيم', role: 'مديرة نجاح العملاء', avatar: 'س' },
  { name: 'عمر خالد', role: 'مدير التسويق والنمو', avatar: 'ع' },
];

const stats = [
  { value: '2022', label: 'سنة التأسيس', icon: FaRocket },
  { value: '150+', label: 'شركة عقارية', icon: FaBuilding },
  { value: '12,000+', label: 'وحدة مُدارة', icon: FaGlobe },
  { value: '25+', label: 'عضو في الفريق', icon: FaUsers },
];

const StaticAboutContent = () => (
  <>
    <PageHero
      tag="من نحن"
      title="نبني مستقبل إدارة العقارات"
      subtitle="EgyEstate وُلد من تحدي حقيقي — شركات عقارية تعاني من تشتت البيانات وضعف المتابعة. قررنا بناء الحل الذي كنا نتمنى وجوده."
    />

    {/* Stats */}
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-5 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <div key={i}>
            <p className="text-4xl font-black mb-1" style={{ color: PRIMARY }}>{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Story */}
    <div className="max-w-4xl mx-auto px-5 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-black mb-4">قصتنا</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              بدأت EgyEstate عام 2022 عندما لاحظنا أن معظم شركات العقارات العربية تعتمد على Excel وWhatsApp لإدارة عقودها
              ومتابعة أقساطها — وهو ما يؤدي إلى خسارة آلاف الجنيهات في أقساط منسية ومعاملات غير موثقة.
            </p>
            <p>
              قررنا بناء منصة SaaS متكاملة تجمع إدارة المشاريع والوحدات والعملاء والمحاسبة في مكان واحد،
              مع واجهة عربية كاملة وتجربة مستخدم استثنائية.
            </p>
            <p>
              اليوم، تثق بنا أكثر من 150 شركة عقارية في مصر والخليج لإدارة أكثر من 12,000 وحدة سكنية وتجارية.
            </p>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#fef3cd', padding: '40px', textAlign: 'center' }}>
          <div className="text-6xl font-black mb-3" style={{ color: PRIMARY }}>E</div>
          <p className="font-bold text-2xl">EgyEstate</p>
          <p className="text-sm text-gray-500 mt-2">نظام إدارة العقارات الأول عربياً</p>
        </div>
      </div>
    </div>

    {/* Values */}
    <div style={{ background: '#f9f5f0' }} className="py-16">
      <div className="max-w-5xl mx-auto px-5">
        <h2 className="text-3xl font-black text-center mb-10">قيمنا</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'البساطة أولاً', desc: 'نؤمن أن البرنامج الجيد يجب أن يكون سهلاً وبديهياً دون الحاجة لتدريب طويل.' },
            { title: 'الموثوقية دائماً', desc: 'بياناتك أمانة عندنا — uptime 99.9% وحماية كاملة بأحدث معايير التشفير.' },
            { title: 'التطوير المستمر', desc: 'نصدر تحديثات أسبوعية بناءً على ملاحظات عملائنا — أنتم من يشكّل المنتج.' },
          ].map((v, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-white font-black text-lg"
                style={{ background: PRIMARY }}>{i + 1}</div>
              <h3 className="font-bold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Team */}
    <div className="max-w-5xl mx-auto px-5 py-16">
      <h2 className="text-3xl font-black text-center mb-10">فريقنا</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {team.map((m, i) => (
          <div key={i} className="text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black text-white"
              style={{ background: '#c8161d' }}>
              {m.avatar}
            </div>
            <p className="font-bold text-sm">{m.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{m.role}</p>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="text-center py-16 px-4 text-white" style={{ background: PRIMARY }}>
      <h2 className="text-3xl font-black mb-3">انضم إلينا اليوم</h2>
      <p className="text-white/70 mb-6">كن جزءاً من مجتمع شركات العقارات المتطورة</p>
      <Link to="/login"
        className="inline-block px-8 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
        style={{ background: ACCENT, color: '#fff' }}>
        ابدأ مجاناً
      </Link>
    </div>
  </>
);

const AboutPage = () => (
  <CmsPage pageKey="about" fallback={<StaticAboutContent />} />
);

export default AboutPage;

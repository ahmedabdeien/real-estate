import React from 'react';
import CmsPage from '../../components/cms/CmsPage';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { Link } from 'react-router-dom';
import {
  FaBuilding, FaFileContract, FaChartLine, FaUsers, FaBell,
  FaShield, FaComments, FaPalette, FaCalendarCheck, FaFileInvoice,
  FaMoneyBillWave, FaGlobe, FaRocket, FaCircleCheck
} from 'react-icons/fa6';

const PRIMARY = '#c8161d';

const features = [
  {
    icon: FaBuilding, title: 'إدارة المشاريع والوحدات',
    desc: 'تتبع كامل لجميع مشاريعك وحالة كل وحدة (متاحة، محجوزة، مباعة، مؤجرة) لحظة بلحظة مع grid تفاعلي.',
    items: ['خريطة الوحدات التفاعلية', 'تصفية حسب الحالة والسعر', 'تفاصيل كاملة لكل وحدة', 'تاريخ تسجيل التغييرات'],
  },
  {
    icon: FaFileContract, title: 'العقود والأقساط التلقائية',
    desc: 'إنشاء وإدارة عقود البيع والإيجار مع جدول أقساط تلقائي وتنبيهات استحقاق فورية.',
    items: ['توليد الأقساط تلقائياً', 'تنبيهات قبل الاستحقاق', 'تصدير العقود PDF', 'تتبع المدفوعات المرتبطة'],
  },
  {
    icon: FaChartLine, title: 'تقارير مالية متقدمة',
    desc: 'لوحة تحكم مالية شاملة مع مخططات تفاعلية لتحليل الإيرادات والمصروفات وصافي الربح.',
    items: ['مقارنة إيرادات شهرية', 'تقرير أرباح وخسائر', 'تصدير Excel و PDF', 'فلترة بالتاريخ والمشروع'],
  },
  {
    icon: FaUsers, title: 'إدارة العملاء CRM',
    desc: 'ملفات عملاء شاملة مع تاريخ كامل للتعاملات والمدفوعات وجميع العقود المرتبطة.',
    items: ['ملف عميل كامل', 'تاريخ المعاملات', 'إحصائيات الشراء', 'تصنيف وبحث متقدم'],
  },
  {
    icon: FaBell, title: 'إشعارات فورية',
    desc: 'نظام إشعارات real-time يُنبهك على الأقساط المستحقة وكل الأحداث المهمة في اللحظة.',
    items: ['Socket.IO real-time', 'تنبيهات الأقساط المتأخرة', 'إشعارات عقود جديدة', 'مركز إشعارات شامل'],
  },
  {
    icon: FaShield, title: 'صلاحيات RBAC متقدمة',
    desc: 'تحكم كامل في صلاحيات كل مستخدم مع أدوار مخصصة وحماية كاملة للبيانات.',
    items: ['أدوار مخصصة', 'صلاحيات granular', 'سجل عمليات كامل', 'عزل بيانات كل شركة'],
  },
  {
    icon: FaComments, title: 'تواصل داخلي',
    desc: 'نظام رسائل داخلية بين فريق العمل مع محادثات مباشرة وإشعارات فورية.',
    items: ['محادثات مباشرة', 'مجموعات الفريق', 'مرفقات الملفات', 'تاريخ المحادثات'],
  },
  {
    icon: FaPalette, title: 'تخصيص المظهر',
    desc: 'خصّص ألوان منصتك وهويتها البصرية بالكامل لتعكس هوية شركتك.',
    items: ['ألوان مخصصة', 'شعار الشركة', 'خطوط عربية', 'وضع ليلي/نهاري'],
  },
  {
    icon: FaGlobe, title: 'Multi-Tenant SaaS',
    desc: 'كل شركة لها بيئة معزولة تماماً مع بيانات منفصلة وإعدادات مستقلة.',
    items: ['عزل تام للبيانات', 'إدارة متعددة الشركات', 'باقات اشتراك مرنة', 'لوحة super admin'],
  },
];

const StaticFeaturesContent = () => (
  <>
    <PageHero
      tag="المميزات"
      title="كل ما تحتاجه لإدارة عقاراتك"
      subtitle="منصة EgyEstate مصممة بعناية لتلبية احتياجات شركات العقارات العربية من الصغيرة للكبيرة"
      actions={<Link to="/login" className="inline-block px-8 py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90" style={{ background: '#fbb140' }}>جرّب مجاناً 14 يوم</Link>}
    />

    {/* Features grid */}
    <div className="max-w-7xl mx-auto px-5 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4"
              style={{ background: '#c8161d' }}>
              <f.icon className="text-lg" />
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{f.desc}</p>
            <ul className="space-y-1.5">
              {f.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCircleCheck className="text-green-500 text-xs flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div className="text-center py-16 px-4" style={{ background: '#f9f5f0' }}>
      <h2 className="text-3xl font-black mb-3">مستعد للبدء؟</h2>
      <p className="text-gray-500 mb-6">ابدأ تجربتك المجانية الآن بدون بطاقة ائتمان</p>
      <Link to="/login"
        className="inline-block px-8 py-3 rounded-xl font-bold text-white text-sm"
        style={{ background: PRIMARY }}>
        ابدأ مجاناً
      </Link>
    </div>
  </>
);

const FeaturesPage = () => (
  <CmsPage pageKey="features" fallback={<StaticFeaturesContent />} />
);

export default FeaturesPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHeadset, FaMagnifyingGlass, FaChevronDown,
  FaBook, FaRocket, FaCity, FaFileContract, FaMoneyBillWave,
  FaUsers, FaChartLine, FaShield, FaWhatsapp,
} from 'react-icons/fa6';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';

const P = '#c8161d';
const A = '#fbb140';

const CATEGORIES = [
  { icon: FaRocket,        label: 'البداية السريعة',    count: 6 },
  { icon: FaCity,          label: 'المشاريع والوحدات',  count: 12 },
  { icon: FaFileContract,  label: 'العقود والأقساط',    count: 15 },
  { icon: FaMoneyBillWave, label: 'المحاسبة والمدفوعات',count: 10 },
  { icon: FaUsers,         label: 'المستخدمين والصلاحيات', count: 8 },
  { icon: FaChartLine,     label: 'التقارير والتصدير',  count: 7 },
  { icon: FaShield,        label: 'الأمان والخصوصية',   count: 5 },
  { icon: FaBook,          label: 'API والتكامل',       count: 9 },
];

const FAQS = [
  {
    q: 'كيف أبدأ استخدام EgyEstate؟',
    a: 'بعد تسجيل حسابك، ستُوجَّه لمعالج الإعداد الذي يأخذك خلال خطوات إنشاء شركتك، إضافة أول مشروع، وإعداد المستخدمين. العملية لا تستغرق أكثر من 10 دقائق.',
  },
  {
    q: 'كيف أضيف مشروعاً عقارياً جديداً؟',
    a: 'من القائمة الجانبية، اختر "المشاريع" ثم اضغط على "مشروع جديد". أدخل اسم المشروع، موقعه، وعدد الوحدات. يمكنك بعدها إضافة وحدات مفصّلة لكل مبنى أو طابق.',
  },
  {
    q: 'هل يمكنني استيراد بيانات من Excel؟',
    a: 'نعم! من صفحة كل قسم (مشاريع، عملاء، وحدات)، ستجد زر "استيراد". نوفر قالب Excel جاهز لتعبئته ورفعه. يدعم النظام استيراد آلاف السجلات دفعة واحدة.',
  },
  {
    q: 'كيف تعمل تذكيرات الأقساط على واتساب؟',
    a: 'يرسل النظام رسالة واتساب تلقائياً للعميل قبل موعد استحقاق القسط بـ 3 أيام وبـ يوم واحد. يمكنك تخصيص نص الرسالة من إعدادات الإشعارات. الخاصية تعمل مع رقم واتساب الشركة.',
  },
  {
    q: 'هل بياناتي آمنة؟',
    a: 'نعم تماماً. كل شركة معزولة تماماً عن الأخرى (Multi-Tenant Architecture). بياناتك مشفرة أثناء النقل والتخزين. نجري اختبارات أمان دورية ولدينا نسخ احتياطية يومية.',
  },
  {
    q: 'كيف أُضيف مستخدمين لفريقي؟',
    a: 'من "إعدادات الشركة" > "المستخدمون"، اضغط "إضافة مستخدم". أدخل البريد الإلكتروني وحدد الدور (مدير، محاسب، مبيعات، إلخ). سيصله بريد إلكتروني بدعوة التفعيل.',
  },
  {
    q: 'ما هي طرق الدفع المتاحة للاشتراك؟',
    a: 'نقبل بطاقات الفيزا وماستركارد، وخدمة فودافون كاش، وإنستاباي. للخطط المؤسسية يمكن الدفع بالتحويل البنكي. جميع المعاملات مشفرة وآمنة.',
  },
  {
    q: 'هل يمكنني تغيير خطتي الاشتراكية؟',
    a: 'يمكنك الترقية في أي وقت وستحصل فوراً على المميزات الجديدة. يُحتسب الفرق بالأيام المتبقية من الاشتراك الحالي. التخفيض ممكن ولكن يسري في دورة الفوترة التالية.',
  },
];

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-gray-900 text-sm leading-relaxed">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FaChevronDown className="text-gray-400 flex-shrink-0 text-sm" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-gray-50">
              <p className="text-gray-600 text-sm leading-[2] mt-4">{faq.a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [search, setSearch] = useState('');
  const filtered = FAQS.filter(f =>
    f.q.includes(search) || f.a.includes(search)
  );

  return (
    <PublicLayout>
      <PageHero tag="مركز المساعدة" title="كيف يمكننا مساعدتك؟" subtitle="تصفح المقالات أو ابحث عن إجابة سؤالك" />
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 py-5 px-5">
        <div className="max-w-xl mx-auto relative">
          <FaMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في المقالات..."
            className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-sm focus:outline-none focus:border-red-400 transition-colors"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-12">
        {/* Categories */}
        {!search && (
          <div className="mb-14">
            <h2 className="text-xl font-black text-gray-900 mb-6">تصفح حسب الموضوع</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((c, i) => (
                <button key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-right hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${P}10` }}>
                    <c.icon className="text-base" style={{ color: P }} />
                  </div>
                  <p className="font-bold text-sm text-gray-900 mb-1">{c.label}</p>
                  <p className="text-xs text-gray-400">{c.count} مقالة</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FAQs */}
        <div className="mb-14">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            {search ? `نتائج البحث عن "${search}"` : 'الأسئلة الشائعة'}
          </h2>
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((f, i) => <FaqItem key={i} faq={f} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FaMagnifyingGlass className="text-3xl mx-auto mb-3 opacity-30" />
              <p>لم نجد نتائج لبحثك. جرّب كلمات مختلفة.</p>
            </div>
          )}
        </div>

        {/* Contact support */}
        <div className="rounded-3xl p-8 md:p-10 text-center" style={{ background: '#fef9ee', border: `1px solid ${P}15` }}>
          <h3 className="text-2xl font-black text-gray-900 mb-2">لم تجد إجابتك؟</h3>
          <p className="text-gray-500 mb-6">فريق الدعم متاح 24/7 لمساعدتك</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="mailto:support@egyestate.com"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
              style={{ background: P }}>
              <FaHeadset className="text-sm" />
              راسل فريق الدعم
            </a>
            <a href="https://wa.me/201000000000"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border"
              style={{ color: '#16a34a', borderColor: '#16a34a20', background: '#f0fdf4' }}>
              <FaWhatsapp className="text-sm" />
              واتساب الدعم
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBriefcase, FaLocationDot, FaClock,
  FaArrowLeft, FaLaptopCode, FaMobileScreen, FaPalette,
  FaChartLine, FaHeadset, FaMoneyBillWave,
} from 'react-icons/fa6';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';

const P = '#c8161d';
const A = '#fbb140';

const JOBS = [
  {
    id: 1, title: 'مطور Backend Node.js', dept: 'هندسة البرمجيات', type: 'دوام كامل', location: 'القاهرة / ريموت',
    icon: FaLaptopCode, color: '#1d4ed8',
    desc: 'نبحث عن مطور Backend متمرس ببناء APIs قابلة للتوسع باستخدام Node.js و Express و MongoDB. خبرة بـ Socket.IO وأنظمة المصادقة JWT تُعدّ ميزة.',
    reqs: ['3+ سنوات Node.js', 'خبرة MongoDB وSQL', 'REST API design', 'Docker أساسي'],
  },
  {
    id: 2, title: 'مطور Frontend React', dept: 'هندسة البرمجيات', type: 'دوام كامل', location: 'القاهرة / ريموت',
    icon: FaMobileScreen, color: '#7c3aed',
    desc: 'مطور Frontend شغوف ببناء واجهات مستخدم سريعة وجذابة. ستعمل على تطوير EgyEstate SaaS وتحسين تجربة أكثر من 150 شركة عقارية.',
    reqs: ['3+ سنوات React', 'TanStack Query', 'Tailwind CSS', 'RTL support'],
  },
  {
    id: 3, title: 'مصمم UI/UX', dept: 'التصميم', type: 'دوام كامل', location: 'القاهرة',
    icon: FaPalette, color: '#d97706',
    desc: 'مصمم موهوب يفهم احتياجات المستخدمين العرب ويترجمها لتجارب رقمية بديهية وجميلة. إتقان Figma وفهم عميق للـ Design Systems أمر أساسي.',
    reqs: ['Figma احترافي', 'Design Systems', 'User Research', 'Arabic RTL design'],
  },
  {
    id: 4, title: 'محلل أعمال عقارية', dept: 'المنتج', type: 'دوام كامل', location: 'القاهرة',
    icon: FaChartLine, color: '#15803d',
    desc: 'خبير بقطاع العقارات المصري يُساعد في ترجمة متطلبات السوق لمميزات منتج. ستعمل جسراً بين فريق المبيعات والعملاء وفريق التطوير.',
    reqs: ['خبرة عقارية 2+ سنة', 'تحليل البيانات', 'كتابة متطلبات', 'تواصل ممتاز'],
  },
  {
    id: 5, title: 'أخصائي دعم فني', dept: 'خدمة العملاء', type: 'دوام كامل', location: 'القاهرة / ريموت',
    icon: FaHeadset, color: '#0891b2',
    desc: 'نبحث عن شخص صبور ومتفاعل لتقديم الدعم الفني لعملائنا عبر البريد الإلكتروني والواتساب والمحادثة المباشرة. معرفة تقنية أساسية مطلوبة.',
    reqs: ['تواصل ممتاز', 'إتقان اللغة العربية', 'أساسيات تقنية', 'صبر واحتراف'],
  },
  {
    id: 6, title: 'مدير مبيعات B2B', dept: 'المبيعات', type: 'دوام كامل', location: 'القاهرة',
    icon: FaMoneyBillWave, color: '#be185d',
    desc: 'مدير مبيعات ذو خبرة في مبيعات SaaS أو قطاع العقارات. مسؤول عن اكتساب عملاء جدد وبناء علاقات طويلة الأمد مع الشركات العقارية.',
    reqs: ['خبرة مبيعات 3+ سنوات', 'B2B SaaS أو عقارات', 'شبكة علاقات', 'هدفية وطموح'],
  },
];

const BENEFITS = [
  { label: 'راتب تنافسي', desc: 'رواتب تنافسية مع مراجعة سنوية' },
  { label: 'ريموت مرن', desc: 'عمل من أي مكان + يوم في المكتب أسبوعياً' },
  { label: 'تأمين صحي', desc: 'تغطية صحية شاملة للموظف والأسرة' },
  { label: 'حصص الشركة', desc: 'ESOP — شارك في نجاح EgyEstate' },
  { label: 'تطوير مهني', desc: 'ميزانية سنوية للكورسات والكتب والمؤتمرات' },
  { label: 'إجازات مرنة', desc: '21 يوم سنوي + إجازات عيد وطارئة' },
];

export default function CareersPage() {
  const [selected, setSelected] = useState(null);

  return (
    <PublicLayout>
      <PageHero
        tag={`${JOBS.length} وظيفة متاحة`}
        title="انضم لفريق EgyEstate"
        subtitle="نبني مستقبل إدارة العقارات في العالم العربي. هل أنت جاهز تؤثر في حياة آلاف الشركات؟"
      />

      <div className="max-w-6xl mx-auto px-5 py-14">
        {/* Benefits */}
        <div className="mb-14">
          <h2 className="text-2xl font-black text-gray-900 mb-8">ليه EgyEstate؟</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="font-black text-sm mb-1" style={{ color: P }}>{b.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-8">الوظائف المتاحة</h2>
          <div className="space-y-4">
            {JOBS.map((job, i) => (
              <motion.div key={job.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(selected === job.id ? null : job.id)}>
                  <div className="flex items-center gap-4 p-6">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${job.color}12` }}>
                      <job.icon className="text-lg" style={{ color: job.color }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-3">
                        <span className="flex items-center gap-1 text-xs text-gray-400"><FaBriefcase className="text-[10px]" />{job.dept}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><FaClock className="text-[10px]" />{job.type}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><FaLocationDot className="text-[10px]" />{job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden md:block text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${job.color}12`, color: job.color }}>
                        {job.dept}
                      </span>
                      <button className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white"
                        style={{ background: P }}>
                        تقدّم الآن
                        <FaArrowLeft className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {selected === job.id && (
                    <div className="px-6 pb-6 border-t border-gray-50 pt-5">
                      <p className="text-gray-600 text-sm leading-[2] mb-4">{job.desc}</p>
                      <p className="font-bold text-sm text-gray-900 mb-2">المتطلبات:</p>
                      <ul className="grid grid-cols-2 gap-2">
                        {job.reqs.map((r, ri) => (
                          <li key={ri} className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: job.color }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5">
                        <a href={`mailto:careers@egyestate.com?subject=التقدم لوظيفة ${job.title}`}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
                          style={{ background: P }}>
                          أرسل CV الآن
                          <FaArrowLeft className="text-xs" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 rounded-3xl p-10 text-center border" style={{ background: `${P}06`, borderColor: `${P}15` }}>
          <h3 className="text-2xl font-black text-gray-900 mb-2">ما لاقيت الوظيفة المناسبة؟</h3>
          <p className="text-gray-500 mb-5">أرسل CV الخاص بك وسنتواصل معك عند توفر فرصة تناسبك.</p>
          <a href="mailto:careers@egyestate.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: P }}>
            careers@egyestate.com
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}

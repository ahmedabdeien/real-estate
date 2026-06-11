import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from './PublicLayout';
import {
  FaCircleCheck, FaCircleExclamation, FaCircleXmark,
  FaServer, FaDatabase, FaBell, FaGlobe, FaShield, FaClock,
} from 'react-icons/fa6';

const P = '#c8161d';

const SERVICES = [
  { name: 'API الرئيسي',           icon: FaServer,   status: 'operational', uptime: '99.98%' },
  { name: 'قاعدة البيانات',        icon: FaDatabase, status: 'operational', uptime: '99.99%' },
  { name: 'نظام الإشعارات',        icon: FaBell,     status: 'operational', uptime: '99.95%' },
  { name: 'الواجهة الأمامية (CDN)',  icon: FaGlobe,   status: 'operational', uptime: '100%'   },
  { name: 'نظام الدفع',            icon: FaShield,   status: 'operational', uptime: '99.97%' },
  { name: 'Socket.IO (Real-time)', icon: FaClock,    status: 'operational', uptime: '99.90%' },
];

const INCIDENTS = [
  {
    date: '8 يونيو 2026',
    title: 'بطء في الاستجابة — API',
    status: 'resolved',
    updates: [
      { time: '14:30', text: 'تم تحديد سبب المشكلة: ضغط زائد على قاعدة البيانات.' },
      { time: '15:10', text: 'تم تطبيق الحل وعودة الأداء للوضع الطبيعي.' },
      { time: '15:25', text: 'تم التحقق من استقرار الخدمة وإغلاق الحادثة.' },
    ],
  },
];

const STATUS_CONFIG = {
  operational:  { icon: FaCircleCheck,      color: '#16a34a', bg: '#dcfce7', label: 'يعمل بشكل طبيعي' },
  degraded:     { icon: FaCircleExclamation, color: '#d97706', bg: '#fef3c7', label: 'أداء متدهور' },
  outage:       { icon: FaCircleXmark,      color: '#dc2626', bg: '#fee2e2', label: 'خارج الخدمة' },
};

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const UptimeBar = ({ days = 90 }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: days }).map((_, i) => (
      <div key={i}
        className="h-7 flex-1 rounded-sm transition-opacity hover:opacity-70"
        style={{ background: i > 85 ? '#fef3c7' : '#dcfce7', border: '1px solid rgba(0,0,0,0.04)' }}
        title={`يوم ${i + 1}`}
      />
    ))}
  </div>
);

const StatusPage = () => {
  const [open, setOpen] = useState(null);
  const allOperational = SERVICES.every(s => s.status === 'operational');

  return (
    <PublicLayout>
      <PageHero
        title={allOperational ? 'جميع الأنظمة تعمل بشكل طبيعي' : 'بعض الأنظمة تواجه مشكلة'}
        subtitle={`آخر تحديث: ${new Date().toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'long' })}`}
        tag={allOperational ? 'متاح' : 'انقطاع جزئي'}
      />
      {/* Uptime badges */}
      <div className="bg-white border-b border-gray-100 py-5 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-center">
          {['اليوم', 'الأسبوع الماضي', 'آخر 30 يوم', 'آخر 90 يوم'].map((period, i) => (
            <div key={i} className="text-center rounded-xl px-5 py-3 border border-gray-100">
              <p className="font-black text-lg" style={{ color: '#15803d' }}>99.9{9 - i}%</p>
              <p className="text-gray-400 text-xs mt-0.5">{period}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-12">

        {/* Services */}
        <div className="mb-10">
          <h2 className="text-lg font-black mb-4" style={{ color: '#1a1a1a' }}>حالة الخدمات</h2>
          <div className="space-y-2">
            {SERVICES.map((svc, i) => {
              const cfg = STATUS_CONFIG[svc.status];
              const Icon = svc.icon;
              const StatusIcon = cfg.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 border border-gray-100">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${P}10`, color: P }}>
                    <Icon className="text-sm" />
                  </div>
                  <span className="font-semibold text-sm flex-1" style={{ color: '#1a1a1a' }}>{svc.name}</span>
                  <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>↑ {svc.uptime}</span>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                    style={{ background: cfg.bg }}>
                    <StatusIcon className="text-xs" style={{ color: cfg.color }} />
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Uptime history */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black" style={{ color: '#1a1a1a' }}>سجل التوفر — 90 يوم</h2>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#9ca3af' }}>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-green-200" /> طبيعي</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-yellow-200" /> تدهور</span>
            </div>
          </div>
          <UptimeBar days={90} />
          <div className="flex justify-between mt-2 text-xs" style={{ color: '#9ca3af' }}>
            <span>قبل 90 يوم</span>
            <span>اليوم</span>
          </div>
        </div>

        {/* Incidents */}
        <div>
          <h2 className="text-lg font-black mb-4" style={{ color: '#1a1a1a' }}>سجل الحوادث</h2>
          {INCIDENTS.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <FaCircleCheck className="text-4xl mx-auto mb-3 text-green-400" />
              <p className="text-sm" style={{ color: '#6b7280' }}>لا توجد حوادث مسجلة خلال آخر 30 يوم</p>
            </div>
          ) : INCIDENTS.map((inc, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              <button className="w-full flex items-center justify-between px-6 py-4 text-right"
                onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: '#dcfce7', color: '#15803d' }}>محلول</span>
                  <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{inc.title}</span>
                </div>
                <span className="text-xs" style={{ color: '#9ca3af' }}>{inc.date}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-gray-50">
                  <div className="mt-4 space-y-3">
                    {inc.updates.map((u, j) => (
                      <div key={j} className="flex gap-3 text-sm">
                        <span className="font-mono text-xs pt-0.5 flex-shrink-0" style={{ color: '#9ca3af' }}>{u.time}</span>
                        <p style={{ color: '#374151' }}>{u.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <div className="mt-10 text-center p-8 rounded-2xl border-2 border-dashed" style={{ borderColor: '#e5e7eb' }}>
          <FaBell className="text-2xl mx-auto mb-3" style={{ color: '#9ca3af' }} />
          <h3 className="font-bold mb-2" style={{ color: '#1a1a1a' }}>اشترك في تنبيهات الحالة</h3>
          <p className="text-sm mb-5" style={{ color: '#6b7280' }}>احصل على إشعار فوري عند حدوث أي مشكلة</p>
          <div className="flex gap-3 max-w-sm mx-auto" dir="rtl">
            <input type="email" placeholder="بريدك الإلكتروني"
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#e5e7eb', fontFamily: 'Tajawal, sans-serif' }} />
            <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: P }}>اشترك</button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default StatusPage;

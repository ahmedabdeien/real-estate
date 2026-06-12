import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaHouse } from 'react-icons/fa6';
import { useSelector } from 'react-redux';

const RED   = '#da1f27';
const GREEN = '#009756';
const DARK  = '#231f20';
const GOLD  = '#fbb140';

export default function NotFoundPage() {
  const navigate  = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#fafafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* Decorative bars */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
        {[RED, GREEN, GOLD, DARK].map((c, i) => (
          <motion.div key={i}
            initial={{ height: 0 }}
            animate={{ height: 48 + i * 14 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            style={{ width: 8, borderRadius: 4, background: c }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', maxWidth: 480 }}
      >
        <p style={{ fontSize: 120, fontWeight: 900, lineHeight: 1, color: DARK, letterSpacing: -4, margin: 0 }}>
          4<span style={{ color: RED }}>0</span>4
        </p>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: DARK, marginTop: 12 }}>
          الصفحة غير موجودة
        </h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8, lineHeight: 1.7 }}>
          يبدو أن الرابط الذي تبحث عنه لا يوجد أو تم نقله.<br />
          تحقق من الرابط أو عد للصفحة الرئيسية.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: 'white', color: DARK, border: `2px solid #e5e7eb`, cursor: 'pointer',
            }}
          >
            <FaArrowRight style={{ fontSize: 12 }} />
            الصفحة السابقة
          </button>

          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: RED, color: '#fff', textDecoration: 'none',
            }}
          >
            <FaHouse style={{ fontSize: 12 }} />
            {isAuthenticated ? 'لوحة التحكم' : 'الرئيسية'}
          </Link>
        </div>
      </motion.div>

      {/* Bottom accent */}
      <div style={{ display: 'flex', gap: 6, marginTop: 40 }}>
        {[DARK, GOLD, GREEN, RED].map((c, i) => (
          <motion.div key={i}
            initial={{ height: 0 }}
            animate={{ height: 48 + (3 - i) * 14 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: 'easeOut' }}
            style={{ width: 8, borderRadius: 4, background: c }}
          />
        ))}
      </div>
    </div>
  );
}

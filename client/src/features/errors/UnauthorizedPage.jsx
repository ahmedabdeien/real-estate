import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaShield, FaLock } from 'react-icons/fa6';
import { useSelector } from 'react-redux';

const RED  = '#da1f27';
const DARK = '#231f20';
const GOLD = '#fbb140';

export default function UnauthorizedPage() {
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const role      = user?.isSuperAdmin ? 'مشرف عام' : user?.role?.label || 'مستخدم';

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#fafafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        style={{
          background: '#fff', borderRadius: 20, padding: '48px 40px',
          boxShadow: '0 4px 32px rgba(35,31,32,0.08)',
          textAlign: 'center', maxWidth: 420, width: '100%',
          border: '1px solid #f0f0f0',
        }}
      >
        {/* Shield icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
          background: `${RED}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FaShield style={{ fontSize: 32, color: RED }} />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, color: DARK, margin: 0 }}>
          غير مصرح بالدخول
        </h1>

        <p style={{ fontSize: 14, color: '#6b7280', margin: '10px 0 0', lineHeight: 1.7 }}>
          ليس لديك صلاحية للوصول لهذه الصفحة.
        </p>

        {/* Role badge */}
        {user && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            margin: '16px auto 0',
            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
            background: `${GOLD}18`, color: '#92400e', border: `1px solid ${GOLD}40`,
          }}>
            <FaLock style={{ fontSize: 10 }} />
            دورك الحالي: {role}
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>
          تواصل مع مديرك لطلب الصلاحيات المطلوبة.
        </p>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: 'white', color: DARK, border: '2px solid #e5e7eb', cursor: 'pointer',
            }}
          >
            <FaArrowRight style={{ fontSize: 11 }} />
            رجوع
          </button>
          <Link to="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: RED, color: '#fff', textDecoration: 'none',
            }}
          >
            لوحة التحكم
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

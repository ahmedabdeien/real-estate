"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const InputField = React.memo(({
  id,
  name,
  type,
  value,
  onChange,
  onBlur,
  error,
  label,
  textarea = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="relative mb-6"
    >
      {textarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          className={`w-full px-4 py-3 border-2 bg-transparent peer transition-all resize-none min-h-[120px] focus:outline-none ${error ? 'border-red-500' : isFocused ? 'border-[#8A6924]' : 'border-slate-200'}`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          className={`w-full px-4 py-3 border-2 bg-transparent peer transition-all focus:outline-none ${error ? 'border-red-500' : isFocused ? 'border-[#8A6924]' : 'border-slate-200'}`}
        />
      )}

      <label
        htmlFor={id}
        className={`absolute right-3 transition-all duration-300 pointer-events-none text-sm ${
          (isFocused || value) ? '-top-3 bg-white px-1 font-bold' : 'top-3'
          } ${error ? 'text-red-500' : isFocused ? 'text-[#8A6924]' : 'text-slate-400'}`}
      >
        {label}
      </label>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-0 -bottom-5 text-red-500 text-sm flex items-center gap-1"
        >
          <FiAlertCircle className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
});

export default function FormContact() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { currentUser } = useSelector((state) => state.user);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.number || '',
        email: currentUser.email || '',
        message: ''
      });
    }
  }, [currentUser]);

  const validations = {
    name: /^[\u0600-\u06FFa-zA-Z\s\-'\.]{2,60}$/, // Accept Arabic and English names
    phone: /^[+0-9\u0660-\u0669\u06F0-\u06F9][0-9\u0660-\u0669\u06F0-\u06F9\s\-()]{9,14}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    message: /^[\s\S]{10,500}$/
  };

  const errorMessages = {
    name: "يرجى إدخال الاسم (٢ حروف على الأقل)",
    phone: "رقم الهاتف غير صالح",
    email: "البريد الإلكتروني غير صالح",
    message: "الرسالة قصيرة جداً (١٠ أحرف على الأقل)"
  };

  const validateField = (name, value) => {
    if (!validations[name].test(value)) {
      setErrors(prev => ({ ...prev, [name]: errorMessages[name] }));
      return false;
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    // Validate all fields
    const validationResults = Object.entries(formData).map(([name, value]) =>
      validateField(name, value)
    );

    if (validationResults.some(valid => !valid)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: t('success_message') });
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.msg || t('error_message') });
      }
    } catch (err) {
      setStatus({ type: 'error', message: t('error_message') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            id="name"
            name="name"
            type="text"
            label="الاسم الكامل"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
          />

          <InputField
            id="phone"
            name="phone"
            type="tel"
            label="رقم الهاتف"
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
          />
        </div>

        <InputField
          id="email"
          name="email"
          type="email"
          label="البريد الإلكتروني"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
        />

        <InputField
          id="message"
          name="message"
          label="رسالتك"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.message}
          textarea
        />

        <div className="pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 text-white text-sm font-black tracking-wide flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isSubmitting ? '#8A6924' : 'linear-gradient(135deg, #8A6924, #c4983a)',
              boxShadow: '0 6px 20px rgba(138,105,36,0.35)',
            }}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSend size={14} />
                <span>إرسال الرسالة</span>
              </>
            )}
          </button>
        </div>

        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 flex items-center gap-3 text-sm font-bold ${status.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
              }`}
          >
            {status.type === 'error' ? (
              <FiAlertCircle className="shrink-0" size={16} />
            ) : (
              <FiCheckCircle className="shrink-0" size={16} />
            )}
            <span>{status.message || (status.type === 'success' ? 'تم إرسال رسالتك بنجاح!' : 'حدث خطأ، يرجى المحاولة مرة أخرى')}</span>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
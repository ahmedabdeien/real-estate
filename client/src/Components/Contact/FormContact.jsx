"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiSend } from 'react-icons/fi';
import { useSelector } from 'react-redux';

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
          className={`w-full px-4 py-3 rounded-lg border-2 bg-transparent peer transition-all resize-none min-h-[120px] ${
            error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
          } ${isFocused ? 'border-[#ff9505] ring-2 ring-[#ff9505]/20' : ''}`}
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
          className={`w-full px-4 py-3 rounded-lg border-2 bg-transparent peer transition-all ${
            error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
          } ${isFocused ? 'border-[#ff9505] ring-2 ring-[#ff9505]/20' : ''}`}
        />
      )}
      
      <label
        htmlFor={id}
        className={`absolute right-3 transition-all duration-300 pointer-events-none ${
          (isFocused || value) ? 
          '-top-3.5 text-sm bg-white dark:bg-gray-800 px-1 text-[#2f2f2f]' : 
          'top-3.5 text-gray-500'
        } ${error ? 'text-red-500' : ''}`}
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
    name: /^[\p{L}\s\-']{2,50}$/u,
    phone: /^[+0-9\u0660-\u0669\u06F0-\u06F9][0-9\u0660-\u0669\u06F0-\u06F9\s\-()]{9,14}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    message: /^[\s\S]{10,500}$/
  };

  const errorMessages = {
    name: "الاسم يجب أن يحتوي على 2-50 حرفًا",
    phone: "رقم الهاتف يجب أن يكون بين ١٠-١٥ رقماً",
    email: "البريد الإلكتروني غير صالح",
    message: "الرسالة يجب أن تكون بين ١٠-٥٠٠ حرف"
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
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'تم إرسال رسالتك بنجاح!' });
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: data.msg || 'حدث خطأ غير متوقع' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'فشل الإرسال، يرجى المحاولة لاحقاً' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl "
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          label="الرسالة"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.message}
          textarea
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-4"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-gradient-to-r from-[#ff9505] to-[#ff6b35] text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-300 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSend className="text-lg" />
                <span>إرسال الرسالة</span>
              </>
            )}
          </button>
        </motion.div>

        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'error' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            }`}
          >
            {status.type === 'error' ? (
              <FiAlertCircle className="shrink-0 text-xl" />
            ) : (
              <FiCheckCircle className="shrink-0 text-xl" />
            )}
            <span>{status.message}</span>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}
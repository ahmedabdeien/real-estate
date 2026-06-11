import React, { useState } from 'react';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';
import { FaPhone, FaEnvelope, FaLocationDot, FaClock } from 'react-icons/fa6';

const PRIMARY = '#c8161d';
const ACCENT  = '#fbb140';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <PublicLayout>
      <PageHero
        title="تواصل معنا"
        subtitle="فريقنا جاهز للإجابة على أسئلتك ومساعدتك في البدء"
      />

      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {[
              { icon: FaPhone, title: 'الهاتف', val: '+20 100 000 0000', sub: 'السبت - الخميس، 9 ص - 6 م' },
              { icon: FaEnvelope, title: 'البريد الإلكتروني', val: 'hello@egyestate.com', sub: 'نرد خلال ساعتين في أوقات العمل' },
              { icon: FaLocationDot, title: 'العنوان', val: 'القاهرة، مصر', sub: 'مدينة نصر، شارع عباس العقاد' },
              { icon: FaClock, title: 'ساعات العمل', val: 'السبت — الخميس', sub: '9:00 ص — 6:00 م' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: PRIMARY }}>
                  <item.icon className="text-sm" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-sm mt-0.5">{item.val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            {sent ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl"
                  style={{ background: '#16a34a' }}>✓</div>
                <h3 className="text-2xl font-black mb-2">تم الإرسال!</h3>
                <p className="text-gray-500">شكراً لتواصلك معنا — سنرد عليك خلال ساعتين في أوقات العمل.</p>
                <button onClick={() => setSent(false)}
                  className="mt-6 text-sm font-bold underline" style={{ color: PRIMARY }}>
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black mb-6">أرسل لنا رسالة</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                      <input required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 transition-colors"
                        value={form.name} onChange={e => set('name', e.target.value)} placeholder="أحمد محمد" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">البريد الإلكتروني <span className="text-red-500">*</span></label>
                      <input required type="email" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 transition-colors"
                        value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@company.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">رقم الهاتف</label>
                      <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 transition-colors"
                        value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+20 100 000 0000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">الموضوع</label>
                      <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                        value={form.subject} onChange={e => set('subject', e.target.value)}>
                        <option value="">اختر الموضوع</option>
                        <option>استفسار عن الباقات</option>
                        <option>دعم فني</option>
                        <option>شراكات تجارية</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">الرسالة <span className="text-red-500">*</span></label>
                    <textarea required rows={5} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none"
                      value={form.message} onChange={e => set('message', e.target.value)}
                      placeholder="اكتب رسالتك هنا..." />
                  </div>
                  <button type="submit"
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90"
                    style={{ background: PRIMARY }}>
                    إرسال الرسالة
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;

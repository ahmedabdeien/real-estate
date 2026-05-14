import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { HiSave, HiArrowRight, HiExclamationCircle } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";

const IS = { border: '1.5px solid #e2e8f0', background: 'white' };
const fo = e => e.target.style.borderColor = '#8A6924';
const bl = e => e.target.style.borderColor = '#e2e8f0';

export default function PageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: { en: '', ar: '' }, slug: '', content: { en: '', ar: '' } });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pageId) {
      setLoading(true);
      fetch('/api/cms/pages')
        .then(r => r.json())
        .then(data => { const p = data.find(p => p._id === pageId); if (p) setFormData(p); })
        .catch(() => setError('فشل تحميل البيانات'))
        .finally(() => setLoading(false));
    }
  }, [pageId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch(pageId ? `/api/cms/pages/${pageId}` : '/api/cms/pages', {
        method: pageId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message?.includes('duplicate') ? 'الـ slug مستخدم بالفعل' : (data.message || 'خطأ في الحفظ'));
      navigate('/Dashboard?tab=staticPages');
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto p-6" style={{ background: '#faf8f4', minHeight: '100vh' }}>
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/Dashboard?tab=staticPages')}
          className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
          style={{ color: '#12283C' }}>
          <HiArrowRight size={16} /> العودة للصفحات
        </button>
        <h1 className="text-xl font-black" style={{ color: '#12283C' }}>
          {pageId ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 text-xs font-bold"
          style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#dc2626' }}>
          <HiExclamationCircle size={15} />{error}
        </div>
      )}

      <div className="bg-white p-8" style={{ border: '1px solid rgba(138,105,36,0.12)', borderTop: '3px solid #8A6924' }}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>رابط الصفحة (Slug)</label>
            <input type="text" placeholder="مثال: privacy-policy" value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              required className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
            <p className="text-[11px] mt-1" style={{ color: '#94a3b8' }}>الرابط: /p/<b>{formData.slug || 'slug'}</b></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest uppercase pb-2"
                style={{ color: '#8A6924', borderBottom: '1px solid rgba(138,105,36,0.15)' }}>النسخة الإنجليزية</h3>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>العنوان (EN)</label>
                <input type="text" value={formData.title.en}
                  onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })}
                  required className="w-full px-4 py-3 text-sm focus:outline-none mb-4" style={IS} onFocus={fo} onBlur={bl} />
              </div>
              <div className="h-72 pb-10">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>المحتوى (EN)</label>
                <ReactQuill theme="snow" value={formData.content.en}
                  onChange={v => setFormData({ ...formData, content: { ...formData.content, en: v } })} className="h-60 bg-white" />
              </div>
            </div>
            <div className="space-y-4" dir="rtl">
              <h3 className="text-xs font-black tracking-widest uppercase pb-2"
                style={{ color: '#8A6924', borderBottom: '1px solid rgba(138,105,36,0.15)' }}>النسخة العربية</h3>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>العنوان (AR)</label>
                <input type="text" value={formData.title.ar}
                  onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })}
                  required className="w-full px-4 py-3 text-sm focus:outline-none mb-4" style={IS} onFocus={fo} onBlur={bl} />
              </div>
              <div className="h-72 pb-10">
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>المحتوى (AR)</label>
                <ReactQuill theme="snow" value={formData.content.ar}
                  onChange={v => setFormData({ ...formData, content: { ...formData.content, ar: v } })} className="h-60 bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-start" style={{ borderTop: '1px solid rgba(138,105,36,0.1)' }}>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#8A6924,#c4983a)', boxShadow: '0 6px 20px rgba(138,105,36,0.35)' }}>
              {loading ? <><TbLoaderQuarter className="animate-spin" size={16} /> جارٍ الحفظ...</> : <><HiSave size={16} /> حفظ الصفحة</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

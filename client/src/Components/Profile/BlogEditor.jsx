import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { HiSave, HiArrowRight, HiExclamationCircle, HiPhotograph } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../firebase";

const IS = { border: '1.5px solid #e2e8f0', background: 'white' };
const fo = e => e.target.style.borderColor = '#8A6924';
const bl = e => e.target.style.borderColor = '#e2e8f0';

export default function BlogEditor() {
  const { blogId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: { en: '', ar: '' }, slug: '', excerpt: { en: '', ar: '' },
    content: { en: '', ar: '' }, status: 'Draft', image: ''
  });
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);

  useEffect(() => {
    if (blogId) {
      setLoading(true);
      fetch('/api/cms/blogs')
        .then(r => r.json())
        .then(data => { const b = data.find(b => b._id === blogId); if (b) setFormData(b); })
        .catch(() => setError('فشل تحميل المقال'))
        .finally(() => setLoading(false));
    }
  }, [blogId]);

  const handleImageUpload = () => new Promise((resolve, reject) => {
    const storage = getStorage(app);
    const storageRef = ref(storage, new Date().getTime() + imageFile.name);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on('state_changed',
      snap => setImageUploadProgress(((snap.bytesTransferred / snap.totalBytes) * 100).toFixed(0)),
      reject,
      () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      let imageUrl = formData.image;
      if (imageFile) imageUrl = await handleImageUpload();
      const res = await fetch(blogId ? `/api/cms/blogs/${blogId}` : '/api/cms/blogs', {
        method: blogId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, image: imageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message?.includes('duplicate') ? 'الـ slug مستخدم بالفعل' : (data.message || 'خطأ في الحفظ'));
      navigate('/Dashboard?tab=blogs');
    } catch (err) { setError(err.message); setLoading(false); setImageUploadProgress(null); }
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto p-6" style={{ background: '#faf8f4', minHeight: '100vh' }}>
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/Dashboard?tab=blogs')}
          className="flex items-center gap-2 text-sm font-bold hover:opacity-70" style={{ color: '#12283C' }}>
          <HiArrowRight size={16} /> العودة للمقالات
        </button>
        <h1 className="text-xl font-black" style={{ color: '#12283C' }}>
          {blogId ? 'تعديل المقال' : 'كتابة مقال جديد'}
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
          {/* Meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pb-6" style={{ borderBottom: '1px solid rgba(138,105,36,0.1)' }}>
            {/* صورة مميزة */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>الصورة المميزة</label>
              <div onClick={() => document.getElementById('blog-img-input').click()}
                className="w-full h-28 flex flex-col items-center justify-center cursor-pointer transition-all"
                style={{ border: '2px dashed rgba(138,105,36,0.3)', background: 'rgba(138,105,36,0.03)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#8A6924'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(138,105,36,0.3)'}>
                {imageFile || formData.image
                  ? <img src={imageFile ? URL.createObjectURL(imageFile) : formData.image} className="w-full h-full object-cover" />
                  : <><HiPhotograph size={28} style={{ color: 'rgba(138,105,36,0.5)' }} /><span className="text-xs font-bold mt-1" style={{ color: '#8A6924' }}>اختر صورة</span></>}
                <input id="blog-img-input" type="file" accept="image/*" hidden onChange={e => setImageFile(e.target.files[0])} />
              </div>
              {imageUploadProgress && <p className="text-xs mt-1" style={{ color: '#8A6924' }}>جارٍ الرفع: {imageUploadProgress}%</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>رابط المقال (Slug)</label>
                <input type="text" placeholder="مثال: real-estate-trends" value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })} required
                  className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: '#12283C' }}>حالة النشر</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl}>
                  <option value="Draft">مسودة</option>
                  <option value="Published">منشور</option>
                  <option value="Hidden">مخفي</option>
                </select>
              </div>
            </div>
          </div>

          {/* محتوى ثنائي اللغة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black tracking-widest uppercase pb-2"
                style={{ color: '#8A6924', borderBottom: '1px solid rgba(138,105,36,0.15)' }}>المحتوى الإنجليزي</h3>
              <input type="text" placeholder="عنوان المقال (EN)" value={formData.title.en}
                onChange={e => setFormData({ ...formData, title: { ...formData.title, en: e.target.value } })} required
                className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
              <input type="text" placeholder="مقتطف مختصر (EN)" value={formData.excerpt.en}
                onChange={e => setFormData({ ...formData, excerpt: { ...formData.excerpt, en: e.target.value } })
                } className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
              <div className="h-80 pb-12">
                <ReactQuill theme="snow" value={formData.content.en}
                  onChange={v => setFormData({ ...formData, content: { ...formData.content, en: v } })} className="h-64 bg-white" />
              </div>
            </div>
            <div className="space-y-4" dir="rtl">
              <h3 className="text-xs font-black tracking-widest uppercase pb-2"
                style={{ color: '#8A6924', borderBottom: '1px solid rgba(138,105,36,0.15)' }}>المحتوى العربي</h3>
              <input type="text" placeholder="عنوان المقال (AR)" value={formData.title.ar}
                onChange={e => setFormData({ ...formData, title: { ...formData.title, ar: e.target.value } })} required
                className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
              <input type="text" placeholder="مقتطف مختصر (AR)" value={formData.excerpt.ar}
                onChange={e => setFormData({ ...formData, excerpt: { ...formData.excerpt, ar: e.target.value } })
                } className="w-full px-4 py-3 text-sm focus:outline-none" style={IS} onFocus={fo} onBlur={bl} />
              <div className="h-80 pb-12">
                <ReactQuill theme="snow" value={formData.content.ar}
                  onChange={v => setFormData({ ...formData, content: { ...formData.content, ar: v } })} className="h-64 bg-white" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-start" style={{ borderTop: '1px solid rgba(138,105,36,0.1)' }}>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#8A6924,#c4983a)', boxShadow: '0 6px 20px rgba(138,105,36,0.35)' }}>
              {loading ? <><TbLoaderQuarter className="animate-spin" size={16} /> جارٍ الحفظ...</> : <><HiSave size={16} /> حفظ المقال</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

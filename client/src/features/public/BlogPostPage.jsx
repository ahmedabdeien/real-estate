import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { blogsAPI } from '../../api/services';
import { FaArrowRight, FaCalendar, FaEye, FaUser, FaTag } from 'react-icons/fa6';

const PRIMARY = '#c8161d';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(window.location.search).get('company') || '';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog-post', slug, companyId],
    queryFn: () => blogsAPI.getBySlug(slug).then(r => r.data.data),
    enabled: !!slug,
  });

  if (isLoading) return (
    <div style={{ fontFamily: 'Tajawal, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p className="opacity-40">جاري التحميل...</p>
    </div>
  );

  if (isError || !data) return (
    <div style={{ fontFamily: 'Tajawal, sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-center">
        <p className="text-2xl font-bold mb-2">404</p>
        <p className="opacity-40 mb-4">المقال غير موجود</p>
        <button onClick={() => navigate(-1)} className="text-sm font-medium underline">العودة</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={{ fontFamily: 'Tajawal, sans-serif', background: '#fcfcfc', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="relative h-72 overflow-hidden"
        style={{ background: data.coverImage ? `url(${data.coverImage}) center/cover` : '#c8161d' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute bottom-0 right-0 left-0 p-8 max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
            <FaArrowRight /> العودة للمدونة
          </button>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-3 inline-block"
            style={{ background: '#fef3c7', color: '#92400e' }}>
            {data.category}
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{data.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-wrap gap-4 py-4 text-sm opacity-50"
          style={{ borderBottom: '1px solid #e5e7eb' }}>
          {data.author?.name && (
            <span className="flex items-center gap-1"><FaUser />{data.author.name}</span>
          )}
          {data.publishedAt && (
            <span className="flex items-center gap-1">
              <FaCalendar />{new Date(data.publishedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          {data.views > 0 && (
            <span className="flex items-center gap-1"><FaEye />{data.views} مشاهدة</span>
          )}
          {data.tags?.length > 0 && (
            <span className="flex items-center gap-1"><FaTag />{data.tags.join(' • ')}</span>
          )}
        </div>

        {/* Content */}
        <div className="py-8"
          style={{ lineHeight: 2, fontSize: '1rem', color: '#1f2937' }}
          dangerouslySetInnerHTML={{ __html: data.content || `<p>${data.excerpt || ''}</p>` }}
        />
      </div>
    </div>
  );
};

export default BlogPostPage;

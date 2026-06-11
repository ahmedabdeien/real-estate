import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../../api/services';
import { FaMagnifyingGlass, FaArrowLeft, FaCalendar, FaEye } from 'react-icons/fa6';
import PublicLayout from './PublicLayout';
import PageHero from './PageHero';

const PRIMARY = '#c8161d';

const BlogListPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const companyId = new URLSearchParams(window.location.search).get('company') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['public-blogs', companyId, search, category],
    queryFn: () => blogsAPI.getPublic({ companyId, search, category, limit: 20 }).then(r => r.data),
    enabled: !!companyId,
  });

  const blogs = data?.data || [];

  return (
    <PublicLayout>
      <PageHero tag="المدونة" title="المدونة العقارية" subtitle="مقالات ونصائح متخصصة في السوق العقاري" />
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 py-5 px-5">
        <div className="max-w-md mx-auto relative">
          <FaMagnifyingGlass className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-200 pr-10 pl-4 py-3 rounded-xl text-sm outline-none focus:border-red-400 transition-colors"
            placeholder="ابحث في المقالات..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="text-center py-20 opacity-40">جاري التحميل...</div>
        ) : !companyId ? (
          <div className="text-center py-20 opacity-40">المدونة غير متاحة</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 opacity-40">لا توجد مقالات منشورة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map(b => (
              <Link key={b._id} to={`/blog/${b.slug}?company=${companyId}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block">
                <div className="h-44 overflow-hidden"
                  style={{ background: b.coverImage ? `url(${b.coverImage}) center/cover` : '#c8161d' }}>
                  {!b.coverImage && (
                    <div className="h-full flex items-center justify-center text-white text-4xl font-black opacity-20">
                      {b.title?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
                    style={{ background: '#fef3c7', color: '#92400e' }}>
                    {b.category}
                  </span>
                  <h2 className="font-bold text-base leading-snug mt-2 mb-2 line-clamp-2">{b.title}</h2>
                  <p className="text-sm opacity-50 line-clamp-2 mb-3">{b.excerpt}</p>
                  <div className="flex items-center justify-between text-xs opacity-40">
                    <span className="flex items-center gap-1"><FaCalendar />
                      {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('ar-EG-u-nu-latn') : ''}
                    </span>
                    {b.views > 0 && <span className="flex items-center gap-1"><FaEye />{b.views}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default BlogListPage;

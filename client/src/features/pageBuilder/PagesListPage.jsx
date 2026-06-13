import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pagesAPI } from '../../api/services';
import { FaPlus, FaPenToSquare, FaTrash, FaEye, FaEyeSlash, FaGlobe, FaCopy, FaMagnifyingGlass, FaArrowUpRightFromSquare, FaBars } from 'react-icons/fa6';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  landing: 'هبوط', about: 'من نحن', contact: 'اتصل', features: 'مميزات', pricing: 'أسعار', custom: 'مخصص',
};

export default function PagesListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: () => pagesAPI.getAll().then(r => r.data.data),
    placeholderData: prev => prev,
  });

  const filtered = (data || []).filter(p =>
    !search.trim() ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const duplicateMut = useMutation({
    mutationFn: async (id) => {
      const full = await pagesAPI.getOne(id).then(r => r.data.data);
      return pagesAPI.create({
        title: `${full.title} (نسخة)`,
        slug: `${full.slug}-copy-${Date.now().toString(36)}`,
        type: full.type,
        craftJson: full.craftJson,
        isPublished: false,
        seo: full.seo,
        settings: full.settings,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); toast.success('تم نسخ الصفحة'); },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل النسخ'),
  });

  const deleteMut = useMutation({
    mutationFn: id => pagesAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); setConfirm(null); },
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }) => pagesAPI.update(id, { isPublished }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pages'] }),
  });

  const toggleNavMut = useMutation({
    mutationFn: ({ id, showInNav }) => pagesAPI.update(id, { settings: { showInNav } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pages'] }); toast.success('تم التحديث'); },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">صفحات الموقع</h1>
          <p className="text-sm text-gray-500 mt-0.5">أنشئ وادر صفحات الموقع بالسحب والإفلات</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث بالعنوان أو الرابط..."
              className="input text-sm pr-9" style={{ width: 220 }} />
          </div>
          <button onClick={() => navigate('/page-builder/new')} className="btn btn-primary flex items-center gap-2">
            <FaPlus size={13} /> صفحة جديدة
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !filtered.length ? (
        <div className="text-center py-20 text-gray-400">
          <FaGlobe size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-semibold">لا توجد صفحات بعد</p>
          <p className="text-sm mt-1">ابدأ بإنشاء صفحتك الأولى</p>
          <button onClick={() => navigate('/page-builder/new')} className="btn btn-primary mt-4">إنشاء صفحة</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(page => (
            <div key={page._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{page.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 dir-ltr">/{page.slug}</p>
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: page.isPublished ? '#d1fae5' : '#f3f4f6', color: page.isPublished ? '#065f46' : '#6b7280', fontWeight: 600 }}>
                  {page.isPublished ? 'منشور' : 'مسودة'}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-3 flex-wrap">
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280' }}>
                  {TYPE_LABELS[page.type] || page.type}
                </span>
                {page.settings?.showInNav && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#dbeafe', color: '#1d4ed8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <FaBars size={9} /> في القائمة
                  </span>
                )}
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  {new Date(page.updatedAt).toLocaleDateString('ar-EG-u-nu-latn', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/page-builder/${page._id}`)}
                  className="flex-1 btn btn-sm btn-outline flex items-center justify-center gap-1.5">
                  <FaPenToSquare size={12} /> تعديل
                </button>
                <button onClick={() => togglePublish.mutate({ id: page._id, isPublished: !page.isPublished })}
                  className="btn btn-sm btn-outline p-2" title={page.isPublished ? 'إلغاء النشر' : 'نشر'}>
                  {page.isPublished ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
                <button
                  onClick={() => toggleNavMut.mutate({ id: page._id, showInNav: !page.settings?.showInNav })}
                  className="btn btn-sm btn-outline p-2"
                  title={page.settings?.showInNav ? 'إخفاء من القائمة' : 'إظهار في القائمة'}
                  style={page.settings?.showInNav ? { background: '#dbeafe', borderColor: '#93c5fd', color: '#1d4ed8' } : {}}>
                  <FaBars size={13} />
                </button>
                <button onClick={() => duplicateMut.mutate(page._id)} disabled={duplicateMut.isPending}
                  className="btn btn-sm btn-outline p-2" title="نسخ الصفحة">
                  <FaCopy size={13} />
                </button>
                {page.isPublished && (
                  <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer"
                    className="btn btn-sm btn-outline p-2" title="فتح الصفحة">
                    <FaArrowUpRightFromSquare size={12} />
                  </a>
                )}
                <button onClick={() => setConfirm(page._id)}
                  className="btn btn-sm p-2" style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}>
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 320, textAlign: 'center' }}>
            <p className="font-bold text-gray-900 mb-2">حذف الصفحة؟</p>
            <p className="text-sm text-gray-500 mb-5">لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn btn-outline flex-1">إلغاء</button>
              <button onClick={() => deleteMut.mutate(confirm)} disabled={deleteMut.isPending}
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', cursor: 'pointer', fontWeight: 700 }}>
                {deleteMut.isPending ? 'جاري...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

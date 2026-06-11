import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  FaPlus, FaPen, FaTrash, FaEye, FaNewspaper,
  FaMagnifyingGlass, FaCircleCheck, FaFile, FaBoxArchive
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const STATUS = {
  draft:     { label: 'مسودة',   color: 'default' },
  published: { label: 'منشور',   color: 'success' },
  archived:  { label: 'مؤرشف',   color: 'warning' },
};

const CATEGORIES = ['عام', 'أخبار', 'نصائح عقارية', 'تحليلات السوق', 'قصص نجاح', 'إعلانات'];

const defaultForm = {
  title: '', excerpt: '', content: '', category: 'عام',
  tags: '', status: 'draft', coverImage: '', seoTitle: '', seoDesc: '',
};

const BlogsPage = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState('content'); // content | seo
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [delId, setDelId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', search, statusFilter],
    queryFn: () => blogsAPI.getAll({ search, status: statusFilter, limit: 50 }).then(r => r.data),
  });

  const save = useMutation({
    mutationFn: (d) => editing ? blogsAPI.update(editing._id, d) : blogsAPI.create(d),
    onSuccess: () => { qc.invalidateQueries(['blogs']); toast.success(editing ? 'تم التحديث' : 'تم إنشاء المقال'); closeModal(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حدث خطأ'),
  });

  const del = useMutation({
    mutationFn: blogsAPI.remove,
    onSuccess: () => { qc.invalidateQueries(['blogs']); toast.success('تم الحذف'); setDelId(null); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setTab('content'); setModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...defaultForm, ...b, tags: (b.tags || []).join(', ') }); setTab('content'); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    save.mutate(payload);
  };

  const blogs = data?.data || [];
  const stats = {
    total:     blogs.length,
    published: blogs.filter(b => b.status === 'published').length,
    draft:     blogs.filter(b => b.status === 'draft').length,
  };

  return (
    <div>
      <PageHeader title="المقالات والمدونة" subtitle="إدارة محتوى المدونة والمقالات التسويقية"
        actions={<Button onClick={openCreate}><FaPlus /> مقال جديد</Button>} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'إجمالي المقالات', value: stats.total, icon: FaNewspaper, color: '#1a56db' },
          { label: 'منشورة', value: stats.published, icon: FaCircleCheck, color: '#16a34a' },
          { label: 'مسودات', value: stats.draft, icon: FaFile, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: s.color }}>
              <s.icon className="text-lg" />
            </div>
            <div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs opacity-50">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 text-sm" />
          <input className="input pr-9 text-sm py-2" placeholder="بحث في المقالات..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {[{ v: '', l: 'الكل' }, { v: 'published', l: 'منشور' }, { v: 'draft', l: 'مسودة' }, { v: 'archived', l: 'مؤرشف' }].map(opt => (
            <button key={opt.v} onClick={() => setStatusFilter(opt.v)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: statusFilter === opt.v ? 'var(--color-primary)' : 'var(--color-surface)',
                color: statusFilter === opt.v ? '#fff' : 'inherit',
                border: '1px solid var(--color-border)',
              }}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      {isLoading ? (
        <div className="card p-12 text-center opacity-40">جاري التحميل...</div>
      ) : blogs.length === 0 ? (
        <div className="card p-16 text-center">
          <FaNewspaper className="text-5xl mx-auto mb-4 opacity-20" />
          <p className="opacity-40 mb-4">لا توجد مقالات</p>
          <Button onClick={openCreate}><FaPlus /> إنشاء أول مقال</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {blogs.map(b => {
            const s = STATUS[b.status] || STATUS.draft;
            return (
              <div key={b._id} className="card overflow-hidden hover:shadow-md transition-shadow">
                {/* Cover */}
                <div className="h-40 relative overflow-hidden"
                  style={{ background: b.coverImage ? `url(${b.coverImage}) center/cover` : 'linear-gradient(135deg,#da1f27,#b01820)' }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
                    <span className="text-white text-xs bg-black/40 px-2 py-0.5 rounded-full">{b.category}</span>
                    <Badge color={s.color}>{s.label}</Badge>
                  </div>
                </div>
                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-2">{b.title}</h3>
                  <p className="text-xs opacity-50 line-clamp-2 mb-3">{b.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs opacity-40">
                      {b.publishedAt ? new Date(b.publishedAt).toLocaleDateString('ar-EG') : 'غير منشور'}
                      {b.views > 0 && ` • ${b.views} مشاهدة`}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(b)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="تعديل">
                        <FaPen className="text-xs" />
                      </button>
                      <button onClick={() => setDelId(b._id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"
                        title="حذف">
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modal} onClose={closeModal} title={editing ? `تعديل: ${editing.title}` : 'مقال جديد'} size="xl"
        footer={<>
          <Button variant="outline" onClick={closeModal}>إلغاء</Button>
          <Button variant="outline" onClick={() => { set('status', 'draft'); setTimeout(handleSave, 100); }}>
            <FaFile /> حفظ مسودة
          </Button>
          <Button onClick={() => { set('status', 'published'); setTimeout(handleSave, 100); }} loading={save.isPending}>
            <FaCircleCheck /> نشر
          </Button>
        </>}
      >
        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {[{ k: 'content', l: 'المحتوى' }, { k: 'seo', l: 'SEO والإعدادات' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className="px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px"
              style={{
                borderColor: tab === t.k ? 'var(--color-primary)' : 'transparent',
                color: tab === t.k ? 'var(--color-primary)' : 'inherit',
              }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'content' && (
          <div className="space-y-4">
            <Input label="عنوان المقال" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="أدخل عنوان المقال..." />
            <div className="grid grid-cols-2 gap-4">
              <Select label="التصنيف" value={form.category} onChange={e => set('category', e.target.value)}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} />
              <Select label="الحالة" value={form.status} onChange={e => set('status', e.target.value)}
                options={Object.entries(STATUS).map(([v, { label }]) => ({ value: v, label }))} />
            </div>
            <div>
              <label className="label">الملخص / المقتطف</label>
              <textarea className="input h-20 resize-none" value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)} placeholder="ملخص قصير يظهر في قائمة المقالات..." />
            </div>
            <div>
              <label className="label">محتوى المقال</label>
              <textarea className="input resize-y font-mono text-sm" rows={14} value={form.content}
                onChange={e => set('content', e.target.value)}
                placeholder="اكتب محتوى المقال هنا... (يدعم HTML)" />
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div className="space-y-4">
            <Input label="رابط صورة الغلاف (URL)" value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://..." />
            {form.coverImage && (
              <img src={form.coverImage} alt="غلاف" className="w-full h-40 object-cover rounded-lg" />
            )}
            <Input label="الوسوم (Tags)" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="عقارات، استثمار، قاهرة (مفصولة بفاصلة)" />
            <Input label="عنوان SEO" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="عنوان لمحركات البحث..." />
            <div>
              <label className="label">وصف SEO</label>
              <textarea className="input h-24 resize-none" value={form.seoDesc}
                onChange={e => set('seoDesc', e.target.value)} placeholder="وصف قصير لمحركات البحث (150-160 حرف)..." />
              <p className="text-xs opacity-40 mt-1">{form.seoDesc?.length || 0} / 160 حرف</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={() => del.mutate(delId)} loading={del.isPending} />
    </div>
  );
};

export default BlogsPage;

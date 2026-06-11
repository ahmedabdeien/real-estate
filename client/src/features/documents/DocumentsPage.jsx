import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FaFolder, FaMagnifyingGlass, FaPlus, FaTrash, FaDownload,
  FaFileContract, FaFilePdf, FaFileImage, FaFile, FaFileLines,
  FaTag, FaUser, FaCalendar, FaArrowUpFromBracket,
} from 'react-icons/fa6';
import { documentsAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Can from '../../casl/Can';

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
    {children}
  </div>
);

const TYPE_CONFIG = {
  contract: { label: 'عقد',          icon: FaFileContract, color: '#c8161d', bg: '#fee2e2' },
  invoice:  { label: 'فاتورة',       icon: FaFileLines,    color: '#f59e0b', bg: '#fef3c7' },
  id:       { label: 'هوية',          icon: FaFile,         color: '#8b5cf6', bg: '#ede9fe' },
  deed:     { label: 'سند ملكية',    icon: FaFileContract, color: '#059669', bg: '#d1fae5' },
  permit:   { label: 'رخصة / تصريح', icon: FaFileLines,    color: '#3b82f6', bg: '#dbeafe' },
  photo:    { label: 'صورة',          icon: FaFileImage,    color: '#ec4899', bg: '#fce7f3' },
  other:    { label: 'أخرى',          icon: FaFile,         color: '#6b7280', bg: '#f3f4f6' },
};

const RELATED_TO_OPTIONS = [
  { value: 'none',     label: 'غير مرتبط' },
  { value: 'customer', label: 'عميل' },
  { value: 'unit',     label: 'وحدة' },
  { value: 'property', label: 'مشروع' },
  { value: 'contract', label: 'عقد' },
];

const defaultForm = {
  name: '', description: '', url: '', type: 'other',
  relatedTo: 'none', relatedId: '', tags: '',
};

function FileIcon({ mimeType, type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
  const Icon = mimeType?.includes('image') ? FaFileImage
    : mimeType?.includes('pdf') ? FaFilePdf
    : cfg.icon;
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="text-xl" />
    </div>
  );
}

function DocCard({ doc, onDelete }) {
  const cfg = TYPE_CONFIG[doc.type] || TYPE_CONFIG.other;
  const sizeKb = doc.size ? `${(doc.size / 1024).toFixed(0)} KB` : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border p-4 flex flex-col gap-3 group"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start gap-3">
        <FileIcon mimeType={doc.mimeType} type={doc.type} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--color-text-dark)' }}>{doc.name}</p>
          <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>
      </div>

      {doc.description && (
        <p className="text-xs line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{doc.description}</p>
      )}

      {doc.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-lg"
              style={{ background: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-1.5">
          <FaUser className="text-[10px]" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {doc.uploadedBy?.name || '—'}
          </span>
          {sizeKb && <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>· {sizeKb}</span>}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={doc.url} target="_blank" rel="noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-bg)' }}>
            <FaDownload className="text-xs" style={{ color: 'var(--color-primary)' }} />
          </a>
          <Can I="delete" a="documents">
            <button onClick={() => onDelete(doc)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50">
              <FaTrash className="text-xs text-red-500" />
            </button>
          </Can>
        </div>
      </div>
    </motion.div>
  );
}

export default function DocumentsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 24 });
  const [showModal, setShowModal] = useState(false);
  const [delDoc, setDelDoc] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v || undefined, page: 1 }));
  const setFld = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsAPI.getAll(filters).then(r => r.data),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (d) => documentsAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries(['documents']);
      toast.success('تم رفع المستند بنجاح');
      setShowModal(false);
      setForm(defaultForm);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsAPI.remove(id),
    onSuccess: () => { qc.invalidateQueries(['documents']); toast.success('تم حذف المستند'); setDelDoc(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'خطأ'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      relatedId: form.relatedId || undefined,
    };
    createMutation.mutate(payload);
  };

  const docs  = data?.data || [];
  const total = data?.total || data?.pagination?.total || 0;
  const pages = Math.ceil(total / filters.limit);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="إدارة المستندات"
        subtitle={`${total.toLocaleString('ar-EG')} مستند محفوظ`}
        icon={FaFolder}
        actions={
          <Can I="create" a="documents">
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}>
              <FaPlus className="text-xs" /> رفع مستند
            </button>
          </Can>
        }
      />

      {/* Filters */}
      <div className="rounded-2xl border p-4 flex flex-wrap gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="relative flex-1 min-w-[200px]">
          <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" placeholder="بحث بالاسم..."
            className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
            onChange={e => setF('search', e.target.value)} />
        </div>
        <select className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
          onChange={e => setF('type', e.target.value)}>
          <option value="">كل الأنواع</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}
          onChange={e => setF('relatedTo', e.target.value)}>
          {RELATED_TO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setF('type', key)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all hover:opacity-80"
            style={{ background: cfg.bg, color: cfg.color }}>
            <cfg.icon className="text-[10px]" />{cfg.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FaFolder} title="لا توجد مستندات" message="ارفع أول مستند بالضغط على الزر أعلاه" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {docs.map(doc => (
            <DocCard key={doc._id} doc={doc} onDelete={setDelDoc} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            الصفحة {filters.page} من {pages}
          </p>
          <div className="flex gap-2">
            <button disabled={filters.page <= 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}>
              السابق
            </button>
            <button disabled={filters.page >= pages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
              className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40"
              style={{ background: 'var(--color-primary)', color: 'white' }}>
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal title="رفع مستند جديد" onClose={() => { setShowModal(false); setForm(defaultForm); }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="اسم المستند *">
                <input required value={form.name} onChange={setFld('name')}
                  placeholder="مثال: عقد إيجار - أ. محمد علي"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }} />
              </Field>

              <Field label="رابط الملف *">
                <div className="flex gap-2">
                  <input required value={form.url} onChange={setFld('url')}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                    <FaArrowUpFromBracket className="text-sm" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="النوع">
                  <select value={form.type} onChange={setFld('type')}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}>
                    {Object.entries(TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
                <Field label="مرتبط بـ">
                  <select value={form.relatedTo} onChange={setFld('relatedTo')}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}>
                    {RELATED_TO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
              </div>

              {form.relatedTo !== 'none' && (
                <Field label="معرّف العنصر المرتبط">
                  <input value={form.relatedId} onChange={setFld('relatedId')}
                    placeholder="ID العميل / الوحدة / العقد..."
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }} />
                </Field>
              )}

              <Field label="الوصف">
                <textarea value={form.description} onChange={setFld('description')}
                  rows={2} placeholder="وصف اختياري..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }} />
              </Field>

              <Field label="وسوم (مفصولة بفاصلة)">
                <div className="relative">
                  <FaTag className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }} />
                  <input value={form.tags} onChange={setFld('tags')}
                    placeholder="عقار, قانوني, مهم..."
                    className="w-full pr-9 pl-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }} />
                </div>
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(defaultForm); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-dark)' }}>
                  إلغاء
                </button>
                <button type="submit" disabled={createMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--color-primary)' }}>
                  {createMutation.isPending ? 'جارٍ الرفع...' : 'رفع المستند'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      {delDoc && (
        <ConfirmDialog
          title="حذف المستند"
          message={`هل أنت متأكد من حذف "${delDoc.name}"؟`}
          onConfirm={() => deleteMutation.mutate(delDoc._id)}
          onCancel={() => setDelDoc(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

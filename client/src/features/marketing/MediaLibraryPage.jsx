import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FaImages, FaUpload, FaMagnifyingGlass, FaTrash, FaCopy,
  FaCheck, FaXmark, FaFolder, FaSpinner, FaCloudArrowUp,
  FaEye, FaEllipsisVertical, FaCircleInfo,
} from 'react-icons/fa6';
import { mediaAPI } from '../../api/services';
import PageHeader from '../../components/ui/PageHeader';

const PRIMARY = '#da1f27';
const FOLDERS = ['all', 'general', 'blogs', 'projects', 'team', 'marketing'];
const FOLDER_AR = { all: 'الكل', general: 'عام', blogs: 'المقالات', projects: 'المشاريع', team: 'الفريق', marketing: 'التسويق' };

function formatBytes(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── Upload Zone ─────────────────────────────────────────── */
function UploadZone({ onUpload, uploading }) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onUpload(files);
  }, [onUpload]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) onUpload(files);
    e.target.value = '';
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        drag ? 'border-red-800 bg-red-50 scale-[1.01]' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
      } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" hidden onChange={handleFiles} />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="text-3xl animate-spin" style={{ color: PRIMARY }} />
          <p className="text-sm text-gray-500">جاري الرفع...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${PRIMARY}12` }}>
            <FaCloudArrowUp className="text-2xl" style={{ color: PRIMARY }} />
          </div>
          <div>
            <p className="font-semibold text-sm">اسحب الصور هنا أو اضغط للاختيار</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WEBP, PDF — حد أقصى 10MB</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Media Card ──────────────────────────────────────────── */
function MediaCard({ item, onDelete, onCopy, selected, onSelect }) {
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const isImage = item.mimeType?.startsWith('image/');

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    onCopy?.(item.url);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
        selected ? 'border-red-800 shadow-lg' : 'border-transparent hover:border-gray-200'
      }`}
    >
      {/* Image/Preview */}
      <div className="aspect-square bg-gray-100 relative">
        {isImage ? (
          <img
            src={item.url.startsWith('data:') ? item.url : item.url}
            alt={item.originalName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaImages className="text-3xl text-gray-300" />
            <span className="absolute bottom-2 text-xs bg-gray-800 text-white px-2 py-0.5 rounded">PDF</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {selected && <FaCheck className="text-white text-xl" />}
          {!selected && (
            <>
              <button onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                title="نسخ الرابط">
                {copied ? <FaCheck className="text-xs text-green-400" /> : <FaCopy className="text-xs" />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenu(!menu); }}
                className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                <FaEllipsisVertical className="text-xs" />
              </button>
            </>
          )}
        </div>

        {/* Dropdown menu */}
        {menu && (
          <div className="absolute top-8 left-2 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 min-w-[130px]"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCopy}
              className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
              <FaCopy className="text-gray-400 text-xs" /> نسخ الرابط
            </button>
            <button onClick={(e) => { e.stopPropagation(); window.open(item.url, '_blank'); }}
              className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
              <FaEye className="text-gray-400 text-xs" /> عرض
            </button>
            <hr className="my-1" />
            <button onClick={(e) => { e.stopPropagation(); setMenu(false); onDelete(item._id); }}
              className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <FaTrash className="text-xs" /> حذف
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-xs font-medium truncate" title={item.originalName}>{item.originalName}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatBytes(item.size)}{item.width ? ` · ${item.width}×${item.height}` : ''}</p>
      </div>
    </div>
  );
}

/* ── Detail Panel ────────────────────────────────────────── */
function DetailPanel({ item, onClose, onCopy, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <p className="font-bold text-sm">تفاصيل الملف</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <FaXmark />
        </button>
      </div>

      {/* Preview */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {item.mimeType?.startsWith('image/') ? (
          <img src={item.url} alt={item.originalName} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaImages className="text-4xl text-gray-300" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div>
          <p className="text-xs text-gray-400 mb-1">اسم الملف</p>
          <p className="text-sm font-medium break-all">{item.originalName}</p>
        </div>
        {item.width && (
          <div>
            <p className="text-xs text-gray-400 mb-1">الأبعاد</p>
            <p className="text-sm">{item.width} × {item.height} px</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400 mb-1">الحجم</p>
          <p className="text-sm">{formatBytes(item.size)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">المجلد</p>
          <p className="text-sm">{FOLDER_AR[item.folder] || item.folder}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">تاريخ الرفع</p>
          <p className="text-sm">{new Date(item.createdAt).toLocaleDateString('ar-EG')}</p>
        </div>

        {/* URL */}
        <div>
          <p className="text-xs text-gray-400 mb-1">رابط الصورة</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={item.url}
              className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 truncate outline-none"
            />
            <button onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1"
              style={{ background: copied ? '#16a34a' : PRIMARY }}>
              {copied ? <FaCheck className="text-xs" /> : <FaCopy className="text-xs" />}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100 flex gap-2">
        <button onClick={handleCopy}
          className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-colors"
          style={{ background: PRIMARY }}>
          {copied ? 'تم النسخ ✓' : 'نسخ الرابط'}
        </button>
        <button onClick={() => onDelete(item._id)}
          className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors">
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
const MediaLibraryPage = () => {
  const qc = useQueryClient();
  const [folder, setFolder] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [uploadFolder, setUploadFolder] = useState('general');

  const { data, isLoading } = useQuery({
    queryKey: ['media', folder, search],
    queryFn: () => mediaAPI.getAll({ folder: folder === 'all' ? undefined : folder, search: search || undefined }),
    select: (r) => r.data,
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const results = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', uploadFolder);
        const res = await mediaAPI.upload(fd);
        results.push(res.data.data);
      }
      return results;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => mediaAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] });
      if (selected && selected._id === deleteMutation.variables) setSelected(null);
    },
  });

  const items = data?.data || [];
  const total = data?.total || 0;

  return (
    <div className="flex flex-col gap-6 h-full">
      <PageHeader
        title="مكتبة الوسائط"
        subtitle={`${total} ملف`}
        actions={
          <button
            onClick={() => document.getElementById('upload-trigger')?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: '#da1f27' }}
          >
            <FaUpload className="text-xs" />
            رفع صور
          </button>
        }
      />

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Sidebar folders */}
        <div className="w-44 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-1">
            <p className="text-xs font-bold text-gray-400 px-2 mb-2 uppercase tracking-wider">المجلدات</p>
            {FOLDERS.map(f => (
              <button key={f} onClick={() => setFolder(f)}
                className={`w-full text-right flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  folder === f ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
                style={folder === f ? { background: PRIMARY } : {}}>
                <FaFolder className="text-xs opacity-60" />
                {FOLDER_AR[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Upload + Search bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ابحث في الملفات..."
                className="w-full bg-white border border-gray-200 rounded-xl pr-9 pl-4 py-2.5 text-sm outline-none focus:border-red-800 transition-colors"
              />
            </div>
            <select
              value={uploadFolder}
              onChange={e => setUploadFolder(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none">
              {FOLDERS.filter(f => f !== 'all').map(f => (
                <option key={f} value={f}>{FOLDER_AR[f]}</option>
              ))}
            </select>
          </div>

          {/* Upload zone (compact) */}
          <input id="upload-trigger" type="file" multiple accept="image/*,application/pdf" hidden
            onChange={e => { const files = Array.from(e.target.files); if (files.length) uploadMutation.mutate(files); e.target.value = ''; }} />
          <UploadZone onUpload={(files) => uploadMutation.mutate(files)} uploading={uploadMutation.isPending} />

          {/* Grid */}
          <div className="flex gap-4 flex-1 min-h-0">
            <div className={`flex-1 overflow-y-auto ${items.length === 0 ? 'flex items-center justify-center' : ''}`}>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <FaSpinner className="text-3xl animate-spin text-gray-300" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16">
                  <FaImages className="text-5xl text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">لا توجد ملفات</p>
                  <p className="text-gray-300 text-sm mt-1">ارفع صورك الأولى من فوق</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
                  {items.map(item => (
                    <MediaCard
                      key={item._id}
                      item={item}
                      selected={selected?._id === item._id}
                      onSelect={i => setSelected(prev => prev?._id === i._id ? null : i)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onCopy={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detail panel */}
            {selected && (
              <DetailPanel
                item={selected}
                onClose={() => setSelected(null)}
                onDelete={(id) => { deleteMutation.mutate(id); setSelected(null); }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaLibraryPage;

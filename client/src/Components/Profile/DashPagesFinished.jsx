import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiOutlineExclamationCircle,
  HiSearch,
  HiRefresh,
  HiPencilAlt,
  HiEye,
  HiTrash,
  HiExclamation,
} from 'react-icons/hi';
import { TbLoaderQuarter } from 'react-icons/tb';
import { BsGripVertical } from 'react-icons/bs';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ── Sortable row ──────────────────────────────────────────────────────────────
function SortableRow({ page, onDeleteClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? '#faf8f4' : 'white',
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.12)' : undefined,
    position: 'relative',
    zIndex: isDragging ? 10 : undefined,
  };

  const name      = typeof page.name    === 'object' ? (page.name.ar    || page.name.en    || '') : (page.name    || '');
  const address   = typeof page.address === 'object' ? (page.address.ar || page.address.en || '') : (page.address || '');
  const isAvailable = page.available === 'available';

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-slate-50 transition-colors border-b border-slate-50">
      {/* Drag handle */}
      <td className="px-3 py-3 w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors"
          title="اسحب لإعادة الترتيب"
          style={{ touchAction: 'none', background: 'none', border: 'none', padding: 2 }}
        >
          <BsGripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex -space-x-2">
          {page.imageUrls?.slice(0, 2).map((img, idx) => (
            <img key={idx} src={img} alt={name} className="w-10 h-10 object-cover border-2 border-white" />
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-bold text-slate-800 text-sm">{name}</div>
        <div className="text-[11px] text-slate-400 mt-0.5">{address}</div>
      </td>
      <td className="px-4 py-3 font-black text-sm" style={{ color: '#8A6924' }}>
        {page.price?.toLocaleString('ar-EG')} ج.م
      </td>
      <td className="px-4 py-3 text-slate-500 text-xs">
        {page.propertySize} م²
      </td>
      <td className="px-4 py-3">
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
            isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}
        >
          {isAvailable ? 'متاح' : 'غير متاح'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">
        {new Date(page.updatedAt).toLocaleDateString('ar-EG')}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <Link to={`/Update-Page/${page._id}`}>
            <button
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:opacity-90"
              style={{ background: '#12283C' }}
            >
              <HiPencilAlt size={11} /> تعديل
            </button>
          </Link>
          <Link to={`/Projects/${page.slug}`} target="_blank">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
              <HiEye size={11} /> عرض
            </button>
          </Link>
          <button
            onClick={() => onDeleteClick(page._id)}
            className="p-1.5 text-red-400 hover:bg-red-50 transition-colors"
          >
            <HiTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DashPagesFinished() {
  const { currentUser } = useSelector(state => state.user);
  const [userPages, setUserPages]         = useState([]);
  const [showMore, setShowMore]           = useState(false);
  const [showModal, setShowModal]         = useState(false);
  const [pageIdToDelete, setPageIdToDelete] = useState('');
  const [searchTerm, setSearchTerm]       = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [isLoading, setIsLoading]         = useState(true);
  const [isSaving, setIsSaving]           = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (currentUser.isAdmin || currentUser.role === 'Sales') {
      fetchPages();
    }
  }, [currentUser.isAdmin, currentUser._id]);

  const fetchPages = async (startIndex = 0) => {
    setIsLoading(true);
    try {
      const res  = await fetch(`/api/listing/getListings?limit=1000&startIndex=${startIndex}`);
      const data = await res.json();
      if (res.ok) {
        setUserPages(prev => startIndex === 0 ? data.listings : [...prev, ...data.listings]);
        setShowMore(data.listings.length === 8);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePage = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/listing/deletePage/${pageIdToDelete}/${currentUser._id}`, { method: 'DELETE' });
      if (res.ok) setUserPages(prev => prev.filter(p => p._id !== pageIdToDelete));
    } catch (err) {
      console.error('Error deleting page:', err);
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = userPages.findIndex(p => p._id === active.id);
    const newIndex = userPages.findIndex(p => p._id === over.id);
    const reordered = arrayMove(userPages, oldIndex, newIndex);
    setUserPages(reordered);

    // Persist new order to server
    setIsSaving(true);
    try {
      await fetch('/api/listing/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: reordered.map(p => p._id) }),
      });
    } catch (err) {
      console.error('Error saving order:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPages = userPages.filter(page => {
    const name    = (typeof page.name    === 'object' ? (page.name.ar    || page.name.en    || '') : (page.name    || '')).toLowerCase();
    const address = (typeof page.address === 'object' ? (page.address.ar || page.address.en || '') : (page.address || '')).toLowerCase();
    const term    = searchTerm.toLowerCase();
    const matchSearch = !term || name.includes(term) || address.includes(term);
    const matchFilter = filterAvailable === 'all' || page.available === filterAvailable;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-800">إدارة المشاريع</h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{filteredPages.length} مشروع</span>
            {isSaving && (
              <span className="flex items-center gap-1" style={{ color: '#8A6924' }}>
                <TbLoaderQuarter className="animate-spin" size={12} />
                جارٍ الحفظ…
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/CreatePage">
            <button
              className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)' }}
            >
              + إضافة مشروع
            </button>
          </Link>
          <button
            onClick={() => { setUserPages([]); fetchPages(0); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-sm text-sm font-bold text-slate-600 hover:border-[#8A6924] hover:text-[#8A6924] transition-colors"
          >
            <HiRefresh size={14} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-4 flex flex-wrap gap-3 items-center mb-4">
        <div className="relative flex-1 min-w-48">
          <HiSearch className="absolute right-3 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الموقع..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pr-9 pl-3 py-2 text-sm border border-slate-200 rounded-sm focus:outline-none focus:border-[#8A6924]"
          />
        </div>
        <div className="flex gap-1">
          {[
            { value: 'all',           label: 'الكل'       },
            { value: 'available',     label: 'متاح'       },
            { value: 'not available', label: 'غير متاح'   },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterAvailable(opt.value)}
              className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-colors ${
                filterAvailable === opt.value
                  ? 'text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={filterAvailable === opt.value ? { background: '#8A6924' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mr-auto flex items-center gap-1">
          <BsGripVertical size={12} />
          اسحب الصفوف لإعادة الترتيب
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center p-16">
          <TbLoaderQuarter className="animate-spin text-3xl" style={{ color: '#8A6924' }} />
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="bg-white rounded-sm shadow-sm border border-slate-100 p-16 text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-3 text-slate-200" size={48} />
          <p className="text-slate-400 font-medium">لا توجد مشاريع</p>
        </div>
      ) : (
        <div className="bg-white rounded-sm shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-3 py-3 w-8" />
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الصورة</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">المشروع</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">السعر</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">المساحة</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">الحالة</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">آخر تحديث</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-400 uppercase">إجراءات</th>
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredPages.map(p => p._id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {filteredPages.map(page => (
                    <SortableRow
                      key={page._id}
                      page={page}
                      onDeleteClick={id => { setShowModal(true); setPageIdToDelete(id); }}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>

          {showMore && (
            <div className="p-4 text-center border-t border-slate-50">
              <button
                onClick={() => fetchPages(userPages.length)}
                className="px-5 py-2 bg-slate-100 text-slate-600 rounded-sm text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                تحميل المزيد
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: 380, margin: '0 16px', padding: 28,
              background: 'white', border: '1px solid rgba(18,40,60,0.12)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            }}
            dir="rtl"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 44, height: 44, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'rgba(220,38,38,0.1)', flexShrink: 0,
                }}
              >
                <HiExclamation size={22} style={{ color: '#dc2626' }} />
              </div>
              <div>
                <p style={{ color: '#12283C', fontWeight: 900, fontSize: 15 }}>تأكيد حذف المشروع</p>
                <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 3 }}>لا يمكن التراجع عن هذا الإجراء</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={handleDeletePage}
                style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 900, background: '#dc2626', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '10px 0', fontSize: 13, fontWeight: 900, background: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer' }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

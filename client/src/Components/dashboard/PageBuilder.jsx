import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSelector } from 'react-redux';
import { saveConfig, getConfig } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGripVertical,
  FaEdit,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaSpinner,
} from 'react-icons/fa';

const DEFAULT_SECTIONS = [
  {
    id: 'hero',
    label: 'قسم Hero',
    icon: '🏠',
    visible: true,
    title: 'اكتشف عقارك المثالي',
    subtitle: 'في أرقى مناطق المملكة',
    description: 'نقدم أفضل العقارات السكنية والتجارية بأعلى معايير الجودة',
    image: '',
  },
  {
    id: 'featured',
    label: 'المشاريع المميزة',
    icon: '⭐',
    visible: true,
    title: 'أحدث العقارات المعروضة',
    subtitle: 'مشاريعنا المتاحة',
    description: 'اكتشف مجموعة مختارة من أفضل العقارات',
    image: '',
  },
  {
    id: 'stats',
    label: 'الإحصائيات',
    icon: '📊',
    visible: true,
    title: 'إنجازاتنا بالأرقام',
    subtitle: '',
    description: '',
    image: '',
  },
  {
    id: 'cities',
    label: 'المدن',
    icon: '🏙️',
    visible: true,
    title: 'نخدمك في أبرز المدن',
    subtitle: 'تغطية جغرافية واسعة',
    description: '',
    image: '',
  },
  {
    id: 'services',
    label: 'الخدمات',
    icon: '🔑',
    visible: true,
    title: 'ماذا نقدم لك؟',
    subtitle: 'خدماتنا',
    description: 'نقدم حلولاً عقارية شاملة',
    image: '',
  },
  {
    id: 'about',
    label: 'عن الشركة',
    icon: '🏢',
    visible: true,
    title: 'من نحن؟',
    subtitle: 'قصتنا',
    description: 'شركة متخصصة في بيع وتأجير العقارات',
    image: '',
  },
];

// ─── Sortable Item ────────────────────────────────────────────────────────────
function SortableSection({ section, onEdit, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white border transition-all ${
        section.visible ? 'border-[#8A6924]/20' : 'border-gray-200 opacity-60'
      } ${isDragging ? 'shadow-premium-lg' : 'hover:border-[#8A6924]/40 hover:shadow-sm'}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[#6b5e3e]/40 hover:text-[#8A6924] cursor-grab active:cursor-grabbing p-1 touch-none"
        title="اسحب لإعادة الترتيب"
      >
        <FaGripVertical size={14} />
      </button>

      {/* Icon & label */}
      <span className="text-xl">{section.icon}</span>
      <div className="flex-1">
        <div className="text-[#12283C] font-bold text-sm">{section.label}</div>
        {section.title && (
          <div className="text-[#6b5e3e] text-xs truncate max-w-[200px]">{section.title}</div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggle(section.id)}
          className={`p-1.5 rounded transition-colors ${
            section.visible
              ? 'text-[#8A6924] hover:text-[#6b5219]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
          title={section.visible ? 'إخفاء' : 'إظهار'}
        >
          {section.visible ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
        </button>
        <button
          onClick={() => onEdit(section.id)}
          className="p-1.5 text-[#12283C] hover:text-[#8A6924] transition-colors"
          title="تعديل"
        >
          <FaEdit size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ section, onSave, onClose }) {
  const [form, setForm] = useState({ ...section });

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md shadow-xl border border-[#8A6924]/20"
      >
        <div className="flex items-center justify-between p-4 border-b border-[#8A6924]/10 bg-[#12283C]">
          <h3 className="text-[#DFBA6B] font-black text-sm">
            تعديل: {section.label}
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[#12283C] text-xs font-bold mb-1.5">العنوان الرئيسي</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="ds-input"
              placeholder="العنوان الرئيسي للقسم"
            />
          </div>
          <div>
            <label className="block text-[#12283C] text-xs font-bold mb-1.5">العنوان الفرعي</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              className="ds-input"
              placeholder="العنوان الفرعي"
            />
          </div>
          <div>
            <label className="block text-[#12283C] text-xs font-bold mb-1.5">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="ds-input resize-none"
              placeholder="وصف القسم"
            />
          </div>
          <div>
            <label className="block text-[#12283C] text-xs font-bold mb-1.5">رابط الصورة</label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="ds-input"
              placeholder="https://..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex gap-3 p-4 border-t border-[#8A6924]/10">
          <button
            onClick={() => onSave(form)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#8A6924] text-white font-bold text-sm hover:bg-[#DFBA6B] hover:text-[#12283C] transition-colors"
          >
            <FaCheck size={12} />
            حفظ التغييرات
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#8A6924]/30 text-[#12283C] font-bold text-sm hover:bg-[#8A6924]/5 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main PageBuilder ─────────────────────────────────────────────────────────
export default function PageBuilder() {
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [editingId, setEditingId] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Load config from API
  useEffect(() => {
    getConfig()
      .then((r) => {
        if (r.data?.pageSections) {
          setSections(r.data.pageSections);
        }
      })
      .catch(() => {});
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggle = (id) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const handleEditSave = (updated) => {
    setSections((prev) =>
      prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
    );
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveConfig({ pageSections: sections });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError('حدث خطأ أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const editingSection = editingId ? sections.find((s) => s.id === editingId) : null;
  const activeSection = activeId ? sections.find((s) => s.id === activeId) : null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[#12283C] font-black text-xl">محرر الصفحة الرئيسية</h2>
          <p className="text-[#6b5e3e] text-sm">اسحب الأقسام لإعادة ترتيبها، وانقر تعديل لتغيير المحتوى</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-sm transition-all ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-[#8A6924] text-white hover:bg-[#DFBA6B] hover:text-[#12283C]'
          }`}
        >
          {saving ? (
            <FaSpinner className="animate-spin" />
          ) : saved ? (
            <FaCheck />
          ) : (
            <FaSave />
          )}
          {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 p-3 bg-[#8A6924]/5 border border-[#8A6924]/10 text-xs text-[#6b5e3e] flex items-center gap-2">
        <FaGripVertical className="text-[#8A6924]" />
        اسحب من مقبض السحب لإعادة ترتيب الأقسام
      </div>

      {/* DnD List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}

        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sections.map((section) => (
              <SortableSection
                key={section.id}
                section={section}
                onEdit={setEditingId}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activeSection ? (
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-[#DFBA6B] shadow-premium-xl opacity-90">
              <FaGripVertical className="text-[#8A6924]" size={14} />
              <span className="text-xl">{activeSection.icon}</span>
              <span className="text-[#12283C] font-bold text-sm">{activeSection.label}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Order summary */}
      <div className="mt-6 p-4 bg-[#12283C]/5 border border-[#12283C]/10">
        <h4 className="text-[#12283C] font-bold text-xs mb-2">الترتيب الحالي:</h4>
        <div className="flex flex-wrap gap-2">
          {sections
            .filter((s) => s.visible)
            .map((s, i) => (
              <span key={s.id} className="text-xs px-2 py-1 bg-[#8A6924] text-white font-bold">
                {i + 1}. {s.label}
              </span>
            ))}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSection && (
          <EditModal
            section={editingSection}
            onSave={handleEditSave}
            onClose={() => setEditingId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

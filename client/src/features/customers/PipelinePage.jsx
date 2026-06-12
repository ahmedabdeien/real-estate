import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { customersAPI } from '../../api/services';
import { Avatar } from '../../components/ui/Avatar';
import {
  FaUserPlus, FaPhone, FaEye, FaCircle,
  FaFilter, FaArrowsLeftRight, FaMoneyBillWave,
  FaCalendarDays, FaUser,
} from 'react-icons/fa6';
import toast from 'react-hot-toast';

const STAGES = [
  { id: 'new_lead',    label: 'عملاء جدد',       color: '#6366f1', bg: '#eef2ff' },
  { id: 'contacted',  label: 'تم التواصل',        color: '#f59e0b', bg: '#fffbeb' },
  { id: 'interested', label: 'مهتم',              color: '#3b82f6', bg: '#eff6ff' },
  { id: 'negotiating',label: 'في التفاوض',        color: '#da1f27', bg: '#fff1f2' },
  { id: 'contracted', label: 'تم التعاقد',        color: '#009756', bg: '#f0fdf4' },
  { id: 'lost',       label: 'فرصة ضائعة',       color: '#9ca3af', bg: '#f9fafb' },
];

const SOURCE_LABELS = {
  walk_in: 'مباشر', referral: 'إحالة', online: 'إنترنت',
  social_media: 'سوشيال', other: 'أخرى',
};

const fmt = (n) => Number(n || 0).toLocaleString('en-US');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' }) : null;

/* ─── Customer Card (draggable) ─── */
function CustomerCard({ customer, stageColor, overlay = false }) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: customer._id,
    data: { customer },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging && !overlay ? 0.35 : 1,
    cursor: overlay ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-xl border select-none transition-shadow hover:shadow-md"
      style={{
        ...style,
        borderColor: isDragging ? stageColor : '#e5e7eb',
        borderWidth: isDragging ? 2 : 1,
        padding: '12px 14px',
        marginBottom: 8,
        boxShadow: overlay ? '0 12px 32px rgba(0,0,0,0.15)' : undefined,
      }}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={customer.name} size={34} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: '#111827' }}>{customer.name}</p>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: '#6b7280' }}>
            <FaPhone className="text-[9px]" /> {customer.phone}
          </p>
        </div>
      </div>

      {customer.totalBalance > 0 && (
        <div className="flex items-center gap-1 mt-2.5 text-xs font-semibold" style={{ color: '#059669' }}>
          <FaMoneyBillWave className="text-[10px]" />
          {fmt(customer.totalBalance)} ج.م
        </div>
      )}

      <div className="flex items-center justify-between mt-2.5">
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ background: '#f3f4f6', color: '#6b7280' }}>
          {SOURCE_LABELS[customer.source] || customer.source}
        </span>
        {customer.followUpDate && (
          <span className="text-[10px] flex items-center gap-1" style={{ color: '#f59e0b' }}>
            <FaCalendarDays className="text-[9px]" />
            {fmtDate(customer.followUpDate)}
          </span>
        )}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer._id}`); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: '#f3f4f6', color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.background = stageColor + '20'; e.currentTarget.style.color = stageColor; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <FaEye className="text-[10px]" />
        </button>
      </div>
    </div>
  );
}

/* ─── Stage Column (droppable) ─── */
function StageColumn({ stage, customers, onAddClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = customers.reduce((s, c) => s + (c.totalBalance || 0), 0);

  return (
    <div className="flex-shrink-0" style={{ width: 264 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <FaCircle className="text-[8px]" style={{ color: stage.color }} />
          <span className="font-bold text-sm" style={{ color: '#111827' }}>{stage.label}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: stage.color + '18', color: stage.color }}>
            {customers.length}
          </span>
        </div>
      </div>

      {/* Value summary */}
      {total > 0 && (
        <div className="text-[11px] font-semibold px-1 mb-2" style={{ color: '#6b7280' }}>
          {fmt(total)} ج.م
        </div>
      )}

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        style={{
          minHeight: 120,
          background: isOver ? stage.color + '08' : stage.bg,
          border: `2px dashed ${isOver ? stage.color : 'transparent'}`,
          borderRadius: 12,
          padding: '8px 8px 4px',
          transition: 'all 0.15s',
        }}
      >
        {customers.map(c => (
          <CustomerCard key={c._id} customer={c} stageColor={stage.color} />
        ))}

        {customers.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-20 text-xs" style={{ color: stage.color + '60' }}>
            اسحب عميل هنا
          </div>
        )}
      </div>

      {/* Add button */}
      <button
        onClick={() => onAddClick(stage.id)}
        className="w-full mt-2 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        style={{ color: stage.color, background: 'transparent', border: `1px dashed ${stage.color}40`, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = stage.color + '08'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <FaUserPlus className="text-[10px]" /> إضافة عميل
      </button>
    </div>
  );
}

/* ─── Pipeline Page ─── */
export default function PipelinePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [grouped, setGrouped] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['pipeline'],
    queryFn: () => customersAPI.getPipeline().then(r => r.data.data),
  });

  useEffect(() => {
    if (data?.grouped) setGrouped(data.grouped);
  }, [data]);

  // keep local copy for optimistic DnD
  const currentGrouped = grouped || data?.grouped || Object.fromEntries(STAGES.map(s => [s.id, []]));

  const stageMut = useMutation({
    mutationFn: ({ id, stage }) => customersAPI.updateStage(id, stage),
    onError: () => {
      toast.error('فشل تحديث المرحلة');
      qc.invalidateQueries({ queryKey: ['pipeline'] });
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragStart = useCallback(({ active }) => {
    for (const stage of STAGES) {
      const c = (currentGrouped[stage.id] || []).find(x => x._id === active.id);
      if (c) { setActiveCustomer({ customer: c, stage }); break; }
    }
  }, [currentGrouped]);

  const handleDragEnd = useCallback(({ active, over }) => {
    setActiveCustomer(null);
    if (!over || !active) return;
    const toStage = over.id;
    if (!STAGES.find(s => s.id === toStage)) return;

    let fromStage = null;
    let movedCustomer = null;
    for (const s of STAGES) {
      const found = (currentGrouped[s.id] || []).find(x => x._id === active.id);
      if (found) { fromStage = s.id; movedCustomer = found; break; }
    }
    if (!movedCustomer || fromStage === toStage) return;

    // Optimistic update
    const next = { ...currentGrouped };
    next[fromStage] = next[fromStage].filter(x => x._id !== active.id);
    next[toStage] = [{ ...movedCustomer, pipelineStage: toStage }, ...(next[toStage] || [])];
    setGrouped(next);

    stageMut.mutate({ id: active.id, stage: toStage });
  }, [currentGrouped, stageMut]);

  const activeStage = activeCustomer ? STAGES.find(s => s.id === activeCustomer.stage.id) : null;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(s => (
            <div key={s.id} className="flex-shrink-0 rounded-xl animate-pulse"
              style={{ width: 264, height: 400, background: s.bg }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{ color: '#111827' }}>
            <FaArrowsLeftRight className="inline ml-2 text-base" style={{ color: '#da1f27' }} />
            مسار المبيعات
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            اسحب العملاء بين المراحل لتتبع مسار صفقاتك
          </p>
        </div>
        <button
          onClick={() => navigate('/customers')}
          className="btn btn-outline text-sm flex items-center gap-2"
        >
          <FaFilter className="text-xs" /> عرض القائمة
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6" style={{ alignItems: 'flex-start' }}>
          {STAGES.map(stage => (
            <StageColumn
              key={stage.id}
              stage={stage}
              customers={currentGrouped[stage.id] || []}
              onAddClick={() => navigate('/customers')}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCustomer && activeStage && (
            <CustomerCard
              customer={activeCustomer.customer}
              stageColor={activeStage.color}
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

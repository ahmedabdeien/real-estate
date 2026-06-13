import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { FaTrash } from 'react-icons/fa6';

const ConfirmDialog = ({ open, onClose, onConfirm, title = 'تأكيد الحذف', message, loading }) => (
  <Modal open={open} onClose={onClose} size="sm"
    footer={
      <>
        <Button variant="outline" onClick={onClose} disabled={loading}>إلغاء</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          <FaTrash className="text-xs" /> حذف
        </Button>
      </>
    }
  >
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#fee2e2,#fecaca)', border: '1px solid #fca5a5' }}>
        <FaTrash className="text-2xl text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-black mb-1.5" style={{ color: 'var(--color-text-dark)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {message || 'هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.'}
        </p>
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;

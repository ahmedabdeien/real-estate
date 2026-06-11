import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaXmark } from 'react-icons/fa6';

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-full mx-4' };

const Modal = ({ open, onClose, title, children, size = 'md', footer }) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className={`card relative w-full ${sizes[size]} max-h-[92vh] flex flex-col z-10`}
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.22), 0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-dark)' }}>{title}</h2>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                style={{ color: 'var(--color-text-muted)' }}>
                <FaXmark className="text-sm" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 flex justify-end gap-3"
              style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default Modal;

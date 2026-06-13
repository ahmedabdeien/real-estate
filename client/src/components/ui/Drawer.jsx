import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaXmark } from 'react-icons/fa6';

const Drawer = ({ open, onClose, title, children, side = 'right', width = 'w-96' }) => {
  const variants = {
    right: { hidden: { x: '100%' }, visible: { x: 0 } },
    left: { hidden: { x: '-100%' }, visible: { x: 0 } },
  };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={variants[side].hidden} animate={variants[side].visible} exit={variants[side].hidden}
            transition={{ type: 'tween', duration: 0.25 }}
            className={`absolute ${side}-0 top-0 bottom-0 ${width} flex flex-col`}
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-lg">{title}</h3>
              <button className="btn btn-ghost btn-icon rounded-full" onClick={onClose}><FaXmark /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Drawer;

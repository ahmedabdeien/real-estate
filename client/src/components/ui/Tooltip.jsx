import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Tooltip({ children, content, placement = 'top', delay = 300 }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  const show = () => { timer.current = setTimeout(() => setVisible(true), delay); };
  const hide = () => { clearTimeout(timer.current); setVisible(false); };

  const positions = {
    top:    { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 6 },
    bottom: { top: '100%',    left: '50%', transform: 'translateX(-50%)', marginTop: 6 },
    left:   { right: '100%', top: '50%',  transform: 'translateY(-50%)', marginRight: 6 },
    right:  { left: '100%',  top: '50%',  transform: 'translateY(-50%)', marginLeft: 6 },
  };

  const origins = { top: 'bottom center', bottom: 'top center', left: 'right center', right: 'left center' };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {visible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            style={{ position: 'absolute', zIndex: 9999, transformOrigin: origins[placement], ...positions[placement] }}
            className="pointer-events-none"
          >
            <div
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap shadow-lg"
              style={{ background: '#1a1a1a' }}
            >
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;

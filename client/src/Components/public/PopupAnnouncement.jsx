import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark, FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useCms } from "../../hooks/useCms";

const SESSION_KEY = "popup_dismissed_v1";

export default function PopupAnnouncement() {
  const { data: cms, loading } = useCms("popup_announcement", {
    popup_enabled:     "false",
    popup_title:       "",
    popup_message:     "",
    popup_button_text: "",
    popup_button_link: "",
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    const enabled = cms.popup_enabled === "true" || cms.popup_enabled === true;
    if (!enabled) return;
    if (!cms.popup_title && !cms.popup_message) return;
    // Don't show again in the same browser session
    if (sessionStorage.getItem(SESSION_KEY)) return;
    // Small delay for better UX
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [loading, cms]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            dir="rtl"
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors z-10"
              >
                <FaXmark className="w-4 h-4" />
              </button>

              {/* Top accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" />

              <div className="p-6 pt-5">
                {/* Icon + Title */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                      {cms.popup_title}
                    </h3>
                  </div>
                </div>

                {/* Message */}
                {cms.popup_message && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-5 whitespace-pre-line">
                    {cms.popup_message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {cms.popup_button_text && cms.popup_button_link && (
                    <a
                      href={cms.popup_button_link}
                      target={cms.popup_button_link.startsWith("http") ? "_blank" : "_self"}
                      rel="noreferrer"
                      onClick={dismiss}
                      className="flex items-center gap-2 flex-1 justify-center bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    >
                      {cms.popup_button_text}
                      {cms.popup_button_link.startsWith("http") && <FaArrowUpRightFromSquare className="w-3.5 h-3.5" />}
                    </a>
                  )}
                  <button
                    onClick={dismiss}
                    className="flex-shrink-0 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

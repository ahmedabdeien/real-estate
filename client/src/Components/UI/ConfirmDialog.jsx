/**
 * ConfirmDialog — Reusable confirmation modal
 * Replaces all inline confirm implementations across pages
 *
 * Usage:
 *   const confirm = useDisclosure();
 *   <button onClick={() => confirm.open(item)}>Delete</button>
 *   <ConfirmDialog
 *     isOpen={confirm.isOpen}
 *     onClose={confirm.close}
 *     onConfirm={() => { deleteMutation.mutate(confirm.data._id); confirm.close(); }}
 *     title="حذف العنصر"
 *     message={`هل تريد حذف "${confirm.data?.name}"؟`}
 *     loading={deleteMutation.isPending}
 *   />
 */
import { AnimatePresence, motion } from "framer-motion";
import { FaTrash, FaTriangleExclamation, FaXmark, FaSpinner } from "react-icons/fa6";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title     = "تأكيد الحذف",
  message   = "هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.",
  confirmLabel = "حذف",
  cancelLabel  = "إلغاء",
  loading   = false,
  variant   = "danger", // danger | warning | info
}) {
  const colors = {
    danger:  { icon: "bg-red-100 dark:bg-red-900/30 text-red-600",  btn: "bg-red-600 hover:bg-red-700" },
    warning: { icon: "bg-amber-100 dark:bg-amber-900/30 text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    info:    { icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600", btn: "bg-blue-600 hover:bg-blue-700" },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 z-10"
          >
            <div className="flex items-start gap-4 mb-5">
              <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                {variant === "danger" ? <FaTrash className="w-5 h-5" /> : <FaTriangleExclamation className="w-5 h-5" />}
              </span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{message}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                <FaXmark className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-60 flex items-center gap-2 ${colors.btn}`}
              >
                {loading && <FaSpinner className="w-3.5 h-3.5 animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

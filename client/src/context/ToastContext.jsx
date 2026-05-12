import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
  success: "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800",
  error: "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800",
  warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800",
  info: "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800",
};

function Toast({ toast, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-gray-900 dark:text-white text-sm">{toast.title}</p>}
        <p className="text-gray-700 dark:text-gray-300 text-sm">{toast.message}</p>
      </div>
      <button onClick={() => onClose(toast.id)} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

let _toastCounter = 0;
const genId = () => `toast_${++_toastCounter}_${Date.now()}`;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = "info", title, message, duration = 4000 }) => {
    const id = genId();
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]); // max 5 toasts
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = {
    success: (message, title) => addToast({ type: "success", message, title }),
    error: (message, title) => addToast({ type: "error", message, title }),
    warning: (message, title) => addToast({ type: "warning", message, title }),
    info: (message, title) => addToast({ type: "info", message, title }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MantineProvider, Box, Stack, Group, Text, ActionIcon, ThemeIcon } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaCircleInfo, FaXmark } from "react-icons/fa6";
import { mantineTheme } from "../mantineTheme";

const ToastContext = createContext(null);

const ICONS = { success: FaCircleCheck, error: FaCircleXmark, warning: FaTriangleExclamation, info: FaCircleInfo };
const COLORS = { success: "green", error: "red", warning: "yellow", info: "blue" };

function Toast({ toast, onClose }) {
  const Icon = ICONS[toast.type];
  const color = COLORS[toast.type];
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <Group
        align="flex-start" gap={10} p="md" wrap="nowrap" maw={380}
        bg={`${color}.0`} style={{ border: `1px solid var(--mantine-color-${color}-2)`, boxShadow: "var(--mantine-shadow-lg)" }}
      >
        <ThemeIcon variant="transparent" color={color} size={20}><Icon size={18} /></ThemeIcon>
        <Box style={{ flex: 1, minWidth: 0 }}>
          {toast.title && <Text fw={700} size="sm">{toast.title}</Text>}
          <Text size="sm" c="dark.6">{toast.message}</Text>
        </Box>
        <ActionIcon variant="transparent" color="gray" size="sm" onClick={() => onClose(toast.id)}><FaXmark size={14} /></ActionIcon>
      </Group>
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
      <MantineProvider theme={mantineTheme}>
        <Box pos="fixed" bottom={16} left={16} style={{ zIndex: 9999 }}>
          <Stack gap={8}>
            <AnimatePresence>
              {toasts.map((t) => (
                <Toast key={t.id} toast={t} onClose={removeToast} />
              ))}
            </AnimatePresence>
          </Stack>
        </Box>
      </MantineProvider>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

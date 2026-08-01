/**
 * ConfirmDialog — Reusable confirmation modal (Mantine)
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
import { MantineProvider, Modal, Group, ThemeIcon, Text, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaTrash, FaTriangleExclamation } from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.",
  confirmLabel = "حذف",
  cancelLabel = "إلغاء",
  loading = false,
  variant = "danger", // danger | warning | info
}) {
  const color = { danger: "red", warning: "yellow", info: "blue" }[variant];

  return (
    <MantineProvider theme={mantineTheme}>
      <Modal opened={isOpen} onClose={onClose} withCloseButton={false} size="sm" dir="rtl" centered>
        <Group align="flex-start" gap="md" mb="lg">
          <ThemeIcon size={44} color={color} variant="light">
            {variant === "danger" ? <FaTrash size={18} /> : <FaTriangleExclamation size={18} />}
          </ThemeIcon>
          <div style={{ flex: 1 }}>
            <Text fw={700}>{title}</Text>
            <Text size="sm" c="dimmed" mt={4}>{message}</Text>
          </div>
        </Group>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button color={color} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </Group>
      </Modal>
    </MantineProvider>
  );
}

import { MantineProvider, Modal, Group, ThemeIcon, Text, Button } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaTriangleExclamation } from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Modal opened={open} onClose={onCancel} withCloseButton={false} size="sm" dir="rtl" centered>
        <Group align="flex-start" gap="md" mb="lg">
          <ThemeIcon size={44} color="red" variant="light"><FaTriangleExclamation size={18} /></ThemeIcon>
          <div style={{ flex: 1 }}>
            <Text fw={700}>{title || "تأكيد الحذف"}</Text>
            <Text size="sm" c="dimmed" mt={4}>{message || "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء."}</Text>
          </div>
        </Group>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onCancel} disabled={loading}>إلغاء</Button>
          <Button color="red" onClick={onConfirm} loading={loading}>تأكيد الحذف</Button>
        </Group>
      </Modal>
    </MantineProvider>
  );
}

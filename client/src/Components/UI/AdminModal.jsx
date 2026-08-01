/**
 * AdminModal — Shared modal wrapper for admin pages (Mantine)
 *
 * Usage:
 *   <AdminModal isOpen={modal.isOpen} onClose={modal.close} title="إضافة عميل" size="lg">
 *     ...form content...
 *   </AdminModal>
 */
import { MantineProvider, Modal, Group, ThemeIcon, Box, Title, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

const SIZES = { sm: "sm", md: "md", lg: "lg", xl: "xl", "2xl": "xl", "3xl": "1100px", full: "100%" };

export default function AdminModal({
  isOpen, onClose, title, subtitle, children, footer,
  size = "lg", closeOnBackdrop = true, hideClose = false, icon,
}) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Modal
        opened={isOpen}
        onClose={onClose}
        size={SIZES[size] || SIZES.lg}
        closeOnClickOutside={closeOnBackdrop}
        withCloseButton={!hideClose}
        dir="rtl"
        title={
          title ? (
            <Group gap={10}>
              {icon && <ThemeIcon size={32} color="brand"><Box fz={14}>{icon}</Box></ThemeIcon>}
              <Box>
                <Title order={3} fz="md" fw={700}>{title}</Title>
                {subtitle && <Text size="xs" c="dimmed">{subtitle}</Text>}
              </Box>
            </Group>
          ) : undefined
        }
        styles={{ body: { paddingTop: title ? undefined : 20 } }}
      >
        {children}
        {footer && (
          <Group justify="flex-end" gap="sm" mt="lg" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            {footer}
          </Group>
        )}
      </Modal>
    </MantineProvider>
  );
}

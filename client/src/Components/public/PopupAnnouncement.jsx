import { useEffect, useState } from "react";
import { Modal, Group, Stack, Text, Title, Button, ThemeIcon, Box } from "@mantine/core";
import { FaArrowUpRightFromSquare, FaBullhorn } from "react-icons/fa6";
import { useCms } from "../../hooks/useCms";

const SESSION_KEY = "popup_dismissed_v1";

export default function PopupAnnouncement() {
  const { data: cms, loading } = useCms("popup_announcement", {
    popup_enabled: "false", popup_title: "", popup_message: "", popup_button_text: "", popup_button_link: "",
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) return;
    const enabled = cms.popup_enabled === "true" || cms.popup_enabled === true;
    if (!enabled) return;
    if (!cms.popup_title && !cms.popup_message) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, [loading, cms]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  return (
    <Modal opened={visible} onClose={dismiss} size="md" radius="lg" centered withCloseButton={false} padding={0}>
      <Box h={5} bg="brand.6" style={{ borderTopLeftRadius: "var(--mantine-radius-lg)", borderTopRightRadius: "var(--mantine-radius-lg)" }} />
      <Stack gap="md" p="lg" dir="rtl">
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <ThemeIcon size={40} radius="lg" variant="light" color="brand"><FaBullhorn size={18} /></ThemeIcon>
          <Title order={3} size="lg" lh={1.3} style={{ flex: 1 }}>{cms.popup_title}</Title>
        </Group>

        {cms.popup_message && <Text c="dimmed" size="sm" lh={1.7} style={{ whiteSpace: "pre-line" }}>{cms.popup_message}</Text>}

        <Group gap="sm">
          {cms.popup_button_text && cms.popup_button_link && (
            <Button
              component="a" href={cms.popup_button_link}
              target={cms.popup_button_link.startsWith("http") ? "_blank" : "_self"} rel="noreferrer"
              onClick={dismiss} color="brand" style={{ flex: 1 }}
              rightSection={cms.popup_button_link.startsWith("http") ? <FaArrowUpRightFromSquare size={13} /> : undefined}
            >
              {cms.popup_button_text}
            </Button>
          )}
          <Button variant="default" onClick={dismiss}>إغلاق</Button>
        </Group>
      </Stack>
    </Modal>
  );
}

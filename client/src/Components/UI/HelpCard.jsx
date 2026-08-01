import { useState } from "react";
import { MantineProvider, UnstyledButton, Group, Text, Stack, Box, Collapse } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaCircleQuestion, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

export default function HelpCard({ title, tips }) {
  const [open, setOpen] = useState(false);
  return (
    <MantineProvider theme={mantineTheme}>
      <Box bg="blue.0" mb="md" style={{ border: "1px solid var(--mantine-color-blue-2)", overflow: "hidden" }}>
        <UnstyledButton onClick={() => setOpen((p) => !p)} w="100%" px="md" py="sm">
          <Group gap={8} c="blue.7" wrap="nowrap">
            <FaCircleQuestion size={14} style={{ flexShrink: 0 }} />
            <Text size="sm" fw={600}>{title}</Text>
            {open ? <FaChevronUp size={13} style={{ marginRight: "auto" }} /> : <FaChevronDown size={13} style={{ marginRight: "auto" }} />}
          </Group>
        </UnstyledButton>
        <Collapse in={open}>
          <Stack gap={6} px="md" pb="md">
            {tips.map((tip, i) => (
              <Group key={i} gap={8} align="flex-start" wrap="nowrap">
                <Box w={6} h={6} bg="blue.4" mt={6} style={{ borderRadius: 999, flexShrink: 0 }} />
                <Text size="sm" c="blue.7">{tip}</Text>
              </Group>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </MantineProvider>
  );
}

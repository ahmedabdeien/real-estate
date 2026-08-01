import { MantineProvider, Stack, ThemeIcon, Title, Text, Box } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaInbox } from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

export default function EmptyState({ icon: Icon = FaInbox, title = "لا توجد بيانات", description, action }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Stack align="center" py={64} px="md" gap={4}>
        <ThemeIcon size={64} variant="light" color="gray" mb="xs"><Icon size={28} /></ThemeIcon>
        <Title order={3} size="h4">{title}</Title>
        {description && <Text c="dimmed" size="sm" maw={360} ta="center">{description}</Text>}
        {action && <Box mt="sm">{action}</Box>}
      </Stack>
    </MantineProvider>
  );
}

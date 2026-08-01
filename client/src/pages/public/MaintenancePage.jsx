import { Box, Center, Stack, Image, Title, Text, Group, ThemeIcon } from "@mantine/core";
import { FaPhone, FaEnvelope } from "react-icons/fa6";
import logo from "../../assets/logo.svg";

export default function MaintenancePage() {
  return (
    <Box dir="rtl" mih="100vh" bg="white" style={{ display: "flex", alignItems: "center" }}>
      <Center w="100%" px="md">
        <Stack align="center" gap="lg" maw={560} ta="center">
          <Image src={logo} alt="AG Development" h={48} w="auto" fit="contain" />

          <Title order={1} fz={{ base: 32, sm: 40 }} fw={900} c="dark.8" mt="md">
            قيد التطوير
          </Title>

          <Text size="lg" c="dimmed" lh={1.8}>
            نعمل حالياً على تطوير جذري وشامل للموقع لنقدّم لكم تجربة أفضل تليق بمشروعاتنا.
            سنعود قريباً بحلة جديدة بالكامل — نشكركم على صبركم وتفهّمكم.
          </Text>

          <Group gap="xl" mt="md">
            <Group gap={8}>
              <ThemeIcon size={32} variant="light" color="brand" radius="xl"><FaPhone size={13} /></ThemeIcon>
              <Text size="sm" c="dimmed" dir="ltr">01234567890</Text>
            </Group>
            <Group gap={8}>
              <ThemeIcon size={32} variant="light" color="brand" radius="xl"><FaEnvelope size={13} /></ThemeIcon>
              <Text size="sm" c="dimmed">info@agdevelopments-eg.com</Text>
            </Group>
          </Group>

          <Text size="xs" c="gray.5" mt="xl">AG Development © {new Date().getFullYear()}</Text>
        </Stack>
      </Center>
    </Box>
  );
}

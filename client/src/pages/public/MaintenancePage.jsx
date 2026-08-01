import { Box, Center, Stack, Image, Title, Text, Group, ThemeIcon } from "@mantine/core";
import { FaEnvelope } from "react-icons/fa6";
import logo from "../../assets/logo.svg";

export default function MaintenancePage() {
  return (
    <Box dir="ltr" mih="100vh" bg="white" style={{ display: "flex", alignItems: "center" }}>
      <Center w="100%" px="md">
        <Stack align="center" gap="lg" maw={560} ta="center">
          <Image src={logo} alt="AG Development" h={48} w="auto" fit="contain" />

          <Title order={1} fz={{ base: 32, sm: 40 }} fw={900} c="dark.8" mt="md">
            Under Development
          </Title>

          <Text size="lg" c="dimmed" lh={1.8}>
            We're currently working on a complete redesign of our website to bring you a better
            experience worthy of our projects. We'll be back soon with an entirely new look —
            thank you for your patience and understanding.
          </Text>

          <Group gap={8} mt="md">
            <ThemeIcon size={32} variant="light" color="brand" radius="xl"><FaEnvelope size={13} /></ThemeIcon>
            <Text size="sm" c="dimmed">info@agdevelopments-eg.com</Text>
          </Group>

          <Text size="xs" c="gray.5" mt="xl">AG Development © {new Date().getFullYear()}</Text>
        </Stack>
      </Center>
    </Box>
  );
}

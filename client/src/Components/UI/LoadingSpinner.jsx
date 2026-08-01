import { MantineProvider, Loader, Center, Stack, Text } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

export default function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "sm", md: "md", lg: "lg" };
  return (
    <MantineProvider theme={mantineTheme}>
      <Center>
        <Loader color="brand" size={sizes[size] || "md"} />
      </Center>
    </MantineProvider>
  );
}

export function PageLoader() {
  return (
    <MantineProvider theme={mantineTheme}>
      <Stack
        align="center"
        justify="center"
        gap="md"
        style={{ position: "fixed", inset: 0, background: "white", zIndex: 9999 }}
      >
        <Loader color="brand" size="lg" />
        <Text c="brand.6" fw={700} size="sm" style={{ letterSpacing: 1 }}>AG Development</Text>
      </Stack>
    </MantineProvider>
  );
}

/**
 * PageHeader — Shared admin page header (Mantine)
 * Self-contained MantineProvider so it renders correctly whether the parent
 * route is under AdminLayout or the (Tailwind) StaffLayout.
 *
 * Usage:
 *   <PageHeader
 *     title="إدارة العملاء"
 *     subtitle="عرض وإدارة جميع العملاء المحتملين"
 *     icon={<FaUsers />}
 *     actions={<PrimaryButton onClick={modal.open}>+ إضافة عميل</PrimaryButton>}
 *     stats={[{ label: "الإجمالي", value: 234 }]}
 *   />
 */
import { MantineProvider, Box, Group, Title, Text, ThemeIcon, Badge, Loader, Button, Breadcrumbs, Anchor } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

export default function PageHeader({ title, subtitle, icon, actions, stats, loading = false, breadcrumbs }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <Box bg="white" px="lg" py="md" dir="rtl" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        {breadcrumbs && (
          <Breadcrumbs mb="sm" separator="/">
            {breadcrumbs.map((b, i) => (
              <Anchor key={i} fw={i === breadcrumbs.length - 1 ? 600 : 400} c={i === breadcrumbs.length - 1 ? "dark.6" : "dimmed"} underline="never" fz="xs">
                {b}
              </Anchor>
            ))}
          </Breadcrumbs>
        )}

        <Group justify="space-between" wrap="wrap" gap="md">
          <Group gap="sm">
            {icon && (
              <ThemeIcon size={36} color="brand" variant="filled">
                {icon}
              </ThemeIcon>
            )}
            <Box>
              <Group gap={8}>
                <Title order={1} fz="xl" fw={900} c="dark.8">{title}</Title>
                {loading && <Loader size={14} color="gray" />}
              </Group>
              {subtitle && <Text size="sm" c="dimmed" mt={2}>{subtitle}</Text>}
            </Box>
          </Group>

          {actions && <Group gap={8}>{actions}</Group>}
        </Group>

        {stats?.length > 0 && (
          <Group gap="sm" mt="md">
            {stats.map((s, i) => (
              <Badge key={i} variant="light" color="gray" size="lg" radius="sm" leftSection={s.icon}>
                <Text component="span" c="dimmed" fw={400}>{s.label}: </Text>
                <Text component="span" fw={700}>{s.value ?? "—"}</Text>
              </Badge>
            ))}
          </Group>
        )}
      </Box>
    </MantineProvider>
  );
}

/** Shared action button used in page headers */
export function PrimaryButton({ children, onClick, loading, icon, disabled, ...props }) {
  return (
    <Button onClick={onClick} loading={loading} disabled={disabled} color="brand" leftSection={!loading ? icon : undefined} {...props}>
      {children}
    </Button>
  );
}

/** Secondary / outline button */
export function SecondaryButton({ children, onClick, icon, ...props }) {
  return (
    <Button onClick={onClick} variant="default" leftSection={icon} {...props}>
      {children}
    </Button>
  );
}

/** Danger button */
export function DangerButton({ children, onClick, loading, icon, disabled, ...props }) {
  return (
    <Button onClick={onClick} loading={loading} disabled={disabled} color="red" leftSection={!loading ? icon : undefined} {...props}>
      {children}
    </Button>
  );
}

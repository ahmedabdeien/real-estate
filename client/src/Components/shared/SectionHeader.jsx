/**
 * SectionHeader — عنوان القسم المشترك
 * Usage: <SectionHeader badge="مشاريعنا" title="المشاريع المميزة" desc="..." />
 */
import { Stack, Text, Title } from "@mantine/core";

export default function SectionHeader({ badge, title, desc, align = "center" }) {
  const ta = { center: "center", right: "right", left: "left" }[align] || "center";
  return (
    <Stack align={ta === "center" ? "center" : ta === "right" ? "flex-end" : "flex-start"} gap={6} ta={ta}>
      {badge && <Text c="brand.6" fw={800} size="sm" tt="uppercase" style={{ letterSpacing: 2 }}>{badge}</Text>}
      {title && <Title order={2} fz={{ base: 26, sm: 30, md: 36 }} c="dark.8" mt={4}>{title}</Title>}
      {desc && <Text c="dimmed" maw={ta === "center" ? 560 : undefined}>{desc}</Text>}
    </Stack>
  );
}

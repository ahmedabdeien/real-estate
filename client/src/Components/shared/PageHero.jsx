/**
 * PageHero — مكوّن الهيدر المشترك لجميع صفحات الموقع العام
 * Usage: <PageHero title="..." subtitle="..." badge="..." image="..." />
 */
import { Box, Container, Title, Text, Badge } from "@mantine/core";

export default function PageHero({ title, subtitle, badge, children, align = "center" }) {
  const ta = { center: "center", right: "right", left: "left" }[align] || "center";

  return (
    <Box component="section" bg="white" pt={{ base: 48, md: 64 }} pb={{ base: 32, md: 40 }} className="page-hero">
      <Container size="md" ta={ta}>
        {badge && (
          <Badge size="lg" variant="light" color="brand" mb="md">
            {badge}
          </Badge>
        )}
        {title && (
          <Title order={1} c="dark.7" fz={{ base: 28, sm: 34, md: 40 }} fw={900} lh={1.2} mb="sm">
            {title}
          </Title>
        )}
        {subtitle && (
          <Text c="dimmed" fz={{ base: "sm", md: "lg" }} maw={620} mx={ta === "center" ? "auto" : 0}>
            {subtitle}
          </Text>
        )}
        {children && <Box mt="lg">{children}</Box>}
      </Container>
    </Box>
  );
}

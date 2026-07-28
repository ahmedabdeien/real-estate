/**
 * PageHero — مكوّن الهيدر المشترك لجميع صفحات الموقع العام
 * Usage: <PageHero title="..." subtitle="..." badge="..." image="..." />
 */
import { Box, Container, Title, Text, Badge } from "@mantine/core";

export default function PageHero({ title, subtitle, badge, image, children, align = "center" }) {
  const ta = { center: "center", right: "right", left: "left" }[align] || "center";

  return (
    <Box className="public-hero" pos="relative" py={{ base: 56, md: 80 }} style={{ overflow: "hidden" }}>
      {image && (
        <Box
          pos="absolute" inset={0}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }}
        />
      )}
      <Container size="md" pos="relative" ta={ta}>
        {badge && (
          <Badge size="lg" variant="light" mb="md" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>
            {badge}
          </Badge>
        )}
        {title && (
          <Title order={1} c="white" fz={{ base: 30, sm: 36, md: 44 }} fw={900} lh={1.2} mb="sm">
            {title}
          </Title>
        )}
        {subtitle && (
          <Text c="brand.1" fz={{ base: "sm", md: "lg" }} maw={640} mx={ta === "center" ? "auto" : 0}>
            {subtitle}
          </Text>
        )}
        {children && <Box mt="lg">{children}</Box>}
      </Container>
    </Box>
  );
}

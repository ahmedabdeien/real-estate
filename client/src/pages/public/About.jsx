import { useEffect } from "react";
import { Box, Container, Grid, SimpleGrid, Card, Title, Text, Image, ThemeIcon, Stack } from "@mantine/core";
import { FaBuilding, FaEye, FaBullseye, FaAward, FaUsers } from "react-icons/fa6";

import { useCms } from "../../hooks/useCms";

export default function AboutPage() {
  useEffect(() => { document.title = "عن الشركة | AG Development"; }, []);
  const { data: content } = useCms("about", {
    title_ar: "عن AG Development",
    body_ar: "AG Development شركة رائدة في مجال التطوير العقاري، تأسست بهدف تقديم أفضل الوحدات السكنية والتجارية بأعلى معايير الجودة وأسعار تنافسية. نؤمن بأن كل عائلة تستحق بيتاً يليق بها.",
    vision_ar: "أن نكون الخيار الأول للتطوير العقاري في مصر، من خلال تقديم مشاريع مبتكرة تلبي تطلعات العملاء وتساهم في بناء مجتمعات متكاملة.",
    mission_ar: "تقديم حلول عقارية متكاملة تجمع بين الجودة والابتكار وخدمة العملاء الاستثنائية، مع الحفاظ على أعلى معايير الشفافية والمصداقية.",
    image: "",
  });
  const { data: stats } = useCms("stats", {
    projects_count: "50+", units_count: "2000+", clients_count: "5000+", years_experience: "15+",
  });
  const { data: hero } = useCms("about_hero", { title_ar: "", subtitle_ar: "شركة رائدة في مجال التطوير العقاري", hero_image: "" });

  const statItems = [
    { label: "مشروع", value: stats.projects_count },
    { label: "وحدة سكنية", value: stats.units_count },
    { label: "عملاء", value: stats.clients_count },
    { label: "سنة خبرة", value: stats.years_experience },
  ];

  const values = [
    { icon: FaAward, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل مشروع" },
    { icon: FaUsers, title: "خدمة العملاء", desc: "عملاؤنا في قلب كل قرار نتخذه" },
    { icon: FaBuilding, title: "الابتكار", desc: "نستمر في تطوير حلول عقارية مبتكرة" },
  ];

  return (
    <Box dir="rtl">
      {/* Story */}
      <Box className="public-section" bg="white">
        <Container size="xl">
          <Grid gutter={48} align="center">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Text c="brand.6" fw={700} size="sm" tt="uppercase" mb={6}>قصتنا</Text>
              <Title order={2} fz={{ base: 26, md: 32 }} mb="md">
                {content.founded_year ? `منذ عام ${content.founded_year}` : "رواد في عالم العقارات"}
              </Title>
              <Text c="dimmed" lh={1.8} mb="lg">{content.body_ar}</Text>
              <SimpleGrid cols={2} spacing="md">
                {statItems.map(({ label, value }) => (
                  <Card key={label} bg="gray.0" radius="md" p="md">
                    <Text fw={900} size="28px" c="brand.6">{value}</Text>
                    <Text size="sm" c="dimmed">{label}</Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              {content.image ? (
                <Image src={content.image} alt="AG Development" radius="lg" h={320} fit="cover" />
              ) : (
                <Box h={320} bg="brand.6" display="flex" style={{ alignItems: "center", justifyContent: "center", borderRadius: "var(--mantine-radius-lg)" }}>
                  <FaBuilding size={96} color="rgba(255,255,255,0.3)" />
                </Box>
              )}
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Vision & Mission */}
      <Box className="public-section" bg="gray.0">
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card className="public-card" radius="lg" p="xl">
              <ThemeIcon size={48} radius="lg" variant="light" color="brand" mb="md"><FaEye size={22} /></ThemeIcon>
              <Title order={3} size="xl" mb="sm">رؤيتنا</Title>
              <Text c="dimmed" lh={1.8}>{content.vision_ar}</Text>
            </Card>
            <Card className="public-card" radius="lg" p="xl">
              <ThemeIcon size={48} radius="lg" variant="light" color="dark" mb="md"><FaBullseye size={22} /></ThemeIcon>
              <Title order={3} size="xl" mb="sm">رسالتنا</Title>
              <Text c="dimmed" lh={1.8}>{content.mission_ar}</Text>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Values */}
      <Box className="public-section" bg="brand.6">
        <Container size="xl">
          <Title order={2} c="white" ta="center" fz={{ base: 26, md: 32 }} mb="xl">قيمنا الأساسية</Title>
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {values.map(({ icon: Icon, title, desc }) => (
              <Stack key={title} align="center" ta="center" p="lg" gap={8} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "var(--mantine-radius-lg)" }}>
                <ThemeIcon size={48} radius="lg" variant="light" color="gray.0" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <Icon size={22} color="white" />
                </ThemeIcon>
                <Text fw={700} c="white" size="lg">{title}</Text>
                <Text c="brand.1" size="sm">{desc}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}

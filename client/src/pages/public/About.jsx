import { useEffect } from "react";
import { Box, Container, Grid, SimpleGrid, Card, Title, Text, Image, ThemeIcon, Stack, Badge } from "@mantine/core";
import { FaAward, FaChartLine, FaHandshake, FaGears, FaLightbulb, FaEye, FaBullseye } from "react-icons/fa6";

import { useCms } from "../../hooks/useCms";
import rebrandImg from "../../assets/about-rebrand.webp";

export default function AboutPage() {
  useEffect(() => { document.title = "عن الشركة | AG Development"; }, []);

  const { data: content } = useCms("about", {
    title_ar: "عن AG Development",
    body_ar: "تُعد AG Development الامتداد الجديد لشركة الصرح للتطوير العقاري، حيث تمثل الهوية الجديدة تطورًا طبيعيًا لمسيرتنا وخبراتنا السابقة، مع الحفاظ على نفس الرؤية والقيم والخبرة التي بنيناها على مدار السنوات. ومن خلال AG Development، نبدأ مرحلة جديدة بهوية أكثر تطورًا وطموحًا، لتصبح المظلة الرئيسية لجميع أعمالنا ومشروعاتنا الحالية والمستقبلية في مجال التطوير العقاري، بينما نستمر في البناء على ما حققته شركة الصرح وتقديم مشروعات تعكس التزامنا بالجودة والثقة والقيمة المستدامة.",
    history_ar: "بدأت رحلتنا في محافظة بني سويف، حيث نفذنا أولى مشروعاتنا السكنية منذ عام 2000، قبل أن نوسّع أعمالنا لتشمل قلب القاهرة عام 2010. وعلى مدار أكثر من 25 عامًا، أثبتنا جدارتنا في السوق المصري من خلال منظومة عمل تعتمد على الكفاءة الهندسية والدراسات الدقيقة، وأعلى معايير الشفافية والالتزام.",
    vision_ar: "أن نكون العلامة الأبرز في التطوير العقاري بمصر، من خلال مشروعات تجمع بين التصميم العصري والجودة العالية، وتساهم في بناء مجتمعات متكاملة تليق بتطلعات عملائنا.",
    mission_ar: "تقديم وحدات عقارية تعكس التزامنا بالجودة والثقة والقيمة المستدامة، عبر تخطيط استثماري مدروس ومنظومة عمل تحتكم لأعلى معايير الاحتراف والشفافية.",
    image: "",
  });

  const { data: stats } = useCms("stats", {
    projects_count: "50+", units_count: "2000+", clients_count: "5000+", years_experience: "25+",
  });

  const statItems = [
    { label: "سنة خبرة", value: stats.years_experience },
    { label: "مشروع", value: stats.projects_count },
    { label: "وحدة سكنية", value: stats.units_count },
    { label: "عميل", value: stats.clients_count },
  ];

  const pillars = [
    { icon: FaAward, title: "الجودة والتميز", desc: "الالتزام بتنفيذ مشروعات عالية الجودة وفق أحدث المعايير الهندسية" },
    { icon: FaChartLine, title: "التخطيط الاستراتيجي", desc: "الاعتماد على دراسات استثمارية دقيقة تضمن نموًا مستدامًا لكل مشروع" },
    { icon: FaHandshake, title: "الشفافية والمصداقية", desc: "تبني الوضوح الكامل في التعامل مع العملاء والشركاء" },
    { icon: FaGears, title: "الكفاءة الهندسية", desc: "فريق عمل متخصص يضمن تنفيذ كل تفصيلة بأعلى جودة" },
    { icon: FaLightbulb, title: "الابتكار المستمر", desc: "مواكبة أحدث التقنيات والتوجهات العالمية في التطوير العقاري" },
  ];

  return (
    <Box dir="rtl">
      {/* Rebrand intro */}
      <Box className="public-section" bg="white">
        <Container size="md" ta="center">
          <Badge size="lg" variant="light" color="brand" mb="md">من الصرح إلى AG Development</Badge>
          <Title order={1} fz={{ base: 28, md: 40 }} fw={900} mb="lg">هوية جديدة، بنفس الثقة</Title>
          <Text c="dimmed" fz={{ base: "md", md: "lg" }} lh={1.9} maw={760} mx="auto">
            {content.body_ar}
          </Text>
        </Container>
        <Container size="lg" mt={{ base: 40, md: 56 }}>
          <Image src={rebrandImg} alt="من الصرح للتطوير العقاري إلى AG Development" fit="contain" mah={340} w="auto" mx="auto" />
        </Container>
      </Box>

      {/* History + stats */}
      <Box className="public-section" bg="gray.0">
        <Container size="xl">
          <Grid gutter={48} align="center">
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <Text c="brand.6" fw={700} size="sm" tt="uppercase" mb={6}>قصتنا</Text>
              <Title order={2} fz={{ base: 24, md: 30 }} mb="md">أكثر من 25 عامًا من الخبرة</Title>
              <Text c="dimmed" lh={1.9}>{content.history_ar}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <SimpleGrid cols={2} spacing="md">
                {statItems.map(({ label, value }) => (
                  <Card key={label} bg="white" p="lg">
                    <Text fw={900} size="32px" c="brand.6">{value}</Text>
                    <Text size="sm" c="dimmed">{label}</Text>
                  </Card>
                ))}
              </SimpleGrid>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Vision & Mission */}
      <Box className="public-section" bg="white">
        <Container size="xl">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            <Card className="public-card" p="xl">
              <ThemeIcon size={48} variant="light" color="brand" mb="md"><FaEye size={22} /></ThemeIcon>
              <Title order={3} size="xl" mb="sm">رؤيتنا</Title>
              <Text c="dimmed" lh={1.8}>{content.vision_ar}</Text>
            </Card>
            <Card className="public-card" p="xl">
              <ThemeIcon size={48} variant="light" color="dark" mb="md"><FaBullseye size={22} /></ThemeIcon>
              <Title order={3} size="xl" mb="sm">رسالتنا</Title>
              <Text c="dimmed" lh={1.8}>{content.mission_ar}</Text>
            </Card>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Strategic pillars */}
      <Box className="public-section" bg="brand.6">
        <Container size="xl">
          <Title order={2} c="white" ta="center" fz={{ base: 24, md: 30 }} mb={8}>ركائز عملنا</Title>
          <Text c="brand.1" ta="center" mb="xl" maw={560} mx="auto">
            منظومة عمل متكاملة تعتمد على معايير ريادية تعزز مكانتنا في السوق العقاري
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="lg">
            {pillars.map(({ icon: Icon, title, desc }) => (
              <Stack key={title} align="center" ta="center" p="lg" gap={8} style={{ background: "rgba(255,255,255,0.08)" }}>
                <ThemeIcon size={48} variant="light" color="gray.0" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Icon size={20} color="white" />
                </ThemeIcon>
                <Text fw={700} c="white">{title}</Text>
                <Text c="brand.1" size="sm">{desc}</Text>
              </Stack>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}

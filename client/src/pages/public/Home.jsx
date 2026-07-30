import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box, Container, Title, Text, Button, SimpleGrid, Card, Group, Stack,
  TextInput, Loader, Skeleton, Badge as MantineBadge, Image, ThemeIcon,
  Combobox, useCombobox,
} from "@mantine/core";
import {
  FaMagnifyingGlass, FaXmark, FaBuilding, FaLocationDot, FaPhone,
  FaHouse, FaUsers, FaAward, FaArrowLeft,
} from "react-icons/fa6";

import api from "../../api/axios";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useCms } from "../../hooks/useCms";
import heroBg from "../../assets/home-hero-bg.webp";

const typeColor = { project: "blue", unit: "teal", blog: "grape", career: "orange" };

function HeroSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const search = useCallback((q) => {
    if (!q || q.length < 2) { setResults([]); return; }
    setSearching(true);
    api.get("/search", { params: { q } })
      .then((r) => { setResults(r.data.results || []); combobox.openDropdown(); })
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [combobox]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    combobox.updateSelectedOptionIndex();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(val), 350);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    combobox.closeDropdown();
    const hasUnit = results.some((r) => r.type === "unit");
    navigate(hasUnit
      ? `/units?search=${encodeURIComponent(query.trim())}`
      : `/projects?search=${encodeURIComponent(query.trim())}`);
  };

  const clear = () => { setQuery(""); setResults([]); };

  return (
    <Box pos="relative" w="100%" maw={640} mx="auto" dir="rtl">
      <Combobox
        store={combobox}
        onOptionSubmit={(href) => { combobox.closeDropdown(); navigate(href); }}
      >
        <form onSubmit={handleSubmit}>
          <Combobox.Target>
            <TextInput
              value={query}
              onChange={handleChange}
              onFocus={() => results.length && combobox.openDropdown()}
              placeholder="ابحث عن مشاريع، وحدات، أخبار، وظائف..."
              size="lg"
              radius="lg"
              leftSection={<FaMagnifyingGlass size={16} />}
              rightSection={
                searching ? <Loader size={16} /> :
                query ? <FaXmark size={16} onClick={clear} style={{ cursor: "pointer" }} /> : null
              }
            />
          </Combobox.Target>
        </form>

        <Combobox.Dropdown>
          <Combobox.Options mah={320} style={{ overflowY: "auto" }}>
            {results.length > 0 ? results.map((r) => (
              <Combobox.Option value={r.href} key={r.href}>
                <Group wrap="nowrap">
                  {r.img ? (
                    <Image src={r.img} alt="" w={40} h={40} radius="md" fit="cover" />
                  ) : (
                    <ThemeIcon size={40} radius="md" variant="light" color="brand">
                      <FaMagnifyingGlass size={16} />
                    </ThemeIcon>
                  )}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={600} truncate c="dark.7">{r.label}</Text>
                    {r.sub && <Text size="xs" c="dimmed" truncate>{r.sub}</Text>}
                  </Box>
                  <MantineBadge color={typeColor[r.type] || "gray"} variant="filled" size="sm">{r.badge}</MantineBadge>
                </Group>
              </Combobox.Option>
            )) : (
              !searching && query.length >= 2 && (
                <Combobox.Empty>لا توجد نتائج لـ «{query}»</Combobox.Empty>
              )
            )}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Box>
  );
}

function StatItem({ icon: Icon, value, label }) {
  return (
    <Stack align="center" gap={6}>
      <ThemeIcon size={56} radius="xl" variant="light" color="brand">
        <Icon size={26} />
      </ThemeIcon>
      <Text fw={900} size="34px" c="dark.8">{value}</Text>
      <Text size="sm" c="dimmed">{label}</Text>
    </Stack>
  );
}

function ProjectCard({ project }) {
  const { label, variant } = statusBadge(project.status);
  return (
    <Card className="public-card" padding={0} radius="lg">
      <Box pos="relative" h={200} bg="gray.1">
        {project.coverImage ? (
          <Image src={project.coverImage} alt={project.name?.ar} h={200} fit="cover" />
        ) : (
          <Box h={200} display="flex" style={{ alignItems: "center", justifyContent: "center", background: "var(--mantine-color-brand-6)" }}>
            <FaBuilding size={56} color="rgba(255,255,255,0.3)" />
          </Box>
        )}
        <Group pos="absolute" top={12} right={12}><Badge variant={variant}>{label}</Badge></Group>
        {project.featured && (
          <Group pos="absolute" top={12} left={12}><Badge variant="warning">مميز</Badge></Group>
        )}
      </Box>
      <Stack gap={6} p="lg">
        <Title order={3} size="lg" c="dark.8">{project.name?.ar}</Title>
        <Group gap={6} c="dimmed">
          <FaLocationDot size={13} />
          <Text size="sm">{project.location?.city?.ar}</Text>
        </Group>
        <Group justify="space-between" pt="sm" mt={4} style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
          {project.startingPrice > 0 ? (
            <Text c="brand.6" fw={700} size="sm">من {project.startingPrice.toLocaleString()} ج</Text>
          ) : <Box />}
          <Button component={Link} to={`/projects/${project.slug}`} variant="subtle" color="brand" size="xs" rightSection={<FaArrowLeft size={12} />}>
            التفاصيل
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { data: heroCms } = useCms("hero", {
    title_ar: "AG Development",
    subtitle_ar: "نقدم لكم أفضل الوحدات السكنية والتجارية بأعلى معايير الجودة",
    background_image: "",
    cta_text_ar: "اكتشف مشاريعنا",
    cta_secondary_ar: "تواصل معنا",
  });
  const { data: statsCms } = useCms("stats", {
    projects_count: "50+", units_count: "2000+", clients_count: "5000+", years_experience: "15+",
    projects_label: "مشروع متميز", units_label: "وحدة سكنية", clients_label: "عميل سعيد", years_label: "سنة خبرة",
  });
  const { data: servicesCms } = useCms("home_services");
  const { data: ctaCms } = useCms("home_cta", {
    cta_title: "هل أنت مستعد لبدء رحلتك العقارية؟",
    cta_subtitle: "فريقنا المتخصص جاهز لمساعدتك في اختيار العقار المثالي",
    cta_button_text: "احجز استشارة مجانية",
    cta_button_link: "/contact",
    cta_phone: "",
  });

  useEffect(() => { document.title = "AG Development - الرئيسية"; }, []);

  useEffect(() => {
    api.get("/projects", { params: { featured: true, published: true, limit: 6 } })
      .then((r) => setProjects(r.data.projects || []))
      .finally(() => setLoadingProjects(false));
  }, []);

  return (
    <Box>
      {/* Hero */}
      <Box pos="relative" bg="dark.8" py={{ base: 56, md: 90 }} style={{ overflow: "hidden" }}>
        <Box
          pos="absolute" inset={0}
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <Box pos="absolute" inset={0} bg="dark.9" style={{ opacity: 0.55 }} />
        <Container size="md" ta="center" dir="rtl" pos="relative">
          <MantineBadge size="lg" variant="filled" color="brand" mb="lg">
            AG Development — مستقبلك يبدأ هنا
          </MantineBadge>
          <Title order={1} c="white" fz={{ base: 32, sm: 42, md: 54 }} fw={900} lh={1.15} mb="md">
            {heroCms.title_ar}
          </Title>
          <Text c="gray.3" fz={{ base: "md", md: "xl" }} maw={640} mx="auto" mb="xl">
            {heroCms.subtitle_ar}
          </Text>
          <Box mb="xl"><HeroSearch /></Box>
          <Group justify="center" gap="md">
            <Button component={Link} to="/projects" size="lg" radius="md" color="brand">
              {heroCms.cta_text_ar}
            </Button>
            <Button component={Link} to="/contact" size="lg" radius="md" variant="outline" color="gray.0" c="white">
              تواصل معنا
            </Button>
          </Group>
        </Container>
      </Box>

      {/* Stats */}
      <Box bg="brand.0" py={{ base: 40, md: 56 }}>
        <Container size="xl" dir="rtl">
          <SimpleGrid cols={{ base: 2, lg: 4 }} spacing="lg">
            <StatItem icon={FaBuilding} value={statsCms.projects_count} label={statsCms.projects_label} />
            <StatItem icon={FaHouse}    value={statsCms.units_count}    label={statsCms.units_label} />
            <StatItem icon={FaUsers}    value={statsCms.clients_count}  label={statsCms.clients_label} />
            <StatItem icon={FaAward}    value={statsCms.years_experience} label={statsCms.years_label} />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Services */}
      {(servicesCms?.services_title || servicesCms?.service1_title) && (
        <Box className="public-section" bg="white">
          <Container size="xl" dir="rtl">
            <Stack align="center" gap={6} mb="xl" ta="center">
              <Text c="brand.6" fw={700} size="sm" tt="uppercase">خدماتنا</Text>
              <Title order={2} fz={{ base: 28, md: 36 }} c="dark.8">{servicesCms?.services_title || "ما نقدمه لك"}</Title>
              {servicesCms?.services_subtitle && (
                <Text c="dimmed" maw={560}>{servicesCms.services_subtitle}</Text>
              )}
            </Stack>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {[1, 2, 3, 4].map((n) => {
                const title = servicesCms?.[`service${n}_title`];
                const desc  = servicesCms?.[`service${n}_desc`];
                const icon  = servicesCms?.[`service${n}_icon`];
                if (!title) return null;
                return (
                  <Card key={n} className="public-card" radius="lg" p="lg" ta="center" bg="gray.0">
                    <ThemeIcon size={56} radius="lg" variant="light" color="brand" mx="auto" mb="md">
                      {icon ? <Text fz={24}>{icon}</Text> : <FaBuilding size={26} />}
                    </ThemeIcon>
                    <Title order={3} size="md" c="dark.8" mb={6}>{title}</Title>
                    {desc && <Text size="sm" c="dimmed">{desc}</Text>}
                  </Card>
                );
              })}
            </SimpleGrid>
          </Container>
        </Box>
      )}

      {/* Featured Projects */}
      <Box className="public-section" bg="gray.0">
        <Container size="xl" dir="rtl">
          <Stack align="center" gap={6} mb="xl" ta="center">
            <Text c="brand.6" fw={700} size="sm" tt="uppercase">مشاريعنا</Text>
            <Title order={2} fz={{ base: 28, md: 36 }} c="dark.8">المشاريع المميزة</Title>
            <Text c="dimmed" maw={560}>اكتشف مشاريعنا المتميزة التي تجمع بين الجودة والتصميم الفريد والموقع الاستراتيجي</Text>
          </Stack>

          {loadingProjects ? (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} padding={0} radius="lg" withBorder>
                  <Skeleton height={200} radius={0} />
                  <Stack gap={8} p="lg">
                    <Skeleton height={20} width="70%" />
                    <Skeleton height={14} width="40%" />
                    <Skeleton height={32} mt="sm" />
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
            </SimpleGrid>
          )}

          <Group justify="center" mt="xl">
            <Button component={Link} to="/projects" size="md" color="brand" rightSection={<FaArrowLeft size={14} />}>
              كل المشاريع
            </Button>
          </Group>
        </Container>
      </Box>

      {/* CTA Banner */}
      <Box bg="brand.6" py={{ base: 50, md: 70 }} dir="rtl">
        <Container size="md" ta="center">
          <Title order={2} c="white" fz={{ base: 26, md: 34 }} mb="md">{ctaCms.cta_title}</Title>
          {ctaCms.cta_subtitle && <Text c="brand.1" fz="lg" mb="xl" maw={560} mx="auto">{ctaCms.cta_subtitle}</Text>}
          <Group justify="center" gap="md">
            <Button component={Link} to={ctaCms.cta_button_link || "/contact"} size="lg" color="dark.8">
              {ctaCms.cta_button_text}
            </Button>
            {ctaCms.cta_phone && (
              <Button component="a" href={`tel:+${ctaCms.cta_phone}`} size="lg" variant="outline" color="gray.0" c="white" leftSection={<FaPhone size={16} />}>
                اتصل الآن
              </Button>
            )}
          </Group>
        </Container>
      </Box>
    </Box>
  );
}

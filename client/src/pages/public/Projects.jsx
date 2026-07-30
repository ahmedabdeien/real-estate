import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Container, Group, Stack, TextInput, Button, SimpleGrid, Card, Title, Text,
  Image, Skeleton, Pagination as MantinePagination, Chip, SegmentedControl, Anchor,
} from "@mantine/core";
import {
  FaMagnifyingGlass, FaTableCellsLarge, FaTableList, FaWandMagicSparkles,
  FaGear, FaBuilding, FaLocationDot, FaArrowLeft, FaInbox,
} from "react-icons/fa6";

import api from "../../api/axios";
import Badge, { statusBadge } from "../../Components/UI/Badge";
import { useCms } from "../../hooks/useCms";
import { useAuth } from "../../context/AuthContext";
import PageHero from "../../Components/shared/PageHero";

const statusOptions = [
  { value: "", label: "كل المشاريع" },
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز للتسليم" },
  { value: "coming_soon", label: "قريباً" },
];

function ProjectCardSkeleton() {
  return (
    <Card padding={0} radius="lg" withBorder>
      <Skeleton height={220} radius={0} />
      <Stack gap={8} p="lg">
        <Skeleton height={20} width="70%" />
        <Skeleton height={14} width="40%" />
        <Skeleton height={14} width="90%" />
        <Skeleton height={32} mt="sm" />
      </Stack>
    </Card>
  );
}

function ProjectCard({ p, view = "grid" }) {
  const { label, variant } = statusBadge(p.status);
  const isList = view === "list";
  return (
    <Card className="public-card" padding={0} radius="lg">
      <Group wrap={isList ? "nowrap" : "wrap"} align="stretch" gap={0}>
        <Box pos="relative" w={isList ? 220 : "100%"} h={isList ? "auto" : 220} miw={isList ? 220 : undefined} bg="gray.1" style={{ flexShrink: 0 }}>
          {p.coverImage ? (
            <Image src={p.coverImage} alt={p.name?.ar} h="100%" mih={isList ? 160 : 220} fit="cover" />
          ) : (
            <Box h="100%" mih={220} display="flex" style={{ alignItems: "center", justifyContent: "center", background: "var(--mantine-color-brand-6)" }}>
              <FaBuilding size={48} color="rgba(255,255,255,0.3)" />
            </Box>
          )}
          <Stack gap={4} pos="absolute" top={10} right={10}>
            <Badge variant={variant}>{label}</Badge>
            {p.featured && <Badge variant="warning">مميز</Badge>}
          </Stack>
        </Box>
        <Stack gap={6} p="lg" style={{ flex: 1 }} justify="space-between">
          <Box>
            <Title order={3} size="lg" c="dark.8" lineClamp={1}>{p.name?.ar}</Title>
            {p.developer?.ar && <Text size="xs" c="dimmed" mt={2}>{p.developer.ar}</Text>}
            {p.location?.city?.ar && (
              <Group gap={6} c="dimmed" mt={6}>
                <FaLocationDot size={13} />
                <Text size="sm">{p.location.city.ar}</Text>
              </Group>
            )}
            {p.description?.ar && <Text size="sm" c="dimmed" mt={6} lineClamp={2}>{p.description.ar}</Text>}
          </Box>
          <Group justify="space-between" pt="sm" mt={4} style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
            <Box>
              {p.startingPrice > 0 && <Text c="brand.6" fw={700}>{p.startingPrice.toLocaleString("ar-EG")} ج.م</Text>}
              {p.totalUnits > 0 && <Text size="xs" c="dimmed">{p.totalUnits} وحدة</Text>}
            </Box>
            <Button component={Link} to={`/projects/${p.slug}`} color="brand" size="xs" rightSection={<FaArrowLeft size={12} />}>
              عرض التفاصيل
            </Button>
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const { data: cmsPage } = useCms("projects_page", {
    title_ar: "مشاريعنا",
    subtitle_ar: "اكتشف مجموعة مشاريعنا المتميزة",
    hero_image: "",
  });
  const [projects, setProjects] = useState([]);
  const [allCounts, setAllCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState("grid");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { page, search: debouncedSearch, status, published: true } });
      setProjects(res.data.projects || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadCounts = async () => {
    try {
      const res = await api.get("/projects", { params: { published: true, limit: 1000 } });
      const list = res.data.projects || [];
      const counts = list.reduce((acc, p) => { acc[p.status] = (acc[p.status] || 0) + 1; return acc; }, {});
      counts[""] = list.length;
      setAllCounts(counts);
    } catch {
      // ignore
    }
  };

  useEffect(() => { document.title = "المشاريع | AG Development"; }, []);
  useEffect(() => { load(); }, [page, status, debouncedSearch]);
  useEffect(() => { loadCounts(); }, []);

  const featured = useMemo(() => projects.filter((p) => p.featured), [projects]);
  const regular = useMemo(() => projects.filter((p) => !p.featured), [projects]);

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <PageHero title={cmsPage.title_ar} subtitle={cmsPage.subtitle_ar} image={cmsPage.hero_image} />

      <Container size="xl" py="xl">
        <Group justify="space-between" mb="lg" wrap="wrap" gap="sm">
          <TextInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث عن مشروع..."
            leftSection={<FaMagnifyingGlass size={14} />}
            radius="md"
            style={{ flex: 1, minWidth: 220 }}
          />
          <Chip.Group value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
            <Group gap={6} wrap="wrap">
              {statusOptions.map((o) => (
                <Chip key={o.value} value={o.value} color="brand" variant="filled" radius="md">
                  {o.label} {allCounts[o.value] > 0 && `(${allCounts[o.value]})`}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
          <SegmentedControl
            value={view}
            onChange={setView}
            color="brand"
            data={[
              { value: "grid", label: <FaTableCellsLarge size={14} /> },
              { value: "list", label: <FaTableList size={14} /> },
            ]}
          />
        </Group>

        {loading ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </SimpleGrid>
        ) : projects.length === 0 ? (
          <Stack align="center" py={80} gap="xs">
            <FaInbox size={40} color="var(--mantine-color-gray-4)" />
            <Text fw={600} c="dark.6">لا توجد مشاريع</Text>
            <Text size="sm" c="dimmed">لا توجد مشاريع تطابق بحثك</Text>
          </Stack>
        ) : (
          <>
            <Text c="dimmed" size="sm" mb="md">{total} مشروع</Text>

            {featured.length > 0 && page === 1 && !status && !debouncedSearch && (
              <Box mb="xl">
                <Group gap={8} mb="md">
                  <FaWandMagicSparkles size={18} color="var(--mantine-color-yellow-6)" />
                  <Title order={2} size="lg" c="dark.8">المشاريع المميزة</Title>
                </Group>
                {view === "list" ? (
                  <Stack gap="md">{featured.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}</Stack>
                ) : (
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                    {featured.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}
                  </SimpleGrid>
                )}
              </Box>
            )}

            {regular.length > 0 && (
              view === "list" ? (
                <Stack gap="md">{regular.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}</Stack>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                  {regular.map((p) => <ProjectCard key={p._id} p={p} view={view} />)}
                </SimpleGrid>
              )
            )}

            {pages > 1 && (
              <Group justify="center" mt="xl">
                <MantinePagination value={page} onChange={setPage} total={pages} color="brand" radius="md" />
              </Group>
            )}
          </>
        )}
      </Container>

      {user && ["admin", "supervisor"].includes(user.role) && (
        <Anchor
          component="a" href="/admin/projects"
          pos="fixed" bottom={96} left={24} style={{ zIndex: 100 }}
        >
          <Button color="brand" radius="xl" leftSection={<FaGear size={14} />} style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>
            إدارة المشاريع
          </Button>
        </Anchor>
      )}
    </Box>
  );
}

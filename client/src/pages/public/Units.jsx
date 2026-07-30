import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Box, Container, Card, Group, Stack, TextInput, Select, Button, SimpleGrid,
  Text, Title, Badge, Image, Skeleton, Pagination as MantinePagination,
  Affix, Modal, Table, ActionIcon, Chip,
} from "@mantine/core";
import {
  FaMagnifyingGlass, FaSliders, FaBuilding, FaBed, FaBath, FaRulerCombined,
  FaLayerGroup, FaArrowLeft, FaCheck, FaCodeCompare, FaXmark, FaHouse,
} from "react-icons/fa6";

import api from "../../api/axios";
import { useCms } from "../../hooks/useCms";
import { useAuth } from "../../context/AuthContext";
import PageHero from "../../Components/shared/PageHero";

const unitTypeAr = {
  apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس",
  penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه",
};
const statusLabel = { available: "متاحة", reserved: "محجوزة", sold: "مبيعة" };
const statusColor = { available: "green", reserved: "yellow", sold: "red" };

export default function UnitsPage() {
  const { data: cms } = useCms("units_page", {
    title_ar: "الوحدات المتاحة",
    subtitle_ar: "اختر وحدتك المثالية من مجموعة متنوعة من الخيارات",
    hero_image: "",
  });
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [units, setUnits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("available");
  const [project, setProject] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [sort, setSort] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/units", { params: { page, status, project, published: true, public: true, search } });
      setUnits(res.data.units || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { document.title = "الوحدات | الصرح للتطوير العقاري"; }, []);
  useEffect(() => { load(); }, [page, status, project, search]);
  useEffect(() => {
    api.get("/projects", { params: { limit: 100, published: true } }).then((r) => setProjects(r.data.projects || []));
  }, []);

  const submitSearch = (e) => {
    e?.preventDefault?.();
    setPage(1);
    setSearch(searchInput.trim());
    setSearchParams(searchInput.trim() ? { search: searchInput.trim() } : {});
  };

  const toggleCompare = (id) => setCompareIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev));

  const sortedUnits = useMemo(() => {
    const arr = [...units];
    if (sort === "price_asc") arr.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sort === "price_desc") arr.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sort === "area_desc") arr.sort((a, b) => (b.area || 0) - (a.area || 0));
    return arr;
  }, [units, sort]);

  const compareUnits = units.filter((u) => compareIds.includes(u._id));

  const compareRows = [
    ["النوع", (u) => unitTypeAr[u.type] || u.type || "—"],
    ["السعر", (u) => (u.price ? `${u.price.toLocaleString("ar-EG")} ج.م` : "—")],
    ["المساحة", (u) => (u.area ? `${u.area} م²` : "—")],
    ["الغرف", (u) => u.rooms ?? "—"],
    ["الحمامات", (u) => u.bathrooms ?? "—"],
    ["الدور", (u) => u.floor ?? "—"],
    ["نوع الإنهاء", (u) => u.finishing || "—"],
    ["الجهة", (u) => u.facing || "—"],
    ["الحالة", (u) => statusLabel[u.status] || "—"],
    ["المرافق", (u) => u.amenities?.join("، ") || "—"],
  ];

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <PageHero title={cms.title_ar} subtitle={cms.subtitle_ar} image={cms.hero_image} />

      <Container size="xl" py="xl">
        <Card className="public-card" radius="lg" p="md" mb="lg" component="form" onSubmit={submitSearch}>
          <Group gap="sm" wrap="wrap">
            <TextInput
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث برقم الوحدة، النوع، المشروع..."
              leftSection={<FaMagnifyingGlass size={14} />} radius="md"
              style={{ flex: 1, minWidth: 200 }}
            />
            <Select
              value={project} onChange={(v) => { setProject(v || ""); setPage(1); }}
              data={[{ value: "", label: "كل المشاريع" }, ...projects.map((p) => ({ value: p._id, label: p.name?.ar }))]}
              radius="md" w={180} allowDeselect={false}
            />
            <Select
              value={sort} onChange={(v) => setSort(v || "")}
              data={[
                { value: "", label: "الترتيب الافتراضي" },
                { value: "price_asc", label: "الأرخص" },
                { value: "price_desc", label: "الأغلى" },
                { value: "area_desc", label: "الأكبر مساحة" },
              ]}
              radius="md" w={180} allowDeselect={false}
            />
            <Chip.Group value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
              <Group gap={6}>
                {[{ value: "", label: "الكل" }, { value: "available", label: "متاحة" }, { value: "reserved", label: "محجوزة" }].map((o) => (
                  <Chip key={o.value} value={o.value} color="brand" variant="filled" radius="md">{o.label}</Chip>
                ))}
              </Group>
            </Chip.Group>
            <Button type="submit" color="brand" leftSection={<FaSliders size={14} />}>بحث</Button>
          </Group>
        </Card>

        {loading ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} padding={0} radius="lg" withBorder>
                <Skeleton height={0} style={{ paddingBottom: "75%" }} radius={0} />
                <Stack gap={8} p="md">
                  <Skeleton height={18} width="60%" />
                  <Skeleton height={30} />
                  <Skeleton height={32} mt="sm" />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : sortedUnits.length === 0 ? (
          <Stack align="center" py={80} gap="xs">
            <FaHouse size={40} color="var(--mantine-color-gray-4)" />
            <Text fw={600} c="dark.6">لا توجد وحدات</Text>
            <Text size="sm" c="dimmed">جرب تغيير فلاتر البحث</Text>
          </Stack>
        ) : (
          <>
            <Text c="dimmed" size="sm" mb="md">{total} وحدة</Text>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {sortedUnits.map((unit) => {
                const coverImage = unit.coverImage || unit.images?.[0];
                const isCompared = compareIds.includes(unit._id);
                return (
                  <Card key={unit._id} className="public-card" padding={0} radius="lg">
                    <Box pos="relative" style={{ aspectRatio: "4/3" }} bg="gray.1">
                      {coverImage ? (
                        <Image src={coverImage} alt="" h="100%" fit="cover" />
                      ) : (
                        <Box h="100%" display="flex" style={{ alignItems: "center", justifyContent: "center", background: "var(--mantine-color-brand-6)" }}>
                          <FaBuilding size={44} color="rgba(255,255,255,0.3)" />
                        </Box>
                      )}
                      <Badge pos="absolute" top={12} right={12} color="brand" variant="filled">{unitTypeAr[unit.type] || unit.type}</Badge>
                      <Badge pos="absolute" top={12} left={12} color={statusColor[unit.status] || "gray"} variant="filled">{statusLabel[unit.status] || unit.status}</Badge>
                      {user && (
                        <ActionIcon
                          pos="absolute" bottom={12} left={12} size={30} radius="md"
                          variant={isCompared ? "filled" : "white"} color="brand"
                          onClick={(e) => { e.preventDefault(); toggleCompare(unit._id); }}
                          title="مقارنة"
                        >
                          {isCompared ? <FaCheck size={13} /> : <FaCodeCompare size={13} />}
                        </ActionIcon>
                      )}
                    </Box>
                    <Stack gap={8} p="md">
                      <Box>
                        <Title order={3} size="md" c="dark.8">{unit.unitNumber} {unit.project?.name?.ar ? `— ${unit.project.name.ar}` : ""}</Title>
                        {unit.project?.name?.ar && (
                          <Group gap={4} c="dimmed" mt={2}><FaBuilding size={11} /><Text size="xs">{unit.project.name.ar}</Text></Group>
                        )}
                      </Box>
                      <SimpleGrid cols={4} spacing={4}>
                        {[
                          { icon: FaBed, value: unit.rooms ?? "—", label: "غرفة" },
                          { icon: FaBath, value: unit.bathrooms ?? "—", label: "حمام" },
                          { icon: FaRulerCombined, value: unit.area ?? "—", label: "م²" },
                          { icon: FaLayerGroup, value: unit.floor ?? "—", label: "الدور" },
                        ].map(({ icon: Icon, value, label }) => (
                          <Stack key={label} align="center" gap={2}>
                            <Icon size={14} color="var(--mantine-color-brand-6)" />
                            <Text size="xs" fw={700} c="dark.7">{value}</Text>
                            <Text size={10} c="dimmed">{label}</Text>
                          </Stack>
                        ))}
                      </SimpleGrid>
                      {unit.amenities?.length > 0 && (
                        <Group gap={4}>
                          {unit.amenities.slice(0, 3).map((a) => <Badge key={a} size="xs" variant="light" color="gray">{a}</Badge>)}
                          {unit.amenities.length > 3 && <Text size={10} c="dimmed">+{unit.amenities.length - 3}</Text>}
                        </Group>
                      )}
                      <Group justify="space-between" pt="sm" mt={4} style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
                        <Box>
                          <Text fw={800} c="brand.6" size="lg">{unit.price ? unit.price.toLocaleString("ar-EG") : "—"}</Text>
                          <Text size="xs" c="dimmed">جنيه مصري</Text>
                        </Box>
                        <Button component={Link} to={`/projects/${unit.project?.slug || unit.project?._id || ""}`} size="xs" color="brand" rightSection={<FaArrowLeft size={12} />}>
                          التفاصيل
                        </Button>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
            {pages > 1 && (
              <Group justify="center" mt="xl">
                <MantinePagination value={page} onChange={setPage} total={pages} color="brand" radius="md" />
              </Group>
            )}
          </>
        )}
      </Container>

      {compareIds.length > 0 && (
        <Affix position={{ bottom: 24, left: "50%" }} style={{ transform: "translateX(-50%)" }}>
          <Group bg="brand.6" c="white" px="lg" py={10} style={{ borderRadius: "var(--mantine-radius-xl)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
            <Text size="sm" fw={600}>تم اختيار {compareIds.length} وحدة</Text>
            <Button size="xs" color="gray.0" c="brand.7" disabled={compareIds.length < 2} onClick={() => setShowCompare(true)}>مقارنة</Button>
            <ActionIcon variant="transparent" c="white" onClick={() => setCompareIds([])}><FaXmark size={16} /></ActionIcon>
          </Group>
        </Affix>
      )}

      <Modal opened={showCompare} onClose={() => setShowCompare(false)} title="مقارنة الوحدات" size="xl" radius="lg">
        <Table.ScrollContainer minWidth={500}>
          <Table verticalSpacing="sm" withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={140}>المواصفة</Table.Th>
                {compareUnits.map((u) => (
                  <Table.Th key={u._id}>
                    <Group gap={6} wrap="nowrap">
                      <Text fw={700} c="brand.6">{u.unitNumber}</Text>
                      <ActionIcon size="xs" variant="subtle" color="red" onClick={() => setCompareIds((p) => p.filter((i) => i !== u._id))}>
                        <FaXmark size={11} />
                      </ActionIcon>
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {compareRows.map(([label, fn]) => (
                <Table.Tr key={label}>
                  <Table.Td fw={600} c="dimmed" fz="sm">{label}</Table.Td>
                  {compareUnits.map((u) => <Table.Td key={u._id} fz="sm">{fn(u)}</Table.Td>)}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Modal>
    </Box>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box, Container, Card, Group, Stack, TextInput, Select, Button, SimpleGrid,
  Text, Title, Badge, ThemeIcon, Skeleton,
} from "@mantine/core";
import {
  FaBriefcase, FaLocationDot, FaMagnifyingGlass, FaCircleCheck,
  FaCalendar, FaChevronLeft, FaDollarSign,
} from "react-icons/fa6";

import api from "../../api/axios";
import { useCms } from "../../hooks/useCms";

const TYPE_LABELS = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };
const TYPE_COLORS = { full_time: "blue", part_time: "grape", contract: "yellow", internship: "green" };

export default function CareersPage() {
  const { data: cmsPage } = useCms("careers_page", {
    title_ar: "الوظائف المتاحة",
    subtitle_ar: "انضم إلى فريق AG Development",
    image: "",
  });
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilter] = useState("all");

  useEffect(() => {
    api.get("/careers", { params: { published: true } })
      .then((r) => setCareers(r.data.careers || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = careers.filter((c) => {
    const matchSearch = !search || c.title?.ar?.includes(search) || c.department?.ar?.includes(search) || c.location?.ar?.includes(search);
    const matchType = filterType === "all" || c.type === filterType;
    return matchSearch && matchType;
  });

  const active = careers.filter((c) => !c.deadline || new Date(c.deadline) >= new Date()).length;

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <Container size="xl" py="xl">
        <Group mb="xl" wrap="wrap">
          <TextInput
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن وظيفة..." leftSection={<FaMagnifyingGlass size={14} />}
            radius="md" style={{ flex: 1, minWidth: 240 }}
          />
          <Select
            value={filterType} onChange={(v) => setFilter(v || "all")}
            data={[{ value: "all", label: "كل الأنواع" }, ...Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
            radius="md" w={180} allowDeselect={false}
          />
          {(search || filterType !== "all") && (
            <Button variant="default" radius="md" onClick={() => { setSearch(""); setFilter("all"); }}>مسح الفلتر</Button>
          )}
        </Group>

        {loading ? (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} padding={0} radius="lg" withBorder>
                <Skeleton height={4} radius={0} />
                <Stack gap={10} p="lg">
                  <Group justify="space-between">
                    <Skeleton height={44} width={44} radius="md" />
                    <Skeleton height={20} width={70} radius="xl" />
                  </Group>
                  <Skeleton height={18} width="70%" />
                  <Skeleton height={14} width="50%" />
                  <Skeleton height={36} mt="sm" />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : filtered.length === 0 ? (
          <Stack align="center" py={80} gap="xs">
            <FaBriefcase size={40} color="var(--mantine-color-gray-4)" />
            <Text fw={600} c="dark.6">لا توجد وظائف تطابق البحث</Text>
            <Text size="sm" c="dimmed">جرب تغيير كلمات البحث أو الفلاتر</Text>
          </Stack>
        ) : (
          <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="lg">
            {filtered.map((c) => {
              const isExpired = c.deadline && new Date(c.deadline) < new Date();
              return (
                <Card key={c._id} className="public-card" padding={0} radius="lg" opacity={isExpired ? 0.75 : 1}>
                  <Box h={4} bg={isExpired ? "gray.3" : "brand.6"} />
                  <Stack gap={10} p="lg" style={{ flex: 1 }}>
                    <Group justify="space-between" align="flex-start">
                      <ThemeIcon size={44} radius="md" variant="light" color={isExpired ? "gray" : "brand"}>
                        <FaBriefcase size={19} />
                      </ThemeIcon>
                      <Badge color={TYPE_COLORS[c.type]} variant="light">{TYPE_LABELS[c.type]}</Badge>
                    </Group>

                    <Box>
                      <Title order={3} size="md" c="dark.8">{c.title?.ar}</Title>
                      {c.title?.en && <Text size="xs" c="dimmed" mt={2}>{c.title.en}</Text>}
                    </Box>

                    <Group gap="md" c="dimmed">
                      {c.department?.ar && <Group gap={4}><FaBriefcase size={11} /><Text size="xs">{c.department.ar}</Text></Group>}
                      {c.location?.ar && <Group gap={4}><FaLocationDot size={11} /><Text size="xs">{c.location.ar}</Text></Group>}
                    </Group>

                    {c.description?.ar && <Text size="sm" c="dimmed" lineClamp={2} style={{ flex: 1 }}>{c.description.ar}</Text>}

                    {c.requirements?.length > 0 && (
                      <Group gap={4} c="brand.6"><FaCircleCheck size={13} /><Text size="xs">{c.requirements.length} متطلب</Text></Group>
                    )}

                    {c.salary?.min && !c.salary?.hidden && (
                      <Group gap={4} c="green.7" fw={600}>
                        <FaDollarSign size={13} />
                        <Text size="xs">{Number(c.salary.min).toLocaleString("ar-EG")} — {Number(c.salary.max).toLocaleString("ar-EG")} {c.salary.currency}</Text>
                      </Group>
                    )}

                    <Stack gap="sm" pt="sm" mt={4} style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
                      {c.deadline && (
                        <Group gap={4} c={isExpired ? "red.6" : "dimmed"}>
                          <FaCalendar size={11} />
                          <Text size="xs">{isExpired ? "انتهت في " : "حتى "}{new Date(c.deadline).toLocaleDateString("ar-EG")}</Text>
                        </Group>
                      )}
                      <Button
                        component={Link} to={`/careers/${c._id}`} fullWidth color="brand"
                        disabled={isExpired} rightSection={<FaChevronLeft size={14} />}
                      >
                        عرض التفاصيل والتقديم
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
}

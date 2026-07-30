import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Carousel } from "@mantine/carousel";
import {
  Box, Container, Grid, Stack, Card, Title, Text, Group, Badge, Button,
  TextInput, Textarea, Anchor, Breadcrumbs, SimpleGrid, Image, Modal, Table,
  ThemeIcon, Loader,
} from "@mantine/core";
import {
  FaLocationDot, FaBuilding, FaHouseChimney, FaPhone, FaWhatsapp,
  FaRulerCombined, FaBed, FaBath, FaCircleCheck, FaTag, FaHouse, FaMapPin,
  FaPlay, FaCodeCompare, FaPen, FaTriangleExclamation,
} from "react-icons/fa6";
import { notifications } from "@mantine/notifications";

import api from "../../api/axios";
import { statusBadge } from "../../Components/UI/Badge";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { useAuth } from "../../context/AuthContext";

const unitTypeAr = {
  apartment: "شقة", villa: "فيلا", studio: "استوديو",
  duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب",
  shop: "محل", chalet: "شاليه",
};

const UNIT_STATUS = {
  available: { label: "متاح", color: "green" },
  sold:      { label: "مباعة", color: "red" },
  reserved:  { label: "محجوز", color: "yellow" },
};

function ContactForm({ projectName, projectId, waNumber }) {
  const [form, setForm] = useState({ name: "", phone: "", message: "", interestedProject: projectId, source: "website" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leads", form);
      setSent(true);
    } catch {
      notifications.show({
        color: "red",
        icon: <FaTriangleExclamation size={16} />,
        title: "تعذر إرسال الطلب",
        message: "يرجى المحاولة مرة أخرى",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Stack align="center" py="md" gap={4}>
        <ThemeIcon color="green" variant="light" size={48} radius="xl"><FaCircleCheck size={22} /></ThemeIcon>
        <Text fw={700} size="sm">تم الاستلام!</Text>
        <Text size="xs" c="dimmed">سنتواصل معك قريباً</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="xs" component="form" onSubmit={submit}>
      <TextInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="الاسم الكامل" required radius="md" />
      <TextInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="رقم الهاتف" required type="tel" radius="md" />
      <Textarea rows={2} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="رسالة (اختياري)" radius="md" />
      <Button type="submit" loading={loading} color="brand" fullWidth>احجز الآن</Button>
      <SimpleGrid cols={2} spacing={8}>
        <Button component="a" href={`tel:${waNumber}`} variant="default" size="xs" leftSection={<FaPhone size={13} />}>اتصل</Button>
        <Button
          component="a" color="green" size="xs" leftSection={<FaWhatsapp size={13} />}
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`أريد الاستفسار عن ${projectName}`)}`}
          target="_blank" rel="noopener noreferrer"
        >
          واتساب
        </Button>
      </SimpleGrid>
    </Stack>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [unitFilter, setUnitFilter] = useState("all");
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const { contact } = useSiteSettings();
  const waNum = (contact.whatsapp_number || contact.whatsapp || contact.phone || "201000000000").replace(/\D/g, "");

  const { data, isLoading } = useQuery({
    queryKey: ["project-detail", slug],
    queryFn: () => api.get(`/projects/${slug}`).then((r) => r.data),
  });
  const project = data?.project;
  const units = data?.units || [];

  if (isLoading) {
    return <Group justify="center" py={120}><Loader color="brand" size="lg" /></Group>;
  }
  if (!project) {
    return (
      <Stack align="center" justify="center" mih="60vh" dir="rtl">
        <ThemeIcon size={72} radius="xl" variant="light" color="gray"><FaBuilding size={32} /></ThemeIcon>
        <Text c="dimmed">المشروع غير موجود</Text>
        <Anchor component={Link} to="/projects" c="brand.6" fw={600}>← العودة للمشاريع</Anchor>
      </Stack>
    );
  }

  const allImages = [project.coverImage, ...(project.images || [])].filter(Boolean);
  const { label: statusLabel, variant } = statusBadge(project.status);
  const filteredUnits = unitFilter === "all" ? units : units.filter((u) => u.status === unitFilter);
  const counts = {
    all: units.length,
    available: units.filter((u) => u.status === "available").length,
    sold: units.filter((u) => u.status === "sold").length,
    reserved: units.filter((u) => u.status === "reserved").length,
  };

  const toggleCompare = (id) => setCompareList((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  const compareUnits = units.filter((u) => compareList.includes(u._id));

  const mapEmbed = project.mapEmbedUrl
    || (project.location?.lat && project.location?.lng
      ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ""}&q=${project.location.lat},${project.location.lng}&zoom=15`
      : null);

  const statColorMap = { success: "green", warning: "yellow", error: "red", gray: "gray" };

  const detailRows = [
    project.developer?.ar && { icon: FaBuilding, label: "المطور", value: project.developer.ar },
    project.startingPrice > 0 && { icon: FaTag, label: "يبدأ من", value: `${project.startingPrice.toLocaleString("ar-EG")} ج.م` },
    project.totalUnits > 0 && { icon: FaHouse, label: "إجمالي الوحدات", value: `${project.totalUnits} وحدة` },
    counts.available > 0 && { icon: FaCircleCheck, label: "متاح الآن", value: `${counts.available} وحدة`, green: true },
    project.location?.city?.ar && { icon: FaMapPin, label: "الموقع", value: project.location.city.ar },
  ].filter(Boolean);

  const compareRows = [
    { label: "الحالة", fn: (u) => { const s = UNIT_STATUS[u.status]; return s ? <Badge color={s.color} variant="light">{s.label}</Badge> : "—"; } },
    { label: "السعر", fn: (u) => (u.price ? <Text fw={900} c="brand.6">{u.price.toLocaleString("ar-EG")} ج.م</Text> : "—") },
    { label: "المساحة", fn: (u) => (u.area ? `${u.area} م²` : "—") },
    { label: "الغرف", fn: (u) => u.rooms || "—" },
    { label: "الحمامات", fn: (u) => u.bathrooms || "—" },
    { label: "الدور", fn: (u) => u.floor || "—" },
    { label: "سعر المتر", fn: (u) => (u.price && u.area ? `${Math.round(u.price / u.area).toLocaleString("ar-EG")} ج.م` : "—") },
  ];

  return (
    <Box bg="gray.0" dir="rtl">
      {/* Hero */}
      {allImages.length > 0 && (
        <Box pos="relative" h="55vh" bg="dark.9" style={{ overflow: "hidden" }}>
          <Carousel withIndicators={allImages.length > 1} withControls={allImages.length > 1} height="55vh" style={{ height: "100%" }}>
            {allImages.map((img, i) => (
              <Carousel.Slide key={i}><Image src={img} alt="" h="55vh" fit="cover" style={{ opacity: 0.85 }} /></Carousel.Slide>
            ))}
          </Carousel>
          <Box pos="absolute" top={20} right={20} style={{ zIndex: 2 }}>
            <Badge size="lg" color={statColorMap[variant] || "gray"} variant="filled">{statusLabel}</Badge>
          </Box>
          <Box pos="absolute" bottom={0} left={0} right={0} p="lg" style={{ zIndex: 2, background: "rgba(0,0,0,0.35)" }}>
            <Container size="xl">
              <Title order={1} c="white" fz={{ base: 26, md: 36 }} mb={4}>{project.name?.ar}</Title>
              {project.location?.city?.ar && (
                <Group gap={6} c="gray.3">
                  <FaLocationDot size={14} />
                  <Text size="sm">{[project.location.address?.ar, project.location.city.ar].filter(Boolean).join("، ")}</Text>
                </Group>
              )}
            </Container>
          </Box>
        </Box>
      )}

      {/* Breadcrumb */}
      <Box bg="white" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }} py={10}>
        <Container size="xl">
          <Breadcrumbs>
            <Anchor component={Link} to="/" size="sm" c="dimmed">الرئيسية</Anchor>
            <Anchor component={Link} to="/projects" size="sm" c="dimmed">المشاريع</Anchor>
            <Text size="sm" fw={600} truncate maw={200}>{project.name?.ar}</Text>
          </Breadcrumbs>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          {/* Sidebar */}
          <Grid.Col span={{ base: 12, lg: 4 }} order={{ base: 1, lg: 2 }}>
            <Stack gap="md" style={{ position: "sticky", top: 84 }}>
              <Card className="public-card" radius="lg" p="lg">
                <Group gap={10} mb="md">
                  <ThemeIcon color="brand" size={36} radius="md"><FaPhone size={16} /></ThemeIcon>
                  <Box>
                    <Text fw={700} size="sm">احجز استشارة مجانية</Text>
                    <Text size="xs" c="dimmed">نتواصل معك خلال ٢٤ ساعة</Text>
                  </Box>
                </Group>
                <ContactForm projectName={project.name?.ar} projectId={project._id} waNumber={waNum} />
              </Card>

              <Card className="public-card" radius="lg" p="lg">
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">تفاصيل المشروع</Text>
                <Stack gap={10}>
                  {detailRows.map((item, i) => (
                    <Group key={i} gap={10} wrap="nowrap">
                      <item.icon size={14} color={item.green ? "var(--mantine-color-green-6)" : "var(--mantine-color-gray-5)"} />
                      <Text size="xs" c="dimmed" w={90} style={{ flexShrink: 0 }}>{item.label}</Text>
                      <Text size="sm" fw={600} c={item.green ? "green.7" : "dark.7"}>{item.value}</Text>
                    </Group>
                  ))}
                </Stack>
              </Card>

              {project.brochureUrl && (
                <Button component="a" href={project.brochureUrl} target="_blank" rel="noopener noreferrer" color="dark.8" fullWidth>
                  تحميل الكتيب التعريفي
                </Button>
              )}
            </Stack>
          </Grid.Col>

          {/* Main content */}
          <Grid.Col span={{ base: 12, lg: 8 }} order={{ base: 2, lg: 1 }}>
            <Stack gap="lg">
              {project.description?.ar && (
                <Card className="public-card" radius="lg" p="lg">
                  <Title order={2} size="lg" mb="sm">عن المشروع</Title>
                  <Text c="dimmed" lh={1.8} size="sm">{project.description.ar}</Text>
                </Card>
              )}

              {project.amenities?.length > 0 && (
                <Card className="public-card" radius="lg" p="lg">
                  <Title order={2} size="lg" mb="md">المميزات والمرافق</Title>
                  <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
                    {project.amenities.map((a) => (
                      <Group key={a} gap={8} p={10} bg="brand.0" style={{ borderRadius: "var(--mantine-radius-md)" }}>
                        <ThemeIcon size={20} radius="xl" color="brand" variant="light"><FaCircleCheck size={11} /></ThemeIcon>
                        <Text size="sm" fw={500}>{a}</Text>
                      </Group>
                    ))}
                  </SimpleGrid>
                </Card>
              )}

              {allImages.length > 1 && (
                <Card className="public-card" radius="lg" p="lg">
                  <Title order={2} size="lg" mb="md">معرض الصور</Title>
                  <SimpleGrid cols={{ base: 4, sm: 5 }} spacing={8}>
                    {allImages.map((img, i) => (
                      <Image key={i} src={img} alt="" radius="md" style={{ aspectRatio: "1/1", objectFit: "cover" }} />
                    ))}
                  </SimpleGrid>
                </Card>
              )}

              {mapEmbed && (
                <Card className="public-card" radius="lg" p={0} style={{ overflow: "hidden" }}>
                  <Group gap={8} p="lg" pb="sm">
                    <FaLocationDot size={15} color="var(--mantine-color-brand-6)" />
                    <Title order={2} size="lg">موقع المشروع</Title>
                  </Group>
                  <iframe src={mapEmbed} width="100%" height="300" style={{ border: 0, display: "block" }} loading="lazy" title="موقع المشروع" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                </Card>
              )}

              {project.videoUrl && (
                <Card className="public-card" radius="lg" p={0} style={{ overflow: "hidden" }}>
                  <Group gap={8} p="lg" pb="sm">
                    <FaPlay size={14} color="var(--mantine-color-brand-6)" />
                    <Title order={2} size="lg">فيديو المشروع</Title>
                  </Group>
                  <Box style={{ aspectRatio: "16/9" }}>
                    <iframe
                      src={project.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                      style={{ width: "100%", height: "100%", border: 0 }} allowFullScreen title="فيديو"
                    />
                  </Box>
                </Card>
              )}

              {units.length > 0 && (
                <Card className="public-card" radius="lg" p="lg">
                  <Group justify="space-between" wrap="wrap" mb="md">
                    <Title order={2} size="lg">وحدات المشروع</Title>
                    <Group gap={6}>
                      {[
                        { key: "all", label: "الكل" },
                        { key: "available", label: "متاح" },
                        { key: "reserved", label: "محجوز" },
                        { key: "sold", label: "مباعة" },
                      ].map((tab) => (
                        <Button key={tab.key} size="xs" radius="xl" color="brand" variant={unitFilter === tab.key ? "filled" : "light"} onClick={() => setUnitFilter(tab.key)}>
                          {tab.label} {counts[tab.key] > 0 && `(${counts[tab.key]})`}
                        </Button>
                      ))}
                    </Group>
                  </Group>

                  {compareList.length >= 2 && (
                    <Group justify="space-between" bg="brand.0" p="sm" mb="md" style={{ borderRadius: "var(--mantine-radius-md)" }}>
                      <Text size="sm" c="brand.7" fw={600}>{compareList.length} وحدات مختارة للمقارنة</Text>
                      <Group gap={6}>
                        <Button size="xs" color="brand" leftSection={<FaCodeCompare size={12} />} onClick={() => setShowCompare(true)}>مقارنة</Button>
                        <Button size="xs" variant="default" onClick={() => setCompareList([])}>مسح</Button>
                      </Group>
                    </Group>
                  )}

                  <Stack gap={0}>
                    {filteredUnits.length === 0 ? (
                      <Stack align="center" py="xl" gap={4}>
                        <FaHouseChimney size={36} color="var(--mantine-color-gray-4)" />
                        <Text size="sm" c="dimmed">لا توجد وحدات بهذه الحالة</Text>
                      </Stack>
                    ) : filteredUnits.map((u) => {
                      const st = UNIT_STATUS[u.status] || UNIT_STATUS.available;
                      const inCompare = compareList.includes(u._id);
                      return (
                        <Group key={u._id} wrap="nowrap" py="sm" px={4} bg={inCompare ? "brand.0" : undefined} style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
                          <Box w={64} h={64} style={{ borderRadius: "var(--mantine-radius-md)", overflow: "hidden", flexShrink: 0 }} bg="gray.1">
                            {u.images?.[0] ? <Image src={u.images[0]} alt="" w={64} h={64} fit="cover" /> : (
                              <Group justify="center" align="center" h="100%"><FaHouseChimney size={22} color="var(--mantine-color-gray-4)" /></Group>
                            )}
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap={8} mb={2}>
                              <Text fw={700} size="sm">{unitTypeAr[u.type] || u.type} {u.unitNumber && `— ${u.unitNumber}`}</Text>
                              <Badge size="xs" color={st.color} variant="light">{st.label}</Badge>
                            </Group>
                            <Group gap="md" c="dimmed">
                              {u.area && <Group gap={4}><FaRulerCombined size={11} /><Text size="xs">{u.area} م²</Text></Group>}
                              {u.rooms && <Group gap={4}><FaBed size={11} /><Text size="xs">{u.rooms} غرف</Text></Group>}
                              {u.bathrooms && <Group gap={4}><FaBath size={11} /><Text size="xs">{u.bathrooms} حمام</Text></Group>}
                              {u.floor && <Text size="xs">الدور: {u.floor}</Text>}
                            </Group>
                          </Box>
                          <Group gap={10} style={{ flexShrink: 0 }}>
                            {u.price > 0 && (
                              <Box ta="left">
                                <Text fw={900} size="sm" c="brand.6">{u.price.toLocaleString("ar-EG")}</Text>
                                <Text size="xs" c="dimmed">ج.م</Text>
                              </Box>
                            )}
                            <ThemeIcon
                              size={32} radius="md" variant={inCompare ? "filled" : "default"} color="brand"
                              style={{ cursor: "pointer" }} onClick={() => toggleCompare(u._id)}
                            >
                              <FaCodeCompare size={13} />
                            </ThemeIcon>
                          </Group>
                        </Group>
                      );
                    })}
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {user && ["admin", "supervisor"].includes(user.role) && (
        <Anchor component={Link} to={`/admin/projects?edit=${project._id}`} pos="fixed" bottom={96} left={24} style={{ zIndex: 100 }}>
          <Button color="brand" radius="xl" leftSection={<FaPen size={13} />} style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>تعديل المشروع</Button>
        </Anchor>
      )}

      <Modal opened={showCompare} onClose={() => setShowCompare(false)} title="مقارنة الوحدات" size="lg" radius="lg">
        <Table.ScrollContainer minWidth={500}>
          <Table verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                {compareUnits.map((u) => (
                  <Table.Th key={u._id} ta="center">
                    <Stack gap={4} align="center">
                      {u.images?.[0] && <Image src={u.images[0]} alt="" w="100%" h={64} radius="md" fit="cover" />}
                      <Text fw={700} size="sm">{unitTypeAr[u.type] || u.type}</Text>
                      <Text size="xs" c="dimmed">{u.unitNumber}</Text>
                    </Stack>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {compareRows.map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Td fw={600} c="dimmed" fz="xs">{row.label}</Table.Td>
                  {compareUnits.map((u) => <Table.Td key={u._id} ta="center">{row.fn(u)}</Table.Td>)}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Modal>
    </Box>
  );
}

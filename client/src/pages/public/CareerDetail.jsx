import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box, Container, Grid, Stack, Card, Group, Title, Text, Badge, Button,
  TextInput, Anchor, Popover, SimpleGrid, ThemeIcon, Loader,
} from "@mantine/core";
import {
  FaBriefcase, FaLocationDot, FaCalendar, FaDollarSign, FaArrowRight,
  FaShareNodes, FaCopy, FaCircleCheck, FaLink, FaArrowUpRightFromSquare,
  FaWhatsapp, FaFacebook, FaXTwitter, FaLinkedin, FaTriangleExclamation,
} from "react-icons/fa6";
import { notifications } from "@mantine/notifications";
import api from "../../api/axios";

const TYPE_LABELS = { full_time: "دوام كامل", part_time: "دوام جزئي", contract: "عقد", internship: "تدريب" };
const TYPE_COLORS = { full_time: "blue", part_time: "grape", contract: "yellow", internship: "green" };

function ShareGrid({ shareLinks, copied, copyLink }) {
  return (
    <Stack gap="xs">
      <SimpleGrid cols={2} spacing={8}>
        {shareLinks.map((s) => (
          <Button key={s.label} component="a" href={s.href} target="_blank" rel="noreferrer" color={s.color} size="xs" leftSection={<s.icon size={13} />}>
            {s.label}
          </Button>
        ))}
      </SimpleGrid>
      <Button variant={copied ? "light" : "default"} color={copied ? "green" : "gray"} size="xs" leftSection={<FaCopy size={12} />} onClick={copyLink}>
        {copied ? "تم النسخ!" : "نسخ الرابط"}
      </Button>
    </Stack>
  );
}

export default function CareerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "", email: "", cv_link: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const pageUrl = window.location.href;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/careers/${id}`),
      api.get("/careers", { params: { published: true } }),
    ]).then(([det, all]) => {
      setCareer(det.data.career);
      setRelated((all.data.careers || []).filter((c) => c._id !== id).slice(0, 3));
    }).catch(() => navigate("/careers"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/leads", {
        name: form.name, phone: form.phone, email: form.email, cv_link: form.cv_link || "",
        career: id, source: "website", message: `تقديم على وظيفة: ${career?.title?.ar}`,
      });
      setSent(true);
    } catch {
      notifications.show({
        color: "red",
        icon: <FaTriangleExclamation size={16} />,
        title: "تعذر إرسال الطلب",
        message: "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى",
      });
    } finally { setSending(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <Group justify="center" py={120}><Loader color="brand" size="lg" /></Group>;
  if (!career) return null;

  const isExpired = career.deadline && new Date(career.deadline) < new Date();

  const shareLinks = [
    { label: "واتساب", icon: FaWhatsapp, color: "green", href: `https://wa.me/?text=${encodeURIComponent(`وظيفة: ${career.title?.ar}\n${pageUrl}`)}` },
    { label: "فيسبوك", icon: FaFacebook, color: "blue", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}` },
    { label: "X", icon: FaXTwitter, color: "dark", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`وظيفة شاغرة: ${career.title?.ar}`)}&url=${encodeURIComponent(pageUrl)}` },
    { label: "LinkedIn", icon: FaLinkedin, color: "indigo", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}` },
  ];

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <Box bg="white" py={40} className="page-hero">
        <Container size="xl">
          <Anchor component={Link} to="/careers" c="brand.6" size="sm" mb="lg" display="inline-flex" style={{ alignItems: "center", gap: 8 }}>
            <FaArrowRight size={13} /> العودة للوظائف
          </Anchor>
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap={8} mb="sm">
                <Badge color={TYPE_COLORS[career.type]} variant="light">{TYPE_LABELS[career.type]}</Badge>
                {career.published && !isExpired && <Badge color="green" variant="light">متاحة</Badge>}
                {isExpired && <Badge color="red" variant="light">انتهت المدة</Badge>}
              </Group>
              <Title order={1} c="dark.8" fz={{ base: 28, md: 36 }} mb={8}>{career.title?.ar}</Title>
              {career.title?.en && <Text c="dimmed" fz="lg" mb="md">{career.title.en}</Text>}
              <Group gap="lg" c="dimmed">
                {career.department?.ar && <Group gap={6}><FaBriefcase size={14} /><Text size="sm">{career.department.ar}</Text></Group>}
                {career.location?.ar && <Group gap={6}><FaLocationDot size={14} /><Text size="sm">{career.location.ar}</Text></Group>}
                {career.deadline && (
                  <Group gap={6} c={isExpired ? "red.6" : undefined}>
                    <FaCalendar size={14} /><Text size="sm">آخر موعد: {new Date(career.deadline).toLocaleDateString("ar-EG")}</Text>
                  </Group>
                )}
                {career.salary?.min && !career.salary?.hidden && (
                  <Group gap={6} c="green.7">
                    <FaDollarSign size={14} />
                    <Text size="sm">{Number(career.salary.min).toLocaleString("ar-EG")} — {Number(career.salary.max).toLocaleString("ar-EG")} {career.salary.currency}</Text>
                  </Group>
                )}
              </Group>
            </Box>

            <Popover position="bottom-end" shadow="lg" radius="lg">
              <Popover.Target>
                <Button variant="default" color="dark" leftSection={<FaShareNodes size={14} />}>مشاركة</Button>
              </Popover.Target>
              <Popover.Dropdown w={260}>
                <Text size="xs" fw={700} c="dimmed" mb="sm">مشاركة الوظيفة</Text>
                <ShareGrid shareLinks={shareLinks} copied={copied} copyLink={copyLink} />
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="lg">
              {career.description?.ar && (
                <Card className="public-card" radius="lg" p="lg">
                  <Group gap={8} mb="md"><FaBriefcase size={17} color="var(--mantine-color-brand-6)" /><Title order={2} size="lg">وصف الوظيفة</Title></Group>
                  <Text c="dimmed" lh={1.8} style={{ whiteSpace: "pre-line" }}>{career.description.ar}</Text>
                </Card>
              )}

              {career.requirements?.length > 0 && (
                <Card className="public-card" radius="lg" p="lg">
                  <Group gap={8} mb="md"><FaCircleCheck size={17} color="var(--mantine-color-brand-6)" /><Title order={2} size="lg">المتطلبات</Title></Group>
                  <Stack gap="sm">
                    {career.requirements.map((r, i) => (
                      <Group key={i} gap={10} align="flex-start" wrap="nowrap">
                        <ThemeIcon size={20} radius="xl" variant="light" color="brand" mt={2}><FaCircleCheck size={11} /></ThemeIcon>
                        <Text size="sm" c="dimmed" lh={1.7}>{r}</Text>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              )}

              <Card className="public-card" radius="lg" p="lg" hiddenFrom="lg">
                <Group gap={8} mb="sm"><FaShareNodes size={15} color="var(--mantine-color-brand-6)" /><Text fw={700} size="sm">شارك هذه الوظيفة</Text></Group>
                <ShareGrid shareLinks={shareLinks} copied={copied} copyLink={copyLink} />
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Stack gap="md" style={{ position: "sticky", top: 84 }}>
              <Card className="public-card" radius="lg" p="lg">
                <Title order={2} size="lg" mb="md">قدّم الآن</Title>
                {isExpired ? (
                  <Stack align="center" py="lg" gap={6}>
                    <FaCalendar size={36} color="var(--mantine-color-red-3)" />
                    <Text size="sm" c="dimmed" ta="center">انتهت مدة التقديم على هذه الوظيفة</Text>
                  </Stack>
                ) : sent ? (
                  <Stack align="center" py="lg" gap={4}>
                    <ThemeIcon size={56} radius="xl" color="green" variant="light"><FaCircleCheck size={26} /></ThemeIcon>
                    <Text fw={700}>تم إرسال طلبك!</Text>
                    <Text size="sm" c="dimmed" ta="center">سيتواصل معك فريق الموارد البشرية قريباً</Text>
                  </Stack>
                ) : career.cv_link ? (
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">للتقديم على هذه الوظيفة يرجى الضغط على الزر أدناه</Text>
                    <Button component="a" href={career.cv_link} target="_blank" rel="noreferrer" color="brand" fullWidth leftSection={<FaArrowUpRightFromSquare size={14} />}>
                      تقديم عبر الرابط
                    </Button>
                  </Stack>
                ) : (
                  <Stack gap="sm" component="form" onSubmit={handleApply}>
                    <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل *" required radius="md" />
                    <TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="رقم الهاتف *" required radius="md" />
                    <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="البريد الإلكتروني *" required radius="md" />
                    <TextInput
                      type="url" value={form.cv_link} onChange={(e) => setForm({ ...form, cv_link: e.target.value })}
                      placeholder="https://drive.google.com/..." radius="md"
                      label="رابط السيرة الذاتية (اختياري)" leftSection={<FaLink size={13} />}
                    />
                    <Button type="submit" loading={sending} color="brand" fullWidth>إرسال الطلب</Button>
                  </Stack>
                )}
              </Card>

              <Card className="public-card" radius="lg" p="lg" visibleFrom="lg">
                <Group gap={8} mb="sm"><FaShareNodes size={15} color="var(--mantine-color-brand-6)" /><Text fw={700} size="sm">مشاركة الوظيفة</Text></Group>
                <ShareGrid shareLinks={shareLinks} copied={copied} copyLink={copyLink} />
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>

        {related.length > 0 && (
          <Box mt={48}>
            <Title order={2} size="xl" mb="lg">وظائف أخرى قد تهمك</Title>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
              {related.map((c) => (
                <Card key={c._id} component={Link} to={`/careers/${c._id}`} className="public-card" radius="lg" p="lg" style={{ textDecoration: "none" }}>
                  <Group gap={10} mb="sm">
                    <ThemeIcon size={36} radius="md" variant="light" color="brand"><FaBriefcase size={15} /></ThemeIcon>
                    <Badge color={TYPE_COLORS[c.type]} variant="light" size="sm">{TYPE_LABELS[c.type]}</Badge>
                  </Group>
                  <Text fw={700} size="sm" c="dark.8" mb={2}>{c.title?.ar}</Text>
                  <Text size="xs" c="dimmed">{c.department?.ar} • {c.location?.ar}</Text>
                </Card>
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Container>
    </Box>
  );
}

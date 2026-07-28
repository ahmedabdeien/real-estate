import { useState, useEffect } from "react";
import {
  Box, Container, Grid, Stack, Card, Title, Text, TextInput, Textarea,
  Button, ThemeIcon, SimpleGrid, Anchor, Group,
} from "@mantine/core";
import {
  FaPhone, FaEnvelope, FaLocationDot, FaClock, FaWhatsapp, FaPaperPlane,
  FaCircleCheck, FaLocationArrow,
} from "react-icons/fa6";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { useCms } from "../../hooks/useCms";
import PageHero from "../../Components/shared/PageHero";

export default function ContactPage() {
  const { user } = useAuth();
  const { contact: siteContact, settings } = useSiteSettings();
  const { data: cmsContact } = useCms("contact", {
    phone: "", whatsapp: "", email: "", address_ar: "", working_hours: "",
    facebook: "", instagram: "", youtube: "",
  });

  const [form, setForm] = useState({
    name: user?.name || "", phone: user?.phone || "", email: user?.email || "", message: "", source: "website",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "تواصل معنا | الصرح للتطوير العقاري"; }, []);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post("/leads", form); setSent(true); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const phone = cmsContact.phone || siteContact.phone || "01234567890";
  const email = cmsContact.email || siteContact.email || "info@elsarh.com";
  const address = cmsContact.address_ar || siteContact.address_ar || "القاهرة، جمهورية مصر العربية";
  const hours = cmsContact.working_hours || siteContact.working_hours || "السبت - الخميس: 9 صباحاً - 6 مساءً";
  const whatsapp = cmsContact.whatsapp || siteContact.whatsapp || phone;

  let branches = [];
  try { branches = settings.branches ? JSON.parse(settings.branches) : []; } catch { /* ignore */ }

  const infoItems = [
    { icon: FaPhone, title: "الهاتف", value: phone, href: `tel:+2${phone}` },
    { icon: FaEnvelope, title: "البريد الإلكتروني", value: email, href: `mailto:${email}` },
    { icon: FaLocationDot, title: "العنوان", value: address },
    { icon: FaClock, title: "أوقات العمل", value: hours },
  ];

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <PageHero title="تواصل معنا" subtitle="نحن هنا لمساعدتك في رحلتك العقارية" />

      <Container size="xl" py="xl">
        <Grid gutter={40}>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Title order={2} fz={{ base: 24, md: 28 }} mb="lg">معلومات التواصل</Title>
            <Stack gap="sm" mb="md">
              {infoItems.map(({ icon: Icon, title, value, href }) => (
                <Card key={title} className="public-card" radius="lg" p="md">
                  <Group gap="md" wrap="nowrap">
                    <ThemeIcon size={44} radius="md" variant="light" color="brand"><Icon size={18} /></ThemeIcon>
                    <Box>
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase">{title}</Text>
                      {href ? (
                        <Anchor href={href} fw={700} c="dark.8" underline="never">{value}</Anchor>
                      ) : (
                        <Text fw={700} c="dark.8">{value}</Text>
                      )}
                    </Box>
                  </Group>
                </Card>
              ))}
            </Stack>

            <Button
              component="a" color="green" size="lg" fullWidth leftSection={<FaWhatsapp size={20} />}
              href={whatsapp.startsWith("http") ? whatsapp : `https://wa.me/2${whatsapp.replace(/\D/g, "")}`}
              target="_blank" rel="noreferrer" mb="md"
            >
              تواصل عبر واتساب
            </Button>

            {siteContact.map_embed && (
              <Card className="public-card" radius="lg" p={0} style={{ overflow: "hidden" }}
                dangerouslySetInnerHTML={{ __html: siteContact.map_embed.replace('width="600"', 'width="100%"').replace('height="450"', 'height="280"') }}
              />
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            {sent ? (
              <Card className="public-card" radius="lg" p={40} ta="center">
                <ThemeIcon size={64} radius="xl" color="green" variant="light" mx="auto" mb="md"><FaCircleCheck size={30} /></ThemeIcon>
                <Title order={3} size="xl" mb={6}>تم إرسال رسالتك!</Title>
                <Text c="dimmed">سيتواصل معك فريقنا في أقرب وقت ممكن</Text>
                <Anchor mt="lg" c="brand.6" fw={600} onClick={() => setSent(false)} style={{ cursor: "pointer" }}>إرسال رسالة أخرى</Anchor>
              </Card>
            ) : (
              <Card className="public-card" radius="lg" p="xl" component="form" onSubmit={handleSubmit}>
                <Title order={2} fz={{ base: 24, md: 28 }} mb={4}>أرسل رسالتك</Title>
                <Text c="dimmed" size="sm" mb="lg">سنرد عليك خلال 24 ساعة</Text>

                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <TextInput label="الاسم الكامل" required value={form.name} onChange={(e) => f("name", e.target.value)} radius="md" />
                    <TextInput label="رقم الهاتف" required value={form.phone} onChange={(e) => f("phone", e.target.value)} radius="md" />
                  </SimpleGrid>
                  <TextInput type="email" label="البريد الإلكتروني" value={form.email} onChange={(e) => f("email", e.target.value)} radius="md" />
                  <Textarea label="رسالتك" rows={5} placeholder="أخبرنا عن احتياجاتك العقارية..." value={form.message} onChange={(e) => f("message", e.target.value)} radius="md" />
                  <Button type="submit" loading={loading} color="brand" size="md" leftSection={<FaPaperPlane size={14} />}>
                    إرسال الرسالة
                  </Button>
                </Stack>
              </Card>
            )}
          </Grid.Col>
        </Grid>
      </Container>

      {branches.length > 0 && (
        <Container size="xl" pb={64}>
          <Title order={2} fz={{ base: 24, md: 28 }} ta="center" mb="lg">فروعنا</Title>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {branches.map((br, i) => (
              <Card key={i} className="public-card" radius="lg" p="lg">
                <Group gap={10} mb="md">
                  <ThemeIcon size={40} radius="md" variant="light" color="brand"><FaLocationDot size={17} /></ThemeIcon>
                  <Text fw={700}>{br.name || `فرع ${i + 1}`}</Text>
                </Group>
                <Stack gap={8}>
                  {br.address && <Group gap={8} align="flex-start"><FaLocationDot size={13} color="var(--mantine-color-gray-5)" style={{ marginTop: 3 }} /><Text size="sm" c="dimmed">{br.address}</Text></Group>}
                  {br.phone && <Group gap={8}><FaPhone size={13} color="var(--mantine-color-gray-5)" /><Anchor href={`tel:${br.phone}`} size="sm" c="dimmed" underline="never">{br.phone}</Anchor></Group>}
                  {br.hours && <Group gap={8}><FaClock size={13} color="var(--mantine-color-gray-5)" /><Text size="sm" c="dimmed">{br.hours}</Text></Group>}
                </Stack>
                {br.map_link && (
                  <Button component="a" href={br.map_link} target="_blank" rel="noreferrer" variant="light" color="brand" fullWidth mt="md" leftSection={<FaLocationArrow size={13} />}>
                    عرض على الخريطة
                  </Button>
                )}
              </Card>
            ))}
          </SimpleGrid>
        </Container>
      )}
    </Box>
  );
}

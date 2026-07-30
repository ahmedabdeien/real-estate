import { Link } from "react-router-dom";
import {
  Box, Container, SimpleGrid, Stack, Text, Title, Group, ActionIcon,
  Anchor, Image, Divider, Button,
} from "@mantine/core";
import { FaPhone, FaEnvelope, FaLocationDot, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa6";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { useCms } from "../../hooks/useCms";
import logo from "../../assets/logo.svg";

const quickLinks = [
  { to: "/projects", label: "مشاريعنا" },
  { to: "/units",    label: "الوحدات المتاحة" },
  { to: "/about",    label: "عن الشركة" },
  { to: "/blog",     label: "الأخبار والمقالات" },
  { to: "/careers",  label: "الوظائف" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const { settings, contact } = useSiteSettings();

  const { data: cmsFooter } = useCms("footer", {
    companyName: "", companyDesc: "", phone: "", email: "", address: "",
  });

  const phone   = cmsFooter.phone    || contact.phone    || settings.company_phone   || "01234567890";
  const email   = cmsFooter.email    || contact.email    || settings.company_email   || "info@elsarh.com";
  const address = cmsFooter.address  || contact.address_ar || settings.company_address || "القاهرة، مصر";
  const name    = cmsFooter.companyName || settings.company_name_ar || "AG Development";
  const desc    = cmsFooter.companyDesc || "شركة عقارية رائدة متخصصة في توفير أفضل الوحدات السكنية والتجارية بأعلى معايير الجودة.";

  const facebook  = contact.facebook  || settings.facebook_url  || "#";
  const instagram = contact.instagram || settings.instagram_url || "#";
  const youtube   = contact.youtube   || settings.youtube_url   || "#";

  return (
    <Box component="footer" bg="dark.8" c="gray.4" dir="rtl">
      <Container size="xl" py="xl">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xl">
          <Stack gap="sm">
            <Box bg="white" p={8} style={{ borderRadius: "var(--mantine-radius-md)", display: "inline-block", width: "fit-content" }}>
              <Image src={logo} alt={name} h={36} w="auto" fit="contain" />
            </Box>
            <Text size="sm" lh={1.7}>{desc}</Text>
            <Group gap="xs" mt="xs">
              <ActionIcon component="a" href={facebook} target="_blank" rel="noreferrer" variant="light" color="gray" radius="md" size="lg">
                <FaFacebook size={16} />
              </ActionIcon>
              <ActionIcon component="a" href={instagram} target="_blank" rel="noreferrer" variant="light" color="gray" radius="md" size="lg">
                <FaInstagram size={16} />
              </ActionIcon>
              <ActionIcon component="a" href={youtube} target="_blank" rel="noreferrer" variant="light" color="gray" radius="md" size="lg">
                <FaYoutube size={16} />
              </ActionIcon>
            </Group>
          </Stack>

          <Stack gap="sm">
            <Title order={4} size="sm" c="gray.2" tt="uppercase">روابط سريعة</Title>
            <Stack gap={8}>
              {quickLinks.map(({ to, label }) => (
                <Anchor key={to} component={Link} to={to} c="gray.4" size="sm" underline="never">
                  {label}
                </Anchor>
              ))}
            </Stack>
          </Stack>

          <Stack gap="sm">
            <Title order={4} size="sm" c="gray.2" tt="uppercase">تواصل معنا</Title>
            <Stack gap={10}>
              <Group gap={10} wrap="nowrap">
                <FaPhone size={14} color="var(--mantine-color-brand-4)" />
                <Anchor href={`tel:+2${phone}`} c="gray.4" size="sm" underline="never">{phone}</Anchor>
              </Group>
              <Group gap={10} wrap="nowrap">
                <FaEnvelope size={14} color="var(--mantine-color-brand-4)" />
                <Anchor href={`mailto:${email}`} c="gray.4" size="sm" underline="never">{email}</Anchor>
              </Group>
              <Group gap={10} wrap="nowrap" align="flex-start">
                <FaLocationDot size={14} color="var(--mantine-color-brand-4)" style={{ marginTop: 3 }} />
                <Text size="sm">{address}</Text>
              </Group>
            </Stack>
          </Stack>

          <Stack gap="sm">
            <Title order={4} size="sm" c="gray.2" tt="uppercase">احجز استشارتك</Title>
            <Text size="sm">تواصل معنا الآن للحصول على أفضل العروض العقارية</Text>
            <Button component={Link} to="/contact" color="brand" fullWidth>
              تواصل الآن
            </Button>
          </Stack>
        </SimpleGrid>
      </Container>

      <Divider color="dark.5" />
      <Container size="xl" py="md">
        <Group justify="space-between" wrap="wrap">
          <Text size="sm" c="gray.6">© {year} {name}. جميع الحقوق محفوظة.</Text>
          <Group gap="lg">
            <Anchor component={Link} to="/contact" c="gray.6" size="sm" underline="never">سياسة الخصوصية</Anchor>
            <Anchor component={Link} to="/admin" c="gray.7" size="xs" underline="never">لوحة الإدارة</Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

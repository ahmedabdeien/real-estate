import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Container, Group, Button, Burger, Drawer, Menu, Avatar, Text,
  Stack, Divider, Box, UnstyledButton, Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  FaBuilding, FaPhone, FaUser, FaGear, FaRightFromBracket, FaChevronDown,
} from "react-icons/fa6";

import { useAuth } from "../../context/AuthContext";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const links = [
  { to: "/", label: "الرئيسية", exact: true },
  { to: "/projects", label: "المشاريع" },
  { to: "/blog", label: "الأخبار" },
  { to: "/about", label: "عن الشركة" },
  { to: "/careers", label: "وظائف" },
  { to: "/contact", label: "تواصل معنا" },
];

function NavItem({ to, label, exact, onClick, mobile }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-item ${mobile ? "nav-item--mobile" : ""} ${isActive ? "nav-item--active" : ""}`
      }
    >
      {label}
    </NavLink>
  );
}

function UserMenu({ user, logout }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Menu shadow="md" width={220} position="bottom-end" radius="lg">
      <Menu.Target>
        <UnstyledButton className="user-trigger">
          <Group gap={8}>
            <Avatar color="brand" radius="xl" size={28}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
            <Text size="sm" fw={600} visibleFrom="sm" truncate maw={100}>
              {user.name?.split(" ")[0]}
            </Text>
            <FaChevronDown size={12} />
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Box px="sm" py="xs">
          <Text size="sm" fw={600} truncate>{user.name}</Text>
          <Text size="xs" c="dimmed" truncate>{user.email}</Text>
        </Box>
        <Menu.Divider />
        <Menu.Item component={Link} to="/profile" leftSection={<FaUser size={14} />}>
          الملف الشخصي
        </Menu.Item>
        {["admin", "sales"].includes(user.role) && (
          <Menu.Item component={Link} to="/admin" leftSection={<FaGear size={14} />}>
            لوحة التحكم
          </Menu.Item>
        )}
        <Menu.Item color="red" onClick={handleLogout} leftSection={<FaRightFromBracket size={14} />}>
          تسجيل الخروج
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

export default function Header() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { contact, settings } = useSiteSettings();

  const phone = contact.phone || settings.company_phone || "01234567890";
  const logo  = settings.company_logo;
  const name  = settings.company_name_ar || "الصرح للتطوير العقاري";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { close(); }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Box component="header" className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <Container size="xl">
        <Group h={64} justify="space-between" wrap="nowrap">
          <Group component={Link} to="/" gap={10} wrap="nowrap" style={{ textDecoration: "none" }}>
            {logo ? (
              <Image src={logo} alt={name} h={36} w="auto" fit="contain" />
            ) : (
              <Box className="logo-badge">
                <FaBuilding size={18} color="white" />
              </Box>
            )}
            <Text fw={800} size="lg" c="dark.8" visibleFrom="xs">{name}</Text>
          </Group>

          <Group gap={4} visibleFrom="lg">
            {links.map((l) => <NavItem key={l.to} {...l} />)}
          </Group>

          <Group gap="xs" wrap="nowrap">
            {user ? (
              <UserMenu user={user} logout={logout} />
            ) : (
              <>
                <Button component={Link} to="/admin/login" color="brand" radius="md" visibleFrom="md">
                  تسجيل الدخول
                </Button>
                <Button
                  component="a" href={`tel:+2${phone}`}
                  color="dark" radius="md" leftSection={<FaPhone size={14} />}
                  visibleFrom="md"
                >
                  اتصل بنا
                </Button>
              </>
            )}
            <Burger opened={opened} onClick={toggle} hiddenFrom="lg" size="sm" />
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={opened} onClose={close} position="top" size="auto"
        withCloseButton={false} hiddenFrom="lg" padding={0}
      >
        <Stack gap={4} p="md" pt={80}>
          {links.map((l) => <NavItem key={l.to} {...l} mobile onClick={close} />)}
          <Divider my="xs" />
          {user ? (
            <>
              <NavItem to="/profile" label={`${user.name} — الملف الشخصي`} mobile onClick={close} />
              {["admin", "sales"].includes(user.role) && (
                <NavItem to="/admin" label="لوحة التحكم" mobile onClick={close} />
              )}
              <Button color="red" variant="light" onClick={handleLogout} fullWidth mt="xs">
                تسجيل الخروج
              </Button>
            </>
          ) : (
            <Stack gap="xs" mt="xs">
              <Button component={Link} to="/admin/login" color="brand" fullWidth onClick={close}>
                تسجيل الدخول
              </Button>
              <Button component="a" href={`tel:+2${phone}`} color="dark" fullWidth leftSection={<FaPhone size={14} />}>
                اتصل بنا الآن
              </Button>
            </Stack>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}

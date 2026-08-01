import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Group, ActionIcon, Menu, Indicator, Avatar, Text, TextInput,
  Modal, ScrollArea, UnstyledButton, Burger,
} from "@mantine/core";
import {
  FaBell, FaSun, FaMoon, FaArrowUpRightFromSquare,
  FaMagnifyingGlass, FaCircleUser, FaGear, FaRightFromBracket,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { t } from "../../lib/t";
import { useToast } from "../../context/ToastContext";
import { toggleDarkMode, selectDarkMode } from "../../store/slices/uiSlice";
import { fetchNotifications, markAllRead } from "../../store/slices/notificationsSlice";
import { selectNotifications, selectUnreadCount } from "../../store";
import api from "../../api/axios";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `${mins}د`;
  if (hours < 24) return `${hours}س`;
  return `${days}ي`;
}

const notifTypeIcon = (type) => {
  const map = { lead: "🏠", task: "✅", system: "⚙️", warning: "⚠️", info: "ℹ️" };
  return map[type] || "🔔";
};

const QUICK_PAGES = [
  { label: "لوحة التحكم", path: "/admin", icon: "📊" },
  { label: "المشاريع", path: "/admin/projects", icon: "🏗️" },
  { label: "الوحدات", path: "/admin/units", icon: "🏠" },
  { label: "العملاء", path: "/admin/leads", icon: "👥" },
  { label: "الإشعارات", path: "/admin/notifications", icon: "🔔" },
  { label: "الواتساب", path: "/admin/whatsapp", icon: "💬" },
  { label: "الإعدادات", path: "/admin/settings", icon: "⚙️" },
  { label: "المقالات", path: "/admin/blogs", icon: "📝" },
  { label: "الوظائف", path: "/admin/careers", icon: "💼" },
  { label: "المستخدمون", path: "/admin/users", icon: "👤" },
  { label: "المهام", path: "/admin/tasks", icon: "✅" },
];

export default function Topbar({ onMenuClick, navbarOpened }) {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const dark = useSelector(selectDarkMode);
  const unreadCount = useSelector(selectUnreadCount);
  const notifications = useSelector(selectNotifications);
  const notifLoading = useSelector((s) => s.notifications.loading);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/admin/login");
  };

  const markOne = (id) => { api.put(`/notifications/${id}/read`).catch(() => {}); };
  const filtered = query
    ? QUICK_PAGES.filter((p) => p.label.includes(query) || p.path.includes(query))
    : QUICK_PAGES;

  return (
    <Box h="100%" px="md" dir="rtl" style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Burger opened={navbarOpened} onClick={onMenuClick} hiddenFrom="lg" color="white" size="sm" />

      <UnstyledButton
        onClick={() => setSearchOpen(true)}
        visibleFrom="md"
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          padding: "6px 12px", color: "rgba(255,255,255,0.4)", minWidth: 220,
        }}
      >
        <FaMagnifyingGlass size={12} />
        <Text fz={11} c="gray.5">بحث سريع...</Text>
        <Text fz={9} ff="monospace" c="gray.6" ml="auto">⌘K</Text>
      </UnstyledButton>

      <Group ml="auto" gap={4} wrap="nowrap">
        <ActionIcon component="a" href="/" target="_blank" variant="subtle" color="gray.5" title="عرض الموقع">
          <FaArrowUpRightFromSquare size={13} />
        </ActionIcon>

        <ActionIcon
          variant="subtle" color="gray.5"
          onClick={() => dispatch(toggleDarkMode())}
          title={dark ? "الوضع النهاري" : "الوضع الليلي"}
        >
          {dark ? <FaSun size={13} /> : <FaMoon size={13} />}
        </ActionIcon>

        <Menu position="bottom-end" width={320} shadow="lg" onOpen={() => dispatch(fetchNotifications())}>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray.5">
              <Indicator disabled={unreadCount === 0} label={unreadCount > 99 ? "99+" : unreadCount} size={14} color="red" offset={2}>
                <FaBell size={13} />
              </Indicator>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown p={0} dir="rtl">
            <Group justify="space-between" px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <Text fz="sm" fw={700}>الإشعارات</Text>
              <UnstyledButton onClick={() => dispatch(markAllRead())}>
                <Text fz={10} c="brand.6" fw={600}>تحديد الكل كمقروء</Text>
              </UnstyledButton>
            </Group>
            <ScrollArea.Autosize mah={340}>
              {notifLoading ? (
                <Text ta="center" c="dimmed" fz="sm" py="lg">جاري التحميل...</Text>
              ) : notifications.length === 0 ? (
                <Text ta="center" c="dimmed" fz="sm" py="lg">لا توجد إشعارات</Text>
              ) : (
                notifications.map((n) => (
                  <UnstyledButton
                    key={n._id}
                    onClick={() => markOne(n._id)}
                    w="100%" px="md" py="sm"
                    bg={!n.read ? "brand.0" : undefined}
                    style={{ borderBottom: "1px solid var(--mantine-color-gray-1)", display: "flex", gap: 10, alignItems: "flex-start" }}
                  >
                    <Text fz={16} style={{ flexShrink: 0 }}>{notifTypeIcon(n.type)}</Text>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" wrap="nowrap" gap={6}>
                        <Text fz={11} fw={!n.read ? 700 : 400} lineClamp={2}>{t(n.title)}</Text>
                        <Text fz={9} c="dimmed" style={{ flexShrink: 0 }}>{timeAgo(n.createdAt)}</Text>
                      </Group>
                      {n.body && <Text fz={9} c="dimmed" truncate>{t(n.body, "ar", "")}</Text>}
                    </Box>
                  </UnstyledButton>
                ))
              )}
            </ScrollArea.Autosize>
            <Box ta="center" py={8} style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
              <Text component={Link} to="/admin/notifications" fz={11} c="brand.6" fw={600}>عرض كل الإشعارات</Text>
            </Box>
          </Menu.Dropdown>
        </Menu>

        <Menu position="bottom-end" width={220} shadow="lg">
          <Menu.Target>
            <UnstyledButton style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px" }}>
              <Avatar size={28} color="brand">{user?.name?.[0]?.toUpperCase() || "A"}</Avatar>
              <Text visibleFrom="md" fz={11} c="gray.4" truncate maw={80}>{user?.name?.split(" ")[0] || "مدير"}</Text>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown dir="rtl">
            <Box px="md" py="sm">
              <Text fz="sm" fw={700} truncate>{user?.name}</Text>
              <Text fz={11} c="dimmed" truncate>{user?.email}</Text>
            </Box>
            <Menu.Divider />
            <Menu.Item component={Link} to="/admin/profile" leftSection={<FaCircleUser size={13} />}>الملف الشخصي</Menu.Item>
            <Menu.Item component={Link} to="/admin/settings" leftSection={<FaGear size={13} />}>الإعدادات</Menu.Item>
            <Menu.Divider />
            <Menu.Item color="red" onClick={handleLogout} leftSection={<FaRightFromBracket size={13} />}>تسجيل الخروج</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Modal opened={searchOpen} onClose={() => setSearchOpen(false)} withCloseButton={false} padding={0} size="md">
        <Box p="md" dir="rtl" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <TextInput
            autoFocus
            placeholder="ابحث في الصفحات..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSection={<FaMagnifyingGlass size={13} />}
          />
        </Box>
        <ScrollArea.Autosize mah={280} dir="rtl">
          {filtered.map((p) => (
            <UnstyledButton
              key={p.path}
              w="100%" px="md" py="sm"
              onClick={() => { navigate(p.path); setSearchOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <Text fz={16}>{p.icon}</Text>
              <Text fz="sm">{p.label}</Text>
              <Text fz={10} c="dimmed" ff="monospace" ml="auto">{p.path}</Text>
            </UnstyledButton>
          ))}
        </ScrollArea.Autosize>
      </Modal>
    </Box>
  );
}

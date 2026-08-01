import { useState, useEffect } from "react";
import { NavLink as RouterNavLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Group, Text, UnstyledButton, ScrollArea, NavLink, Avatar,
  ActionIcon, Tooltip, Collapse, Image,
} from "@mantine/core";
import {
  FaTableColumns, FaBuilding, FaHouse, FaUsers, FaFileLines,
  FaImage, FaGear, FaBriefcase, FaRightFromBracket,
  FaChartLine, FaWaveSquare, FaSquareCheck, FaClockRotateLeft,
  FaCircleUser, FaPenToSquare, FaBell, FaUserPlus,
  FaScaleBalanced, FaShieldHalved,
  FaCommentDots, FaChevronDown, FaChevronUp,
  FaAnglesLeft, FaAnglesRight,
} from "react-icons/fa6";
import LogoSvg from "../../assets/logo.svg";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchUnreadCount } from "../../store/slices/notificationsSlice";
import { toggleSidebar, selectSidebarCollapsed } from "../../store/slices/uiSlice";
import { selectUnreadCount } from "../../store";

const navGroups = [
  {
    label: "الرئيسية",
    items: [
      { to: "/admin",               label: "لوحة التحكم",      icon: FaTableColumns, exact: true, pageKey: "dashboard" },
      { to: "/admin/notifications", label: "الإشعارات",         icon: FaBell,         pageKey: "notifications", badge: true },
      { to: "/admin/tasks",         label: "المهام",            icon: FaSquareCheck,  pageKey: "tasks" },
    ],
  },
  {
    label: "العقارات",
    items: [
      { to: "/admin/projects",      label: "المشاريع",          icon: FaBuilding,     pageKey: "projects" },
      { to: "/admin/units",         label: "الوحدات",           icon: FaHouse,        pageKey: "units" },
      { to: "/admin/leads",         label: "العملاء",           icon: FaChartLine,    pageKey: "leads" },
      { to: "/admin/client-reg",    label: "تسجيل العملاء",     icon: FaUserPlus,     pageKey: "client-reg" },
    ],
  },
  {
    label: "الشئون القانونية",
    items: [
      { to: "/admin/legal", label: "الشئون القانونية", icon: FaScaleBalanced, pageKey: "legal" },
    ],
  },
  {
    label: "المحتوى",
    items: [
      { to: "/admin/blogs",    label: "المقالات",               icon: FaFileLines,    pageKey: "blogs" },
      { to: "/admin/content",  label: "المحتوى",                icon: FaPenToSquare,  pageKey: "content" },
      { to: "/admin/media",    label: "مكتبة الصور",            icon: FaImage,        pageKey: "media" },
      { to: "/admin/careers",  label: "الوظائف",                icon: FaBriefcase,    pageKey: "careers" },
    ],
  },
  {
    label: "النظام",
    items: [
      { to: "/admin/whatsapp",   label: "الواتساب",             icon: FaCommentDots,     pageKey: "whatsapp" },
      { to: "/admin/users",      label: "المستخدمون",           icon: FaUsers,           pageKey: "users" },
      { to: "/admin/roles",      label: "إدارة الأدوار",        icon: FaShieldHalved,    pageKey: "roles" },
      { to: "/admin/activity",   label: "سجل النشاط",           icon: FaWaveSquare,      pageKey: "activity" },
      { to: "/admin/settings",   label: "الإعدادات",            icon: FaGear,            pageKey: "settings" },
      { to: "/admin/profile",    label: "الملف الشخصي",         icon: FaCircleUser,      pageKey: "profile" },
      { to: "/admin/changelog",  label: "التحديثات",            icon: FaClockRotateLeft, pageKey: "changelog" },
    ],
  },
];

const canSee = (user, pageKey) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.allowedPages?.includes("*")) return true;
  return user.allowedPages?.includes(pageKey) ?? false;
};

const roleLabels = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
};

function SidebarLink({ item, collapsed, unreadCount, active }) {
  const badgeCount = item.badge ? unreadCount : 0;

  const link = (
    <NavLink
      component={RouterNavLink}
      to={item.to}
      active={active}
      label={!collapsed ? item.label : undefined}
      leftSection={<item.icon size={14} />}
      rightSection={
        badgeCount > 0 && !collapsed ? (
          <Box bg="red.6" c="white" fz={9} fw={700} px={6} py={1} style={{ borderRadius: 999, lineHeight: 1.5 }}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </Box>
        ) : null
      }
      mx={collapsed ? 6 : 8}
      my={2}
      styles={{
        root: {
          padding: collapsed ? "10px 0" : "10px 12px",
          justifyContent: collapsed ? "center" : "flex-start",
          backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
        },
        label: { fontSize: 12, color: active ? "#fff" : "rgba(255,255,255,0.55)", fontWeight: active ? 600 : 400 },
        section: { color: active ? "var(--mantine-color-brand-4)" : "rgba(255,255,255,0.45)" },
        body: { flex: collapsed ? "0 0 auto" : 1 },
      }}
    />
  );

  return collapsed ? (
    <Tooltip label={item.label} position="left" withArrow offset={10}>
      {link}
    </Tooltip>
  ) : link;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const unreadCount = useSelector(selectUnreadCount);
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    if (!user || user.role === "viewer") return;
    dispatch(fetchUnreadCount());
    const interval = setInterval(() => dispatch(fetchUnreadCount()), 60000);
    return () => clearInterval(interval);
  }, [user, dispatch]);

  const handleLogout = () => {
    logout();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/admin/login");
  };

  const toggleGroup = (label) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  return (
    <Box h="100%" dir="rtl" style={{ display: "flex", flexDirection: "column", background: "#0f1e2e" }}>
      <Group px="md" py="md" wrap="nowrap" gap="xs" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        {!isCollapsed && (
          <Box bg="white" px={8} py={6} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center" }}>
            <Image src={LogoSvg} alt="AG Development" h={22} w="auto" fit="contain" />
          </Box>
        )}
        <ActionIcon
          variant="subtle" color="gray.6" size="sm"
          onClick={() => dispatch(toggleSidebar())}
          style={isCollapsed ? { marginInline: "auto" } : undefined}
        >
          {isCollapsed ? <FaAnglesRight size={12} /> : <FaAnglesLeft size={12} />}
        </ActionIcon>
      </Group>

      <ScrollArea style={{ flex: 1 }} scrollbarSize={4} py="xs" scrollHideDelay={0}>
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => canSee(user, item.pageKey));
          if (!visibleItems.length) return null;
          const isOpen = openGroups[group.label] !== false;

          return (
            <Box key={group.label} mb={4}>
              {!isCollapsed ? (
                <UnstyledButton
                  onClick={() => toggleGroup(group.label)}
                  px="md" py={6}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
                >
                  <Text fz={10} fw={700} tt="uppercase" c="gray.6" style={{ letterSpacing: 1 }}>{group.label}</Text>
                  {isOpen ? <FaChevronUp size={8} color="var(--mantine-color-gray-6)" /> : <FaChevronDown size={8} color="var(--mantine-color-gray-6)" />}
                </UnstyledButton>
              ) : (
                <Box mx="md" my={4} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />
              )}

              <Collapse in={isOpen || isCollapsed}>
                {visibleItems.map((item) => {
                  const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                  return (
                    <SidebarLink key={item.to} item={item} collapsed={isCollapsed} unreadCount={unreadCount} active={active} />
                  );
                })}
              </Collapse>
            </Box>
          );
        })}
      </ScrollArea>

      <Group px="md" py="sm" wrap="nowrap" gap="xs" justify={isCollapsed ? "center" : "flex-start"} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <Avatar size={32} color="brand">{user?.name?.[0]?.toUpperCase() || "A"}</Avatar>
        {!isCollapsed && (
          <>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text c="white" fz={11} fw={600} truncate>{user?.name || "مدير النظام"}</Text>
              <Text c="gray.6" fz={9} truncate>{roleLabels[user?.role] || "مستخدم"}</Text>
            </Box>
            <ActionIcon variant="subtle" color="gray.6" onClick={handleLogout} title="تسجيل الخروج">
              <FaRightFromBracket size={12} />
            </ActionIcon>
          </>
        )}
      </Group>
    </Box>
  );
}

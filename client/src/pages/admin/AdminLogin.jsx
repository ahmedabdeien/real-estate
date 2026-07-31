import { useState, useEffect } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  Box, Container, Stack, Title, Text, TextInput, PasswordInput, Button,
  Divider, ThemeIcon, Group, Center, Paper, MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { FaBuilding, FaHouseChimney, FaEnvelope, FaLock } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../api/axios";
import { useCms } from "../../hooks/useCms";
import { mantineTheme } from "../../mantineTheme";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

export default function AdminLogin() {
  const { user, login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: loginCms } = useCms("login_page");

  const [cms, setCms] = useState({
    heroTitle: "AG Development",
    heroSubtitle: "تسجيل الدخول إلى لوحة التحكم",
    heroTagline: "ندير أعمالك بكفاءة واحترافية",
    heroImage: "",
  });

  useEffect(() => {
    api.get("/content/login_page")
      .then((r) => {
        const d = r.data.data || {};
        setCms({
          heroTitle:    d.heroTitle    || "AG Development",
          heroSubtitle: d.heroSubtitle || "تسجيل الدخول إلى لوحة التحكم",
          heroTagline:  d.heroTagline  || "ندير أعمالك بكفاءة واحترافية",
          heroImage:    d.heroImage    || "",
        });
      })
      .catch(() => {});
  }, []);

  if (user) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("مرحباً بك في لوحة الإدارة");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("Google")) {
        toast.error("هذا الحساب مسجّل بـ Google، استخدم زر تسجيل الدخول بـ Google أعلاه");
      } else {
        toast.error(msg || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const u = await loginWithGoogle();
      toast.success(`مرحباً ${u.name}!`);
      navigate("/admin");
    } catch (err) {
      const msg = err.code === "auth/popup-closed-by-user"
        ? "تم إغلاق نافذة Google"
        : err.response?.data?.message || "فشل تسجيل الدخول بـ Google";
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <MantineProvider theme={mantineTheme}>
    <Box dir="rtl" style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left panel — brand */}
      <Box
        visibleFrom="lg"
        pos="relative"
        style={{
          width: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", padding: 48,
          background: "linear-gradient(135deg, #0B1F33 0%, #0f2f4d 45%, #004F9E 100%)",
        }}
      >
        {cms.heroImage && (
          <Box pos="absolute" inset={0}>
            <img src={cms.heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.2 }} />
            <Box pos="absolute" inset={0} style={{ background: "linear-gradient(135deg, rgba(11,31,51,0.8), rgba(0,79,158,0.6))" }} />
          </Box>
        )}
        <Stack align="center" ta="center" pos="relative" gap="md" maw={380}>
          <ThemeIcon size={80} variant="light" color="gray.0" style={{ background: "rgba(255,255,255,0.15)" }}>
            {loginCms?.logo_url ? (
              <img src={loginCms.logo_url} alt="logo" style={{ height: 44, objectFit: "contain" }} />
            ) : (
              <FaBuilding size={36} color="white" />
            )}
          </ThemeIcon>
          <Title order={1} c="white" fz={30} fw={900}>{cms.heroTitle}</Title>
          <Text c="rgba(255,255,255,0.7)" fz="lg">{cms.heroSubtitle}</Text>
          <Text c="white" fz="md" fw={600}>{cms.heroTagline}</Text>
          <Divider w={120} color="rgba(255,255,255,0.2)" mt="lg" />
          <Text c="rgba(255,255,255,0.5)" fz="sm">© {new Date().getFullYear()} AG Development</Text>
        </Stack>
      </Box>

      {/* Right panel — form */}
      <Box style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }} bg="gray.0">
        <Button
          component={Link} to="/" variant="white" size="sm" radius={0}
          pos="absolute" top={16} left={16}
          leftSection={<FaHouseChimney size={14} />}
        >
          الرئيسية
        </Button>

        <Container size={440} w="100%">
          <Center mb="xl" hiddenFrom="lg">
            <Stack align="center" gap={6}>
              <ThemeIcon size={64} variant="light" color="brand">
                {loginCms?.logo_url ? (
                  <img src={loginCms.logo_url} alt="logo" style={{ height: 36, objectFit: "contain" }} />
                ) : (
                  <FaBuilding size={28} />
                )}
              </ThemeIcon>
              <Title order={2} fz={22}>{cms.heroTitle}</Title>
              <Text c="dimmed" size="sm">{cms.heroSubtitle}</Text>
            </Stack>
          </Center>

          <Box visibleFrom="lg" mb="xl" ta="center">
            <Title order={2} fz={26} fw={900}>مرحباً بعودتك</Title>
            <Text c="dimmed" mt={4}>{cms.heroSubtitle}</Text>
          </Box>

          <Paper withBorder p="xl" bg="white">
            <Title order={3} fz="lg" mb="lg">تسجيل الدخول</Title>

            <Button
              onClick={handleGoogle}
              loading={googleLoading}
              disabled={loading}
              variant="default"
              fullWidth
              leftSection={<GoogleIcon />}
              mb="md"
            >
              تسجيل الدخول بـ Google
            </Button>

            <Divider label="أو بالبريد الإلكتروني" labelPosition="center" mb="md" />

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label="البريد الإلكتروني" type="email" required
                  placeholder="admin@agdevelopment.com"
                  leftSection={<FaEnvelope size={14} />}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <PasswordInput
                  label="كلمة المرور" required
                  placeholder="••••••••"
                  leftSection={<FaLock size={14} />}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Button type="submit" color="brand" fullWidth loading={loading} disabled={googleLoading} mt="xs">
                  تسجيل الدخول
                </Button>
              </Stack>
            </form>
          </Paper>

          <Group justify="center" mt="lg">
            <Text size="xs" c="dimmed">© {new Date().getFullYear()} AG Development</Text>
          </Group>
        </Container>
      </Box>
    </Box>
    </MantineProvider>
  );
}

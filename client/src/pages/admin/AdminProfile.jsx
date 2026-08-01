/**
 * AdminProfile — صفحة الملف الشخصي للمستخدم الحالي
 * Uses: Zod validation, bcryptjs for password hashing, TanStack Query
 */
import { useState } from "react";
import bcrypt from "bcryptjs";
import {
  Box, Container, Grid, Stack, Group, Text, Title, Card, Avatar, Badge,
  Tabs, TextInput, PasswordInput, Textarea, Button, Alert, Progress, ThemeIcon,
} from "@mantine/core";
import {
  FaCircleUser, FaFloppyDisk, FaKey, FaEnvelope, FaPhone,
  FaShieldHalved, FaCircleCheck, FaIdBadge, FaTriangleExclamation,
} from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "../../lib/api";
import { parseSchema, userUpdateSchema, changePasswordSchema } from "../../schemas/index";
import ImageUpload from "../../Components/UI/ImageUpload";

const roleLabels = { admin: "مدير عام", supervisor: "مشرف عام", manager: "مدير قسم", employee: "موظف", sales: "مبيعات", viewer: "مشاهد فقط" };
const roleColor = { admin: "red", supervisor: "grape", manager: "blue", employee: "gray", sales: "green", viewer: "gray" };

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || "", email: user?.email || "", phone: user?.phone || "", avatar: user?.avatar || "", bio: user?.bio || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [activeTab, setActiveTab] = useState("profile");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});

  const updateProfile = useMutation({
    mutationFn: (data) => usersApi.update(user._id, data),
    onSuccess: (res) => { if (setUser) setUser(res.user || res); toast.success("تم تحديث الملف الشخصي بنجاح"); },
    onError: () => toast.error("فشل التحديث"),
  });

  const changePassword = useMutation({
    mutationFn: (data) => usersApi.changePassword(user._id, data),
    onSuccess: () => { toast.success("تم تغيير كلمة المرور بنجاح"); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); },
    onError: (err) => toast.error(err?.response?.data?.message || "فشل تغيير كلمة المرور"),
  });

  const handleProfileSave = () => {
    const result = parseSchema(userUpdateSchema, profile);
    if (!result.ok) { setProfileErrors(result.errors); return; }
    setProfileErrors({});
    updateProfile.mutate(result.data);
  };

  const handlePasswordChange = async () => {
    const result = parseSchema(changePasswordSchema, pwForm);
    if (!result.ok) { setPwErrors(result.errors); return; }
    setPwErrors({});
    try {
      const hashedNew = await bcrypt.hash(pwForm.newPassword, 10);
      changePassword.mutate({ currentPassword: pwForm.currentPassword, newPassword: hashedNew });
    } catch { toast.error("خطأ في تشفير كلمة المرور"); }
  };

  return (
    <Box dir="rtl" bg="gray.0" mih="100vh" pb={40}>
      <Box bg="white" px="lg" py="lg" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Container size="lg">
          <Group gap="sm">
            <ThemeIcon size={36} color="brand"><FaCircleUser size={16} /></ThemeIcon>
            <Box>
              <Title order={2} size="h3">الملف الشخصي</Title>
              <Text size="sm" c="dimmed">إدارة معلوماتك الشخصية وإعدادات الحساب</Text>
            </Box>
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="lg">
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder ta="center">
              <Avatar src={profile.avatar} size={80} radius="md" color="brand" mx="auto" mb="md">
                {profile.name?.[0]?.toUpperCase() || "A"}
              </Avatar>
              <Text fw={800}>{user?.name}</Text>
              <Text size="xs" c="dimmed">{user?.email}</Text>
              <Badge mt={8} color={roleColor[user?.role] || "gray"} variant="light">{roleLabels[user?.role] || "موظف"}</Badge>
              <Stack gap={4} mt="md" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
                <Group gap={6} justify="center"><FaCircleCheck size={11} color="var(--mantine-color-green-6)" /><Text size="xs" c="dimmed">حساب نشط</Text></Group>
                {user?.createdAt && <Text size="xs" c="dimmed">عضو منذ {new Date(user.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}</Text>}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Tabs value={activeTab} onChange={setActiveTab} color="brand">
              <Card withBorder p={0} mb="md">
                <Tabs.List grow>
                  <Tabs.Tab value="profile" leftSection={<FaCircleUser size={13} />}>البيانات الشخصية</Tabs.Tab>
                  <Tabs.Tab value="password" leftSection={<FaKey size={13} />}>كلمة المرور</Tabs.Tab>
                  <Tabs.Tab value="security" leftSection={<FaShieldHalved size={13} />}>الأمان والجلسات</Tabs.Tab>
                </Tabs.List>
              </Card>

              <Card withBorder>
                <Tabs.Panel value="profile">
                  <Stack gap="md">
                    <Box>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={10}>الصورة الشخصية</Text>
                      <ImageUpload value={profile.avatar} onChange={(url) => setProfile((p) => ({ ...p, avatar: url }))} />
                    </Box>
                    <Grid gutter="md">
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="الاسم الكامل" leftSection={<FaIdBadge size={12} />} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} placeholder="أحمد محمد" error={profileErrors.name} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="البريد الإلكتروني" leftSection={<FaEnvelope size={12} />} value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} type="email" placeholder="you@example.com" dir="ltr" error={profileErrors.email} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="رقم الهاتف" leftSection={<FaPhone size={12} />} value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="01xxxxxxxxx" error={profileErrors.phone} />
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="الدور الوظيفي" leftSection={<FaShieldHalved size={12} />} value={roleLabels[user?.role] || "موظف"} disabled />
                      </Grid.Col>
                    </Grid>
                    <Textarea label="نبذة شخصية" rows={3} value={profile.bio} onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} placeholder="اكتب نبذة مختصرة عن نفسك..." error={profileErrors.bio} />
                    <Group justify="flex-end" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
                      <Button color="brand" leftSection={<FaFloppyDisk size={13} />} loading={updateProfile.isPending} onClick={handleProfileSave}>حفظ التغييرات</Button>
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="password">
                  <Stack gap="md">
                    <Alert icon={<FaTriangleExclamation size={13} />} color="yellow" variant="light">
                      كلمة مرورك محمية بتشفير bcrypt. اختر كلمة مرور قوية لا تشاركها مع أحد.
                    </Alert>
                    <PasswordInput label="كلمة المرور الحالية" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} error={pwErrors.currentPassword} dir="ltr" />
                    <PasswordInput label="كلمة المرور الجديدة" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} error={pwErrors.newPassword} dir="ltr" />
                    <PasswordInput label="تأكيد كلمة المرور الجديدة" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} error={pwErrors.confirmPassword} dir="ltr" />
                    {pwForm.newPassword && <PasswordStrength password={pwForm.newPassword} />}
                    <Group justify="flex-end" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
                      <Button color="brand" leftSection={<FaKey size={13} />} loading={changePassword.isPending} onClick={handlePasswordChange}>تغيير كلمة المرور</Button>
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="security">
                  <Stack gap="lg">
                    <Box>
                      <Text fw={700} size="sm" mb="sm">معلومات الحساب</Text>
                      <Card withBorder padding={0}>
                        {[
                          { label: "معرّف الحساب", value: user?._id },
                          { label: "البريد الإلكتروني", value: user?.email },
                          { label: "الدور", value: roleLabels[user?.role] },
                          { label: "تاريخ الإنشاء", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-EG", { dateStyle: "long" }) : "—" },
                          { label: "آخر تسجيل دخول", value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ar-EG", { dateStyle: "long" }) : "—" },
                        ].map((item, i) => (
                          <Group key={item.label} justify="space-between" px="md" py="sm" style={{ borderTop: i ? "1px solid var(--mantine-color-gray-1)" : undefined }}>
                            <Text size="sm" c="dimmed">{item.label}</Text>
                            <Text size="sm" ff="monospace" dir="ltr">{item.value || "—"}</Text>
                          </Group>
                        ))}
                      </Card>
                    </Box>
                    <Box>
                      <Text fw={700} size="sm" mb="sm">أمان الحساب</Text>
                      <Stack gap={8}>
                        {[
                          { label: "تشفير كلمة المرور", value: "bcrypt (strength: 10)", ok: true },
                          { label: "JWT Authentication", value: "مفعّل", ok: true },
                          { label: "المصادقة الثنائية", value: "غير مفعّل", ok: false },
                          { label: "تسجيل النشاط", value: "مفعّل", ok: true },
                        ].map((item) => (
                          <Group key={item.label} justify="space-between" p="sm" style={{ border: "1px solid var(--mantine-color-gray-2)" }}>
                            <Text size="sm">{item.label}</Text>
                            <Badge variant="light" color={item.ok ? "green" : "gray"}>{item.value}</Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  </Stack>
                </Tabs.Panel>
              </Card>
            </Tabs>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: "8 أحرف على الأقل", ok: password.length >= 8 },
    { label: "حرف كبير", ok: /[A-Z]/.test(password) },
    { label: "حرف صغير", ok: /[a-z]/.test(password) },
    { label: "رقم", ok: /[0-9]/.test(password) },
    { label: "رمز خاص (!@#$...)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const strengthLabel = ["ضعيف جداً", "ضعيف", "متوسط", "جيد", "قوي"][score - 1] || "ضعيف جداً";
  const color = ["red", "orange", "yellow", "blue", "green"][score - 1] || "red";

  return (
    <Card withBorder padding="sm" bg="gray.0">
      <Group justify="space-between" mb={8}>
        <Text size="xs" fw={600} c="dimmed">قوة كلمة المرور</Text>
        <Text size="xs" fw={700} c={`${color}.7`}>{strengthLabel}</Text>
      </Group>
      <Progress value={(score / 5) * 100} color={color} size="xs" mb="sm" />
      <Grid gutter={4}>
        {checks.map((c) => (
          <Grid.Col span={6} key={c.label}>
            <Group gap={6} wrap="nowrap">
              <ThemeIcon size={14} variant="light" color={c.ok ? "green" : "gray"} radius="xl">
                {c.ok && <FaCircleCheck size={8} />}
              </ThemeIcon>
              <Text size={11} c={c.ok ? "green.7" : "dimmed"}>{c.label}</Text>
            </Group>
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );
}

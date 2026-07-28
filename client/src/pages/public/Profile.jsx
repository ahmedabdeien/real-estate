import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Grid, Stack, Card, Title, Text, TextInput, Button, Avatar,
  Badge, Group, Alert, SimpleGrid,
} from "@mantine/core";
import {
  FaArrowRight, FaPhone, FaLocationDot, FaCalendar, FaRightFromBracket,
  FaPen, FaUser, FaEnvelope, FaLock, FaFloppyDisk, FaTriangleExclamation,
} from "react-icons/fa6";

import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
function canChange(changedAt) {
  if (!changedAt) return { ok: true };
  const ms = Date.now() - new Date(changedAt);
  return ms >= SEVEN_DAYS_MS ? { ok: true } : { ok: false, days: Math.ceil((SEVEN_DAYS_MS - ms) / 86400000) };
}

const roleLabel = { admin: "مدير النظام", sales: "مبيعات", viewer: "عضو" };
const roleColor = { admin: "brand", sales: "teal", viewer: "gray" };

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", age: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    setForm({ name: user.name || "", phone: user.phone || "", email: user.email || "", address: user.address || "", age: user.age || "" });
  }, [user]);

  if (!user) return null;

  const phoneStatus = canChange(user.phoneChangedAt);
  const emailStatus = canChange(user.emailChangedAt);
  const f = (k, v) => { setForm((p) => ({ ...p, [k]: v })); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("الاسم مطلوب"); return; }
    setSaving(true); setError("");
    try {
      const payload = { name: form.name, address: form.address, age: form.age || null };
      if (phoneStatus.ok) payload.phone = form.phone;
      if (emailStatus.ok && form.email !== user.email) payload.email = form.email;
      const res = await api.put("/auth/profile", payload);
      updateUser(res.data.user);
      setSuccess("تم حفظ التغييرات بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <Container size={900} py="xl">
        <Button variant="subtle" color="gray" leftSection={<FaArrowRight size={13} />} onClick={() => navigate(-1)} mb="lg">
          رجوع
        </Button>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card className="public-card" radius="lg" p="lg" ta="center">
              <Avatar color="brand" radius="xl" size={96} mx="auto" mb="md" style={{ fontSize: 32, fontWeight: 900 }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Title order={3} size="lg">{user.name}</Title>
              <Text c="dimmed" size="sm" truncate mt={2}>{user.email}</Text>
              <Badge color={roleColor[user.role] || "gray"} variant="light" mt="sm">{roleLabel[user.role] || "عضو"}</Badge>

              <Stack gap={10} mt="lg" pt="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }} ta="right">
                {user.phone && <Group gap={10}><FaPhone size={14} color="var(--mantine-color-brand-6)" /><Text size="sm" dir="ltr">{user.phone}</Text></Group>}
                {user.address && <Group gap={10} align="flex-start"><FaLocationDot size={14} color="var(--mantine-color-brand-6)" style={{ marginTop: 3 }} /><Text size="sm">{user.address}</Text></Group>}
                {user.age && <Group gap={10}><FaCalendar size={14} color="var(--mantine-color-brand-6)" /><Text size="sm">{user.age} سنة</Text></Group>}
              </Stack>

              <Button
                variant="light" color="red" fullWidth mt="lg" leftSection={<FaRightFromBracket size={14} />}
                onClick={async () => { await logout(); navigate("/"); }}
              >
                تسجيل الخروج
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card className="public-card" radius="lg" p="xl" component="form" onSubmit={handleSave}>
              <Group gap={10} mb="lg">
                <FaPen size={16} color="var(--mantine-color-brand-6)" />
                <Text fw={700}>تعديل المعلومات</Text>
              </Group>

              <Stack gap="md">
                <TextInput label="الاسم الكامل" required value={form.name} onChange={(e) => f("name", e.target.value)} leftSection={<FaUser size={13} />} radius="md" />

                <TextInput
                  label="رقم الهاتف" value={form.phone} onChange={(e) => f("phone", e.target.value)}
                  disabled={!phoneStatus.ok} leftSection={<FaPhone size={13} />} radius="md"
                  rightSection={!phoneStatus.ok && <FaLock size={13} color="var(--mantine-color-yellow-6)" />}
                  description={!phoneStatus.ok ? `يمكن التعديل بعد ${phoneStatus.days} أيام` : undefined}
                />

                <TextInput
                  type="email" label="البريد الإلكتروني" value={form.email} onChange={(e) => f("email", e.target.value)}
                  disabled={!emailStatus.ok} leftSection={<FaEnvelope size={13} />} radius="md"
                  rightSection={!emailStatus.ok && <FaLock size={13} color="var(--mantine-color-yellow-6)" />}
                  description={!emailStatus.ok ? `يمكن التعديل بعد ${emailStatus.days} أيام` : undefined}
                />

                <SimpleGrid cols={2} spacing="md">
                  <TextInput label="العنوان" placeholder="مثال: القاهرة، المعادي" value={form.address} onChange={(e) => f("address", e.target.value)} leftSection={<FaLocationDot size={13} />} radius="md" />
                  <TextInput type="number" min="10" max="120" label="السن" placeholder="مثال: 30" value={form.age} onChange={(e) => f("age", e.target.value)} leftSection={<FaCalendar size={13} />} radius="md" />
                </SimpleGrid>

                {error && <Alert color="red" icon={<FaTriangleExclamation size={14} />} radius="md">{error}</Alert>}
                {success && <Alert color="green" radius="md">{success}</Alert>}

                <Button type="submit" loading={saving} color="brand" size="md" leftSection={<FaFloppyDisk size={14} />}>
                  حفظ التغييرات
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
}

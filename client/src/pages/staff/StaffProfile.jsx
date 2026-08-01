import { useEffect, useState } from "react";
import {
  MantineProvider, Box, Container, Group, Stack, Text, Title, Card, Avatar,
  TextInput, Button, ThemeIcon, SimpleGrid,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { FaEnvelope, FaPhone, FaBuilding, FaShieldHalved } from "react-icons/fa6";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { mantineTheme } from "../../mantineTheme";

const roleLabels = {
  admin: "مدير عام", supervisor: "مشرف عام", manager: "مدير قسم",
  employee: "موظف", sales: "مبيعات", viewer: "مشاهد",
};

const departmentLabels = {
  accounts: "الحسابات", legal: "الشئون القانونية", marketing: "التسويق",
  administrative: "اداري", projects: "مشروعات", warehouse: "المخازن", purchasing: "المشتريات",
};

function InfoTile({ icon: Icon, label, value }) {
  return (
    <Group gap={10} p="sm" bg="gray.0" wrap="nowrap">
      <ThemeIcon size={32} variant="light" color="brand"><Icon size={14} /></ThemeIcon>
      <Box style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="sm" fw={600} truncate>{value}</Text>
      </Box>
    </Group>
  );
}

function StaffProfileInner() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "", address: user.address || "" });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/auth/profile", form);
      if (updateUser) updateUser(res.data.user || form);
      toast.success("تم تحديث الملف الشخصي");
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل تحديث الملف الشخصي");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container size="sm" dir="rtl">
      <Stack gap="lg">
        <Box>
          <Title order={2} size="h3">الملف الشخصي</Title>
          <Text c="dimmed" size="sm" mt={4}>بياناتك الشخصية ومعلوماتك</Text>
        </Box>

        <Card withBorder>
          <Group gap="md" mb="lg">
            <Avatar size={64} color="brand" fz="xl" fw={900}>{user?.name?.[0]?.toUpperCase()}</Avatar>
            <Box>
              <Text fw={700} size="lg">{user?.name}</Text>
              <Text c="dimmed" size="sm">{user?.email}</Text>
            </Box>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <InfoTile icon={FaShieldHalved} label="الدور الوظيفي" value={roleLabels[user?.role] || user?.role} />
            {user?.department && (
              <InfoTile icon={FaBuilding} label="القسم" value={departmentLabels[user.department] || user.department} />
            )}
            <InfoTile icon={FaEnvelope} label="البريد الإلكتروني" value={user?.email} />
            {user?.phone && <InfoTile icon={FaPhone} label="رقم الهاتف" value={user.phone} />}
          </SimpleGrid>
        </Card>

        <Card withBorder>
          <Title order={3} size="h5" mb="lg">تعديل البيانات</Title>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput label="الاسم الكامل" placeholder="الاسم الكامل" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextInput label="رقم الهاتف" placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <TextInput label="العنوان" placeholder="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <Button type="submit" color="brand" loading={saving} style={{ alignSelf: "flex-start" }}>حفظ التغييرات</Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}

export default function StaffProfile() {
  return (
    <MantineProvider theme={mantineTheme}>
      <StaffProfileInner />
    </MantineProvider>
  );
}

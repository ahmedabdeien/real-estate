import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { Box, Group, Stack, Text, Title, Card, SimpleGrid, ThemeIcon, Button, Badge, Loader, Anchor, Avatar } from "@mantine/core";
import {
  FaBuilding, FaHouse, FaUsers, FaListCheck, FaArrowUpRightFromSquare,
  FaPlus, FaPhone, FaClock, FaCircleExclamation,
} from "react-icons/fa6";
import {
  useDashboardStats, useRecentLeads, usePendingTasks, useLeadsChartData, useLeadsStatusData,
} from "../../hooks/queries/useDashboard";

function timeAgo(d) {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return "الآن";
  if (s < 3600) return `${Math.floor(s / 60)} د`;
  if (s < 86400) return `${Math.floor(s / 3600)} س`;
  return new Date(d).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
}

const STATUS_COLOR = {
  "جديد": "yellow", "تم التواصل": "blue", "مهتم": "green", "غير مهتم": "red", "تم البيع": "grape",
};
const PRIORITY_COLOR = { "عالية": "red", "متوسطة": "yellow", "منخفضة": "green" };

function StatCard({ icon: Icon, label, value, color, to }) {
  const inner = (
    <Card withBorder padding="lg">
      <Group justify="space-between" mb="md">
        <ThemeIcon size={44} color={color} variant="filled">
          <Icon size={18} />
        </ThemeIcon>
        {to && <FaArrowUpRightFromSquare size={13} color="var(--mantine-color-gray-4)" />}
      </Group>
      <Text fz={26} fw={800}>{value ?? "—"}</Text>
      <Text size="sm" c="dimmed">{label}</Text>
    </Card>
  );
  return to ? <Anchor component={Link} to={to} underline="never" c="inherit">{inner}</Anchor> : inner;
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentLeads = [], isLoading: leadsLoading } = useRecentLeads();
  const { data: pendingTasks = [], isLoading: tasksLoading } = usePendingTasks();
  const { data: chartData = [], isLoading: chartLoading } = useLeadsChartData();
  const { data: statusData = [], isLoading: statusLoading } = useLeadsStatusData();

  const barOptions = {
    chart: { type: "bar", toolbar: { show: false }, dir: "rtl", fontFamily: "Cairo, sans-serif" },
    colors: ["#004F9E"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: chartData.map((d) => d.label), labels: { style: { fontFamily: "Cairo, sans-serif", fontSize: "12px" } } },
    yaxis: { labels: { style: { fontFamily: "Cairo, sans-serif", fontSize: "12px" } } },
    grid: { borderColor: "#e5e7eb" },
    tooltip: { y: { formatter: (v) => `${v} عميل` }, style: { fontFamily: "Cairo, sans-serif" } },
  };
  const barSeries = [{ name: "عملاء", data: chartData.map((d) => d.count) }];

  const donutOptions = {
    chart: { type: "donut", fontFamily: "Cairo, sans-serif" },
    labels: statusData.map((d) => d.name),
    colors: statusData.map((d) => d.color),
    legend: { position: "bottom", fontFamily: "Cairo, sans-serif", fontSize: "13px" },
    dataLabels: { enabled: true, style: { fontFamily: "Cairo, sans-serif" } },
    plotOptions: { pie: { donut: { size: "65%" } } },
    tooltip: { style: { fontFamily: "Cairo, sans-serif" } },
  };
  const donutSeries = statusData.map((d) => d.value);

  return (
    <Box dir="rtl">
      <Group justify="space-between" mb="lg">
        <Box>
          <Title order={2} size="h3">لوحة التحكم</Title>
          <Text size="sm" c="dimmed" mt={2}>نظرة عامة على المشاريع والعملاء والمهام</Text>
        </Box>
        <Button component={Link} to="/admin/leads/new" color="brand" leftSection={<FaPlus size={13} />}>عميل جديد</Button>
      </Group>

      {statsLoading ? (
        <Group justify="center" py={40}><Loader color="gray" /></Group>
      ) : (
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="lg">
          <StatCard icon={FaBuilding} label="المشاريع" value={stats?.projectsCount} color="brand" to="/admin/projects" />
          <StatCard icon={FaHouse} label="الوحدات" value={stats?.unitsCount} color="teal" to="/admin/units" />
          <StatCard icon={FaUsers} label="العملاء" value={stats?.leadsCount} color="grape" to="/admin/leads" />
          <StatCard icon={FaListCheck} label="المهام المعلقة" value={stats?.tasksCount} color="indigo" to="/admin/tasks" />
        </SimpleGrid>
      )}

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mb="lg">
        <Card withBorder>
          <Title order={3} size="h5" mb="md">العملاء الجدد بالشهر</Title>
          {chartLoading ? <Group justify="center" py={64}><Loader color="gray" /></Group> : (
            <ReactApexChart options={barOptions} series={barSeries} type="bar" height={260} />
          )}
        </Card>
        <Card withBorder>
          <Title order={3} size="h5" mb="md">توزيع حالة العملاء</Title>
          {statusLoading ? (
            <Group justify="center" py={64}><Loader color="gray" /></Group>
          ) : donutSeries.length === 0 ? (
            <Text ta="center" c="dimmed" py={64} size="sm">لا توجد بيانات</Text>
          ) : (
            <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={260} />
          )}
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <Title order={3} size="h5">آخر العملاء</Title>
            <Anchor component={Link} to="/admin/leads" fz="xs" fw={600} c="brand.6">عرض الكل</Anchor>
          </Group>
          {leadsLoading ? (
            <Group justify="center" py={40}><Loader color="gray" /></Group>
          ) : recentLeads.length === 0 ? (
            <Text ta="center" c="dimmed" py={40} size="sm">لا يوجد عملاء</Text>
          ) : (
            <Stack gap={0}>
              {recentLeads.map((lead, i) => (
                <Group key={lead._id || i} justify="space-between" wrap="nowrap" px="md" py="sm" style={{ borderTop: i ? "1px solid var(--mantine-color-gray-0)" : undefined }}>
                  <Group gap={10} wrap="nowrap" style={{ minWidth: 0 }}>
                    <Avatar color="brand" radius="xl">{lead.name?.charAt(0) || "؟"}</Avatar>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>{lead.name}</Text>
                      <Group gap={4} c="dimmed"><FaPhone size={9} /><Text size="xs">{lead.phone}</Text></Group>
                    </Box>
                  </Group>
                  <Stack align="flex-end" gap={4}>
                    <Badge variant="light" color={STATUS_COLOR[lead.status] || "gray"} size="sm">{lead.status}</Badge>
                    <Group gap={4} c="dimmed"><FaClock size={9} /><Text size="xs">{timeAgo(lead.createdAt)}</Text></Group>
                  </Stack>
                </Group>
              ))}
            </Stack>
          )}
        </Card>

        <Card withBorder padding={0}>
          <Group justify="space-between" px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <Title order={3} size="h5">المهام المعلقة</Title>
            <Anchor component={Link} to="/admin/tasks" fz="xs" fw={600} c="brand.6">عرض الكل</Anchor>
          </Group>
          {tasksLoading ? (
            <Group justify="center" py={40}><Loader color="gray" /></Group>
          ) : pendingTasks.length === 0 ? (
            <Text ta="center" c="dimmed" py={40} size="sm">لا توجد مهام معلقة</Text>
          ) : (
            <Stack gap={0}>
              {pendingTasks.map((task, i) => (
                <Group key={task._id || i} wrap="nowrap" px="md" py="sm" style={{ borderTop: i ? "1px solid var(--mantine-color-gray-0)" : undefined }}>
                  <FaCircleExclamation size={15} color="var(--mantine-color-orange-5)" style={{ flexShrink: 0 }} />
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Text size="sm" fw={600} truncate>{task.title}</Text>
                    {task.dueDate && (
                      <Group gap={4} c="dimmed" mt={2}>
                        <FaClock size={9} />
                        <Text size="xs">{new Date(task.dueDate).toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}</Text>
                      </Group>
                    )}
                  </Box>
                  {task.priority && <Badge variant="light" color={PRIORITY_COLOR[task.priority] || "gray"} size="sm">{task.priority}</Badge>}
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>
    </Box>
  );
}

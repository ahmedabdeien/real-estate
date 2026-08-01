import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MantineProvider, Box, Container, Group, Stack, Text, Title, Button, ActionIcon,
  TextInput, Textarea, Select, SegmentedControl, Chip, Card, Badge, Progress,
  SimpleGrid, Table, Modal, Menu, Avatar, Skeleton, ThemeIcon, Divider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaPlus, FaTrash, FaPen, FaMagnifyingGlass, FaUser, FaChartLine, FaArrowsRotate,
  FaLayerGroup, FaClock, FaBuilding, FaCheck, FaFileLines, FaRightFromBracket,
  FaTriangleExclamation, FaEllipsisVertical, FaArrowRight, FaCalendarDays,
  FaBars, FaTableCellsLarge, FaTableColumns, FaCircleCheck,
} from "react-icons/fa6";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { mantineTheme } from "../../mantineTheme";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEPARTMENTS = {
  accounts:       "الحسابات",
  legal:          "الشئون القانونية",
  marketing:      "التسويق",
  administrative: "اداري",
  projects:       "مشروعات",
  warehouse:      "المخازن",
  purchasing:     "المشتريات",
};

export const STATUS_LABELS = { pending: "معلق", in_progress: "جارٍ", done: "مكتمل" };
const STATUS_COLOR  = { pending: "yellow", in_progress: "blue", done: "green" };
const PRIORITY_LABELS = { low: "منخفضة", medium: "متوسطة", high: "عالية" };
const PRIORITY_COLOR  = { low: "green", medium: "yellow", high: "red" };
export const ROLE_LABELS = {
  admin:      "مدير عام",
  supervisor: "مشرف عام",
  manager:    "مدير قسم",
  employee:   "موظف",
  sales:      "مبيعات",
  viewer:     "مشاهد",
};

// ─── Countdown ───────────────────────────────────────────────────────────────

export function Countdown({ dueDate, compact = false }) {
  const [text, setText]   = useState("");
  const [state, setState] = useState("normal"); // normal | urgent | overdue

  useEffect(() => {
    const tick = () => {
      const diff = new Date(dueDate) - Date.now();
      if (diff <= 0) {
        const abs = Math.abs(diff);
        const h = Math.floor(abs / 3600000);
        const m = Math.floor((abs % 3600000) / 60000);
        setText(compact ? `متأخر ${h}س` : `متأخر ${h}س ${m}د`);
        setState("overdue");
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setState(diff < 86400000 ? "urgent" : "normal");
        if (d > 0) setText(compact ? `${d}ي ${h}س` : `${d}ي ${h}س ${m}د`);
        else       setText(`${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dueDate, compact]);

  const color = { normal: "gray", urgent: "orange", overdue: "red" }[state];

  return (
    <Badge variant="light" color={color} leftSection={<FaClock size={10} />} styles={{ label: { fontFamily: "monospace" } }}>
      {text}
    </Badge>
  );
}

// ─── TaskCard ──────────────────────────────────────────────────────────────

function TaskCard({ task, canManage, onEdit, onDelete, onStatusChange }) {
  const priorityColor = { high: "red.5", medium: "orange.4", low: "gray.3" }[task.priority] || "gray.3";

  return (
    <Card withBorder padding={0} style={{ overflow: "hidden" }}>
      <Group wrap="nowrap" gap={0} align="stretch">
        <Box w={4} bg={priorityColor} style={{ flexShrink: 0 }} />
        <Stack gap={8} p="md" style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="sm" lineClamp={2}>{task.title}</Text>
              <Badge mt={6} variant="light" color="gray" size="sm" leftSection={<FaBuilding size={9} />}>
                {DEPARTMENTS[task.department] || task.department}
              </Badge>
            </Box>
            <Menu position="bottom-end" shadow="md" width={170}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray"><FaEllipsisVertical size={14} /></ActionIcon>
              </Menu.Target>
              <Menu.Dropdown dir="rtl">
                <Menu.Label>تغيير الحالة</Menu.Label>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <Menu.Item
                    key={k}
                    fw={task.status === k ? 700 : 400}
                    c={task.status === k ? "brand.6" : undefined}
                    leftSection={task.status === k ? <FaCircleCheck size={13} /> : null}
                    onClick={() => onStatusChange(task._id, k)}
                  >
                    {v}
                  </Menu.Item>
                ))}
                {canManage && (
                  <>
                    <Menu.Divider />
                    <Menu.Item leftSection={<FaPen size={13} />} onClick={() => onEdit(task)}>تعديل</Menu.Item>
                    <Menu.Item color="red" leftSection={<FaTrash size={13} />} onClick={() => onDelete(task._id)}>حذف</Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>

          {task.description && <Text size="xs" c="dimmed" lineClamp={2}>{task.description}</Text>}

          <Group gap={6} wrap="wrap">
            <Badge variant="light" color={STATUS_COLOR[task.status]} size="sm">{STATUS_LABELS[task.status]}</Badge>
            <Badge variant="light" color={PRIORITY_COLOR[task.priority]} size="sm">{PRIORITY_LABELS[task.priority]}</Badge>
            <Countdown dueDate={task.dueDate} compact />
            {task.status !== "done" && (
              <Button
                ml="auto" size="compact-xs" color="teal" radius="xl"
                leftSection={<FaCheck size={10} />}
                onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, "done"); }}
              >
                إنجاز
              </Button>
            )}
          </Group>

          <Group gap={6} c="dimmed">
            <FaClock size={11} />
            <Text size="xs">
              {new Date(task.dueDate).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </Text>
          </Group>

          {task.assignedTo?.length > 0 && (
            <Group gap={6} wrap="wrap">
              <FaUser size={12} color="var(--mantine-color-gray-5)" />
              {task.assignedTo.map((u) => (
                <Badge key={u._id} variant="outline" color="gray" size="sm">{u.name}</Badge>
              ))}
            </Group>
          )}

          {task.notes && (
            <Box bg="yellow.0" p="xs" style={{ border: "1px solid var(--mantine-color-yellow-2)" }}>
              <Text size="xs" c="yellow.9">
                <FaFileLines size={10} style={{ marginLeft: 4, display: "inline" }} />
                {task.notes}
              </Text>
            </Box>
          )}
        </Stack>
      </Group>
    </Card>
  );
}

// ─── TaskModal ────────────────────────────────────────────────────────────

const emptyForm = { title: "", description: "", dueDate: "", priority: "medium", assignedTo: [], notes: "", department: "" };

function TaskModal({ open, onClose, onSave, editItem, users, userRole, userDept }) {
  const [form, setForm]     = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setForm({
        ...editItem,
        dueDate: editItem.dueDate ? new Date(editItem.dueDate).toISOString().slice(0, 16) : "",
        assignedTo: (editItem.assignedTo || []).map((u) => u._id || u),
      });
    } else {
      setForm({ ...emptyForm, department: userRole === "manager" ? (userDept || "") : "" });
    }
  }, [open, editItem, userRole, userDept]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleUser = (id) =>
    setForm((p) => ({ ...p, assignedTo: p.assignedTo.includes(id) ? p.assignedTo.filter((x) => x !== id) : [...p.assignedTo, id] }));

  const handleSave = async () => {
    if (!form.title.trim() || !form.dueDate || !form.department) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const deptUsers = form.department
    ? users.filter((u) => u.department === form.department || u.role === "admin" || u.role === "supervisor")
    : users;

  return (
    <Modal opened={open} onClose={onClose} title={editItem ? "تعديل المهمة" : "مهمة جديدة"} size="lg" dir="rtl">
      <Stack gap="md">
        <TextInput label="عنوان المهمة" required value={form.title} onChange={(e) => f("title", e.target.value)} placeholder="أدخل عنوان المهمة..." />

        <Select
          label="القسم" required placeholder="— اختر القسم —"
          disabled={userRole === "manager"}
          data={Object.entries(DEPARTMENTS).map(([value, label]) => ({ value, label }))}
          value={form.department}
          onChange={(v) => f("department", v || "")}
        />

        <Textarea label="الوصف" rows={3} placeholder="وصف المهمة..." value={form.description} onChange={(e) => f("description", e.target.value)} />

        <SimpleGrid cols={2}>
          <TextInput type="datetime-local" label="التاريخ والوقت" required value={form.dueDate} onChange={(e) => f("dueDate", e.target.value)} />
          <Select
            label="الأولوية"
            data={[{ value: "low", label: "منخفض" }, { value: "medium", label: "متوسط" }, { value: "high", label: "عالي" }]}
            value={form.priority}
            onChange={(v) => f("priority", v || "medium")}
          />
        </SimpleGrid>

        {deptUsers.length > 0 && (
          <Box>
            <Text size="sm" fw={600} mb={8}>
              تعيين إلى {form.department && <Text component="span" size="xs" c="dimmed" fw={400}>({DEPARTMENTS[form.department]})</Text>}
            </Text>
            <Chip.Group multiple value={form.assignedTo} onChange={(vals) => f("assignedTo", vals)}>
              <Group gap={8}>
                {deptUsers.map((u) => (
                  <Chip key={u._id} value={u._id} onClick={() => toggleUser(u._id)} variant="filled" color="brand">
                    {u.name}
                  </Chip>
                ))}
              </Group>
            </Chip.Group>
          </Box>
        )}

        <Textarea label="ملاحظات" rows={2} placeholder="ملاحظات إضافية..." value={form.notes} onChange={(e) => f("notes", e.target.value)} />

        <Group grow mt="sm">
          <Button variant="default" onClick={onClose}>إلغاء</Button>
          <Button color="brand" loading={saving} disabled={!form.title || !form.dueDate || !form.department} onClick={handleSave}>
            {editItem ? "تحديث" : "إضافة"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ─── Main TasksPage ───────────────────────────────────────────────────────

function TasksPageInner({ embedded = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);
  const [statusTab, setStatusTab] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const canManage = ["admin", "supervisor", "manager"].includes(user?.role);
  const canSeeAll = ["admin", "supervisor"].includes(user?.role);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/tasks");
      setTasks(r.data.tasks || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    if (!canManage) return;
    try {
      const r = await api.get("/tasks/users");
      setUsers(r.data.users || []);
    } catch { /* silent */ }
  }, [canManage]);

  useEffect(() => { loadTasks(); loadUsers(); }, [loadTasks, loadUsers]);

  const now = Date.now();
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay   = new Date(); endOfDay.setHours(23, 59, 59, 999);
  const weekAhead  = new Date(); weekAhead.setDate(weekAhead.getDate() + 7);

  const filtered = tasks.filter((t) => {
    const statusOk   = statusTab === "all" || t.status === statusTab;
    const deptOk     = deptFilter === "all" || t.department === deptFilter;
    const priorityOk = priorityFilter === "all" || t.priority === priorityFilter;
    const assigneeOk = assigneeFilter === "all" || (t.assignedTo || []).some((u) => (u._id || u) === assigneeFilter);
    const q = search.trim().toLowerCase();
    const searchOk = !q
      || (t.title || "").toLowerCase().includes(q)
      || (t.description || "").toLowerCase().includes(q)
      || (t.notes || "").toLowerCase().includes(q);
    let dateOk = true;
    if (dateFilter !== "all") {
      const due = new Date(t.dueDate);
      if (dateFilter === "today") dateOk = due >= startOfDay && due <= endOfDay;
      else if (dateFilter === "week") dateOk = due >= startOfDay && due <= weekAhead;
      else if (dateFilter === "overdue") dateOk = due.getTime() < now && t.status !== "done";
    }
    return statusOk && deptOk && priorityOk && assigneeOk && searchOk && dateOk;
  });

  const overdueCount = tasks.filter((t) => new Date(t.dueDate).getTime() < now && t.status !== "done").length;
  const todayCount = tasks.filter((t) => { const d = new Date(t.dueDate); return d >= startOfDay && d <= endOfDay; }).length;
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const doneThisWeek = tasks.filter((t) => t.status === "done" && t.updatedAt && new Date(t.updatedAt) >= weekAgo).length;

  const doneCount  = tasks.filter((t) => t.status === "done").length;
  const totalCount = tasks.length;
  const donePct    = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const depts = [...new Set(tasks.map((t) => t.department))].filter(Boolean);

  const handleSave = async (form) => {
    try {
      if (editItem) {
        const r = await api.put(`/tasks/${editItem._id}`, form);
        setTasks((p) => p.map((t) => t._id === editItem._id ? r.data.task : t));
      } else {
        const r = await api.post("/tasks", form);
        setTasks((p) => [r.data.task, ...p]);
      }
      setModalOpen(false);
      setEditItem(null);
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذه المهمة؟")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((p) => p.filter((t) => t._id !== id));
    } catch { /* silent */ }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await api.put(`/tasks/${id}`, { status });
      setTasks((p) => p.map((t) => t._id === id ? r.data.task : t));
    } catch { /* silent */ }
  };

  const openEdit = (task) => { setEditItem(task); setModalOpen(true); };
  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const handleLogout = async () => { await logout(); navigate("/admin/login"); };

  const statusTabs = [
    { key: "all", label: "الكل", count: counts.all, icon: FaLayerGroup },
    { key: "pending", label: "معلق", count: counts.pending, icon: FaClock },
    { key: "in_progress", label: "جارٍ", count: counts.in_progress, icon: FaArrowsRotate },
    { key: "done", label: "مكتمل", count: counts.done, icon: FaCircleCheck },
  ];

  return (
    <Box dir="rtl">
      {!embedded && (
        <Box bg="white" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)", position: "sticky", top: 0, zIndex: 20 }}>
          <Container size="lg" py="sm">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                {canManage && (
                  <ActionIcon component={Link} to="/admin" variant="subtle" color="gray"><FaArrowRight size={14} /></ActionIcon>
                )}
                <Box style={{ minWidth: 0 }}>
                  <Text fw={700} size="sm" truncate>إدارة المهام</Text>
                  <Text size="xs" c="dimmed" truncate>
                    {ROLE_LABELS[user?.role]} — {user?.name}{user?.department && ` · ${DEPARTMENTS[user.department] || ""}`}
                  </Text>
                </Box>
              </Group>
              <Group gap="xs" wrap="nowrap">
                {canManage && (
                  <Button size="sm" color="brand" leftSection={<FaPlus size={13} />} onClick={openCreate}>
                    <Text visibleFrom="sm">مهمة جديدة</Text>
                  </Button>
                )}
                <ActionIcon variant="default" onClick={handleLogout} title="تسجيل الخروج"><FaRightFromBracket size={14} /></ActionIcon>
              </Group>
            </Group>
          </Container>
        </Box>
      )}

      {embedded && canManage && (
        <Group justify="space-between" mb="md">
          <Box>
            <Title order={2} size="h3">إدارة المهام</Title>
            <Text c="dimmed" size="sm">
              {ROLE_LABELS[user?.role]} — {user?.name}{user?.department && ` · ${DEPARTMENTS[user.department] || ""}`}
            </Text>
          </Box>
          <Button color="brand" leftSection={<FaPlus size={14} />} onClick={openCreate}>مهمة جديدة</Button>
        </Group>
      )}

      <Container size="lg" py={embedded ? 0 : "lg"} px={embedded ? 0 : undefined}>
        <Stack gap="md">
          {totalCount > 0 && (
            <Card withBorder>
              <Group justify="space-between" mb={8}>
                <Text fw={700} size="sm">{doneCount} من {totalCount} مهمة مكتملة</Text>
                <Text fw={700} size="sm" c="brand.6">{donePct}%</Text>
              </Group>
              <Progress value={donePct} color="brand" size="md" />
            </Card>
          )}

          <SimpleGrid cols={4} spacing={{ base: 8, sm: 12 }}>
            {statusTabs.map(({ key, label, count, icon: Icon }) => (
              <Card
                key={key} withBorder padding="sm" ta="center"
                onClick={() => setStatusTab(key)}
                style={{
                  cursor: "pointer",
                  borderColor: statusTab === key ? "var(--mantine-color-brand-6)" : undefined,
                  borderWidth: statusTab === key ? 2 : 1,
                }}
              >
                <ThemeIcon variant="light" color={statusTab === key ? "brand" : "gray"} size="sm" mx="auto" mb={4}>
                  <Icon size={12} />
                </ThemeIcon>
                <Text fw={800} size="lg" lh={1}>{count}</Text>
                <Text size={10} c="dimmed" mt={2}>{label}</Text>
              </Card>
            ))}
          </SimpleGrid>

          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed" fw={600}>الأولوية:</Text>
            <Chip.Group value={priorityFilter} onChange={setPriorityFilter}>
              <Group gap={6}>
                <Chip value="all" size="xs" variant="filled" color="brand">الكل</Chip>
                <Chip value="high" size="xs" variant="filled" color="red">عالية</Chip>
                <Chip value="medium" size="xs" variant="filled" color="yellow">متوسطة</Chip>
                <Chip value="low" size="xs" variant="filled" color="green">منخفضة</Chip>
              </Group>
            </Chip.Group>
          </Group>

          {canSeeAll && depts.length > 1 && (
            <Group gap={6}>
              <Chip.Group value={deptFilter} onChange={setDeptFilter}>
                <Group gap={6}>
                  <Chip value="all" size="xs" variant="filled" color="brand">كل الأقسام</Chip>
                  {depts.map((d) => (
                    <Chip key={d} value={d} size="xs" variant="filled" color="brand">{DEPARTMENTS[d] || d}</Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Group>
          )}

          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed" fw={600}>التاريخ:</Text>
            <Chip.Group value={dateFilter} onChange={setDateFilter}>
              <Group gap={6}>
                <Chip value="all" size="xs" variant="filled" color="brand">الكل</Chip>
                <Chip value="today" size="xs" variant="filled" color="brand">اليوم</Chip>
                <Chip value="week" size="xs" variant="filled" color="brand">هذا الأسبوع</Chip>
                <Chip value="overdue" size="xs" variant="filled" color="red">متأخرة</Chip>
              </Group>
            </Chip.Group>
          </Group>

          {totalCount > 0 && (
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={8}>
              {[
                { icon: FaLayerGroup, label: "الإجمالي", value: totalCount, color: "gray" },
                { icon: FaTriangleExclamation, label: "متأخرة", value: overdueCount, color: "red" },
                { icon: FaCalendarDays, label: "اليوم", value: todayCount, color: "yellow" },
                { icon: FaChartLine, label: "منجزة الأسبوع", value: doneThisWeek, color: "teal" },
              ].map(({ icon: Icon, label, value, color }) => (
                <Card key={label} withBorder padding="xs">
                  <Group gap={8} wrap="nowrap">
                    <ThemeIcon variant="light" color={color} size="md"><Icon size={13} /></ThemeIcon>
                    <Box>
                      <Text size={10} c="dimmed" lh={1}>{label}</Text>
                      <Text fw={700} size="sm" c={`${color}.7`}>{value}</Text>
                    </Box>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          )}

          <Group gap="xs" wrap="wrap">
            <TextInput
              style={{ flex: 1, minWidth: 160 }}
              placeholder="بحث في المهام..."
              leftSection={<FaMagnifyingGlass size={13} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {canManage && users.length > 0 && (
              <Select
                w={180}
                placeholder="كل المعيّن لهم"
                data={[{ value: "all", label: "كل المعيّن لهم" }, ...users.map((u) => ({ value: u._id, label: u.name }))]}
                value={assigneeFilter}
                onChange={(v) => setAssigneeFilter(v || "all")}
              />
            )}
          </Group>

          <Group gap="xs" wrap="wrap">
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              data={[
                { value: "list", label: <Group gap={4} wrap="nowrap"><FaBars size={12} /><Text visibleFrom="sm" size="xs">صفوف</Text></Group> },
                { value: "cards", label: <Group gap={4} wrap="nowrap"><FaTableCellsLarge size={12} /><Text visibleFrom="sm" size="xs">بطاقات</Text></Group> },
                { value: "kanban", label: <Group gap={4} wrap="nowrap"><FaTableColumns size={12} /><Text visibleFrom="sm" size="xs">كانبان</Text></Group> },
              ]}
            />
            <ActionIcon variant="default" onClick={loadTasks} loading={loading} title="تحديث"><FaArrowsRotate size={13} /></ActionIcon>
            <Text size="xs" c="dimmed" ml="auto">{filtered.length} مهمة</Text>
          </Group>

          {loading ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
              {[...Array(6)].map((_, i) => <Skeleton key={i} height={176} />)}
            </SimpleGrid>
          ) : filtered.length === 0 ? (
            <Stack align="center" py={64} gap={4}>
              <ThemeIcon variant="light" color="gray" size={64}><FaCircleCheck size={28} /></ThemeIcon>
              <Text c="dimmed" fw={600} mt="sm">لا توجد مهام</Text>
              <Text size="xs" c="dimmed">{statusTab !== "all" ? "جرب تغيير الفلتر" : canManage ? "ابدأ بإضافة أول مهمة" : ""}</Text>
              {canManage && statusTab === "all" && (
                <Button mt="md" color="brand" leftSection={<FaPlus size={13} />} onClick={openCreate}>إضافة مهمة</Button>
              )}
            </Stack>
          ) : viewMode === "list" ? (
            <Card withBorder padding={0} style={{ overflow: "auto" }}>
              <Table verticalSpacing="sm" horizontalSpacing="sm">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th w={4}></Table.Th>
                    <Table.Th>العنوان</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th visibleFrom="md">المعيّن لهم</Table.Th>
                    <Table.Th>الموعد</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filtered.map((task) => {
                    const priorityColor = { high: "red.5", medium: "orange.4", low: "gray.3" }[task.priority] || "gray.3";
                    return (
                      <Table.Tr key={task._id} onClick={() => canManage && openEdit(task)} style={{ cursor: canManage ? "pointer" : "default" }}>
                        <Table.Td p={0}><Box w={4} h="100%" bg={priorityColor} /></Table.Td>
                        <Table.Td>
                          <Text fw={600} size="sm">{task.title}</Text>
                          {task.description && <Text size="xs" c="dimmed" lineClamp={1}>{task.description}</Text>}
                        </Table.Td>
                        <Table.Td><Badge variant="light" color={STATUS_COLOR[task.status]} size="sm">{STATUS_LABELS[task.status]}</Badge></Table.Td>
                        <Table.Td visibleFrom="md">
                          <Group gap={4}>
                            {(task.assignedTo || []).slice(0, 2).map((u) => <Badge key={u._id} variant="light" color="gray" size="sm">{u.name}</Badge>)}
                            {(task.assignedTo || []).length > 2 && <Text size="xs" c="dimmed">+{task.assignedTo.length - 2}</Text>}
                          </Group>
                        </Table.Td>
                        <Table.Td><Countdown dueDate={task.dueDate} compact /></Table.Td>
                        <Table.Td onClick={(e) => e.stopPropagation()}>
                          <Group gap={2}>
                            {task.status !== "done" && (
                              <ActionIcon variant="subtle" color="teal" onClick={() => handleStatusChange(task._id, "done")} title="إنجاز">
                                <FaCheck size={13} />
                              </ActionIcon>
                            )}
                            {canManage && (
                              <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(task._id)} title="حذف">
                                <FaTrash size={13} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          ) : viewMode === "kanban" ? (
            <Box style={{ overflowX: "auto" }}>
              <SimpleGrid cols={3} spacing="sm" style={{ minWidth: 720 }}>
                {["pending", "in_progress", "done"].map((status) => {
                  const colTasks = filtered.filter((t) => t.status === status);
                  return (
                    <Box key={status} bg="gray.0" p="sm" style={{ minHeight: 200 }}>
                      <Group justify="space-between" mb={8} px={4}>
                        <Group gap={6}>
                          <Box w={8} h={8} bg={`${STATUS_COLOR[status]}.5`} style={{ borderRadius: 999 }} />
                          <Text size="xs" fw={700}>{STATUS_LABELS[status]}</Text>
                        </Group>
                        <Badge variant="white" color="gray" size="sm">{colTasks.length}</Badge>
                      </Group>
                      <Stack gap={8}>
                        {colTasks.map((task) => (
                          <TaskCard key={task._id} task={task} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                        ))}
                        {colTasks.length === 0 && <Text size="xs" c="dimmed" ta="center" py="lg">لا مهام</Text>}
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          ) : (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
              {filtered.map((task) => (
                <TaskCard key={task._id} task={task} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
              ))}
            </SimpleGrid>
          )}
        </Stack>
      </Container>

      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
        users={users}
        userRole={user?.role}
        userDept={user?.department}
      />
    </Box>
  );
}

export default function TasksPage({ embedded = false }) {
  if (embedded) return <TasksPageInner embedded />;
  return (
    <MantineProvider theme={mantineTheme}>
      <Box bg="gray.0" mih="100dvh"><TasksPageInner /></Box>
    </MantineProvider>
  );
}

/**
 * AdminProjects — Mantine UI, TanStack Query, dnd-kit reorder
 * Preserves: DnD reorder (sortable), grid/table toggle, favorites, unit counts
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MantineProvider, Box, Container, Group, Stack, Text, TextInput, Textarea, Select,
  Switch, Button, ActionIcon, Card, Image, SimpleGrid, Table, Checkbox, Progress,
  SegmentedControl, Tabs, Chip, Badge, Loader, Pagination,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaBuilding, FaPlus, FaPen, FaTrash, FaMagnifyingGlass,
  FaTableList, FaTableCellsLarge, FaHeart, FaXmark, FaGrip, FaFloppyDisk,
  FaArrowsUpDown, FaSquareCheck,
} from "react-icons/fa6";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../../hooks/queries/useProjects";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton, SecondaryButton } from "../../Components/UI/PageHeader";
import StatusBadge from "../../Components/UI/StatusBadge";
import ImageUpload from "../../Components/UI/ImageUpload";
import { useToast } from "../../context/ToastContext";
import { mantineTheme } from "../../mantineTheme";
import apiClient from "../../api/axios";

// ── Constants ──────────────────────────────────────────────────────────────
const FAVORITES_KEY = "favorites_projects";
const loadFavs = () => { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; } };
const saveFavs = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

const STATUS_OPTIONS = [
  { value: "under_construction", label: "قيد الإنشاء" },
  { value: "ready", label: "جاهز" },
  { value: "sold_out", label: "نفذت الوحدات" },
  { value: "coming_soon", label: "قريباً" },
];

const STATUS_BADGE_MAP = {
  under_construction: "قيد الإنشاء", ready: "جاهز", sold_out: "مباعة", coming_soon: "قريباً",
};

const PREDEFINED_AMENITIES = [
  "حمام سباحة", "نادي رياضي", "أمن 24 ساعة", "مواقف سيارات",
  "حديقة", "مدرسة", "مسجد", "مركز تجاري", "منطقة ألعاب", "كهرباء احتياطي",
];

const emptyProject = {
  name: { ar: "", en: "" }, description: { ar: "", en: "" },
  location: { address: { ar: "", en: "" }, city: { ar: "", en: "" }, lat: "", lng: "" },
  status: "under_construction", coverImage: "", images: [],
  featured: false, published: false, startingPrice: "", totalUnits: "",
  amenities: [], developer: { ar: "", en: "" }, videoUrl: "", brochureUrl: "", mapEmbedUrl: "",
};

function setDeep(obj, path, value) {
  const keys = path.split(".");
  const next = { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = { ...cur[keys[i]] }; cur = cur[keys[i]]; }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// ── Sortable Row ──────────────────────────────────────────────────────────
function SortableRow({ project: p, reorderMode, favorites, onToggleFav, onEdit, onDelete, selected, onToggleSelect, unitCount }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p._id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const fav = favorites.includes(p._id);
  const pct = unitCount?.total > 0 ? Math.round((unitCount.available / unitCount.total) * 100) : 0;

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td w={40}>
        {reorderMode ? (
          <Box {...attributes} {...listeners} style={{ cursor: "grab", display: "flex", justifyContent: "center" }}>
            <FaGrip size={14} color="var(--mantine-color-gray-5)" />
          </Box>
        ) : (
          <Stack align="center" gap={4}>
            <Checkbox checked={!!selected} onChange={() => onToggleSelect(p._id)} size="xs" />
            <ActionIcon variant="transparent" size="xs" onClick={() => onToggleFav(p._id)}>
              <FaHeart size={13} color={fav ? "var(--mantine-color-pink-5)" : "var(--mantine-color-gray-4)"} />
            </ActionIcon>
          </Stack>
        )}
      </Table.Td>
      <Table.Td>
        <Group gap={10} wrap="nowrap">
          {p.coverImage ? (
            <Image src={p.coverImage} alt="" w={40} h={40} fit="cover" />
          ) : (
            <Box w={40} h={40} bg="brand.0" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FaBuilding size={16} color="var(--mantine-color-brand-6)" />
            </Box>
          )}
          <Box style={{ minWidth: 0 }}>
            <Text fw={600} size="sm" truncate maw={160}>{p.name?.ar}</Text>
            <Text c="dimmed" size="xs">{p.location?.city?.ar}</Text>
          </Box>
        </Group>
      </Table.Td>
      <Table.Td><StatusBadge status={p.status} label={STATUS_BADGE_MAP[p.status]} /></Table.Td>
      <Table.Td visibleFrom="sm"><Text size="sm">{p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : "—"}</Text></Table.Td>
      <Table.Td visibleFrom="md">
        <Text size="sm">{p.totalUnits || "—"}</Text>
        {unitCount?.total > 0 && (
          <Box mt={4} w={64}>
            <Progress value={pct} color="teal" size={6} />
            <Text size={10} c="dimmed" mt={2}>{unitCount.available} متاح</Text>
          </Box>
        )}
      </Table.Td>
      <Table.Td visibleFrom="sm"><StatusBadge status={p.published ? "published" : "draft"} /></Table.Td>
      <Table.Td>
        {!reorderMode && (
          <Group gap={2}>
            <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(p)}><FaPen size={12} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => onDelete(p)}><FaTrash size={12} /></ActionIcon>
          </Group>
        )}
      </Table.Td>
    </Table.Tr>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
function AdminProjectsInner() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [form, setForm] = useState(emptyProject);
  const [editItem, setEditItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ar");
  const [galleryUrl, setGalleryUrl] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [view, setView] = useState("table");
  const [favorites, setFavorites] = useState(loadFavs);
  const [showFavs, setShowFavs] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [localProjects, setLocalProjects] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [unitCounts, setUnitCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const table = useTableState({ defaultPageSize: 15 });
  const confirmDelete = useDisclosure();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const { data, isLoading, isFetching, refetch } = useProjects({
    page: table.queryParams.page, limit: table.queryParams.pageSize,
    search: table.queryParams.search, status: statusFilter || undefined,
  });

  const projects = localProjects ?? (data?.projects ?? []);
  const total = data?.total ?? 0;

  useEffect(() => { if (!reorderMode) setLocalProjects(null); }, [data, reorderMode]);

  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const stats = useMemo(() => ({
    total,
    active: projects.filter((p) => ["ready", "under_construction"].includes(p.status)).length,
    completed: projects.filter((p) => p.status === "ready").length,
    underConstruction: projects.filter((p) => p.status === "under_construction").length,
  }), [projects, total]);

  const visibleProjects = useMemo(() =>
    showFavs ? projects.filter((p) => favorites.includes(p._id)) : projects,
    [projects, favorites, showFavs]
  );

  useEffect(() => {
    if (!projects.length) return;
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(projects.map(async (p) => {
        try {
          const res = await apiClient.get("/units", { params: { project: p._id, limit: 200 } });
          const units = res.data.units ?? [];
          counts[p._id] = { total: res.data.total ?? units.length, available: units.filter((u) => u.status === "متاحة" || u.status === "available").length };
        } catch { counts[p._id] = { total: 0, available: 0 }; }
      }));
      setUnitCounts(counts);
    };
    fetchCounts();
  }, [projects]);

  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId || !projects.length) return;
    const found = projects.find((p) => p._id === editId);
    if (found) { openEdit(found); setSearchParams({}, { replace: true }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, searchParams]);

  const f = useCallback((path, value) => setForm((prev) => setDeep(prev, path, value)), []);

  const openCreate = () => { setEditItem(null); setForm(emptyProject); setActiveTab("ar"); setModalOpen(true); };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      ...emptyProject, ...p,
      name: { ar: p.name?.ar ?? "", en: p.name?.en ?? "" },
      description: { ar: p.description?.ar ?? "", en: p.description?.en ?? "" },
      location: {
        address: { ar: p.location?.address?.ar ?? "", en: p.location?.address?.en ?? "" },
        city: { ar: p.location?.city?.ar ?? "", en: p.location?.city?.en ?? "" },
        lat: p.location?.lat ?? "", lng: p.location?.lng ?? "",
      },
      startingPrice: p.startingPrice ?? "", totalUnits: p.totalUnits ?? "",
      coverImage: p.coverImage ?? "", images: Array.isArray(p.images) ? p.images : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      developer: p.developer || { ar: "", en: "" },
      videoUrl: p.videoUrl || "", brochureUrl: p.brochureUrl || "", mapEmbedUrl: p.mapEmbedUrl || "",
    });
    setActiveTab("ar");
    setModalOpen(true);
  };

  const buildPayload = () => ({
    name: form.name, description: form.description,
    location: {
      address: form.location?.address || {}, city: form.location?.city || {},
      lat: form.location?.lat ? parseFloat(form.location.lat) : undefined,
      lng: form.location?.lng ? parseFloat(form.location.lng) : undefined,
    },
    status: form.status, coverImage: form.coverImage, images: form.images || [],
    featured: form.featured, published: form.published,
    startingPrice: Number(form.startingPrice) || 0, totalUnits: Number(form.totalUnits) || 0,
    amenities: form.amenities || [], developer: form.developer || {},
    videoUrl: form.videoUrl || "", brochureUrl: form.brochureUrl || "", mapEmbedUrl: form.mapEmbedUrl || "",
  });

  const handleSave = async () => {
    if (!form.name?.ar?.trim()) return toast.error("اسم المشروع بالعربية مطلوب");
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem._id, data: buildPayload() });
        toast.success("تم تحديث المشروع");
      } else {
        await createMutation.mutateAsync(buildPayload());
        toast.success("تم إنشاء المشروع");
      }
      setModalOpen(false);
    } catch { toast.error("حدث خطأ، حاول مجدداً"); }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف المشروع");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next); return next;
    });
  };

  const handleDragEnd = useCallback(({ active, over }) => {
    if (!over || active.id === over.id) return;
    setLocalProjects((prev) => {
      const src = prev ?? projects;
      const oi = src.findIndex((p) => p._id === active.id);
      const ni = src.findIndex((p) => p._id === over.id);
      return arrayMove(src, oi, ni);
    });
  }, [projects]);

  const saveOrder = async () => {
    try {
      const order = (localProjects ?? projects).map((p, i) => ({ _id: p._id, order: i }));
      await apiClient.put("/projects/reorder", { order });
      toast.success("تم حفظ الترتيب");
      setReorderMode(false); setLocalProjects(null); refetch();
    } catch { toast.error("فشل حفظ الترتيب"); }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    await Promise.all(selectedIds.map((id) => updateMutation.mutateAsync({ id, data: { status: bulkStatus } })));
    toast.success(`تم تحديث ${selectedIds.length} مشروع`);
    setSelectedIds([]); setBulkStatus("");
  };

  const addGalleryUrl = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    f("images", [...(form.images || []), url]);
    setGalleryUrl("");
  };

  const addAmenity = () => {
    const a = customAmenity.trim();
    if (!a || (form.amenities || []).includes(a)) return;
    f("amenities", [...(form.amenities || []), a]);
    setCustomAmenity("");
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const totalPages = Math.max(1, Math.ceil(total / table.queryParams.pageSize));

  return (
    <Box dir="rtl">
      <PageHeader
        title="المشاريع" subtitle={`${total} مشروع`} icon={<FaBuilding size={16} />} loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: stats.total },
          { label: "النشطة", value: stats.active },
          { label: "المكتملة", value: stats.completed },
          { label: "قيد الإنشاء", value: stats.underConstruction },
        ]}
        actions={
          reorderMode ? (
            <>
              <SecondaryButton icon={<FaXmark size={13} />} onClick={() => { setReorderMode(false); setLocalProjects(null); }}>إلغاء</SecondaryButton>
              <Button color="teal" leftSection={<FaFloppyDisk size={13} />} onClick={saveOrder}>حفظ الترتيب</Button>
            </>
          ) : (
            <>
              <SecondaryButton icon={<FaArrowsUpDown size={13} />} onClick={() => { setView("table"); setReorderMode(true); }}>ترتيب</SecondaryButton>
              <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة مشروع</PrimaryButton>
            </>
          )
        }
      />

      <Box bg="white" px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="sm" wrap="wrap">
          <TextInput
            style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
            placeholder="بحث..." leftSection={<FaMagnifyingGlass size={13} />}
            value={table.queryParams.search} onChange={(e) => table.handleSearch(e.target.value)}
          />
          <Select
            w={170} placeholder="كل الحالات" clearable
            data={STATUS_OPTIONS} value={statusFilter}
            onChange={(v) => { setStatusFilter(v || ""); table.resetPage(); }}
          />
          <Chip checked={showFavs} onChange={setShowFavs} color="pink" variant="filled" icon={<FaHeart size={11} />}>المفضلة</Chip>
          <SegmentedControl
            value={view} onChange={setView}
            data={[
              { value: "table", label: <FaTableList size={13} /> },
              { value: "grid", label: <FaTableCellsLarge size={13} /> },
            ]}
          />
        </Group>
      </Box>

      <Container size="xl" py="lg">
        <Stack gap="md">
          {selectedIds.length > 0 && (
            <Card withBorder bg="brand.0" py="sm">
              <Group gap="sm" wrap="wrap">
                <FaSquareCheck size={15} color="var(--mantine-color-brand-6)" />
                <Text fw={700} size="sm" c="brand.7">{selectedIds.length} مشروع محدد</Text>
                <Select w={170} placeholder="تغيير الحالة" data={STATUS_OPTIONS} value={bulkStatus} onChange={(v) => setBulkStatus(v || "")} />
                <Button size="sm" color="brand" disabled={!bulkStatus} onClick={handleBulkStatus}>تطبيق</Button>
                <Button size="sm" variant="subtle" color="gray" onClick={() => setSelectedIds([])}>إلغاء</Button>
              </Group>
            </Card>
          )}

          {isLoading ? (
            <Group justify="center" py={64}><Loader color="gray" /></Group>
          ) : visibleProjects.length === 0 ? (
            <Stack align="center" py={64} gap="sm">
              <FaBuilding size={40} color="var(--mantine-color-gray-3)" />
              <Text c="dimmed" size="sm">{showFavs ? "لا توجد مفضلات" : "لا توجد مشاريع"}</Text>
              {!showFavs && <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة مشروع</PrimaryButton>}
            </Stack>
          ) : view === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {visibleProjects.map((p) => {
                const uc = unitCounts[p._id];
                const pct = uc?.total > 0 ? Math.round((uc.available / uc.total) * 100) : 0;
                return (
                  <Card key={p._id} withBorder padding={0} style={{ overflow: "hidden" }}>
                    <Box pos="relative" h={160} bg="gray.1">
                      {p.coverImage ? <Image src={p.coverImage} alt="" h={160} fit="cover" /> : (
                        <Box h={160} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaBuilding size={36} color="var(--mantine-color-gray-3)" />
                        </Box>
                      )}
                      <ActionIcon
                        pos="absolute" top={8} left={8} variant="white" radius="xl" size="lg"
                        onClick={() => toggleFav(p._id)}
                      >
                        <FaHeart size={15} color={favorites.includes(p._id) ? "var(--mantine-color-pink-5)" : "var(--mantine-color-gray-4)"} />
                      </ActionIcon>
                      <Box pos="absolute" top={8} right={8}><StatusBadge status={p.status} label={STATUS_BADGE_MAP[p.status]} size="xs" /></Box>
                    </Box>
                    <Stack gap={6} p="md">
                      <Text fw={700} truncate>{p.name?.ar}</Text>
                      <Text c="dimmed" size="xs">{p.location?.city?.ar || "—"}</Text>
                      <Group justify="space-between" c="dimmed">
                        <Text size="xs">الوحدات: {p.totalUnits || "—"}</Text>
                        <Text size="xs">{p.startingPrice ? `${p.startingPrice.toLocaleString()} ج` : ""}</Text>
                      </Group>
                      {uc?.total > 0 && (
                        <Box>
                          <Progress value={pct} color="teal" size={6} />
                          <Text size={10} c="dimmed" mt={2}>{uc.available} وحدة متاحة</Text>
                        </Box>
                      )}
                      <Group gap={8} mt={4}>
                        <Button flex={1} size="xs" variant="light" color="blue" onClick={() => openEdit(p)}>تعديل</Button>
                        <Button size="xs" variant="light" color="red" onClick={() => confirmDelete.open(p)}>حذف</Button>
                      </Group>
                    </Stack>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <Card withBorder padding={0} style={{ overflow: "auto" }}>
              {reorderMode && (
                <Box bg="yellow.0" px="md" py={8} style={{ borderBottom: "1px solid var(--mantine-color-yellow-3)" }}>
                  <Group gap={8}><FaGrip size={13} color="var(--mantine-color-yellow-7)" /><Text size="xs" fw={600} c="yellow.8">وضع الترتيب — اسحب المشاريع لتغيير ترتيبها، ثم اضغط "حفظ الترتيب"</Text></Group>
                </Box>
              )}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Table verticalSpacing="sm" horizontalSpacing="sm">
                  <Table.Thead bg="gray.0">
                    <Table.Tr>
                      <Table.Th w={40}></Table.Th>
                      <Table.Th>المشروع</Table.Th>
                      <Table.Th>الحالة</Table.Th>
                      <Table.Th visibleFrom="sm">السعر من</Table.Th>
                      <Table.Th visibleFrom="md">الوحدات</Table.Th>
                      <Table.Th visibleFrom="sm">النشر</Table.Th>
                      <Table.Th w={80}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <SortableContext items={visibleProjects.map((p) => p._id)} strategy={verticalListSortingStrategy}>
                    <Table.Tbody>
                      {visibleProjects.map((p) => (
                        <SortableRow key={p._id} project={p} reorderMode={reorderMode}
                          favorites={favorites} onToggleFav={toggleFav}
                          onEdit={openEdit} onDelete={confirmDelete.open}
                          selected={selectedIds.includes(p._id)}
                          onToggleSelect={(id) => setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
                          unitCount={unitCounts[p._id]} />
                      ))}
                    </Table.Tbody>
                  </SortableContext>
                </Table>
              </DndContext>
            </Card>
          )}

          {total > table.queryParams.pageSize && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">عرض {visibleProjects.length} من {total}</Text>
              <Pagination total={totalPages} value={table.queryParams.page} onChange={table.handlePageChange} size="sm" />
            </Group>
          )}
        </Stack>
      </Container>

      <AdminModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "تعديل المشروع" : "إضافة مشروع جديد"}
        icon={<FaBuilding size={14} />} size="3xl"
        footer={
          <>
            <Button variant="default" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button color="brand" loading={isPending} onClick={handleSave}>{editItem ? "حفظ التغييرات" : "إضافة المشروع"}</Button>
          </>
        }
      >
        <Tabs value={activeTab} onChange={setActiveTab} color="brand">
          <Tabs.List mb="md">
            <Tabs.Tab value="ar">عربي</Tabs.Tab>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="details">تفاصيل</Tabs.Tab>
            <Tabs.Tab value="media">وسائط</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ar">
            <Stack gap="md">
              <TextInput label="اسم المشروع (عربي)" required value={form.name?.ar} onChange={(e) => f("name.ar", e.target.value)} />
              <Textarea label="الوصف (عربي)" rows={4} value={form.description?.ar} onChange={(e) => f("description.ar", e.target.value)} />
              <SimpleGrid cols={2}>
                <TextInput label="المدينة (عربي)" value={form.location?.city?.ar} onChange={(e) => f("location.city.ar", e.target.value)} />
                <TextInput label="العنوان (عربي)" value={form.location?.address?.ar} onChange={(e) => f("location.address.ar", e.target.value)} />
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="en">
            <Stack gap="md">
              <TextInput label="Project Name (English)" value={form.name?.en} onChange={(e) => f("name.en", e.target.value)} />
              <Textarea label="Description (English)" rows={4} value={form.description?.en} onChange={(e) => f("description.en", e.target.value)} />
              <SimpleGrid cols={2}>
                <TextInput label="City (English)" value={form.location?.city?.en} onChange={(e) => f("location.city.en", e.target.value)} />
                <TextInput label="Address (English)" value={form.location?.address?.en} onChange={(e) => f("location.address.en", e.target.value)} />
              </SimpleGrid>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="details">
            <Stack gap="md">
              <SimpleGrid cols={2}>
                <Select label="الحالة" data={STATUS_OPTIONS} value={form.status} onChange={(v) => f("status", v || "under_construction")} />
                <TextInput type="number" label="السعر الابتدائي (ج)" value={form.startingPrice} onChange={(e) => f("startingPrice", e.target.value)} />
                <TextInput type="number" label="إجمالي الوحدات" value={form.totalUnits} onChange={(e) => f("totalUnits", e.target.value)} />
                <TextInput label="المطوّر العقاري" placeholder="اسم الشركة المطورة" value={form.developer?.ar} onChange={(e) => f("developer.ar", e.target.value)} />
              </SimpleGrid>

              <Box>
                <Text size="sm" fw={600} mb={8}>المميزات والمرافق</Text>
                <Group gap={6} mb="sm">
                  {PREDEFINED_AMENITIES.map((a) => {
                    const active = (form.amenities || []).includes(a);
                    return (
                      <Chip key={a} checked={active} variant="filled" color="brand"
                        onChange={() => { const cur = form.amenities || []; f("amenities", active ? cur.filter((x) => x !== a) : [...cur, a]); }}>
                        {a}
                      </Chip>
                    );
                  })}
                  {(form.amenities || []).filter((a) => !PREDEFINED_AMENITIES.includes(a)).map((a) => (
                    <Badge key={a} color="brand" variant="filled" rightSection={
                      <ActionIcon size={12} variant="transparent" c="white" onClick={() => f("amenities", (form.amenities || []).filter((x) => x !== a))}>
                        <FaXmark size={9} />
                      </ActionIcon>
                    }>{a}</Badge>
                  ))}
                </Group>
                <Group gap={8}>
                  <TextInput
                    style={{ flex: 1 }} placeholder="إضافة ميزة مخصصة..." value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                  />
                  <Button color="brand" onClick={addAmenity}>+</Button>
                </Group>
              </Box>

              <Group gap="xl">
                <Switch checked={form.featured} onChange={(e) => f("featured", e.currentTarget.checked)} label="مشروع مميز" description="يظهر في أعلى القائمة" color="brand" />
                <Switch checked={form.published} onChange={(e) => f("published", e.currentTarget.checked)} label="منشور" description="يظهر للزوار" color="brand" />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="media">
            <Stack gap="md">
              <ImageUpload label="الصورة الرئيسية" value={form.coverImage} onChange={(url) => f("coverImage", url)} />
              <Box>
                <Text size="sm" fw={600} mb={8}>معرض الصور</Text>
                <Group gap={8} mb="sm">
                  <TextInput
                    style={{ flex: 1 }} placeholder="رابط صورة" value={galleryUrl}
                    onChange={(e) => setGalleryUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGalleryUrl(); } }}
                  />
                  <Button color="brand" onClick={addGalleryUrl}>إضافة</Button>
                </Group>
                {(form.images || []).length > 0 && (
                  <SimpleGrid cols={4} spacing={8}>
                    {form.images.map((url, i) => (
                      <Box key={`${url}-${i}`} pos="relative">
                        <Image src={url} alt="" h={80} fit="cover" />
                        <ActionIcon
                          pos="absolute" top={4} left={4} size="sm" radius="xl" color="red"
                          onClick={() => f("images", form.images.filter((_, idx) => idx !== i))}
                        >
                          <FaXmark size={11} />
                        </ActionIcon>
                      </Box>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
              <TextInput label="رابط الفيديو (YouTube)" placeholder="https://youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => f("videoUrl", e.target.value)} />
              <TextInput
                label="رابط تضمين الخريطة" description="Google Maps → مشاركة → تضمين → src من iframe"
                placeholder="https://maps.google.com/maps?q=..." value={form.mapEmbedUrl} onChange={(e) => f("mapEmbedUrl", e.target.value)}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </AdminModal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close} onConfirm={handleDelete}
        title="حذف المشروع" message={`هل تريد حذف مشروع "${confirmDelete.data?.name?.ar ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

export default function AdminProjects() {
  return (
    <MantineProvider theme={mantineTheme}>
      <AdminProjectsInner />
    </MantineProvider>
  );
}

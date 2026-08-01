/**
 * AdminUnits — Mantine UI, TanStack Query
 * Preserves: favorites, compare mode, floor plan view, bulk actions, visibility toggle, CSV export
 */
import { useMemo, useState } from "react";
import {
  MantineProvider, Box, Container, Group, Stack, Text, TextInput, Textarea, Select,
  Switch, Button, ActionIcon, Card, SimpleGrid, Table, Checkbox, Chip, Badge,
  Loader, Tabs, Pagination, Divider, NumberInput,
} from "@mantine/core";
import "@mantine/core/styles.css";
import {
  FaHouseChimney, FaPlus, FaPen, FaTrash, FaHeart, FaCodeCompare,
  FaEye, FaEyeSlash, FaDownload, FaTableList, FaLayerGroup,
  FaMagnifyingGlass, FaXmark,
} from "react-icons/fa6";

import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from "../../hooks/queries/useUnits";
import { useProjects } from "../../hooks/queries/useProjects";
import { useTableState } from "../../hooks/useTableState";
import { useDisclosure } from "../../hooks/useDisclosure";

import AdminModal from "../../Components/UI/AdminModal";
import ConfirmDialog from "../../Components/UI/ConfirmDialog";
import PageHeader, { PrimaryButton } from "../../Components/UI/PageHeader";
import StatusBadge from "../../Components/UI/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { mantineTheme } from "../../mantineTheme";
import apiClient from "../../api/axios";

// ── Constants ──────────────────────────────────────────────────────────────
const FAVORITES_KEY = "favorites_units";
const loadFavs = () => { try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); } catch { return []; } };
const saveFavs = (arr) => localStorage.setItem(FAVORITES_KEY, JSON.stringify(arr));

const formatPrice = (p) => {
  if (p == null || p === "") return "—";
  try { return `${Number(p).toLocaleString("ar-EG")} ج.م`; } catch { return `${p} ج.م`; }
};

const UNIT_TYPES = ["apartment", "villa", "studio", "duplex", "penthouse", "office", "shop", "chalet"];
const UNIT_TYPE_AR = { apartment: "شقة", villa: "فيلا", studio: "استوديو", duplex: "دوبلكس", penthouse: "بنتهاوس", office: "مكتب", shop: "محل", chalet: "شاليه" };
const UNIT_STATUSES = ["available", "sold", "reserved"];
const UNIT_STATUS_AR = { available: "متاح", sold: "مباع", reserved: "محجوز" };
const STATUS_DOT = { available: "green", sold: "red", reserved: "yellow" };

const FINISHING_OPTIONS = ["تشطيب سوبر لوكس", "تشطيب لوكس", "تشطيب نصف تشطيب", "بدون تشطيب"];
const FACING_OPTIONS = ["شمال", "جنوب", "شرق", "غرب", "شمال شرق", "شمال غرب", "جنوب شرق", "جنوب غرب"];

const AMENITY_GROUPS = [
  { label: "التكييف والتدفئة", items: ["تكييف مركزي", "تكييف سبليت", "تدفئة مركزية", "تهوية صناعية"] },
  { label: "الخدمات الأساسية", items: ["مصعد", "جنرايتور", "مولد كهربائي", "خزان مياه", "سخان شمسي", "غاز طبيعي", "خطوط تليفون", "تمديدات كهرباء أمريكي"] },
  { label: "الأمن والحماية", items: ["أمن وحراسة 24 ساعة", "كاميرات مراقبة", "إنتركم", "باب أوتوماتيكي", "بواب"] },
  { label: "السيارات", items: ["جراج خاص", "جراج مشترك", "جراج ثنائي", "مواقف خارجية"] },
  { label: "المساحات الخارجية", items: ["حديقة خاصة", "حديقة مشتركة", "تراس/شرفة", "روف خاص", "ملعب أطفال"] },
  { label: "المرافق الترفيهية", items: ["حمام سباحة خاص", "حمام سباحة مشترك", "جيم وصالة رياضة", "نادي اجتماعي", "ملعب تنس/رياضة"] },
  { label: "الغرف الإضافية", items: ["غرفة غسيل", "مخزن", "غرفة سائق", "غرفة خادمة", "مكتب منزلي"] },
  { label: "التقنية", items: ["إنترنت فايبر", "كابل/IPTV", "نظام ذكي (Smart Home)", "طاقة شمسية"] },
  { label: "الإطلالة والموقع", items: ["إطلالة على البحر", "إطلالة على الحديقة", "إطلالة بانورامية", "طابق أرضي مع حديقة", "زاوية/كورنر"] },
];

const emptyUnit = {
  project: "", unitNumber: "", type: "apartment",
  area: "", price: "", floor: "", rooms: 1, bathrooms: 1,
  status: "available", featured: false, published: true,
  description: { ar: "", en: "" }, amenities: [],
  finishing: "", facing: "",
};

// ── Component ──────────────────────────────────────────────────────────────
function AdminUnitsInner() {
  const toast = useToast();

  const [form, setForm] = useState(emptyUnit);
  const [editItem, setEditItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("ar");
  const [activeView, setActiveView] = useState("list");
  const [favorites, setFavorites] = useState(loadFavs);
  const [showFavs, setShowFavs] = useState(false);
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [customAmenity, setCustomAmenity] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const table = useTableState({ defaultPageSize: 20 });
  const confirmDelete = useDisclosure();

  const { data, isLoading, isFetching, refetch } = useUnits({
    page: table.queryParams.page, limit: table.queryParams.pageSize,
    status: statusFilter || undefined, project: projectFilter || undefined,
  });

  const units = data?.units ?? [];
  const total = data?.total ?? 0;

  const { data: projData } = useProjects({ limit: 100 });
  const projects = projData?.projects ?? [];

  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();
  const deleteMutation = useDeleteUnit();

  const stats = useMemo(() => ({
    total,
    available: units.filter((u) => u.status === "available").length,
    sold: units.filter((u) => u.status === "sold").length,
    reserved: units.filter((u) => u.status === "reserved").length,
  }), [units, total]);

  const baseUnits = showFavs ? units.filter((u) => favorites.includes(u._id)) : units;

  const filteredUnits = useMemo(() => {
    let r = baseUnits;
    if (priceMin !== "") r = r.filter((u) => u.price >= Number(priceMin));
    if (priceMax !== "") r = r.filter((u) => u.price <= Number(priceMax));
    if (typeFilter) r = r.filter((u) => u.type === typeFilter);
    if (unitSearch.trim()) {
      const q = unitSearch.toLowerCase();
      r = r.filter((u) => u.unitNumber?.toString().toLowerCase().includes(q) || u.description?.ar?.toLowerCase().includes(q));
    }
    return r;
  }, [baseUnits, priceMin, priceMax, typeFilter, unitSearch]);

  const floorGroups = useMemo(() => {
    const g = {};
    filteredUnits.forEach((u) => {
      const k = u.floor?.trim() || "غير محدد";
      if (!g[k]) g[k] = [];
      g[k].push(u);
    });
    return g;
  }, [filteredUnits]);

  const compareUnits = useMemo(() => units.filter((u) => compareIds.includes(u._id)), [units, compareIds]);

  const f = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const fNested = (key, subKey, val) => setForm((p) => ({ ...p, [key]: { ...p[key], [subKey]: val } }));

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      saveFavs(next); return next;
    });
  };

  const toggleSelected = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const openCreate = () => { setEditItem(null); setForm(emptyUnit); setActiveModalTab("ar"); setModalOpen(true); };

  const openEdit = (u) => {
    setEditItem(u);
    setForm({
      ...emptyUnit, ...u,
      project: u.project?._id || u.project || "",
      unitNumber: u.unitNumber ?? "", area: u.area ?? "", price: u.price ?? "", floor: u.floor ?? "",
      rooms: u.rooms ?? 1, bathrooms: u.bathrooms ?? 1,
      description: { ar: u.description?.ar ?? "", en: u.description?.en ?? "" },
      amenities: Array.isArray(u.amenities) ? u.amenities : [],
    });
    setActiveModalTab("ar");
    setModalOpen(true);
  };

  const buildPayload = () => ({
    ...form,
    area: Number(form.area) || 0, price: Number(form.price) || 0, floor: form.floor || "",
    rooms: Number(form.rooms) || 1, bathrooms: Number(form.bathrooms) || 1,
  });

  const handleSave = async () => {
    if (!form.project) return toast.error("اختر المشروع أولاً");
    try {
      if (editItem) {
        await updateMutation.mutateAsync({ id: editItem._id, data: buildPayload() });
        toast.success("تم تحديث الوحدة");
      } else {
        await createMutation.mutateAsync(buildPayload());
        toast.success("تم إضافة الوحدة");
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "حدث خطأ");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmDelete.data._id);
      toast.success("تم حذف الوحدة");
      confirmDelete.close();
    } catch { toast.error("فشل الحذف"); }
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || !selected.length) return;
    await Promise.all(selected.map((id) => updateMutation.mutateAsync({ id, data: { status: bulkStatus } })));
    toast.success(`تم تحديث ${selected.length} وحدة`);
    setSelected([]); setBulkStatus("");
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await apiClient.patch(`/units/${id}/toggle-visibility`);
      toast.success(res.data.message || "تم تحديث الرؤية");
      refetch();
    } catch { toast.error("فشل تحديث الرؤية"); }
  };

  const handleProjectVisibility = async (isVisible) => {
    if (!projectFilter) return;
    try {
      const res = await apiClient.patch(`/units/project/${projectFilter}/visibility`, { isVisible });
      toast.success(res.data.message || (isVisible ? "تم إظهار جميع الوحدات" : "تم إخفاء جميع الوحدات"));
      refetch();
    } catch { toast.error("فشل التحديث"); }
  };

  const exportCSV = () => {
    const headers = ["رقم الوحدة", "المشروع", "النوع", "الحالة", "المساحة", "السعر", "الدور", "غرف", "حمامات"];
    const rows = filteredUnits.map((u) => [
      u.unitNumber, u.project?.name?.ar || "", UNIT_TYPE_AR[u.type] || u.type,
      UNIT_STATUS_AR[u.status] || u.status, u.area, u.price, u.floor || "", u.rooms, u.bathrooms,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "units.csv" });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const totalPages = Math.max(1, Math.ceil(total / table.queryParams.pageSize));

  return (
    <Box dir="rtl">
      <PageHeader
        title="الوحدات" subtitle={`${total} وحدة`} icon={<FaHouseChimney size={16} />} loading={isFetching && !isLoading}
        stats={[
          { label: "الإجمالي", value: stats.total },
          { label: "متاحة", value: stats.available },
          { label: "محجوزة", value: stats.reserved },
          { label: "مبيعة", value: stats.sold },
        ]}
        actions={<PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة وحدة</PrimaryButton>}
      />

      <Box bg="white" px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap={8} wrap="wrap">
          <TextInput
            w={160} placeholder="رقم الوحدة..." leftSection={<FaMagnifyingGlass size={12} />}
            value={unitSearch} onChange={(e) => setUnitSearch(e.target.value)}
            rightSection={unitSearch ? <ActionIcon variant="transparent" size="xs" onClick={() => setUnitSearch("")}><FaXmark size={11} /></ActionIcon> : null}
          />
          <Select w={160} placeholder="كل المشاريع" clearable
            data={projects.map((p) => ({ value: p._id, label: p.name?.ar }))}
            value={projectFilter} onChange={(v) => { setProjectFilter(v || ""); table.resetPage(); }} />
          <Select w={130} placeholder="كل الحالات" clearable
            data={UNIT_STATUSES.map((s) => ({ value: s, label: UNIT_STATUS_AR[s] }))}
            value={statusFilter} onChange={(v) => { setStatusFilter(v || ""); table.resetPage(); }} />
          <Select w={130} placeholder="كل الأنواع" clearable
            data={UNIT_TYPES.map((t) => ({ value: t, label: UNIT_TYPE_AR[t] }))}
            value={typeFilter} onChange={(v) => setTypeFilter(v || "")} />
          <NumberInput w={100} placeholder="سعر من" value={priceMin} onChange={setPriceMin} hideControls />
          <NumberInput w={100} placeholder="سعر إلى" value={priceMax} onChange={setPriceMax} hideControls />
          <Chip checked={showFavs} onChange={setShowFavs} color="pink" variant="filled" icon={<FaHeart size={11} />}>مفضلة</Chip>
          <Chip checked={compareMode} onChange={(v) => { setCompareMode(v); setCompareIds([]); }} color="yellow" variant="filled" icon={<FaCodeCompare size={11} />}>
            مقارنة{compareMode && compareIds.length ? ` (${compareIds.length})` : ""}
          </Chip>
          {compareMode && compareIds.length >= 2 && (
            <Button size="sm" color="brand" onClick={() => setCompareOpen(true)}>عرض المقارنة</Button>
          )}
          <ActionIcon variant="default" size="lg" disabled={!projectFilter} onClick={() => handleProjectVisibility(false)} title="إخفاء الكل"><FaEyeSlash size={13} /></ActionIcon>
          <ActionIcon variant="default" size="lg" disabled={!projectFilter} onClick={() => handleProjectVisibility(true)} title="إظهار الكل"><FaEye size={13} /></ActionIcon>
          <Group gap={0} ml="auto">
            <ActionIcon variant={activeView === "list" ? "filled" : "default"} color="brand" size="lg" onClick={() => setActiveView("list")}><FaTableList size={13} /></ActionIcon>
            <ActionIcon variant={activeView === "floor" ? "filled" : "default"} color="brand" size="lg" onClick={() => setActiveView("floor")}><FaLayerGroup size={13} /></ActionIcon>
          </Group>
          <ActionIcon variant="default" size="lg" onClick={exportCSV} title="تصدير CSV"><FaDownload size={13} /></ActionIcon>
        </Group>
      </Box>

      <Container size="xl" py="lg">
        <Stack gap="md">
          {selected.length > 0 && (
            <Card withBorder bg="brand.0" py="sm">
              <Group gap="sm" wrap="wrap">
                <Text fw={700} size="sm" c="brand.7">{selected.length} وحدة محددة</Text>
                <Select w={150} placeholder="تغيير الحالة" data={UNIT_STATUSES.map((s) => ({ value: s, label: UNIT_STATUS_AR[s] }))} value={bulkStatus} onChange={(v) => setBulkStatus(v || "")} />
                <Button size="sm" color="brand" disabled={!bulkStatus} onClick={handleBulkStatus}>تطبيق</Button>
                <Button size="sm" variant="subtle" color="gray" onClick={() => setSelected([])}>إلغاء</Button>
              </Group>
            </Card>
          )}

          {isLoading ? (
            <Group justify="center" py={64}><Loader color="gray" /></Group>
          ) : filteredUnits.length === 0 ? (
            <Stack align="center" py={64} gap="sm">
              <FaHouseChimney size={40} color="var(--mantine-color-gray-3)" />
              <Text c="dimmed" size="sm">{showFavs ? "لا توجد مفضلات" : "لا توجد وحدات"}</Text>
              {!showFavs && <PrimaryButton icon={<FaPlus size={13} />} onClick={openCreate}>إضافة وحدة</PrimaryButton>}
            </Stack>
          ) : activeView === "floor" ? (
            <Stack gap="md">
              {Object.entries(floorGroups).sort(([a], [b]) => a.localeCompare(b, "ar")).map(([floor, floorUnits]) => (
                <Card key={floor} withBorder>
                  <Group gap={8} mb="sm">
                    <FaLayerGroup size={14} color="var(--mantine-color-brand-6)" />
                    <Text fw={700} size="sm">الدور: {floor}</Text>
                    <Text size="xs" c="dimmed">({floorUnits.length} وحدة)</Text>
                  </Group>
                  <Group gap={8}>
                    {floorUnits.map((u) => (
                      <Button
                        key={u._id} variant="light" color={STATUS_DOT[u.status] || "gray"} size="xs"
                        w={64} h={44} title={`${u.unitNumber} — ${formatPrice(u.price)}`} onClick={() => openEdit(u)}
                      >
                        {u.unitNumber}
                      </Button>
                    ))}
                  </Group>
                  <Group gap="md" mt="sm">
                    <Badge variant="dot" color="green" size="sm">متاح: {floorUnits.filter((u) => u.status === "available").length}</Badge>
                    <Badge variant="dot" color="yellow" size="sm">محجوز: {floorUnits.filter((u) => u.status === "reserved").length}</Badge>
                    <Badge variant="dot" color="red" size="sm">مباع: {floorUnits.filter((u) => u.status === "sold").length}</Badge>
                  </Group>
                </Card>
              ))}
            </Stack>
          ) : (
            <Card withBorder padding={0} style={{ overflow: "auto" }}>
              <Table verticalSpacing="sm" horizontalSpacing="sm">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th w={36}>
                      <Checkbox
                        checked={filteredUnits.length > 0 && selected.length === filteredUnits.length}
                        onChange={(e) => setSelected(e.currentTarget.checked ? filteredUnits.map((u) => u._id) : [])}
                      />
                    </Table.Th>
                    {compareMode && <Table.Th w={30}></Table.Th>}
                    <Table.Th>الوحدة</Table.Th>
                    <Table.Th>المشروع</Table.Th>
                    <Table.Th visibleFrom="sm">النوع</Table.Th>
                    <Table.Th visibleFrom="md">المساحة</Table.Th>
                    <Table.Th>السعر</Table.Th>
                    <Table.Th visibleFrom="lg">الدور</Table.Th>
                    <Table.Th>الحالة</Table.Th>
                    <Table.Th visibleFrom="sm">الرؤية</Table.Th>
                    <Table.Th w={80}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredUnits.map((u) => {
                    const fav = favorites.includes(u._id);
                    const inCompare = compareIds.includes(u._id);
                    return (
                      <Table.Tr key={u._id} bg={inCompare ? "yellow.0" : undefined}>
                        <Table.Td>
                          <Stack align="center" gap={4}>
                            <Checkbox checked={selected.includes(u._id)} onChange={() => toggleSelected(u._id)} size="xs" />
                            <ActionIcon variant="transparent" size="xs" onClick={() => toggleFav(u._id)}>
                              <FaHeart size={11} color={fav ? "var(--mantine-color-pink-5)" : "var(--mantine-color-gray-4)"} />
                            </ActionIcon>
                          </Stack>
                        </Table.Td>
                        {compareMode && (
                          <Table.Td>
                            <ActionIcon
                              variant={inCompare ? "filled" : "default"} color="yellow" size="sm" onClick={() => toggleCompare(u._id)}
                            >
                              {inCompare ? <Text fz={10} fw={700}>{compareIds.indexOf(u._id) + 1}</Text> : <FaCodeCompare size={11} />}
                            </ActionIcon>
                          </Table.Td>
                        )}
                        <Table.Td>
                          <Text fw={600} size="sm">{u.unitNumber}</Text>
                          <Text size="xs" c="dimmed">{UNIT_TYPE_AR[u.type] || u.type}</Text>
                        </Table.Td>
                        <Table.Td><Text size="sm">{u.project?.name?.ar || "—"}</Text></Table.Td>
                        <Table.Td visibleFrom="sm"><Text size="sm" c="dimmed">{UNIT_TYPE_AR[u.type] || u.type}</Text></Table.Td>
                        <Table.Td visibleFrom="md"><Text size="sm" c="dimmed">{u.area ? `${u.area} م²` : "—"}</Text></Table.Td>
                        <Table.Td><Text size="sm" fw={600}>{formatPrice(u.price)}</Text></Table.Td>
                        <Table.Td visibleFrom="lg"><Text size="sm" c="dimmed">{u.floor || "—"}</Text></Table.Td>
                        <Table.Td><StatusBadge status={u.status} label={UNIT_STATUS_AR[u.status]} /></Table.Td>
                        <Table.Td visibleFrom="sm">
                          <ActionIcon variant="subtle" color={u.isVisible !== false ? "teal" : "gray"} onClick={() => handleToggleVisibility(u._id)}>
                            {u.isVisible !== false ? <FaEye size={13} /> : <FaEyeSlash size={13} />}
                          </ActionIcon>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={2}>
                            <ActionIcon variant="subtle" color="blue" onClick={() => openEdit(u)}><FaPen size={12} /></ActionIcon>
                            <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete.open(u)}><FaTrash size={12} /></ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Card>
          )}

          {total > table.queryParams.pageSize && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">عرض {filteredUnits.length} من {total}</Text>
              <Pagination total={totalPages} value={table.queryParams.page} onChange={table.handlePageChange} size="sm" />
            </Group>
          )}
        </Stack>
      </Container>

      <AdminModal isOpen={compareOpen} onClose={() => setCompareOpen(false)} title="مقارنة الوحدات" size="3xl">
        <SimpleGrid cols={compareUnits.length === 2 ? 2 : 3} spacing="md">
          {compareUnits.map((u) => (
            <Card key={u._id} withBorder>
              <Text fw={700} ta="center" size="lg">{u.unitNumber}</Text>
              <Text ta="center" size="xs" c="dimmed" mb="sm">{u.project?.name?.ar || "—"}</Text>
              <Divider mb="sm" />
              <Stack gap={6}>
                {[
                  ["النوع", UNIT_TYPE_AR[u.type] || u.type],
                  ["الحالة", UNIT_STATUS_AR[u.status]],
                  ["المساحة", u.area ? `${u.area} م²` : "—"],
                  ["السعر", formatPrice(u.price)],
                  ["الدور", u.floor || "—"],
                  ["الغرف", u.rooms],
                  ["الحمامات", u.bathrooms],
                  ["التشطيب", u.finishing || "—"],
                  ["الاتجاه", u.facing || "—"],
                ].map(([label, val]) => (
                  <Group key={label} justify="space-between">
                    <Text size="sm" c="dimmed">{label}</Text>
                    <Text size="sm" fw={600}>{val}</Text>
                  </Group>
                ))}
              </Stack>
              {(u.amenities || []).length > 0 && (
                <Box mt="sm">
                  <Text size="xs" c="dimmed" mb={4}>المرافق</Text>
                  <Group gap={4}>
                    {u.amenities.map((a) => <Badge key={a} variant="light" color="gray" size="sm">{a}</Badge>)}
                  </Group>
                </Box>
              )}
            </Card>
          ))}
        </SimpleGrid>
      </AdminModal>

      <AdminModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editItem ? "تعديل الوحدة" : "إضافة وحدة جديدة"}
        icon={<FaHouseChimney size={14} />} size="2xl"
        footer={
          <>
            <Button variant="default" onClick={() => setModalOpen(false)}>إلغاء</Button>
            <Button color="brand" loading={isPending} onClick={handleSave}>{editItem ? "حفظ التغييرات" : "إضافة الوحدة"}</Button>
          </>
        }
      >
        <Tabs value={activeModalTab} onChange={setActiveModalTab} color="brand">
          <Tabs.List mb="md">
            <Tabs.Tab value="ar">عربي</Tabs.Tab>
            <Tabs.Tab value="en">English</Tabs.Tab>
            <Tabs.Tab value="specs">مواصفات</Tabs.Tab>
            <Tabs.Tab value="amenities">مرافق</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ar">
            <Stack gap="md">
              <Select
                label="المشروع" required placeholder="اختر المشروع"
                data={projects.map((p) => ({ value: p._id, label: p.name?.ar }))}
                value={form.project} onChange={(v) => f("project", v || "")}
              />
              <SimpleGrid cols={2}>
                <TextInput label="رقم الوحدة" required value={form.unitNumber} onChange={(e) => f("unitNumber", e.target.value)} />
                <TextInput label="الدور" placeholder="مثال: أرضي، الدور الأول" value={form.floor} onChange={(e) => f("floor", e.target.value)} />
              </SimpleGrid>
              <Textarea label="الوصف (عربي)" rows={3} value={form.description?.ar} onChange={(e) => fNested("description", "ar", e.target.value)} />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="en">
            <Textarea label="Description (English)" rows={3} value={form.description?.en} onChange={(e) => fNested("description", "en", e.target.value)} />
          </Tabs.Panel>

          <Tabs.Panel value="specs">
            <Stack gap="md">
              <SimpleGrid cols={2}>
                <Select label="النوع" data={UNIT_TYPES.map((t) => ({ value: t, label: UNIT_TYPE_AR[t] }))} value={form.type} onChange={(v) => f("type", v || "apartment")} />
                <Select label="الحالة" data={UNIT_STATUSES.map((s) => ({ value: s, label: UNIT_STATUS_AR[s] }))} value={form.status} onChange={(v) => f("status", v || "available")} />
                <TextInput type="number" label="المساحة (م²)" value={form.area} onChange={(e) => f("area", e.target.value)} />
                <TextInput type="number" label="السعر (ج.م)" value={form.price} onChange={(e) => f("price", e.target.value)} />
                <TextInput type="number" label="غرف النوم" min={0} value={form.rooms} onChange={(e) => f("rooms", e.target.value)} />
                <TextInput type="number" label="الحمامات" min={0} value={form.bathrooms} onChange={(e) => f("bathrooms", e.target.value)} />
                <Select label="التشطيب" placeholder="اختر التشطيب" clearable data={FINISHING_OPTIONS} value={form.finishing} onChange={(v) => f("finishing", v || "")} />
                <Select label="الاتجاه" placeholder="اختر الاتجاه" clearable data={FACING_OPTIONS} value={form.facing} onChange={(v) => f("facing", v || "")} />
              </SimpleGrid>
              <Group gap="xl">
                <Switch checked={form.featured} onChange={(e) => f("featured", e.currentTarget.checked)} label="وحدة مميزة" color="brand" />
                <Switch checked={form.published} onChange={(e) => f("published", e.currentTarget.checked)} label="منشورة" color="brand" />
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="amenities">
            <Stack gap="md">
              {AMENITY_GROUPS.map((g) => (
                <Box key={g.label}>
                  <Text size="xs" fw={700} c="dimmed" mb={6}>{g.label}</Text>
                  <Group gap={6}>
                    {g.items.map((a) => {
                      const active = (form.amenities || []).includes(a);
                      return (
                        <Chip key={a} checked={active} variant="filled" color="brand"
                          onChange={() => f("amenities", active ? form.amenities.filter((x) => x !== a) : [...(form.amenities || []), a])}>
                          {a}
                        </Chip>
                      );
                    })}
                  </Group>
                </Box>
              ))}
              <Group gap={8}>
                <TextInput
                  style={{ flex: 1 }} placeholder="إضافة ميزة مخصصة..." value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (customAmenity.trim() && !(form.amenities || []).includes(customAmenity.trim())) {
                        f("amenities", [...(form.amenities || []), customAmenity.trim()]);
                        setCustomAmenity("");
                      }
                    }
                  }}
                />
                <Button color="brand" onClick={() => { if (customAmenity.trim()) { f("amenities", [...(form.amenities || []), customAmenity.trim()]); setCustomAmenity(""); } }}>+</Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </AdminModal>

      <ConfirmDialog
        isOpen={confirmDelete.isOpen} onClose={confirmDelete.close} onConfirm={handleDelete}
        title="حذف الوحدة" message={`هل تريد حذف الوحدة "${confirmDelete.data?.unitNumber ?? ""}"؟`}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

export default function AdminUnits() {
  return (
    <MantineProvider theme={mantineTheme}>
      <AdminUnitsInner />
    </MantineProvider>
  );
}

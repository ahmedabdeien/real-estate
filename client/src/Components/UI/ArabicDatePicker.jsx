import { useState, useEffect } from "react";
import { MantineProvider, Popover, UnstyledButton, Group, Text, ActionIcon, Box, Stack, SimpleGrid } from "@mantine/core";
import "@mantine/core/styles.css";
import { FaChevronRight, FaChevronLeft, FaCalendar, FaXmark } from "react-icons/fa6";
import { mantineTheme } from "../../mantineTheme";

const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const DAYS_AR = ["أح", "إث", "ث", "أر", "خ", "ج", "س"];

function formatAr(dateStr) {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }); } catch { return dateStr; }
}

function ArabicDatePickerInner({ value, onChange, placeholder = "اختر تاريخاً", label, disabled }) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  const parsed = value ? new Date(value) : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d)) { setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
    }
  }, [value]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); } else setViewMonth((m) => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); } else setViewMonth((m) => m + 1); };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectDay = (d) => {
    const month = String(viewMonth + 1).padStart(2, "0");
    const day = String(d).padStart(2, "0");
    onChange(`${viewYear}-${month}-${day}`);
    setOpen(false);
  };

  const isSelected = (d) => {
    if (!value || !d) return false;
    const p = new Date(value);
    return p.getFullYear() === viewYear && p.getMonth() === viewMonth && p.getDate() === d;
  };
  const isToday = (d) => d && today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  return (
    <Box dir="rtl">
      {label && <Text size="sm" fw={500} mb={4}>{label}</Text>}
      <Popover opened={open} onChange={setOpen} position="bottom-start" shadow="md" width={260} withinPortal>
        <Popover.Target>
          <UnstyledButton
            disabled={disabled}
            onClick={() => !disabled && setOpen((o) => !o)}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", border: "1px solid var(--mantine-color-gray-4)",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            <FaCalendar size={14} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c={value ? undefined : "dimmed"} style={{ flex: 1, textAlign: "right" }}>
              {value ? formatAr(value) : placeholder}
            </Text>
            {value && (
              <ActionIcon variant="transparent" size="xs" onClick={(e) => { e.stopPropagation(); onChange(""); }}>
                <FaXmark size={12} />
              </ActionIcon>
            )}
          </UnstyledButton>
        </Popover.Target>
        <Popover.Dropdown p="sm">
          <Group justify="space-between" mb="sm">
            <ActionIcon variant="subtle" color="gray" onClick={nextMonth}><FaChevronRight size={13} /></ActionIcon>
            <Text fw={700} size="sm">{MONTHS_AR[viewMonth]} {viewYear.toLocaleString("ar-EG", { useGrouping: false })}</Text>
            <ActionIcon variant="subtle" color="gray" onClick={prevMonth}><FaChevronLeft size={13} /></ActionIcon>
          </Group>

          <SimpleGrid cols={7} spacing={2} mb={4}>
            {DAYS_AR.map((d) => <Text key={d} size="xs" c="dimmed" ta="center">{d}</Text>)}
          </SimpleGrid>

          <SimpleGrid cols={7} spacing={2}>
            {cells.map((d, i) => (
              <Box key={i} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {d ? (
                  <UnstyledButton
                    onClick={() => selectDay(d)}
                    bg={isSelected(d) ? "brand.6" : isToday(d) ? "brand.0" : undefined}
                    c={isSelected(d) ? "white" : isToday(d) ? "brand.6" : undefined}
                    fw={isSelected(d) || isToday(d) ? 700 : 400}
                    style={{ width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}
                  >
                    {d.toLocaleString("ar-EG")}
                  </UnstyledButton>
                ) : null}
              </Box>
            ))}
          </SimpleGrid>

          <Stack mt="xs" pt="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            <UnstyledButton
              onClick={() => { const t = today; onChange(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`); setOpen(false); }}
              style={{ textAlign: "center" }}
            >
              <Text size="xs" fw={600} c="brand.6">اليوم</Text>
            </UnstyledButton>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
}

export default function ArabicDatePicker(props) {
  return (
    <MantineProvider theme={mantineTheme}>
      <ArabicDatePickerInner {...props} />
    </MantineProvider>
  );
}

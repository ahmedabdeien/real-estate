import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Box, Container, TextInput, SimpleGrid, Card, Image, Group, Text, Title,
  Anchor, Skeleton, Pagination as MantinePagination, Stack,
} from "@mantine/core";
import { FaMagnifyingGlass, FaCalendar, FaEye, FaFileLines } from "react-icons/fa6";

import api from "../../api/axios";
import { useCms } from "../../hooks/useCms";
import PageHero from "../../Components/shared/PageHero";

export default function BlogPage() {
  const { data: cms } = useCms("blog_page", {
    title_ar: "الأخبار والمقالات",
    subtitle_ar: "آخر أخبار السوق العقاري والمقالات المتخصصة",
    hero_image: "",
  });
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const timerRef = useRef(null);

  const load = async (s = search, p = page) => {
    setLoading(true);
    try {
      const res = await api.get("/blogs", { params: { page: p, search: s, status: "published" } });
      setBlogs(res.data.blogs || []);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { document.title = "المقالات | الصرح للتطوير العقاري"; }, []);
  useEffect(() => { load(search, page); }, [page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { setPage(1); load(val, 1); }, 400);
  };

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      <PageHero title={cms.title_ar} subtitle={cms.subtitle_ar} image={cms.hero_image} />

      <Container size="xl" py="xl">
        <TextInput
          value={search} onChange={handleSearchChange}
          onKeyDown={(e) => { if (e.key === "Enter") { clearTimeout(timerRef.current); setPage(1); load(search, 1); } }}
          placeholder="ابحث عن مقال..." leftSection={<FaMagnifyingGlass size={14} />}
          radius="md" w={280} mb="xl"
        />

        {loading ? (
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} padding={0} radius="lg" withBorder>
                <Skeleton height={192} radius={0} />
                <Stack gap={8} p="lg">
                  <Skeleton height={12} width="40%" />
                  <Skeleton height={20} width="80%" />
                  <Skeleton height={40} />
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        ) : blogs.length === 0 ? (
          <Stack align="center" py={80} gap="xs">
            <FaFileLines size={40} color="var(--mantine-color-gray-4)" />
            <Text fw={600} c="dark.6">لا توجد مقالات</Text>
            <Text size="sm" c="dimmed">لا توجد مقالات منشورة حالياً</Text>
          </Stack>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
              {blogs.map((b) => (
                <Card key={b._id} component="article" className="public-card" padding={0} radius="lg">
                  <Box h={192} bg="gray.1">
                    {b.coverImage ? (
                      <Image src={b.coverImage} alt={b.title?.ar} h={192} fit="cover" />
                    ) : (
                      <Box h={192} display="flex" style={{ alignItems: "center", justifyContent: "center", background: "var(--mantine-color-brand-6)" }}>
                        <FaFileLines size={44} color="rgba(255,255,255,0.3)" />
                      </Box>
                    )}
                  </Box>
                  <Stack gap={8} p="lg">
                    <Group gap="md" c="dimmed">
                      <Group gap={4}><FaCalendar size={11} /><Text size="xs">{new Date(b.createdAt).toLocaleDateString("ar-EG")}</Text></Group>
                      <Group gap={4}><FaEye size={11} /><Text size="xs">{b.views}</Text></Group>
                    </Group>
                    <Title order={3} size="lg" c="dark.8" lineClamp={2}>{b.title?.ar}</Title>
                    {b.excerpt?.ar && <Text size="sm" c="dimmed" lineClamp={2}>{b.excerpt.ar}</Text>}
                    <Anchor component={Link} to={`/blog/${b.slug}`} c="brand.6" fw={600} size="sm" underline="never">
                      اقرأ المزيد ←
                    </Anchor>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
            {pages > 1 && (
              <Group justify="center" mt="xl">
                <MantinePagination value={page} onChange={setPage} total={pages} color="brand" radius="md" />
              </Group>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

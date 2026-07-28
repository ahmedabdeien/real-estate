import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Container, Card, Group, Text, Title, Anchor, Image, Loader, Stack } from "@mantine/core";
import { FaArrowRight, FaCalendar, FaEye } from "react-icons/fa6";

import api from "../../api/axios";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then((r) => setBlog(r.data.blog)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Group justify="center" py={120}><Loader color="brand" size="lg" /></Group>;
  if (!blog) {
    return (
      <Stack align="center" justify="center" mih="60vh" dir="rtl">
        <Text c="dimmed">المقال غير موجود</Text>
        <Anchor component={Link} to="/blog" c="brand.6" fw={600}>← العودة للمقالات</Anchor>
      </Stack>
    );
  }

  return (
    <Box mih="100vh" bg="gray.0" dir="rtl">
      {blog.coverImage && (
        <Box h={{ base: 288, md: 384 }} w="100%" style={{ overflow: "hidden" }}>
          <Image src={blog.coverImage} alt={blog.title?.ar} h="100%" fit="cover" />
        </Box>
      )}

      <Container size={720} py="xl">
        <Anchor component={Link} to="/blog" c="brand.6" fw={600} size="sm" mb="lg" display="inline-flex" style={{ alignItems: "center", gap: 8 }}>
          <FaArrowRight size={13} /> العودة للمقالات
        </Anchor>

        <Card className="public-card" radius="lg" p="xl">
          <Group gap="lg" c="dimmed" mb="md">
            <Group gap={4}>
              <FaCalendar size={12} />
              <Text size="xs">{new Date(blog.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}</Text>
            </Group>
            <Group gap={4}><FaEye size={12} /><Text size="xs">{blog.views} مشاهدة</Text></Group>
            {blog.author?.name && <Text size="xs">بقلم: {blog.author.name}</Text>}
          </Group>

          <Title order={1} fz={{ base: 26, md: 32 }} mb="lg">{blog.title?.ar}</Title>

          {blog.excerpt?.ar && (
            <Text size="lg" fw={500} c="dimmed" mb="lg" pr="md" style={{ borderRight: "4px solid var(--mantine-color-brand-6)" }}>
              {blog.excerpt.ar}
            </Text>
          )}

          <Text c="dark.6" lh={1.9} style={{ whiteSpace: "pre-wrap" }}>{blog.content?.ar}</Text>
        </Card>
      </Container>
    </Box>
  );
}

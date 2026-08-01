import { MantineProvider, Pagination as MantinePagination, Center } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <MantineProvider theme={mantineTheme}>
      <Center mt="lg">
        <MantinePagination total={pages} value={page} onChange={onPage} color="brand" />
      </Center>
    </MantineProvider>
  );
}

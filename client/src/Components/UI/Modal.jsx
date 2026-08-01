import { MantineProvider, Modal as MantineModal } from "@mantine/core";
import "@mantine/core/styles.css";
import { mantineTheme } from "../../mantineTheme";

const SIZES = { sm: "sm", md: "lg", lg: "xl", xl: "1200px" };

export default function Modal({ open, onClose, title, children, size = "md" }) {
  return (
    <MantineProvider theme={mantineTheme}>
      <MantineModal opened={open} onClose={onClose} title={title} size={SIZES[size] || "lg"} dir="rtl">
        {children}
      </MantineModal>
    </MantineProvider>
  );
}

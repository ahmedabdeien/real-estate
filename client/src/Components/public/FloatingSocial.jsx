import { useState } from "react";
import { Affix, Stack, ActionIcon, Tooltip, Transition } from "@mantine/core";
import { FaPhone, FaInstagram, FaFacebook, FaWhatsapp, FaShareNodes, FaXmark } from "react-icons/fa6";
import { useCms } from "../../hooks/useCms";

const ICONS = {
  whatsapp:  { color: "green",  icon: <FaWhatsapp size={20} />,  label: "واتساب" },
  phone:     { color: "blue",   icon: <FaPhone size={19} />,     label: "اتصال" },
  instagram: { color: "grape",  icon: <FaInstagram size={20} />, label: "انستجرام" },
  facebook:  { color: "indigo", icon: <FaFacebook size={20} />,  label: "فيسبوك" },
};

export default function FloatingSocial() {
  const [open, setOpen] = useState(false);

  const { data: contactData } = useCms("contact", { whatsapp_number: "", phone: "", instagram: "", facebook: "" });

  const waNumber = (contactData.whatsapp_number || contactData.phone || "201000000000").replace(/\D/g, "");
  const phone = contactData.phone || "";
  const instagram = contactData.instagram || "https://www.instagram.com/elsarh.eg";
  const facebook = contactData.facebook || "https://www.facebook.com/elsarh.eg";

  const buttons = [
    { key: "whatsapp", href: `https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن الوحدات المتاحة")}` },
    { key: "phone", href: phone ? `tel:${phone}` : null },
    { key: "instagram", href: instagram },
    { key: "facebook", href: facebook },
  ].filter((b) => b.href);

  return (
    <Affix position={{ bottom: 24, left: 20 }}>
      <Stack align="center" gap="sm">
        {buttons.map((btn) => {
          const cfg = ICONS[btn.key];
          return (
            <Transition key={btn.key} mounted={open} transition="slide-up" duration={150}>
              {(styles) => (
                <Tooltip label={cfg.label} position="right">
                  <ActionIcon
                    component="a" href={btn.href} target={btn.key !== "phone" ? "_blank" : undefined} rel="noopener noreferrer"
                    size={48} radius="xl" color={cfg.color} variant="filled" style={{ ...styles, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
                  >
                    {cfg.icon}
                  </ActionIcon>
                </Tooltip>
              )}
            </Transition>
          );
        })}

        <ActionIcon
          size={56} radius="xl" color="brand" variant="filled"
          onClick={() => setOpen((v) => !v)}
          style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.2)", transition: "transform 150ms ease" }}
          title={open ? "إغلاق" : "تواصل معنا"}
        >
          {open ? <FaXmark size={22} /> : <FaShareNodes size={22} />}
        </ActionIcon>
      </Stack>
    </Affix>
  );
}

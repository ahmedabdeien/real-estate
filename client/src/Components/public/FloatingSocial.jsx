import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Phone, Instagram, Facebook, X, Share2 } from "lucide-react";
import { useCms } from "../../hooks/useCms";

const ICONS = {
  whatsapp: { bg: "bg-green-500 hover:bg-green-600", icon: <MessageCircle className="w-5 h-5" />, label: "واتساب" },
  phone:    { bg: "bg-blue-500 hover:bg-blue-600",   icon: <Phone className="w-5 h-5" />,          label: "اتصال" },
  instagram:{ bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90", icon: <Instagram className="w-5 h-5" />, label: "انستجرام" },
  facebook: { bg: "bg-[#1877F2] hover:bg-blue-700",  icon: <Facebook className="w-5 h-5" />,        label: "فيسبوك" },
};

export default function FloatingSocial() {
  const [open, setOpen] = useState(false);

  const { data: contactData } = useCms("contact", {
    whatsapp_number: "", phone: "", instagram: "", facebook: ""
  });

  const waNumber = (contactData.whatsapp_number || contactData.phone || "201000000000").replace(/\D/g, "");
  const phone    = contactData.phone || "";
  const instagram = contactData.instagram || "https://www.instagram.com/elsarh.eg";
  const facebook  = contactData.facebook  || "https://www.facebook.com/elsarh.eg";

  const buttons = [
    {
      key: "whatsapp",
      href: `https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن الوحدات المتاحة")}`,
    },
    { key: "phone",     href: phone ? `tel:${phone}` : null },
    { key: "instagram", href: instagram },
    { key: "facebook",  href: facebook },
  ].filter((b) => b.href);

  return (
    <div className="fixed bottom-6 left-4 sm:left-6 z-50 flex flex-col items-center gap-3" dir="ltr">
      {/* Social buttons */}
      <AnimatePresence>
        {open &&
          buttons.map((btn, i) => {
            const cfg = ICONS[btn.key];
            return (
              <motion.a
                key={btn.key}
                href={btn.href}
                target={btn.key !== "phone" ? "_blank" : undefined}
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                transition={{ delay: i * 0.05 }}
                title={cfg.label}
                className={`w-11 h-11 sm:w-12 sm:h-12 ${cfg.bg} text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 relative group`}
              >
                {cfg.icon}
                {/* Tooltip */}
                <span className="absolute left-14 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {cfg.label}
                </span>
              </motion.a>
            );
          })}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-[#2d5d89] hover:bg-[#1e3f5e] text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 relative"
        title={open ? "إغلاق" : "تواصل معنا"}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {open ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
        </motion.div>

        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping bg-[#2d5d89] opacity-30 pointer-events-none" />
        )}
      </motion.button>
    </div>
  );
}

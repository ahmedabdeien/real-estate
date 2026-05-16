import { Outlet } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";
import SiteMeta from "../Components/SiteMeta";
import { useCms } from "../hooks/useCms";

export default function PublicLayout() {
  const { data: contactData } = useCms("contact", { whatsapp: "", whatsapp_number: "", phone: "" });
  const rawNumber = contactData.whatsapp_number || contactData.whatsapp || contactData.phone || "";
  const waNumber = rawNumber.replace(/\D/g, "") || "201000000000";

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <SiteMeta />
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent("مرحباً، أريد الاستفسار عن الوحدات المتاحة")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        title="تواصل عبر واتساب"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}

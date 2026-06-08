import { Outlet } from "react-router-dom";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";
import SiteMeta from "../Components/SiteMeta";
import FloatingSocial from "../Components/public/FloatingSocial";
import PopupAnnouncement from "../Components/public/PopupAnnouncement";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <SiteMeta />
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <FloatingSocial />
      <PopupAnnouncement />
    </div>
  );
}

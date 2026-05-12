import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import SiteMeta from "../components/SiteMeta";

export default function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <SiteMeta />
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

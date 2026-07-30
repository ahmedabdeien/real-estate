import { Outlet } from "react-router-dom";
import { MantineProvider, AppShell } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "../styles/public.css";
import { mantineTheme } from "../mantineTheme";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";
import SiteMeta from "../Components/SiteMeta";
import FloatingSocial from "../Components/public/FloatingSocial";
import PopupAnnouncement from "../Components/public/PopupAnnouncement";

export default function PublicLayout() {
  return (
    <MantineProvider theme={mantineTheme}>
      <Notifications position="top-center" dir="rtl" />
      <AppShell header={{ height: 64 }} padding={0} dir="rtl">
        <AppShell.Header>
          <SiteMeta />
          <Header />
        </AppShell.Header>
        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      <Footer />
      <FloatingSocial />
      <PopupAnnouncement />
    </MantineProvider>
  );
}

// Home.jsx
import { motion, AnimatePresence } from 'framer-motion';
import SectionShowProjects from "../CreatePage/SectionShowProjects";
import SectionCarousel from "./SectionCarousel";
import AboutHome from './AboutHome';
import CounterUp from "./CounterUp";
import ServiceHome from "./ServiceHome";
import Reviews from "./Reviews";
import { Helmet } from "react-helmet";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

function Home() {
  return (
    <div className="bg-white overflow-hidden">
      <Helmet>
        <title>الصرح للاستثمار العقاري - الرئيسية</title>
        <meta
          name="description"
          content="اكتشف مشاريع الصرح العقارية الفريدة واستثمر في مستقبل ناجح مع نخبة من التصاميم المعمارية المتميزة."
        />
      </Helmet>

      <SectionCarousel />

      <AboutHome />

      <CounterUp />

      <SectionShowProjects />

      <ServiceHome />

      <Reviews />
    </div>
  );
}

export default Home;
import { motion } from 'framer-motion';
import SectionShowProjects from "../CreatePage/SectionShowProjects";
import SectionCarousel from "./SectionCarousel";
import AboutHome from './AboutHome';
import CounterUp from "./CounterUp";
import ServiceHome from "./ServiceHome";
import Reviews from "./Reviews";
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';

function Home() {
  const { config } = useSelector((state) => state.config);

  const siteName = config?.siteName || 'الصرح للاستثمار العقاري';
  const description = config?.seo?.description || config?.hero?.subtitle?.ar || 'شركة رائدة في الاستثمار العقاري';

  return (
    <div style={{ background: '#faf8f4' }} className="transition-colors duration-500 overflow-hidden">
      <Helmet>
        <title>{siteName} - الرئيسية</title>
        <meta
          name="description"
          content={description}
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
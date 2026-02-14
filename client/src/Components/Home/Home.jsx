import { motion, AnimatePresence } from 'framer-motion';
import SectionShowProjects from "../CreatePage/SectionShowProjects";
import SectionCarousel from "./SectionCarousel";
import AboutHome from './AboutHome';
import CounterUp from "./CounterUp";
import ServiceHome from "./ServiceHome";
import Reviews from "./Reviews";
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

function Home() {
  const { config } = useSelector((state) => state.config);
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const siteName = config?.siteName || 'El Sarh Real Estate';
  const description = config?.hero?.subtitle?.[currentLang] || config?.hero?.subtitle?.['en'] || 'Leading Real Estate Investment Company';

  return (
    <div className="bg-[var(--background)] transition-colors duration-500 overflow-hidden">
      <Helmet>
        <title>{siteName} - {currentLang === 'ar' ? 'الرئيسية' : 'Home'}</title>
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
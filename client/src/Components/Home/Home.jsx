import SectionShowProjects from "../CreatePage/SectionShowProjects"
import SectionCarousel from "./SectionCarousel"
import AboutHome from './AboutHome';
import CounterUp from "./CounterUp";
import ServiceHome from "./ServiceHome";
import Reviews from "./Reviews";
import {Helmet} from "react-helmet";


function Home() {
  return (
    <>
      <Helmet>
        <title>Home Page</title>
        <meta name="description" content="Home Page Description" />
        <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
      </Helmet>
      <SectionCarousel/>
      
     
        <AboutHome />
    
       
        <CounterUp/>
      
      
        <SectionShowProjects/>
        <ServiceHome/>
      <Reviews/>
    </>
  )
}

export default Home
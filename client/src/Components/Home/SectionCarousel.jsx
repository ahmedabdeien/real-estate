import { Carousel } from "flowbite-react";
import { PhotoProvider } from "react-photo-view";
import photosOne from "../../assets/images/realestateimages.jpg";
import photosthree from "../../assets/images/image_fx2.jpeg";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SectionCarousel() {
  const sections = [photosOne, photosthree];
  const datatext = [
    "نحن نقدم أعلى معايير الجودة في البناء والتصميم، لضمان لك الراحة والفخامة على المدى الطويل.",
    "اختيار شركة الصرح للاستثمار العقاري يعني الحصول على الشريك المثالي الذي يضمن لك النجاح في كافة جوانب استثماراتك العقارية.",
  ];

  const [showNavbarCarousel, setShowNavbarCarousel] = useState(false);

  // Function to handle scroll events
  const handleScroll = () => {
    if (window.scrollY > 20) {
      setShowNavbarCarousel(true);
    } else {
      setShowNavbarCarousel(false);
    }
  };

  // Scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`${
        showNavbarCarousel ? "scale-100 " : "scale-95"
      } bg-white transition-all duration-300`}
    >
      <div
        className={`${
          showNavbarCarousel ? "rounded-none" : "rounded-2xl"
        }  overflow-hidden transition-all`}
      >
        <PhotoProvider>
          <Carousel
            
            leftControl={
              <div className="w-10 flex justify-center items-center hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all">
                <BsArrowLeft className="text-5xl" />
              </div>
            }
            rightControl={
              <div className="w-10 flex justify-center items-center hover:text-[#ff9505] h-10 overflow-hidden text-white hover:scale-110 transition-all">
                <BsArrowRight className="text-5xl" />
              </div>
            }
          >
            {sections.map((image, index) => (
              <div key={index} className="relative bg-slate-500">
                <img
                  src={image}
                  alt={`Real estate image ${index + 1}`}
                  className="w-full md:h-[30rem] h-72"
                />
                <div className="absolute top-0 right-0-0 w-full h-full flex flex-col justify-center items-end pe-6 md:pe-16">
                  <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 text-black  hidden md:block md:w-96 lg:w-1/3 rounded-2xl">
                    <p className="text-sm lg:text-base text-end">{datatext[index]}</p>
                    <div className="mt-4 flex justify-end "> 
                    <Link to='/Projects/sarayat-abdeen-compound'><button className='bg-[#004483] font-medium transition-all text-white py-2 px-4 rounded-lg hover:bg-white hover:outline hover:text-[#004483]'>عرض المزيد</button></Link>
                    </div>
                    <div className="mt-2">
                      <h1 className="text-xs text-center font-bold text-[#ff9505]  py-1 rounded">
                       قسم {index + 1}/2 
                      </h1>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </PhotoProvider>
      </div>
    </div>
  );
}

export default SectionCarousel;

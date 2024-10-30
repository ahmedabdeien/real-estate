import { Carousel } from "flowbite-react";
import { PhotoProvider } from "react-photo-view";
import photosOne from "../../assets/images/realestateimages.jpg";
import photostwo from "../../assets/images/image_fx.jpg";
import photosthree from "../../assets/images/image_fx2.jpeg";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useEffect, useState } from "react";

function SectionCarousel() {
  const sections = [photosOne, photostwo, photosthree];
  const datatext = [
    "Choosing Elsarh Investment Real Estate means getting the ideal partner who ensures success in all aspects of your real estate investments.",
    "We offer properties in prime locations that ensure value appreciation over time.",
    "We provide the highest standards of quality in construction and design, ensuring you long-lasting comfort and luxury.",
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
      } bg-white transition-all duration-300 `}
    >
      <div
        className={`${
          showNavbarCarousel ? "rounded-none" : "rounded-xl"
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
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Real estate image ${index + 1}`}
                  className="w-full md:h-96 h-72 object-cover"
                />
                <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-start ps-6 md:ps-16">
                  <div className="bg-white/90 backdrop-blur-sm p-4 md:p-6 text-black font-semibold hidden md:block md:w-96 lg:w-1/3 rounded-2xl">
                    <p className="text-sm lg:text-base">{datatext[index]}</p>
                    <div className="mt-2">
                      <h1 className="text-xs font-bold text-[#ff9505]  py-1 rounded">
                        Section {index + 1}/3
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

import elsarhLoge from "../../assets/images/logoElsarh.png";
import {Helmet} from "react-helmet";

function About() {
  return (
    <>
    <Helmet>
      <title>About - El Sarh Real Estate Investment Company</title>
      <meta name="description" content="Discover El Sarh Real Estate Investment Company, a pioneering developer in Egypt, specializing in transformative real estate projects." />
      <meta property="og:title" content="About - El Sarh Real Estate Investment Company" />
      <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
      </Helmet>
    <section className="bg-[#f4f4f9] dark:bg-gray-800">
    <div className="w-full overflow-hidden pb-8 bg-fixed">
      <div className="w-full flex justify-center items-center aboutImg h-60 bg-[#016FB9] bg-opacity-90">
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          About
        </h1>
      </div>
    </div>
    
    <div className="container mx-auto space-y-8">
      <div className="p-8 bg-white dark:bg-gray-700 shadow-lg rounded-lg">
        <h4 className="text-3xl font-bold text-[#033E8A] dark:text-[#FF9505]">
          El Sarh Real Estate Investment Company
        </h4>
        <p className="text-lg text-zinc-700 dark:text-gray-300 mt-4 leading-relaxed">
          Investment Company (El Sarh) stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces. Since its inception in 2005, El Sarh has carved a path of excellence, leaving an indelible mark on the Egyptian real estate landscape.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 p-8 bg-white dark:bg-gray-700 shadow-lg rounded-lg">
        <div className="flex justify-center items-center">
          <img src={elsarhLoge} alt="El Sarh Logo" className="w-3/4 h-auto object-contain" />
        </div>
        <div className="lg:col-span-2">
          <p className="text-lg text-zinc-700 dark:text-gray-300 leading-relaxed">
            Unmatched quality and exceptional construction standards, innovative designs, and contemporary architectural styles. A diverse portfolio catering to a variety of needs and preferences. Commitment to building vibrant communities with unparalleled amenities. Sustainable practices and a clear focus on environmental responsibility. El Sarh is not just a real estate company; it's a visionary force transforming the face of Egypt and crafting living spaces that transcend expectations.
          </p>
          <p className="text-lg text-zinc-700 dark:text-gray-300 mt-4 leading-relaxed">
            Building Dreams and Fostering Communities.
          </p>
        </div>
      </div>
    </div>
  </section>
  </>
  );
}

export default About;

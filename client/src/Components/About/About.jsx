
import elsarhLogo from "../../assets/images/logoElsarh.png";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
function About() {
  return (
    <>
      <Helmet>
        <title>About - El Sarh Real Estate Investment Company</title>
        <meta
          name="description"
          content="Discover El Sarh Real Estate Investment Company, a pioneering developer in Egypt, specializing in transformative real estate projects."
        />
        <meta
          property="og:title"
          content="About - El Sarh Real Estate Investment Company"
        />
        <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
      </Helmet>
      
      <section className="overflow-hidden bg-stone-100 py-5 dark:from-gray-800 dark:to-gray-900 min-h-screen">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className=" "
          >
            <div className="pb-5">
              <div className=" overflow-hidden flex items-start aboutImg h-72">
               <div className=" bg-[#002E66] bg-opacity-80 z-10 w-full h-full flex justify-center items-center">
              
                  <div className="flex flex-col justify-center items-center z-20">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Us</h1>
                    <div className="bg-white p-1 ">
                      <img src={elsarhLogo} alt="El Sarh Logo" className="w-44 h-auto object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white dark:bg-gray-700 border p-6 mb-4 space-y-5 divide-y"
              >
                <div>
                  <h4 className="text-3xl font-bold text-[#033E8A] dark:text-[#FF9505] mb-4">
                    El Sarh Real Estate Investment Company
                  </h4>
                  <p className="text-lg text-zinc-700 dark:text-gray-300 leading-relaxed">
                    El Sarh stands out as a premier developer in Egypt, renowned for its transformative vision and dedication to crafting exceptional living spaces. Since its inception in 2000, El Sarh has carved a path of excellence, leaving an indelible mark on the Egyptian real estate landscape.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 pt-5">
                <ul className="list-disc list-inside space-y-2 text-zinc-700 dark:text-gray-300">
                  <li>Unmatched quality and exceptional construction standards</li>
                  <li>Innovative designs and contemporary architectural styles</li>
                  <li>Diverse portfolio catering to a variety of needs and preferences</li>
                  <li>Commitment to building vibrant communities with unparalleled amenities</li>
                  <li>Sustainable practices and a clear focus on environmental responsibility</li>
                </ul>
                <p className="text-lg text-zinc-700 dark:text-gray-300 mt-4 font-semibold whitespace-pre-line">
                  El Sarh is not just a real estate company; 
                  it&apos;s a visionary force transforming the face of Egypt and crafting living spaces that transcend expectations.
                </p>
              </div>
              
              </motion.div>
            </div>
            

          </motion.div>

        </div>

      </section>
    </>
  

  );
}

export default About;
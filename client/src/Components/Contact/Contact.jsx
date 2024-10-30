import React from 'react';
import { motion } from 'framer-motion';
import { BsPeople, BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { SocialMediaLinkTow } from "../SocialMedia/SocialMediaLink.jsx";
import { Helmet } from "react-helmet";
import FormContact from './FormContact';

function Contact() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | El Sarh Real Estate Investment Company</title>
        <meta name="description" content="Contact El Sarh Real Estate Investment Company for more information about residential, commercial, or investment properties." />
        <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>

      <div className="dark:bg-gray-900  bg-stone-100 py-5 overflow-hidden ">
        <div className=" space-y-5 container mx-auto">


          <motion.div
            className="bg-white border dark:bg-gray-800 p-6 py-16 border-b-4 border-b-[#ff9505] shadow-md"
            {...fadeIn}
          >
            <h2 className="text-3xl font-bold text-[#002E66] dark:text-gray-300 mb-2">Stay in touch with ElSarh company</h2>
            <p className="text-[#353531] dark:text-gray-400 text-lg">
              At El Sarh Real Estate Investment Company, we are committed to delivering exceptional service and addressing all your real estate needs. Whether you're interested in residential, commercial, or investment properties, or simply have a question or concern, our dedicated team is here to assist you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            
            <motion.div
              className="bg-white dark:bg-gray-800 shadow-lg rounded-xl border overflow-hidden flex flex-col"
              {...fadeIn}
            >
              <div className="p-6 border-b dark:border-gray-700">
                <h3 className="text-2xl font-semibold text-[#353531] dark:text-gray-300 mb-4">Contact Information</h3>
                <p className="text-[#353531]/80 dark:text-gray-400 mb-2">We are open 7 days a week, from 9:00 AM to 5:00 PM.</p>
                <p className="text-[#353531]/80 dark:text-gray-400">Please let us know if you have any questions or need assistance.</p>
              </div>
              <div className="flex-grow">
                <motion.a
                  href="mailto:example@elsarh.com"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsEnvelope className="text-3xl text-[#ff9505] mr-4" />
                  <p className="text-gray-800 dark:text-gray-300">elsarhegypt@gmail.com</p>
                </motion.a>
                <motion.a
                  href="tel:+201212622210"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsTelephone className="text-3xl text-[#ff9505] mr-4" />
                  <p className="text-gray-800 dark:text-gray-300">+201212622210</p>
                </motion.a>
                <motion.a
                  href="https://maps.app.goo.gl/yv9HDSAdmwAT2Lft8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-4 hover:bg-stone-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  whileHover={{ x: 10 }}
                >
                  <BsGeoAlt className="text-3xl text-[#ff9505] mr-4" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-300">14 El Mokhtar Street from Nasr Street
                    New Maadi, Cairo</p>
                    <p className="text-red-600">Go to Google Map</p>
                  </div>
                </motion.a>
              </div>
              <div className="border-t bg-stone-50 p-3 flex justify-center">
                <SocialMediaLinkTow />
              </div>
            </motion.div>
            
            <motion.div
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl border overflow-hidden"
              {...fadeIn}
            >
              <div className="p-5">
                <h3 className="text-2xl font-semibold text-[#353531] dark:text-gray-300 mb-6">Get In Touch</h3>
                
                <FormContact/>
              </div>
            </motion.div>

          </div>

          <motion.div
            className="w-full rounded-xl border overflow-hidden shadow-lg p-3 bg-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1728.0818356095576!2d31.274256562161206!3d29.974725938862846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145839b32f2e71d1%3A0x9758140509ccd109!2z2LTYsdmD2Kkg2KfZhNi12LHYrSDZhNmE2KfYs9iq2KvZhdin2LEg2KfZhNi52YLYp9ix2Yo!5e0!3m2!1sen!2seg!4v1727772284728!5m2!1sen!2seg" 
              className='w-full rounded-md'
              height="400"
              allowfullscreen="" 
              loading="lazy" 
              referrerpolicy="no-referrer-when-downgrade">
              </iframe>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Contact;
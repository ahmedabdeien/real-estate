import { BsTelephone } from "react-icons/bs";
import { BsEnvelope } from "react-icons/bs";
import { BsGeoAlt } from "react-icons/bs";
import SocialMediaLink from "../SocialMedia/SocialMediaLink";
import {Helmet} from "react-helmet";
function Contact() {
  return (<>
 
    <Helmet>
      <title>Contact Us | El Sarh Real Estate Investment Company</title>
      <meta name="description" content="Contact El Sarh Real Estate Investment Company for more information about residential, commercial, or investment properties." />
      <link rel="shortcut icon" href="../../../public/favicon.ico" type="image/x-icon" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
    </Helmet>
    <div className=" dark:bg-gray-900 py-8">
    <div className="container mx-auto space-y-6">
        <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-[#034078] dark:text-blue-500">Contact Us</h1>
            <div className="w-24 h-1 bg-[#016FB9] mx-auto"></div>
        </div>
        <div className="px-4 py-6 bg-white dark:bg-gray-800  rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-800 dark:text-gray-300">
                At El Sarh Real Estate Investment Company, we are committed to delivering exceptional service and addressing all your real estate needs. Whether you’re interested in residential, commercial, or investment properties, or simply have a question or concern, our dedicated team is here to assist you.
            </p>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">Contact Information</h3>
                <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">We are open 7 days a week, from 9:00 AM to 5:00 PM.</p>
                    <p className="text-gray-600 dark:text-gray-400">Please let us know if you have any questions or need assistance.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="mailto:example@elsarh.com" className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                        <BsEnvelope className="text-3xl text-[#016FB9] mr-3"/>
                        <p className="text-gray-800 dark:text-gray-300">example@elsarh.com</p>
                    </a>
                    <a href="tel:+201212622210" className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                        <BsTelephone className="text-3xl text-[#016FB9] mr-3"/>
                        <p className="text-gray-800 dark:text-gray-300">+201212622210</p>
                    </a>
                    <a href="https://maps.app.goo.gl/yv9HDSAdmwAT2Lft8" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                        <BsGeoAlt className="text-3xl text-[#016FB9] mr-3"/>
                        <div className="text-gray-800 dark:text-gray-300">
                            <p>123 Main St, City, State, Zip</p>
                            <p className="text-red-600">Go to Google Map</p>
                        </div>
                    </a>
                    <div className="flex items-center justify-center p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
                        <SocialMediaLink/>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-300">Get In Touch</h3>
                <form className="space-y-6 p-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
                    <div className="flex flex-col md:flex-row gap-4">
                        <input type="text" placeholder="Your Name" className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#016FB9]"/>
                        <input type="text" placeholder="Your Phone Number" className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#016FB9]"/>
                    </div>
                    <input type="email" placeholder="Your Email" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#016FB9]"/>
                    <textarea placeholder="Your Message" className="w-full h-40 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#016FB9]"/>
                    <button type="submit" className="w-full px-4 py-2 bg-[#016FB9] text-white rounded-md hover:bg-[#014f7f] transition-colors duration-300">Send Message</button>
                </form>
            </div>
        </div>
        <div className="w-full mt-6">
            <div className="mapouter">
                <div className="gmap_canvas">
                    <iframe className="w-full" height="400" id="gmap_canvas" src="https://maps.google.com/maps?q=%D8%A9%20%D8%A7%D9%84%D8%B5%D8%B1%D8%AD%20%D9%84%D9%84%D8%A7%D8%B3%D8%AA%D8%AB%D9%85%D8%A7%D8%B1%20%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1&t=&z=16&ie=UTF8&iwloc=&output=embed" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>
</>
  )
}

export default Contact
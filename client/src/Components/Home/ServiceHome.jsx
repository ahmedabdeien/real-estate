import React from 'react';
import { motion } from 'framer-motion';
import { BsBuildingCheck, BsBriefcase, BsArrowRepeat, BsGraphUpArrow } from "react-icons/bs";

const ServiceCard = ({ icon: Icon, text }) => (
  <motion.div
    className="w-full md:w-1/2 lg:w-1/4 p-2"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="p-6 bg-white shadow-sm dark:bg-stone-900 border rounded-2xl h-full flex flex-col justify-between"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="text-6xl text-[#FF9505] mb-4" />
      <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
    </motion.div>
  </motion.div>
);

export default function ServiceHome() {
  const services = [
    {
      icon: BsBuildingCheck,
      text: "From planning to execution, we handle all aspects of real estate project development to ensure the best results."
    },
    {
      icon: BsBriefcase,
      text: "We ensure the safety of legal procedures by offering specialized legal advice and preparing contracts that protect your rights."
    },
    {
      icon: BsArrowRepeat,
      text: "Even after the deal is closed, we're with you to provide the additional support and services you need."
    },
    {
      icon: BsGraphUpArrow,
      text: "We provide you with accurate market analyses and investment opportunities to ensure you achieve the highest returns on your investments."
    }
  ];

  return (
    <div className="dark:bg-stone-800 overflow-hidden py-12 container mx-auto">
      <div className=" px-4">
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl font-bold text-[#353531] dark:text-white mb-4">Our Services</h2>
        </motion.div>
        <div className="flex flex-wrap -mx-2">
          {services.map((service, index) => (
            <ServiceCard key={index} icon={service.icon} text={service.text} />
          ))}
        </div>
      </div>
    </div>
  );
}
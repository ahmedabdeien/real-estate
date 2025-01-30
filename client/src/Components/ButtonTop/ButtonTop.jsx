import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsEnvelope, BsTelephone } from "react-icons/bs";
import { FaEllipsisH } from "react-icons/fa";

export default function FloatingContact() {
  const [isOpen, setIsOpen] = useState(false);

  const buttonVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <motion.div
        className="flex items-center gap-2"
        initial={true}
        animate={isOpen ?  "visible" :"visible" }
        variants={containerVariants}
      >
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.a
                key="phone"
                href="tel:+201212622210"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-12 h-12 rounded-full bg-green-600 shadow-lg flex items-center justify-center backdrop-blur-sm bg-opacity-90 hover:bg-green-700 transition-colors"
                aria-label="Make phone call"
              >
                <BsTelephone className="text-2xl text-white" />
              </motion.a>

              <motion.a
                key="email"
                href="mailto:elsarhegypt@gmail.com"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                className="w-12 h-12 rounded-full bg-blue-600 shadow-lg flex items-center justify-center backdrop-blur-sm bg-opacity-90 hover:bg-blue-700 transition-colors"
                aria-label="Send email"
              >
                <BsEnvelope className="text-2xl text-white" />
              </motion.a>
            </>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Contact options"
        >
          <motion.span
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaEllipsisH className="text-2xl text-gray-700" />
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}
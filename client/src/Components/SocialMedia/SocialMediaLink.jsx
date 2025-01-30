import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { motion } from 'framer-motion';

const socialLinks = [
  {
    icon: <FaFacebookF />,
    href: "http://www.facebook.com/elsarh.eg",
    label: "Facebook"
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/elsarh.eg",
    label: "Instagram"
  },
  {
    icon: <FaLinkedinIn />,
    href: "https://www.linkedin.com/company/elsarh/",
    label: "LinkedIn"
  },
  {
    icon: <FaWhatsapp />,
    href: "http://wa.me/201000554192",
    label: "WhatsApp"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1 }
};

export const SocialMediaLinks = ({ variant = 'primary' }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <motion.div
      className={`flex items-center gap-3 ${isPrimary ? 'text-[#016FB9]' : 'text-white'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {socialLinks.map((link, index) => (
        <motion.a
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-full transition-all duration-300 ${
            isPrimary 
              ? 'bg-gray-100 hover:bg-gray-200 text-[#033e8a]' 
              : 'bg-[#016FB9] hover:bg-[#01508a]'
          }`}
        >
          <motion.span className="block text-xl">
            {link.icon}
          </motion.span>
        </motion.a>
      ))}
    </motion.div>
  );
};

// Predefined variants for convenience
export const SocialMediaPrimary = () => <SocialMediaLinks variant="primary" />;
export const SocialMediaSecondary = () => <SocialMediaLinks variant="secondary" />;
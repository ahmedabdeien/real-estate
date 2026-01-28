import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { motion } from 'framer-motion';
import { useSelector } from "react-redux";

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
  const { config } = useSelector(state => state.config);

  const links = [
    {
      icon: <FaFacebookF />,
      href: config?.socialLinks?.facebook || "http://www.facebook.com/elsarh.eg",
      label: "Facebook"
    },
    {
      icon: <FaInstagram />,
      href: config?.socialLinks?.instagram || "https://www.instagram.com/elsarh.eg",
      label: "Instagram"
    },
    {
      icon: <FaLinkedinIn />,
      href: config?.socialLinks?.linkedin || "https://www.linkedin.com/company/elsarh/",
      label: "LinkedIn"
    },
    {
      icon: <FaWhatsapp />,
      href: config?.socialLinks?.whatsapp || "http://wa.me/201000554192",
      label: "WhatsApp"
    }
  ];

  return (
    <motion.div
      className={`flex items-center gap-3 ${isPrimary ? 'text-primary-600' : 'text-white'}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {links.map((link, index) => (
        <motion.a
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          variants={itemVariants}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-none transition-all duration-300 ${isPrimary
            ? 'bg-slate-100 hover:bg-slate-200 text-primary-700'
            : 'bg-primary-600 hover:bg-primary-700'
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
export const SocialMediaPrimary = (props) => <SocialMediaLinks variant="primary" {...props} />;
export const SocialMediaSecondary = (props) => <SocialMediaLinks variant="secondary" {...props} />;
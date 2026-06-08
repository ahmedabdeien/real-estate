/**
 * SectionHeader — عنوان القسم المشترك
 * Usage: <SectionHeader badge="مشاريعنا" title="المشاريع المميزة" desc="..." />
 */
import { motion } from "framer-motion";

export default function SectionHeader({ badge, title, desc, align = "center", className = "", animate = true }) {
  const alignClass = { center: "text-center", right: "text-right", left: "text-left" }[align] || "text-center";
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } }
    : {};

  return (
    <Wrapper className={`${alignClass} ${className}`} {...wrapperProps}>
      {badge && (
        <span className="inline-block text-xs font-black tracking-[0.3em] uppercase mb-3" style={{ color: "var(--primary)" }}>
          {badge}
        </span>
      )}
      {title && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-1 mb-3 leading-tight">
          {title}
        </h2>
      )}
      {desc && (
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed"
          style={{ maxWidth: align === "center" ? "560px" : undefined, margin: align === "center" ? "0 auto" : undefined }}>
          {desc}
        </p>
      )}
    </Wrapper>
  );
}

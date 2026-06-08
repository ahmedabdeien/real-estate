/**
 * PageHero — مكوّن الهيدر المشترك لجميع صفحات الموقع العام
 * Usage: <PageHero title="..." subtitle="..." badge="..." image="..." />
 */
import { motion } from "framer-motion";

export default function PageHero({
  title,
  subtitle,
  badge,
  image,
  children,
  minHeight = "py-20",
  align = "center",
}) {
  const alignClass = { center: "text-center", right: "text-right", left: "text-left" }[align] || "text-center";

  return (
    <section
      className={`relative overflow-hidden ${minHeight}`}
      style={{ background: "linear-gradient(135deg, var(--secondary) 0%, var(--secondary-mid) 55%, var(--secondary-light) 100%)" }}
    >
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(var(--secondary-rgb),0.88) 0%, rgba(var(--secondary-rgb),0.60) 100%)" }} />
        </>
      )}
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-5" style={{ background: "var(--accent)" }} />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full opacity-5" style={{ background: "var(--primary)" }} />

      <div className={`relative z-10 container mx-auto px-4 ${alignClass}`}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: "easeOut" }}>
          {badge && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm mb-5"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)" }}>
              {badge}
            </span>
          )}
          {title && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-base md:text-lg max-w-2xl leading-relaxed"
              style={{ color: "rgba(255,255,255,0.72)", margin: align === "center" ? "0 auto" : undefined }}>
              {subtitle}
            </p>
          )}
          {children && <div className="mt-6">{children}</div>}
        </motion.div>
      </div>
    </section>
  );
}

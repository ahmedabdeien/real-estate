import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BsHouseDoor, BsArrowLeft } from 'react-icons/bs';

export default function NotFound() {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#f5f4f1' }}>

      {/* خلفية زخرفية */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #8A6924 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(138,105,36,0.08), transparent 70%)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(18,40,60,0.06), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6 max-w-lg"
      >
        {/* الرقم 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <span className="text-[120px] md:text-[160px] font-black leading-none select-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px rgba(138,105,36,0.25)',
              letterSpacing: '-0.05em',
            }}>
            404
          </span>
        </motion.div>

        {/* الخط الذهبي */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="h-1 w-20 mx-auto mb-8"
          style={{ background: 'linear-gradient(to left, #8A6924, #DFBA6B)' }}
        />

        {/* النص */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-10"
        >
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: '#12283C' }}>
            الصفحة غير موجودة
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: '#6b5e3e' }}>
            الصفحة التي تبحث عنها غير موجودة أو تم نقلها.<br />
            يمكنك العودة إلى الرئيسية والمتابعة من هناك.
          </p>
        </motion.div>

        {/* أزرار */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/">
            <button
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #8A6924, #c4983a)',
                boxShadow: '0 6px 24px rgba(138,105,36,0.35)',
              }}
            >
              <BsHouseDoor size={16} />
              العودة للرئيسية
            </button>
          </Link>
          <Link to="/Project">
            <button
              className="flex items-center gap-2 px-8 py-3.5 text-sm font-black transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: 'white',
                border: '1.5px solid rgba(138,105,36,0.25)',
                color: '#12283C',
                boxShadow: '0 4px 16px rgba(18,40,60,0.06)',
              }}
            >
              تصفح المشاريع
              <BsArrowLeft size={14} />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { BsStarFill, BsQuote } from 'react-icons/bs';

const reviews = [
  {
    name: 'د. عصام محمد',
    role: 'مستثمر عقاري',
    review: 'تعاملت مع شركة الصرح لشراء منزلي الأول، وكانت التجربة أكثر من رائعة. جودة البناء والخدمة المتميزة جعلتني أشعر بالثقة الكاملة.',
    rating: 5,
  },
  {
    name: 'م. محمد حسن',
    role: 'مهندس استشاري',
    review: 'شركة محترفة بكل ما تحمله الكلمة من معنى. اشتريت شقة من خلالهم وكانوا ملتزمين بالتسليم في الموعد المحدد بتصميم فاق التوقعات.',
    rating: 5,
  },
  {
    name: 'أ. نادية محمد',
    role: 'ربة منزل',
    review: 'إذا كنت تبحث عن شركة عقارية موثوقة، أنصحك بشدة بشركة الصرح. تصاميمها الحديثة وخدماتها الممتازة تجعلها الأفضل في السوق.',
    rating: 5,
  },
];

export default function Reviews() {
  return (
    <section
      dir="rtl"
      id="reviews"
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #faf8f4 0%, #f5ede0 100%)' }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(138,105,36,0.08) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(138,105,36,0.08), transparent 70%)' }}
      />

      <div className="container mx-auto px-4 lg:px-12 relative z-10">

        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'linear-gradient(to left, #8A6924, transparent)' }} />
            <span className="text-xs font-black tracking-[0.35em] uppercase" style={{ color: '#8A6924' }}>
              آراء العملاء
            </span>
            <div className="h-px w-10" style={{ background: 'linear-gradient(to right, #8A6924, transparent)' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#12283C' }}>
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-sm mt-3" style={{ color: '#8A6924' }}>
            قصص حقيقية من أشخاص وثقوا بنا
          </p>
        </motion.div>

        {/* Review cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className="relative overflow-hidden group transition-all duration-500 hover:-translate-y-2"
              style={{
                background: 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(138,105,36,0.12)',
                boxShadow: '0 8px 32px rgba(18,40,60,0.06)',
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(138,105,36,0.05), transparent 60%)' }}
              />

              {/* Quote watermark */}
              <div
                className="absolute top-3 end-4 pointer-events-none"
                style={{ color: 'rgba(138,105,36,0.07)' }}
              >
                <BsQuote size={80} />
              </div>

              <div className="relative z-10 p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(r.rating)].map((_, j) => (
                    <BsStarFill key={j} size={13} style={{ color: '#8A6924' }} />
                  ))}
                </div>

                {/* Review text */}
                <p className="text-sm leading-[1.9] mb-7" style={{ color: '#4a3e2a', fontStyle: 'italic' }}>
                  "{r.review}"
                </p>

                {/* Divider */}
                <div className="h-px mb-5" style={{ background: 'linear-gradient(to left, rgba(138,105,36,0.2), transparent)' }} />

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 flex items-center justify-center text-white font-black text-base shrink-0"
                    style={{ background: 'linear-gradient(135deg, #8A6924, #c4983a)' }}
                  >
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm" style={{ color: '#12283C' }}>{r.name}</h4>
                    <p className="text-xs font-bold mt-0.5" style={{ color: '#8A6924' }}>{r.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

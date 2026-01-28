import React from 'react';
import { motion } from 'framer-motion';

const team = [
  {
    name: " حسين عابدين",
    role: "رئيس مجلس الإدارة",
    bio: "خبير في الإدارة العقارية والاستثمار، يقود الصرح نحو مستقبل مشرق.",
    initials: "ح ع"
  },
  {
    name: "أحمد حسين",
    role: "مدير التكنولوجيا",
    bio: "يشرف على الأنظمة التقنية والابتكار لضمان أفضل خدمة لعملائنا.",
    initials: "أ ح"
  },
];

const TeamMembers = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
    {team.map((member, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="group relative"
      >
        <div className="relative h-[400px] rounded-none overflow-hidden shadow-premium transition-all duration-700 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700">
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-primary-600/20">
            <span className="text-8xl font-black text-primary-600/30 select-none">
              {member.initials}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-8 text-right bg-gradient-to-t from-white dark:from-slate-900 via-white/80 dark:via-slate-900/80 to-transparent">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {member.name}
            </h3>
            <p className="text-primary-600 font-black uppercase tracking-widest text-[10px] mb-4">{member.role}</p>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              {member.bio}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default TeamMembers;
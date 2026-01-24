import React from 'react';
import { motion } from 'framer-motion';

const team = [
  {
    name: " حسين عابدين",
    role: "رئيس مجلس الإدارة ومالك شركة الصرح",
    bio: "مهندس مدني خبير في الإدارة العقارية مع أكثر من 25 عاماً من الخبرة في بناء الصروح السكنية والتجارية.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070"
  },
  {
    name: "أحمد حسين ",
    role: "المدير التنفيذي",
    bio: "مهندس it رائد، يشرف على تطبيق أحدث التكنولوجيا العالمية في التصميم والتنفيذ لضمان تميز مشاريعنا.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
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
        <div className="relative h-[500px] rounded-[48px] overflow-hidden shadow-premium transition-all duration-700 group-hover:shadow-premium-xl border-4 border-white dark:border-slate-800">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-10 text-right">
            <h3 className="text-3xl font-heading font-black text-white mb-2">
              {member.name}
            </h3>
            <p className="text-accent-500 font-black uppercase tracking-widest text-xs mb-6">{member.role}</p>
            <p className="text-slate-300 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {member.bio}
            </p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

export default TeamMembers;
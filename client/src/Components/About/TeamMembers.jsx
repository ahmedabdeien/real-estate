import React from 'react';
import { motion } from 'framer-motion';

const team = [
  {
    name: "محمد أحمد",
    role: "المدير التنفيذي",
    bio: "خبير في الإدارة العقارية مع أكثر من 15 عامًا من الخبرة",
    image: "https://images.pexels.com/photos/7648478/pexels-photo-7648478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    name: "علي محمود",
    role: "كبير المهندسين",
    bio: "مهندس معماري معتمد مع خبرة في التصميمات المستدامة",
    image: "https://images.pexels.com/photos/8353832/pexels-photo-8353832.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

const TeamMembers = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {team.map((member, index) => (
      <motion.div 
        key={index}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <img 
          src={member.image} 
          alt={member.name}
          className="w-full h-64 object-cover rounded-lg mb-4"
          loading="lazy"
        />
        <h3 className="text-xl font-semibold text-primary dark:text-secondary">
          {member.name}
        </h3>
        <p className="text-zinc-600 dark:text-gray-300 mb-2">{member.role}</p>
        <p className="text-zinc-700 dark:text-gray-400">{member.bio}</p>
      </motion.div>
    ))}
  </div>
);

export default TeamMembers;
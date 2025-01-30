import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { BsSearch } from 'react-icons/bs';
import { FaEnvelope, FaPhoneAlt, FaRegCalendarAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { TbLoader, TbAlertCircle } from 'react-icons/tb';





// Animation variants
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { y: -5, scale: 1.02 }
};

export default function PageBroker() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contact');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        const data = await response.json();
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, []);

  const filteredContacts = contacts
    .filter(contact => 
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => sortBy === 'date' ? 
      new Date(b.date) - new Date(a.date) : 
      a.fullName.localeCompare(b.fullName)
    );

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <TbLoader className="text-4xl animate-spin text-blue-500" />
    </div>
  );
  
  if (error) return (
    <motion.div 
      className="max-w-md mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-2 text-red-600">
        <TbAlertCircle className="text-xl" />
        <span className="font-medium">{error}</span>
      </div>
    </motion.div>
  );

  return (
    <>
      <Helmet>
        <title>Contact List</title>
        <meta name="description" content="Manage and organize your contact messages" />
      </Helmet>

      <div dir='rtl' className="min-h-screen container bg-gradient-to-br from-stone-100 to-stone-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.h2 
            className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            قائمة الرسائل
          </motion.h2>

          {/* Controls Section */}
          <motion.div 
            className="mb-6 p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="البحث عن جهات الاتصال..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full ps-10 pe-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-600 border-none focus:ring-2 focus:ring-blue-500"
                />
                <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-gray-600 dark:text-gray-300">فرز حسب:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-600 border-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">تاريخ</option>
                  <option value="name">اسم</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Contact Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact._id}
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10" />
                    <div className="p-4 border-b border-gray-100 dark:border-gray-600">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        {contact.fullName}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FaEnvelope className="text-blue-500" />
                      </span>
                      <span className="truncate">{contact.email}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <span className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <FaPhoneAlt className="text-green-500" />
                      </span>
                      <span>{contact.phoneNumber}</span>
                    </div>

                    <p className="p-3 bg-gray-50 dark:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm border-l-4 border-blue-500">
                      {contact.message}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-600 text-sm flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <FaRegCalendarAlt className="flex-shrink-0" />
                    <span>{new Date(contact.date).toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredContacts.length === 0 && (
            <motion.div 
              className="text-center py-8 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              لا توجد نتائج مطابقة
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import { BsSearch } from 'react-icons/bs';
import { FaEnvelope,FaPhoneAlt,FaRegCalendarAlt  } from "react-icons/fa";
export default function PageBroker() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };


  const filteredContacts = contacts
    .filter(contact => 
      contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName);
      }
      return 0;
    });

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  
  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error!</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );

  return (
    <>
    <Helmet>
    <title>Contact List</title>
    <meta name="description" content="Explore our breathtaking collection of luxurious properties and unique real estate opportunities." />
  </Helmet>
    <div dir='rtl' className="px-4 py-8 bg-gradient-to-br from-stone-100 to-stone-200">
    <div className="container mx-auto ">
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800 animate-fade-in">قائمة الرسايل</h2>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 shadow border-[#353531]/20 p-3 bg-white rounded-xl">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="البحث عن جهات الاتصال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full ps-10 pe-4 py-4 border-none  rounded-xl focus:outline-none focus:border-[#016FB9] bg-stone-100 focus:ring-0"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <BsSearch className="w-5 h-5 text-purple-800/75" />
          </span>
        </div>
        <div className="flex items-center ">
          <label htmlFor="sortBy" className="text-gray-700 font-medium me-2">فرز حسب:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-8 w-40 py-4 rounded-xl border-none  focus:border-[#016FB9] bg-stone-100 focus:ring-0"
          >
            <option value="date">تاريخ</option>
            <option value="name">اسم</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div key={contact._id} className="flex flex-col justify-between bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all  transform hover:-translate-y-1">
            <div className="flex flex-col justify-between">
              <div className='p-3 border-b bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb] '>
                <h3 className="font-bold text-2xl text-black ">{contact.fullName}</h3>
              </div>
              <div className="space-y-2 p-3 py-4">
                <p className="text-[#353531] flex items-center">
                  <span className='bg-[#016FB9] rounded-md p-1 me-2 text-white'> 
                    <FaEnvelope className="" />
                  </span>
                  <span className="font-medium"></span> {contact.email}
                </p>
                <p className="text-[#353531] flex items-center">
                <span className='bg-green-500 rounded-md p-1 me-2 text-white'> 
                  <FaPhoneAlt  className="" />
                  </span>
                  <span className="font-medium"></span>{contact.phoneNumber}
                </p>
                <p className="text-gray-700 border-s-4 p-2 font-semibold italic">{contact.massage}</p>
              </div>
            </div>
            <p className="text-sm text-[#353531] flex items-center bg-stone-50 px-3 py-1">
                <FaRegCalendarAlt className="me-2 text-[#3921d5]" />
                 {new Date(contact.date).toLocaleString()}
              </p>
          </div>
        ))}
      </div>
    </div>
  </div>
  </>
  );
}
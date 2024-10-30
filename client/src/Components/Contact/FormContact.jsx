"use client"

import React, { useState } from 'react';

export default function FormContact() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        message: ''
    });

    const validations = {
        name: /^[a-zA-Z\s]{2,50}$/,
        phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: /^.{10,500}$/
    };

    const errorMessages = {
        name: "Name should be 2-50 characters long and contain only letters and spaces.",
        phone: "Please enter a valid phone number.",
        email: "Please enter a valid email address.",
        message: "Message should be 10-500 characters long."
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateField = (name, value) => {
        if (!validations[name].test(value)) {
            setError(errorMessages[name]);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate all fields
        for (const [key, value] of Object.entries(formData)) {
            if (!validateField(key, value)) {
                return;
            }
        }

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            
            if (res.ok) {
                setSuccess(data.msg);
                setFormData({ name: '', phone: '', email: '', message: '' });
            } else {
                setError(data.msg || 'An error occurred');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Fetch error:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg ">
           
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label htmlFor="name" className="block mb-1 font-medium">Name</label>
                        <input
                            id="name"
                            onChange={handleChange}
                            value={formData.name}
                            name="name"
                            type="text"
                            placeholder="Your Name"
                            className="w-full px-4 py-2 rounded-lg focus:ring-0 border-none bg-stone-100 dark:bg-gray-700 focus:outline-2 focus:outline-[#353531] focus:bg-white focus:outline-offset-2"
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="phone" className="block mb-1 font-medium">Phone</label>
                        <input
                            id="phone"
                            onChange={handleChange}
                            value={formData.phone}
                            name="phone"
                            type="number"
                            number="number"
                            placeholder="Your Phone Number"
                            className="w-full px-4 py-2 rounded-lg focus:ring-0 border-none bg-stone-100 dark:bg-gray-700 focus:outline-2 focus:outline-[#353531] focus:bg-white focus:outline-offset-2"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                    <input
                        id="email"
                        onChange={handleChange}
                        value={formData.email}
                        name="email"
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-4 py-2 rounded-lg focus:ring-0 border-none bg-stone-100 dark:bg-gray-700 focus:outline-2 focus:outline-[#353531] focus:bg-white focus:outline-offset-2"

                    />
                </div>
                <div>
                    <label htmlFor="message" className="block mb-1 font-medium">Message</label>
                    <textarea
                        id="message"
                        onChange={handleChange}
                        value={formData.message}
                        name="message"
                        placeholder="Your Message"
                        className="w-full h-40 px-4 py-2 rounded-lg focus:ring-0 border-none bg-stone-100 dark:bg-gray-700 focus:outline-2 focus:outline-[#353531] focus:bg-white focus:outline-offset-2"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#016FB9] text-white rounded-2xl hover:shadow-lg transition-shadow duration-300 text-lg border"
                >
                    Send Message
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {success && <p className="text-green-500 mt-2">{success}</p>}
        </div>
    );
}
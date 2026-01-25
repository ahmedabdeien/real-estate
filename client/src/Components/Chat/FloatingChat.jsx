import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaPaperPlane, FaTimes, FaMinus } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';

export default function FloatingChat() {
    const { currentUser } = useSelector(state => state.user);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef();

    // In a real app, we'd chat with an admin. For now, let's assume a hardcoded admin ID or the first admin found.
    const adminId = "65a3d4e5f6a7b8c9d0e1f2a3"; // Replace with dynamic logic if needed

    useEffect(() => {
        if (isOpen && currentUser) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, currentUser]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/chat/messages/${adminId}`);
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching messages", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setLoading(true);
            const res = await axios.post('/api/chat/send', {
                receiverId: adminId,
                message: newMessage
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error("Error sending message", error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="mb-4 w-80 md:w-96 bg-[var(--card)] rounded-2xl shadow-premium-xl border border-[var(--border)] overflow-hidden flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-primary p-4 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <FaComments />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">خدمة العملاء</h3>
                                    <p className="text-[10px] opacity-80">متصل الآن</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-lg transition-all">
                                    <FaMinus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)]/50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.sender === currentUser._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === currentUser._id
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-[var(--accent)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-none'
                                            }`}
                                    >
                                        {msg.message}
                                        <p className={`text-[9px] mt-1 opacity-60 ${msg.sender === currentUser._id ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-[var(--card)] border-t border-[var(--border)] flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="اكتب رسالتك هنا..."
                                className="flex-1 bg-[var(--accent)] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary transition-all text-[var(--foreground)]"
                            />
                            <button
                                type="submit"
                                disabled={loading || !newMessage.trim()}
                                className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-premium-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[var(--card)] text-primary border border-[var(--border)] rotate-90' : 'bg-primary text-white'
                    }`}
            >
                {isOpen ? <FaTimes size={24} /> : <FaComments size={24} />}
            </motion.button>
        </div>
    );
}
